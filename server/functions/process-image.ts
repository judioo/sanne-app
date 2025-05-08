import { inngest } from '../utils/inngest';
import { processImageWithAI } from '../utils/image-processor';
import { products } from '../product-data';

// Define the Inngest function for processing images
export const processImageFunction = inngest.createFunction(
  { id: 'process-image' },
  { event: 'image/process' },
  async ({ event, step }) => {
    const { image, imgMD5, productId, TOIJobId } = event.data;
    
    // Log the start of processing
    const processingStartTime = new Date().toISOString();
    console.log(`[${processingStartTime}] Inngest: Starting background processing for product ${productId} with MD5 ${imgMD5}`);
    
    try {
      // Validate the product exists
      const product = await step.run('validate-product', async () => {
        const foundProduct = products.find((product) => product.id === productId);
        if (!foundProduct) {
          throw new Error('Product not found');
        }
        return foundProduct;
      });
      
      console.log(`Using in-memory processing for image: ${image.substring(0, 50)}...`);
      
      // Process the image
      const result = await step.run('process-image-with-ai', async () => {
        return await processImageWithAI(image, imgMD5, productId);
      });
      
      // Calculate processing duration
      const processingEndTime = new Date().toISOString();
      const durationMs = new Date().getTime() - new Date(processingStartTime).getTime();
      
      if (result) {
        console.log(`[${processingEndTime}] ✅ Inngest: Successfully completed background processing for product ${productId}`);
        console.log(`Processing took ${(durationMs / 1000).toFixed(1)} seconds`);
        console.log(`Final TOI URL: ${result}`);
        
        return {
          success: true,
          result,
          duration: (durationMs / 1000).toFixed(1),
          TOIJobId
        };
      } else {
        console.error(`[${processingEndTime}] ❌ Inngest: Background processing failed for product ${productId} after ${(durationMs / 1000).toFixed(1)} seconds`);
        
        return {
          success: false,
          error: 'Processing failed',
          duration: (durationMs / 1000).toFixed(1),
          TOIJobId
        };
      }
    } catch (error) {
      const processingEndTime = new Date().toISOString();
      console.error(`[${processingEndTime}] ❌ Inngest: Error in background processing for product ${productId}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        TOIJobId
      };
    }
  }
);
