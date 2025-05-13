import { z } from 'zod';
import { router, publicProcedure, rateLimitedProcedure } from '../trpc';
import { products, getAllCollections } from '../product-data';
import { UTApi } from 'uploadthing/server';
import { processImageWithAI, base64ToUint8Array, resizeAndConvertToWebp } from '../utils/image-processor';
import { QueryCache, toiPayload } from '../utils/redis';
import { inngest } from '../utils/inngest';
import { TOIToDressingRoomStatusMapper } from '../utils/toi-constants';

// Initialize UploadThing API
const utapi = new UTApi();

// Initialize Redis cache for TOI jobs
const toiCache = QueryCache<toiPayload>();
const e = process.env.NODE_ENV === "production" ? "p" : "d";



export const productsRouter = router({
  // Get all products with optional filtering and pagination
  getAll: publicProcedure
    .input(
      z.object({
        category: z.enum(['all', 'men', 'women']).optional().default('all'),
        sortBy: z.enum(['price_asc', 'price_desc']).optional(),
        search: z.string().optional(),
        collection: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
      })
    )
    .query(({ input }) => {
      let filteredProducts = [...products];

      // Filter by category
      if (input.category !== 'all') {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === input.category
        );
      }

      // Filter by collection if provided
      if (input.collection) {
        const collectionName = input.collection;
        filteredProducts = filteredProducts.filter((product) =>
          product.collections.includes(collectionName)
        );
      }

      // Filter by search term
      if (input.search) {
        const searchTerm = input.search.toLowerCase();
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by price
      if (input.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.numericPrice - b.numericPrice);
      } else if (input.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.numericPrice - a.numericPrice);
      }

      // Calculate pagination values
      const page = input.page || 1;
      const limit = input.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      // Calculate total pages
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);
      
      // Get paginated products
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasMore: page < totalPages,
        }
      };
    }),

  // Get all available collections
  getCollections: publicProcedure.query(() => {
    return getAllCollections();
  }),
  
  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return products.find((product) => product.id === input.id);
    }),
    
  // To The Dressing Room - Virtual try-on functionality
  toDressingRoom: rateLimitedProcedure
    .input(z.object({
      image: z.string(), // base64 encoded image
      imgMD5: z.string(), // md5sum of image
      productId: z.number() // product ID
    }))
    .mutation(async ({ input }) => {
      // Compute TOI ID
      const TOIID = `${e}-${input.imgMD5}-${input.productId}`;
      console.log(`Processing dressing room request for product ${input.productId} TOIID: ${TOIID}`);
      
      // Initialize job status in Redis
      toiCache.reset();
      await toiCache.set({ 
        jobId: TOIID, 
        status: 'initialized', 
        productId: input.productId, 
        md5sum: input.imgMD5,
        timestamp: Date.now() 
      });
      
      try {
        // Upload the raw image to UploadThing first
        console.log(`Uploading source image to UploadThing for TOIID: ${TOIID}`);
        console.log(`Converting raw image to WebP...`);
        // Extract the base64 part from the data URL, just like we did for imageBuffer
        const base64Data = input.image.split(',')[1];
        const bytes = base64ToUint8Array(base64Data);
        const toiWebpFileName = `${e}-${input.imgMD5}-${input.productId}.webp`;
        const webpBuffer = await resizeAndConvertToWebp(Buffer.from(bytes));
        const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });
        const webpFile = new File([webpBlob], toiWebpFileName, { type: 'image/webp' });
        const reductionPercentage = ((base64Data.length - webpBuffer.length) / base64Data.length) * 100;
        const resizeMessage = `Original buffer size: ${base64Data.length} bytes, Resized buffer size: ${webpBuffer.length} bytes, Reduction: ${reductionPercentage.toFixed(2)}%`;
        // log the size of the resized buffer
        console.log(resizeMessage);


        // Upload to UploadThing - API requires array for multi-file uploads
        const uploadResult = await utapi.uploadFiles(webpFile);
        
        if (!uploadResult.data) {
          throw new Error('Failed to upload image to UploadThing');
        }
        
        const imageUrl = uploadResult.data.ufsUrl;
        console.log(`Source image uploaded to: ${imageUrl}`);
        
        // Update status
        await toiCache.set({ 
          jobId: TOIID, 
          status: 'source-uploaded', 
          sourceImageUrl: imageUrl,
          resize: {
            model: resizeMessage,
          },
          timestamp: Date.now() 
        });
        
        // Send the event to Inngest for background processing with image URL
        await inngest.send({
          name: 'image/process',
          data: {
            imageUrl: imageUrl,
            imgMD5: input.imgMD5,
            productId: input.productId,
            TOIJobId: TOIID
          }
        });
        
        console.log(`Triggered Inngest job for processing image. TOIID: ${TOIID}`);
      } catch (error) {
        console.error('Error in pre-processing or triggering Inngest job:', error);
        // Update Redis with error state
        await toiCache.set({ 
          jobId: TOIID, 
          status: 'error-preprocessing', 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now() 
        });
        // Don't throw the error - we still want to return the TOIID
      }

      // Return immediately with TOI ID
      return {
        TOIID: TOIID
      };
    }),

  // Check status of multiple dressing room jobs
  checkDressingRoom: publicProcedure
    .input(z.object({
      jobIds: z.array(z.string())
    }))
    .query(async ({ input }) => {
      console.log(`Checking status for ${input.jobIds.length} dressing room jobs`);
      
      // Query Redis for all job statuses in parallel
      const results = await Promise.all(
        input.jobIds.map(async (jobId) => {
          const result = await toiCache.get(jobId);
          return { jobId, result };
        })
      );
      
      // Convert array of results to a keyed object
      const statusMap: Record<string, any> = {};
      
      results.forEach(item => {
        // @ts-ignore
        let { status, ...rest } = item?.result || {};
        status = status || 'Gone';
        const dressStatus = TOIToDressingRoomStatusMapper[status] || 'Gone';
        statusMap[item.jobId] = item?.result ? { 
          dressStatus,
          status,
          ...rest
        } : { 
          dressStatus,
          status
        };
      });
      
      return statusMap;
    }),
});
