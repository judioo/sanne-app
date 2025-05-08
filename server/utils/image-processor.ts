import { UTApi, UTFile } from 'uploadthing/server';
import OpenAI, { toFile } from 'openai';
import { products } from '../product-data';
import https from 'https';
import sharp from 'sharp';
import { QueryCache, toiPayload } from './redis';

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
    await toiCache.set({ 
      jobId: TOIJobId, 
      status: 'processing-started', 
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
        status: 'error', 
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
        status: 'error', 
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
        status: 'downloading-images', 
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
        status: 'processing-images', 
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
        status: 'calling-openai', 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      // Create File objects for OpenAI
      console.log('Creating files for OpenAI API...');
      const modelFile = await toFile(processedModelsBuffer, 'model.png', { type: 'image/png' }) as unknown as File;
      const frontFile = await toFile(frontImageBuffer, 'front.png', { type: 'image/png' }) as unknown as File;
      const backFile = await toFile(backImageBuffer, 'back.png', { type: 'image/png' }) as unknown as File;
      
      const prompt = `Replace the model's outfit in the photo with a new one. 
      Pay particular attention to the details of the dress (e.g., straps, flow, and hang). 
      I've provided back and front images of the garment so you know how it looks and flows. 
      Make the design match as closely as possible. The model's face must match that of the person in the picture. 
      Pay particular attention to the eyes, mouth and nose. Get the facial details as close to the original as possible. 
      For female models of colour, do not make them fatter than the pictures are. make them look slimer but not skinny. 
      Return a square image.`;

      // Call OpenAI API with files
      console.log('Calling OpenAI API for image generation...');
      
      const images = [modelFile, frontFile, backFile];
      const response = await openai.images.edit({
        image: images,
        prompt: prompt,
        model: "gpt-image-1",
        n: 1,
        size: "1024x1024",
        quality: "high",
        background: "auto"
      });
      
      // Update status after OpenAI call
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: 'processing-openai-response', 
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
          status: 'error', 
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
          status: 'error', 
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
      
      // Update status before uploading result
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: 'received-openai-image', 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      // Upload to UploadThing
      console.log('Uploading generated image to UploadThing...');
      const fileName = `toi-${TOIJobId}.jpg`;
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      const uploadFile = new File([blob], fileName, { type: 'image/jpeg' });
      
      // Upload to UploadThing
      const uploadResult = await utapi.uploadFiles(uploadFile);
      
      if (!uploadResult.data) {
        console.error('UploadThing returned no data');
        await toiCache.set({ 
          jobId: TOIJobId, 
          status: 'error', 
          error: 'Upload failed - no data returned', 
          productId, 
          md5sum,
          timestamp: Date.now() 
        });
        return null;
      }
      
      // Get URL from result
      const finalImageUrl = uploadResult.data.ufsUrl;
      console.log(`Final image URL: ${finalImageUrl}`);
      
      // Update cache with success
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: 'completed', 
        url: finalImageUrl, 
        productId, 
        md5sum,
        timestamp: Date.now() 
      });
      
      return finalImageUrl;
      
    } catch (processingError) {
      console.error('Error in image processing:', processingError);
      await toiCache.set({ 
        jobId: TOIJobId, 
        status: 'error', 
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
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error', 
      productId, 
      md5sum,
      timestamp: Date.now() 
    });
    return null;
  }
}