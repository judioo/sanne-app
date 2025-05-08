import { inngest } from '../utils/inngest';
import { processImageWithAI } from '../utils/image-processor';
import { products } from '../product-data';
import { QueryCache, toiPayload } from '../utils/redis';
import { TOI_STATUS } from '../utils/toi-constants';

// Initialize Redis cache for TOI jobs
const toiCache = QueryCache<toiPayload>();

// Define the Inngest function for processing images
export const processImageFunction = inngest.createFunction(
  { id: 'process-image' },
  { event: 'image/process' },
  async ({ event }) => {
    const { imageUrl, imgMD5, productId, TOIJobId } = event.data;
    
    // Log the start of processing
    const processingStartTime = new Date().toISOString();
    console.log(`[${processingStartTime}] Inngest: Starting background processing for product ${productId} with MD5 ${imgMD5}`);
    
    // Initialize timing for performance tracking
    const startTime = Date.now();
    
    try {
      // We're not using step.run() anymore to avoid payload limitations
      // Instead, we'll directly call processImageWithAI which handles all the image processing
      
      console.log(`Processing try-on for model image URL: ${imageUrl}`);
      
      // Update job status in Redis
      await toiCache.set({
        jobId: TOIJobId,
        status: TOI_STATUS.PROCESSING_STARTED,
        productId,
        md5sum: imgMD5,
        timestamp: Date.now()
      });
      
      // Process the image with our utility
      // This function now handles all the steps:
      // - Downloading images
      // - Converting formats
      // - Calling OpenAI
      // - Uploading results
      const result = await processImageWithAI(imageUrl, imgMD5, productId);
      
      // Calculate processing duration
      const processingEndTime = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      
      if (result) {
        console.log(`[${processingEndTime}] Inngest: Successfully completed background processing for product ${productId}`);
        console.log(`Processing took ${(durationMs / 1000).toFixed(1)} seconds`);
        console.log(`Final TOI URL: ${result}`);
        
        // Update final success status in Redis
        await toiCache.set({
          jobId: TOIJobId,
          status: 'completed',
          result,
          processingDuration: (durationMs / 1000).toFixed(1),
          productId,
          md5sum: imgMD5,
          timestamp: Date.now()
        });
        
        return {
          success: true,
          result,
          duration: (durationMs / 1000).toFixed(1),
          TOIJobId
        };
      } else {
        console.error(`[${processingEndTime}] Inngest: Background processing failed for product ${productId} after ${(durationMs / 1000).toFixed(1)} seconds`);
        
        // Update final error status in Redis
        await toiCache.set({
          jobId: TOIJobId,
          status: 'failed',
          error: 'Processing failed with no result',
          productId,
          md5sum: imgMD5,
          timestamp: Date.now()
        });
        
        return {
          success: false,
          error: 'Processing failed with no result',
          duration: (durationMs / 1000).toFixed(1),
          TOIJobId
        };
      }
    } catch (error) {
      const processingEndTime = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      
      console.error(`[${processingEndTime}] Inngest: Error in background processing for product ${productId} after ${(durationMs / 1000).toFixed(1)} seconds:`, error);
      
      // Update final error status in Redis
      await toiCache.set({
        jobId: TOIJobId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        productId,
        md5sum: imgMD5,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: (durationMs / 1000).toFixed(1),
        TOIJobId
      };
    }
  }
);
