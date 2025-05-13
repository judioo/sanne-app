import { UTApi } from 'uploadthing/server';
import OpenAI, { toFile } from 'openai';
import { products } from '../product-data';
import https from 'https';
import sharp from 'sharp';
import { QueryCache, toiPayload } from './redis';
import { TOI_STATUS } from './toi-constants';

// Initialize UploadThing API client
const utapi = new UTApi();

const toiCache = QueryCache<toiPayload>();
const e = process.env.NODE_ENV === "production" ? "p" : "d";


// Initialize OpenAI client with extended timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // 3 minutes in milliseconds
  maxRetries: 2 // Allow retries if the request fails
});

// Function to download file from URL and return as Buffer
export async function downloadFileToBuffer(url: string): Promise<Buffer> {
  console.log(`Downloading file from ${url} to memory`);
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download, status code: ${response.statusCode}`));
        return;
      }

      response.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Downloaded ${buffer.length} bytes to memory`);
        resolve(buffer);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to process image with OpenAI
export async function processImageWithAI(
  modelsImageUrl: string,
  md5sum: string,
  productId: number
): Promise<string | null> {
  // Compute TOI Job ID early for consistent status tracking
  const TOIJobId = `${e}-${md5sum}-${productId}`;
  
  try {
    console.log(`Processing product ID ${productId} with MD5 ${md5sum}, TOIID: ${TOIJobId}`);
    
    // Initialize job status
    toiCache.reset();
    const currentState = await toiCache.get(TOIJobId);
    await toiCache.set({ 
      ...currentState,
      jobId: TOIJobId, 
      status: TOI_STATUS.PROCESSING_STARTED, 
      productId, 
      md5sum,
      timestamp: Date.now()
    });
    
    // Find product
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error(`Product ID ${productId} not found`);
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.ERROR, 
        error: 'Product not found', 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      return null;
    }
    
    // Check product uploads
    if (!product.uploads || product.uploads.length < 2) {
      console.error(`Product ${productId} doesn't have required uploads`);
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.ERROR, 
        error: 'Product missing required images', 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      return null;
    }
    
    console.log(`Found product: ${product.name}`);
    
    try {
      // All image processing happens in this try block
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.DOWNLOADING_IMAGES, 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      // Download all required images in parallel
      console.log('Downloading all images at once...');
      const [frontImageBuffer, backImageBuffer, modelsImageBuffer] = await Promise.all([
        downloadFileToBuffer(product.uploads[0].ufsUrl),
        downloadFileToBuffer(product.uploads[1].ufsUrl),
        downloadFileToBuffer(modelsImageUrl)
      ]);
      
      console.log(`All images downloaded: front=${frontImageBuffer.length} bytes, back=${backImageBuffer.length} bytes, models=${modelsImageBuffer.length} bytes`);
      
      // Update status to processing
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.PROCESSING_IMAGES, 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      // Process models image - convert to PNG if needed
      const imageInfo = await sharp(modelsImageBuffer).metadata();
      const imageFormat = imageInfo.format || 'png';
      console.log(`Detected image format for model image: ${imageFormat}`);
      
      // Convert to PNG if not already
      const processedModelsBuffer = imageFormat !== 'png'
        ? await sharp(modelsImageBuffer).png().toBuffer()
        : modelsImageBuffer;
      
      console.log(`Models image processed: ${processedModelsBuffer.length} bytes, format: ${imageFormat !== 'png' ? 'png (converted)' : imageFormat}`);
      
      // Update status before calling OpenAI
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.CALLING_OPENAI, 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      // Create File objects for OpenAI
      console.log('Creating files for OpenAI API...');
      const modelFile = await toFile(processedModelsBuffer, 'model.png', { type: 'image/png' }) as unknown as File;
      const frontFile = await toFile(frontImageBuffer, 'front.png', { type: 'image/png' }) as unknown as File;
      const backFile = await toFile(backImageBuffer, 'back.png', { type: 'image/png' }) as unknown as File;
      
      const prompt = `
      TASK: 
      Replace the model's outfit in the photo with a new one. 
      Pay particular attention to the details of the dress (e.g., straps, flow, and hang). 
      I've provided back and front images of the garment so you know how it looks and flows. 
      I have added a product descripiton of the front and back to assist you in creating a more accurate image. 
      
      THE MODEL:
      The model's face MUST match that of the person in the picture. 
      Pay particular attention to the eyes, mouth and nose. Get the facial details as close to the original as possible. 
      For female models of colour, do not make them fatter than the pictures are. make them look slimer but not skinny. 

      THE GARMENT:
      Front Description: ${product.uploads[0].description}
      Back Description: ${product.uploads[1].description}`;

      // Call OpenAI API with files
      console.log('Calling OpenAI API for image generation...');
      
      const images = [modelFile, frontFile, backFile];
      const response = await openai.images.edit({
        image: images,
        prompt: prompt,
        model: "gpt-image-1",
        n: 1,
        size: "1024x1536", //"1024x1024",
        quality: "medium",
        moderation: "low",
        background: "auto"
      });
      
      // Update status after OpenAI call
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.PROCESSING_OPENAI_RESPONSE, 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      console.log('OpenAI response received');
      
      // Process OpenAI response
      if (!response.created) {
        console.error('OpenAI response invalid');
        await toiCache.set({ 
          jobId: TOIJobId, 
          status: TOI_STATUS.ERROR, 
          error: 'OpenAI failed to create image', 
          productId, 
          md5sum,
          timestamp: Date.now() 
        });
        return null;
      }
      
      const base64Data = response?.data?.[0]?.b64_json;
      if (!base64Data) {
        console.error('OpenAI returned no image data');
        await toiCache.set({ 
          jobId: TOIJobId, 
          status: TOI_STATUS.ERROR, 
          error: 'No image data in OpenAI response', 
          productId, 
          md5sum,
          timestamp: Date.now() 
        });
        return null;
      }
      
      // Convert base64 to buffer
      console.log('OpenAI returned base64 image data, converting to buffer...');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      let costMeta: {
        token?: string,
        cost?: string,
        error?: string
      } | undefined = undefined;

      // calculate cost of OpenAI API call
      if (response.usage) {
        const { input_tokens, output_tokens, input_tokens_details } =
          response.usage;
        const textTokens = input_tokens_details?.text_tokens ?? 0;
        const imageTokens = input_tokens_details?.image_tokens ?? 0;
        const textCost = textTokens * 0.000005; // 5.00 per 1M tokens
        const imageCost = imageTokens * 0.00001; // 10.00 per 1M tokens
        const outputCost = output_tokens * 0.00004; // 40.00 per 1M tokens
        const imageGenerationCost = 1 * 0.063; // 63.00 per image
        const totalCost = textCost + imageCost + outputCost + imageGenerationCost;

        costMeta = {
          token:`input_tokens=${input_tokens} (text=${textTokens}, image=${imageTokens}), output_tokens=${output_tokens}, image_generation=1`,
          cost: `Cost: text_input=$${textCost.toFixed(6)}, image_input=$${imageCost.toFixed(6)}, output=$${outputCost.toFixed(6)}, image_generation=$${imageGenerationCost.toFixed(6)}, total=$${totalCost.toFixed(6)}`,
        };
      } else {
        costMeta = {
          error: "No usage info returned from OpenAI response; cannot log token usage or cost."
        };
      }
      
      // Update status before uploading result
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.RECEIVED_OPENAI_IMAGE, 
        productId, 
        costMeta,
        md5sum,
        timestamp: Date.now() 
      });
      
      console.log(`Converting OpenAI response to WebP...`);
      const bytes = base64ToUint8Array(base64Data);
      const toiWebpFileName = `toi-${TOIJobId}.webp`;
      const webpBuffer = await resizeAndConvertToWebp(Buffer.from(bytes));
      const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });
      const webpFile = new File([webpBlob], toiWebpFileName, { type: 'image/webp' });
      // calculate the reduction in size as a percentaage and add to the resizeMessage  
      const reductionPercentage = ((imageBuffer.length - webpBuffer.length) / imageBuffer.length) * 100;
      const resizeMessage = `Original buffer size: ${imageBuffer.length} bytes, Resized buffer size: ${webpBuffer.length} bytes, Reduction: ${reductionPercentage.toFixed(2)}%`;
      // log the size of the resized buffer
      console.log(resizeMessage);
      const currentState = await toiCache.get(TOIJobId);
      const resize = currentState?.resize || {};
      resize.toi = resizeMessage;
      
      
      // Upload to UploadThing
      console.log('Uploading generated image to UploadThing...');
      const uploadResult = await utapi.uploadFiles(webpFile);
      
      // check if we have data. Error if we don't
      if (!uploadResult.data) {
        console.error('UploadThing returned no data');
        
        // update state object - we have no data from openAI
        await toiCache.set({ 
          jobId: TOIJobId, 
          status: TOI_STATUS.ERROR, 
          error: 'Upload failed - no data returned', 
          productId, 
          costMeta,
          md5sum,
          timestamp: Date.now(),
        });
        return null;
      }
      
      
      // Get URL from result
      const finalImageUrl = uploadResult.data.ufsUrl;
      console.log(`Final image URL: ${finalImageUrl}`);
      
      // Update cache with success
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.COMPLETED, 
        url: finalImageUrl, 
        productId, 
        costMeta,
        resize,
        md5sum,
        timestamp: Date.now() 
      });
      
      return finalImageUrl;
      
    } catch (processingError) {
      console.error('Error in image processing:', processingError);
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: TOI_STATUS.ERROR, 
        error: processingError instanceof Error ? processingError.message : 'Unknown error in processing', 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      return null;
    }
  } catch (error) {
    console.error('Error in processImageWithAI:', error);
    const TOIJobId = `${e}-${md5sum}-${productId}`;
    await toiCache.set({ 
      jobId: TOIJobId, 
      status: TOI_STATUS.ERROR, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      productId, 
      md5sum,
      timestamp: Date.now() 
    });
    return null;
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = globalThis.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

export async function resizeAndConvertToWebp(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92 })
    .toBuffer();
};
