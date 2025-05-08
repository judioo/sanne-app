import { UTApi, UTFile } from 'uploadthing/server';
import OpenAI, { toFile } from 'openai';
import { products } from '../product-data';
import https from 'https';
import sharp from 'sharp';
import { QueryCache, toiPayload } from './redis';

// Initialize UploadThing API client
const utapi = new UTApi();

const toiCache = QueryCache<toiPayload>();

// Initialize OpenAI client with extended timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // 3 minutes in milliseconds
  maxRetries: 2 // Allow retries if the request fails
});

// Function to download file from URL and return as Buffer
async function downloadFileToBuffer(url: string): Promise<Buffer> {
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
  imageBase64: string,
  md5sum: string,
  productId: number
): Promise<string | null> {
  try {
    console.log(`Processing image for product ${productId} with md5sum ${md5sum}`);
    
    // Get product details
    const product = products.find(p => p.id === productId);
    if (!product || !product.uploads || product.uploads.length < 2) {
      console.error(`Product ${productId} not found or doesn't have required uploads`);
      return null;
    }

    const TOIJobId = `${md5sum}-${productId}`;
    await toiCache.set({ jobId: TOIJobId, status: 'pending', productId, md5sum });
    
    // Download product images to memory
    console.log(`Downloading product images for ${productId}`);
    
    // Download front and back images to memory
    const frontImageBuffer = await downloadFileToBuffer(product.uploads[0].ufsUrl);
    const backImageBuffer = await downloadFileToBuffer(product.uploads[1].ufsUrl);
    
    console.log(`Product images downloaded successfully: front=${frontImageBuffer.length} bytes, back=${backImageBuffer.length} bytes`);
    
    // Convert base64 string to buffer and detect format
    let userImageBuffer: Buffer;
    let imageFormat: string = 'png'; // Default format
    
    try {
      // Remove header if present (e.g., data:image/jpeg;base64,)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Convert base64 to buffer
      userImageBuffer = Buffer.from(base64Data, 'base64');
      console.log(`Converted base64 to buffer: ${userImageBuffer.length} bytes`);
      
      // Detect format using Sharp
      const imageInfo = await sharp(userImageBuffer).metadata();
      imageFormat = imageInfo.format || 'unknown';
      
      console.log(`Detected image format: ${imageFormat}`);
      
      // Check if format needs conversion
      const supportedFormats = ['jpeg', 'png', 'webp'];
      
      if (!supportedFormats.includes(imageFormat)) {
        // Convert to PNG if not in a supported format
        console.log(`Converting from ${imageFormat} to png format in memory`);
        
        // Use Sharp to convert in memory
        userImageBuffer = await sharp(userImageBuffer)
          .png() // Convert to PNG
          .toBuffer();
        
        console.log(`Converted image to PNG format in memory: ${userImageBuffer.length} bytes`);
        imageFormat = 'png';
      } else {
        console.log(`Image already in supported format (${imageFormat}), using as-is`);
      }
    } catch (error) {
      console.error('Error processing base64 image:', error);
      return null;
    }
    
    // Prepare all images for OpenAI (user + product images)
    console.log('Using images for OpenAI:');
    console.log(`- User image: ${userImageBuffer.length} bytes, format: ${imageFormat}`);
    console.log(`- Front product image: ${frontImageBuffer.length} bytes`);
    console.log(`- Back product image: ${backImageBuffer.length} bytes`);
    
    // Prepare all images in memory for OpenAI
    console.log('Preparing images for OpenAI...');
    await toiCache.set({ jobId: TOIJobId, status: 'preparing images', productId, md5sum });

    // Convert all images to proper file objects for OpenAI
    const images = await Promise.all([
      // User's image
      (async () => {
        const mimeType = imageFormat === 'png' ? 'image/png' : 
                         imageFormat === 'webp' ? 'image/webp' : 
                         imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        
        console.log(`Processing user image - format: ${imageFormat}, MIME type: ${mimeType}`);
        return await toFile(Buffer.from(userImageBuffer), 'user-image.png', { type: mimeType });
      })(),
      
      // Front product image
      (async () => {
        // Detect format using Sharp
        const metadata = await sharp(frontImageBuffer).metadata();
        const format = metadata.format || 'webp';
        const mimeType = format === 'png' ? 'image/png' : 
                          format === 'webp' ? 'image/webp' : 
                          format === 'jpeg' ? 'image/jpeg' : 'image/webp';
        
        console.log(`Processing front image - format: ${format}, MIME type: ${mimeType}`);
        return await toFile(Buffer.from(frontImageBuffer), 'front-image.webp', { type: mimeType });
      })(),
      
      // Back product image
      (async () => {
        // Detect format using Sharp
        const metadata = await sharp(backImageBuffer).metadata();
        const format = metadata.format || 'webp';
        const mimeType = format === 'png' ? 'image/png' : 
                          format === 'webp' ? 'image/webp' : 
                          format === 'jpeg' ? 'image/jpeg' : 'image/webp';
        
        console.log(`Processing back image - format: ${format}, MIME type: ${mimeType}`);
        return await toFile(Buffer.from(backImageBuffer), 'back-image.webp', { type: mimeType });
      })()
    ]);
    
    console.log('Making OpenAI API call with multiple images (may take up to 3 minutes)...');
    
    // Track start time for logging
    const startTime = Date.now();
    
    let b64Image: Buffer | null = null;
    let useUnavailableImage = false;
    
    try {
      // Send all images to OpenAI with extended timeout
      console.log('Calling OpenAI API with multiple images...');
      await toiCache.set({ jobId: TOIJobId, status: 'calling OpenAI', productId, md5sum });

      const prompt = `Replace the model's outfit in the photo with a new one. 
      Pay particular attention to the details of the dress (e.g., straps, flow, and hang). 
      I've provided back and front images of the garment so you know how it looks and flows. 
      Make the design match as closely as possible. The model's face must match that of the person in the picture. 
      Pay particular attention to the eyes, mouth and nose. Get the facial details as close to the original as possible. 
      For female models of colour, do not make them fatter than the pictures are. make them look slimer but not skinny. 
      Return a square image.`;

      const response = await openai.images.edit({
        image: images,
        prompt: prompt,
        model: "gpt-image-1",
        n: 1,
        size: "1024x1024",
        quality: "high",
        background: "auto"
      });
      
      // Calculate elapsed time
      const elapsedTime = (Date.now() - startTime) / 1000;
      console.log(`OpenAI response received in ${elapsedTime.toFixed(2)} seconds`);
      
      if (response.created) {
        const base64Data = response?.data?.[0]?.b64_json;
        if (base64Data) {
          // Convert base64 string to Buffer
          b64Image = Buffer.from(base64Data, 'base64');
          console.log(`Received OpenAI image as base64, size: ${b64Image.length} bytes`);
          await toiCache.set({ jobId: TOIJobId, status: 'received OpenAI image', productId, md5sum });
        } else {
          console.error('No base64 data received from OpenAI');
          await toiCache.set({ jobId: TOIJobId, status: 'no base64 data received from OpenAI', productId, md5sum });
          useUnavailableImage = true;
        }
      } else {
        console.error('OpenAI response invalid, using fallback image');
        await toiCache.set({ jobId: TOIJobId, status: 'OpenAI response invalid, using fallback image', productId, md5sum });
        useUnavailableImage = true;
      }
    } catch (error) {
      // Handle any errors from OpenAI
      const elapsedTime = (Date.now() - startTime) / 1000;
      console.error(`OpenAI API error after ${elapsedTime.toFixed(2)} seconds:`, error);
      useUnavailableImage = true;
    }
    
    // Get final processing time outside try/catch scope
    const totalElapsedTime = (Date.now() - startTime) / 1000;
    console.log(`OpenAI processing completed in ${totalElapsedTime.toFixed(2)} seconds`);
    
    // Compute the TOI URL - this is what we'll return regardless of success or failure
    const toiUrl = `https://qjqqeunp2n.ufs.sh/f/${md5sum}-${productId}`;
    
    // Handle fallback image if needed
    if (!b64Image || useUnavailableImage) {
      // Load fallback image from URL instead of from disk
      const fallbackImageUrl = 'https://qjqqeunp2n.ufs.sh/f/od09cELhFxDCGQTATl4GN267MkFxYc0XhIaUj3WefDHQuLbJ';
      console.log(`Using fallback image from URL: ${fallbackImageUrl}`);
      
      try {
        // Download the fallback image directly into memory
        b64Image = await downloadFileToBuffer(fallbackImageUrl);
        console.log(`Downloaded fallback image: ${b64Image.length} bytes`);
      } catch (error) {
        console.error('Error downloading fallback image:', error);
        // Create an empty buffer as absolute last resort
        b64Image = Buffer.from([]);
      }
    } else {
      console.log(`Using OpenAI-generated image: ${b64Image.length} bytes`);
    }
    
    // upload the image to uploadthing
    try {
      // For b64 Buffer uploads, we need to create a File-like object
      const fileName = `${md5sum}-${productId}.png`;
      
      // For UploadThing, create a proper Blob and then a File object
      // Since b64Image is always a Buffer at this point, we can safely use it
      // First, create a Blob with the correct MIME type
      const blob = new Blob([b64Image as Buffer], { type: 'image/png' });
      // Then create a File object to upload
      const file = new File([blob], fileName, { type: "image/png" });
      
      // Upload to UploadThing
      console.log(`Uploading image to UploadThing (target: ${toiUrl})...`);
      const uploadResult = await utapi.uploadFiles(file, { customId: `${md5sum}-${productId}` });
      
      console.log('UploadThing upload result:', JSON.stringify(uploadResult, null, 2)); 
      console.log(`customId: ${md5sum}-${productId}`);
      
      // Return the TOI URL after successful upload
      await toiCache.set({ jobId: TOIJobId, status: 'completed', productId, md5sum, uploadResult });
    } catch (error) {
      console.error('Error uploading to UploadThing:', error);
      // Still return the TOI URL even if upload failed - the URL is predetermined
      await toiCache.set({ jobId: TOIJobId, status: 'failed', productId, md5sum });
    }
  } catch (error) {
    console.error('Error in processImageWithAI:', error);
    return null;
  }
}