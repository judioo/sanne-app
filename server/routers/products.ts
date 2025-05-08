import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { products, getAllCollections } from '../product-data';
import { UTApi } from 'uploadthing/server';
import { processImageWithAI } from '../utils/image-processor';
import { QueryCache, toiPayload } from '../utils/redis';
import { inngest } from '../utils/inngest';
import { TOI_STATUS } from '../utils/toi-constants';

// Initialize UploadThing API
const utapi = new UTApi();

// Initialize Redis cache for TOI jobs
const toiCache = QueryCache<toiPayload>();
const e = process.env.NODE_ENV === "production" ? "p" : "d";

const DressingRoomToTOIStatusMapper = {
  "Sizing Item": [TOI_STATUS.PROCESSING_STARTED, TOI_STATUS.DOWNLOADING_IMAGES],
  "Item Sized": [TOI_STATUS.PROCESSING_IMAGES],
  "Adorning": [TOI_STATUS.CALLING_OPENAI, TOI_STATUS.RECEIVED_OPENAI_IMAGE],
  "Mirror Check": [TOI_STATUS.PROCESSING_OPENAI_RESPONSE],
  "Final Adjustments": [TOI_STATUS.UPLOADING_RESULT],
  "Click To Reveal": [TOI_STATUS.COMPLETED],
  "Gone": [TOI_STATUS.ERROR],
}

// invert in variable TOIToDressingRoomStatusMapper. for eahc value in the array of values, map the value to the key
const TOIToDressingRoomStatusMapper = Object.fromEntries(
  Object.entries(DressingRoomToTOIStatusMapper).flatMap(([key, values]) =>
    values.map((value) => [value, key])
  )
);

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
  toDressingRoom: publicProcedure
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
        
        const imageBuffer = Buffer.from(input.image.split(',')[1], 'base64');
        const fileName = `${e}-${input.imgMD5}-${input.productId}.jpg`;
        
        // Create a blob and then a file
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        
        // Upload to UploadThing - API requires array for multi-file uploads
        const uploadResult = await utapi.uploadFiles(file);
        
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

      console.log(JSON.stringify(TOIToDressingRoomStatusMapper, null, 2));


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
        const dressStatus = TOIToDressingRoomStatusMapper[item?.result?.status] || 'Gone';
        statusMap[item.jobId] = item.result ? { 
          dressStatus,
          ...item.result
        } : { 
          dressStatus
        };
      });
      
      return statusMap;
    }),
});
