import fs from 'fs';
import path from 'path';
import { UTApi, UTFile } from 'uploadthing/server';
import OpenAI, { toFile } from 'openai';
import { products } from '../product-data';
import https from 'https';
import sharp from 'sharp';

// Initialize UploadThing API client
const utapi = new UTApi();

// Initialize OpenAI client with extended timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // 3 minutes in milliseconds
  maxRetries: 2 // Allow retries if the request fails
});

// Function to download file from URL
async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`Downloading file from ${url} to ${dest}`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => {
          reject(new Error(`Failed to download, status code: ${response.statusCode}`));
        });
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {
        reject(err);
      });
    });
  });
}

// Function to process image with OpenAI
export async function processImageWithAI(
  uploadedImagePath: string,
  md5sum: string,
  productId: number
): Promise<string | null> {
  try {
    console.log(`Processing image for product ${productId} with md5sum ${md5sum}`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Get product details
    const product = products.find(p => p.id === productId);
    if (!product || !product.uploads || product.uploads.length < 2) {
      console.error(`Product ${productId} not found or doesn't have required uploads`);
      return null;
    }
    
    // Download product images
    const frontImagePath = path.join(tempDir, `product_front_${productId}.webp`);
    const backImagePath = path.join(tempDir, `product_back_${productId}.webp`);
    
    await downloadFile(product.uploads[0].ufsUrl, frontImagePath);
    await downloadFile(product.uploads[1].ufsUrl, backImagePath);
    
    console.log('Product images downloaded successfully');
    
    // Prepare image file paths
    const resultImagePath = path.join(tempDir, `result_${md5sum}_${productId}.png`);
    
    // Check file format and prepare for OpenAI
    let processedImagePath = uploadedImagePath;
    let imageFormat: string;
    
    try {
      // Read the uploaded image and detect its format
      const uploadedImageBuffer = fs.readFileSync(uploadedImagePath);
      const imageInfo = await sharp(uploadedImageBuffer).metadata();
      imageFormat = imageInfo.format || 'unknown';
      
      console.log(`Original image format: ${imageFormat}, size: ${uploadedImageBuffer.length} bytes`);
      
      // Check if the format is already supported by OpenAI
      const supportedFormats = ['jpeg', 'png', 'webp'];
      
      if (!supportedFormats.includes(imageFormat)) {
        // Convert to PNG if not in a supported format
        console.log(`Converting from ${imageFormat} to png format`);
        const pngImagePath = path.join(tempDir, `upload_${md5sum}.png`);
        
        await sharp(uploadedImageBuffer)
          .png() // Convert to PNG
          .toFile(pngImagePath);
        
        processedImagePath = pngImagePath;
        console.log(`Converted image to PNG format at ${pngImagePath}`);
        
        // Verify the file exists
        if (!fs.existsSync(pngImagePath)) {
          throw new Error('PNG conversion failed - output file does not exist');
        }
        
        // Log the file info for debugging
        const stats = fs.statSync(pngImagePath);
        console.log(`Converted PNG file size: ${stats.size} bytes`);
      } else {
        console.log(`Image already in supported format (${imageFormat}), using as-is`);
      }
    } catch (error) {
      console.error('Error processing image format:', error);
      return null;
    }
    
    // Now we'll prepare all images for OpenAI (user + product images)
    console.log('Using images for OpenAI:');
    console.log('- User image:', processedImagePath);
    console.log('- Front product image:', frontImagePath);
    console.log('- Back product image:', backImagePath);
    
    // Create an array of all images to send to OpenAI
    const imageFiles = [
      processedImagePath,  // User's uploaded image first
      frontImagePath,     // Front view of product
      backImagePath       // Back view of product
    ];
    
    // Convert all images to proper file objects for OpenAI
    const images = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          // Get metadata from the image using Sharp
          const metadata = await sharp(file).metadata();
          const format = metadata.format || 'unknown';
          
          // Map format to MIME type
          const mimeType = format === 'png' ? 'image/png' : 
                          format === 'webp' ? 'image/webp' : 
                          format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : 'image/png';
          
          console.log(`Processing ${file} - detected format: ${format}, using MIME type: ${mimeType}`);
          
          // Convert to an OpenAI-compatible format if needed
          if (!['png', 'jpeg', 'webp'].includes(format)) {
            console.log(`Converting ${file} from ${format} to png`); 
            const tempPngPath = `${file}.png`;
            await sharp(file).png().toFile(tempPngPath);
            
            // Use the converted file instead
            const result = await toFile(fs.createReadStream(tempPngPath), null, { type: 'image/png' });
            // Clean up temp file
            fs.unlinkSync(tempPngPath);
            return result;
          }
          
          return await toFile(fs.createReadStream(file), null, { type: mimeType });
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
          throw error;
        }
      })
    );
    
    console.log('Making OpenAI API call with multiple images (may take up to 3 minutes)...');
    
    // Track start time for logging
    const startTime = Date.now();
    
    let b64Image: string | undefined;
    let useUnavailableImage = false;
    
    try {
      // Send all images to OpenAI with extended timeout
      console.log('Calling OpenAI API with multiple images...');
      const response = await openai.images.edit({
        image: images,
        prompt: `Create a realistic virtual try-on image where the person in the first image is wearing the ${product.name.toLowerCase()} shown in the reference images. Maintain the person's pose, proportions, and background from the first image, but replace their clothing with the ${product.name.toLowerCase()}. The garment should look natural, with accurate draping, fit, and fabric texture based on the front and back product images provided.`,
        model: "gpt-image-1",
        n: 1,
        size: "1024x1024",
        quality: "high",
        background: "auto",
        moderation: "auto"
      });
      
      // Calculate elapsed time
      const elapsedTime = (Date.now() - startTime) / 1000;
      console.log(`OpenAI response received in ${elapsedTime.toFixed(2)} seconds`);
      // if response dump the data to a file
      fs.writeFileSync('openai_response.json', JSON.stringify(response, null, 2));
      
      
      if (response.created) {
        const blob = response?.data?.[0]?.b64_json;
        if (blob) {
          b64Image = Buffer.from(blob, 'base64');
        }
      } else {
        console.error('No result URL received from OpenAI, using fallback image');
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
    
    if (!b64Image) {
      // read unavailable file into b64Image if OpenAI failed
      const unavailablePath = path.resolve(process.cwd(), 'public/unavailable.png');
      console.log(`Using fallback image: ${unavailablePath}`);
      const imageBuffer = fs.readFileSync(unavailablePath);
      b64Image = imageBuffer;
    }

    // Save b64Image to output path (needed for either approach)
    if (b64Image) {
      fs.writeFileSync(resultImagePath, b64Image);
      console.log(`Saved image to ${resultImagePath}`);
    } else {
      console.error('No image data available to save');
      return null;
    }
    
    // upload the image to uploadthing
    try {
      // For b64 Buffer uploads, we need to create a File-like object
      const fileName = `${md5sum}-${productId}.png`;
      
      // For UploadThing, create a proper Blob and then a File object
      // This handles both Buffer and string types for b64Image
      const blob = new Blob([b64Image], { type: 'image/png' });
      const file = new File([blob], fileName, { type: "image/png" });
      
      // Upload to UploadThing
      console.log(`Uploading image to UploadThing (target: ${toiUrl})...`);
      const uploadResult = await utapi.uploadFiles(file, { customId: `${md5sum}-${productId}` });
      
      console.log('UploadThing upload result:', JSON.stringify(uploadResult, null, 2)); 
      
      // Return the TOI URL after successful upload
      return toiUrl;
    } catch (error) {
      console.error('Error uploading to UploadThing:', error);
      // Still return the TOI URL even if upload failed - the URL is predetermined
      return toiUrl;
    }
    
    // Clean up temp files
    try {
      fs.unlinkSync(frontImagePath);
      fs.unlinkSync(backImagePath);
      fs.unlinkSync(resultImagePath);
      
      // Only delete the processed image if it's different from the original
      if (processedImagePath !== uploadedImagePath) {
        fs.unlinkSync(processedImagePath);
      }
      
      fs.unlinkSync(uploadedImagePath);
      console.log('Temporary files cleaned up successfully');
    } catch (err) {
      console.error('Error cleaning up temp files:', err);
    }
    
    console.log('Image processing completed successfully');
    console.log(`Final TOIUrl: ${toiUrl}`);
    return toiUrl;
  } catch (error) {
    console.error('Error in processImageWithAI:', error);
    return null;
  }
}

// Function to decode and save base64 image
export function saveBase64Image(base64Data: string, md5sum: string): string {
  // Create temp directory if it doesn't exist
  const tempDir = path.resolve(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Remove header if present (e.g., data:image/jpeg;base64,)
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const imagePath = path.join(tempDir, `upload_${md5sum}.webp`);
  
  // Save the image
  fs.writeFileSync(imagePath, Buffer.from(base64Image, 'base64'));
  
  return imagePath;
}
