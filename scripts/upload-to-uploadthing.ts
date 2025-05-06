// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock type for Uploadthing SDK while not installed
// This allows the script to be type-checked without installing uploadthing
type UTApiOptions = {
  apiKey: string | undefined;
};

// Mock UTApi class until the actual package is installed
class UTApi {
  constructor(options: UTApiOptions) {}
  
  async uploadFilesFromUrl(files: Array<{ url: string; name: string; customId: string }>): Promise<Array<any>> {
    return [];
  }

  // Added method to retrieve existing files
  async getFiles(customId: string): Promise<any[]> {
    return [];
  }
}

import { products } from "../server/product-data";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to upload product images to uploadthing and update product data
 * 
 * Usage: 
 * 1. Install dependencies: pnpm add uploadthing dotenv
 * 2. Set your UPLOADTHING_TOKEN in .env.local file
 * 3. Run with: pnpx tsx scripts/upload-to-uploadthing.ts
 */

// Types for Uploadthing response
type UploadthingResponse = {
  data?: {
    url: string;
    ufsUrl?: string; // New V7 API uses ufsUrl
    key: string;
    name: string;
    size: number;
  };
  error?: {
    code: string;
    message: string;
    data?: any;
  };
};

// Check for required environment variables
if (!process.env.UPLOADTHING_TOKEN) {
  console.error('❌ UPLOADTHING_TOKEN environment variable is not set');
  console.log('Please set your UPLOADTHING_TOKEN in .env.local file');
  console.log('Example .env.local file content: UPLOADTHING_TOKEN=your_token_here');
  process.exit(1);
}

// Only use the real UTApi when the script is actually running
// This allows the script to be type-checked without the package installed
let utapi: UTApi;
try {
  // Try to import the actual UTApi - this will be skipped during type checking
  // and will only run when the script is executed
  const { UTApi: ActualUTApi } = require("uploadthing/server");
  utapi = new ActualUTApi({
    apiKey: process.env.UPLOADTHING_TOKEN,
  });
  console.log('✅ UTApi initialized with token');
} catch (error) {
  // During development/type checking, use the mock
  utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_TOKEN,
  });
  console.warn('Using mock UTApi - make sure to install uploadthing before running');
  console.error(error);
  process.exit(1);
}

// Type for mapping product IDs to upload URLs
type ProductUploadMap = {
  [productId: number]: string[];
};

// Helper function to extract a proper URL from the response
function getUrlFromResponse(response: UploadthingResponse): string | null {
  if (!response.data) return null;
  
  // Try to get the V7 API URL format first, then fall back to earlier version
  return response.data.ufsUrl || response.data.url || null;
}

// Helper function to check if an error is a duplicate entry error
function isDuplicateEntryError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  return errorMessage.includes('Duplicate entry') || 
         errorMessage.includes('AlreadyExists') || 
         errorMessage.includes('external_id_idx');
}

async function uploadProductImages() {
  console.log("Starting upload process for all product images...");
  
  // Create a structure to prepare all image uploads
  const allUploadFiles: { url: string; name: string; customId: string }[] = [];
  
  // Prepare all file upload requests
  products.forEach(product => {
    product.images.forEach((imageUrl, index) => {
      // Get the file extension from the URL
      const extension = path.extname(imageUrl.split('?')[0]) || '.jpg';
      
      // Create a unique name for the file based on the customId pattern
      const customId = `product-${product.id}`;
      const fileName = `${customId}-${index + 1}${extension}`;
      
      // Add to all files to upload
      allUploadFiles.push({
        url: imageUrl,
        name: fileName,
        customId: customId
      });
      
      console.log(`Prepared upload: ${fileName} with customId ${customId} from ${imageUrl}`);
    });
  });
  
  console.log(`Prepared ${allUploadFiles.length} files for upload`);

  try {
    // Upload all files in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const productUploads: ProductUploadMap = {};
    
    for (let i = 0; i < allUploadFiles.length; i += BATCH_SIZE) {
      const batch = allUploadFiles.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allUploadFiles.length / BATCH_SIZE)}`);
      
      try {
        const uploadedFiles = await utapi.uploadFilesFromUrl(batch);
        
        // Process the results
        uploadedFiles.forEach((result: UploadthingResponse, index: number) => {
          const { customId, url: sourceUrl } = batch[index];
          const productId = parseInt(customId.replace('product-', ''));
          
          // Initialize the array if needed
          if (!productUploads[productId]) {
            productUploads[productId] = [];
          }
          
          if (result.error) {
            if (isDuplicateEntryError(result.error)) {
              console.log(`File with customId ${customId} already exists. Treating as success.`);
              
              // Try to fetch the existing file with this customId
              try {
                const getFilesResult = utapi.getFiles(customId);
                console.log(`Found existing file: ${JSON.stringify(getFilesResult)}`);
                
                // We'll handle this in the catch block if getFiles isn't supported
                throw new Error('Getting existing files not implemented');
              } catch (getFilesError) {
                // If we can't get the existing file, use a placeholder URL for now
                // In a real implementation, you'd want to query the files by customId
                console.log(`Will update with existing URLs when possible`);
                
                // Don't add anything to the productUploads in this case
                // We'll need to handle existing files separately
              }
            } else {
              console.error(`Failed to upload ${sourceUrl}: ${result.error.message}`);
            }
            return;
          }
          
          // Get URL from the result (handling V7 API changes)
          const uploadUrl = getUrlFromResponse(result);
          if (uploadUrl) {
            productUploads[productId].push(uploadUrl);
            console.log(`Successfully uploaded ${sourceUrl} to ${uploadUrl}`);
          } else {
            console.error(`Failed to get URL from response for ${sourceUrl}`);
          }
        });
        
      } catch (batchError) {
        console.error(`Error uploading batch: ${batchError}`);
        // Continue with next batch even if this one fails
      }
      
      // Sleep to avoid rate limiting
      if (i + BATCH_SIZE < allUploadFiles.length) {
        console.log('Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log("All uploads completed");
    
    // Count successful uploads
    let totalUrls = 0;
    Object.values(productUploads).forEach(urls => {
      totalUrls += urls.length;
    });
    console.log(`Successfully processed ${totalUrls} URLs out of ${allUploadFiles.length} files`);
    
    // Update products with the new upload URLs
    const updatedProducts = products.map(product => {
      const uploads = productUploads[product.id] || [];
      return {
        ...product,
        uploads
      };
    });
    
    // Write the updated product data back to the original file
    const originalFilePath = path.join(__dirname, '../server/product-data.ts');
    const fileContent = `import { z } from 'zod';

// Product schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  numericPrice: z.number(),
  images: z.array(z.string()),
  productUrl: z.string().optional(),
  category: z.enum(['men', 'women']),
  collections: z.array(z.string()),
  uploads: z.array(z.string()),
});

export type Product = z.infer<typeof ProductSchema>;

// Product data with uploadthing URLs
export const products: Product[] = ${JSON.stringify(updatedProducts, null, 2)};
`;
    
    fs.writeFileSync(originalFilePath, fileContent);
    console.log(`Updated product data written to ${originalFilePath}`);
    
  } catch (error) {
    console.error("Error during upload process:", error);
  }
}

// Execute the upload function
uploadProductImages().catch(console.error);
