import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { products, getAllCollections } from '../product-data';
import { UTApi } from 'uploadthing/server';
import { processImageWithAI } from '../utils/image-processor';
import { QueryCache, toiPayload } from '../utils/redis';
import { inngest } from '../utils/inngest';

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
      toiCache.set({ jobId: TOIID, status: 'initialised', productId: input.productId, md5sum: input.imgMD5 });
      
      try {
        // Send the event to Inngest for background processing
        await inngest.send({
          name: 'image/process',
          data: {
            image: input.image,
            imgMD5: input.imgMD5,
            productId: input.productId,
            TOIJobId: TOIID
          }
        });
        
        console.log(`Triggered Inngest job for processing image. TOIID: ${TOIID}`);
      } catch (error) {
        console.error('Error triggering Inngest job:', error);
        // Don't throw the error - we still want to return the TOIID
        // This follows the same pattern as before, where background processing errors
        // didn't stop the response
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
        statusMap[item.jobId] = item.result;
      });
      
      return statusMap;
    }),
});
