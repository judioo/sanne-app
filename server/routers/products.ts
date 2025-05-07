import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { products, getAllCollections } from '../product-data';
import { UTApi } from 'uploadthing/server';
import { processImageWithAI, saveBase64Image } from '../utils/image-processor';
import fs from 'fs';

// Initialize UploadThing API
const utapi = new UTApi();

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
      try {
        console.log(`Processing dressing room request for product ${input.productId}`);
        
        // Compute TOI URL
        const toiUrl = `https://qjqqeunp2n.ufs.sh/f/${input.imgMD5}-${input.productId}`;
        
        // Save base64 image to disk
        const imagePath = saveBase64Image(input.image, input.imgMD5);
        
       // get the uploads images from products using the productId
       const product = products.find((product) => product.id === input.productId);
       if (!product) {
         throw new Error('Product not found');
       }
/*
       // download the images in uploads array
       if (!product.uploads) {
         throw new Error('Product has no images');
       }

       const productImagesPromises = product.uploads.map(async (imageUrl) => {
        // fetch the image from the url
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        return base64Image;
       });

       // wait for all images to be downloaded
       const productImages = await Promise.all(productImagesPromises) as string[];

       // save the product images to disk
       const imagePaths = productImages.map((image, index) => {
         saveBase64Image(image, `${input.imgMD5}-${index}`);
       });

       imagePaths.push(imagePath);
*/
        
        // Start background processing (don't wait for it to complete)
        // Add timestamp to track when the processing starts
        const processingStartTime = new Date().toISOString();
        console.log(`[${processingStartTime}] Starting background processing for product ${input.productId} with MD5 ${input.imgMD5}`);
        
        processImageWithAI(imagePath, input.imgMD5, input.productId)
          .then(result => {
            const processingEndTime = new Date().toISOString();
            const durationMs = new Date().getTime() - new Date(processingStartTime).getTime();
            
            if (result) {
              console.log(`[${processingEndTime}] ✅ Successfully completed background processing for product ${input.productId}`);
              console.log(`Processing took ${(durationMs / 1000).toFixed(1)} seconds`);
              console.log(`Final TOI URL: ${result}`);
            } else {
              console.error(`[${processingEndTime}] ❌ Background processing failed for product ${input.productId} after ${(durationMs / 1000).toFixed(1)} seconds`);
            }
          })
          .catch(error => {
            const processingEndTime = new Date().toISOString();
            console.error(`[${processingEndTime}] ❌ Error in background processing for product ${input.productId}:`, error);
          });
        
        // Return immediately with TOI URL and upload URL
        return {
          TOIUrl: toiUrl
        };
      } catch (error) {
        console.error('Error in toDressingRoom:', error);
        throw error;
      }
    }),
});
