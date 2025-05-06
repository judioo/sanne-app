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
  
  const errorMessage = JSON.stringify(error);
  return errorMessage.includes('Duplicate entry') || 
         errorMessage.includes('AlreadyExists') || 
         errorMessage.includes('external_id_idx');
}

// Helper function to analyze and log error with decision
function analyzeError(error: any, customId: string, sourceUrl: string): string {
  // Convert error to string for easier parsing
  const errorStr = JSON.stringify(error);
  console.error('\n🔍 ERROR ANALYSIS:');
  console.error(`Source URL: ${sourceUrl}`);
  console.error(`CustomID: ${customId}`);
  
  if (isDuplicateEntryError(error)) {
    console.error('✓ Identified as duplicate entry error');
    console.error('✓ This indicates the file was already uploaded previously');
    console.error('✓ Decision: Treat as success and attempt to retrieve the existing URL');
    return 'DUPLICATE_ENTRY';
  } 
  
  if (errorStr.includes('Invalid token')) {
    console.error('✗ Invalid token error detected');
    console.error('✗ Issue with the UPLOADTHING_TOKEN provided');
    console.error('✗ Decision: Check token format and validity in .env.local file');
    return 'INVALID_TOKEN';
  }
  
  if (errorStr.includes('timed out') || errorStr.includes('ETIMEDOUT')) {
    console.error('✗ Request timed out');
    console.error('✗ This could be due to network issues or large file size');
    console.error('✗ Decision: Skip this file and continue with others');
    return 'TIMEOUT';
  }
  
  if (errorStr.includes('404') || errorStr.includes('not found')) {
    console.error('✗ Source image not found (404)');
    console.error('✗ The source URL may be invalid or no longer accessible');
    console.error('✗ Decision: Skip this file and continue with others');
    return 'SOURCE_NOT_FOUND';
  }
  
  console.error('✗ Unknown error type');
  console.error('✗ Full error:', errorStr.substring(0, 500) + (errorStr.length > 500 ? '...' : ''));
  console.error('✗ Decision: Skip this file and continue with others');
  return 'UNKNOWN_ERROR';
}

async function uploadProductImages() {
  console.log("\n==================================================");
  console.log("🚀 STARTING UPLOAD PROCESS FOR PRODUCT IMAGES");
  console.log("==================================================\n");
  
  // Create a structure to prepare all image uploads
  const allUploadFiles: { url: string; name: string; customId: string }[] = [];
  console.log("\n📋 PREPARING FILES FOR UPLOAD");
  console.log("----------------------------");
  
  // Prepare all file upload requests
  products.forEach(product => {
    console.log(`\n🏷️  Product ID: ${product.id} - ${product.name}`);
    
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
      
      console.log(`   📎 Image ${index + 1}:`);
      console.log(`      - Source URL:  ${imageUrl}`);
      console.log(`      - CustomID:    ${customId}`);
      console.log(`      - Output Name: ${fileName}`);
    });
  });
  
  console.log(`\n✅ Prepared ${allUploadFiles.length} files for upload`);

  try {
    console.log("\n📤 STARTING BATCH UPLOADS");
    console.log("------------------------");
    
    // Upload all files in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const productUploads: ProductUploadMap = {};
    
    // Statistics
    let successCount = 0;
    let failureCount = 0;
    let duplicateCount = 0;
    let otherErrorCount = 0;
    
    for (let i = 0; i < allUploadFiles.length; i += BATCH_SIZE) {
      const batch = allUploadFiles.slice(i, i + BATCH_SIZE);
      
      console.log(`\n🔄 Processing Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allUploadFiles.length / BATCH_SIZE)}`);
      console.log(`   Files in this batch: ${batch.length}`);
      
      batch.forEach((file, idx) => {
        console.log(`   ${idx+1}. ${file.name} (${file.customId}) - ${file.url}`);
      });
      
      try {
        console.log(`\n   Sending upload request to Uploadthing...`);
        const uploadedFiles = await utapi.uploadFilesFromUrl(batch);
        console.log(`   Received response for ${uploadedFiles.length} files`);
        
        // Process the results
        uploadedFiles.forEach((result: UploadthingResponse, index: number) => {
          const { customId, name, url: sourceUrl } = batch[index];
          const productId = parseInt(customId.replace('product-', ''));
          
          // Initialize the array if needed
          if (!productUploads[productId]) {
            productUploads[productId] = [];
          }
          
          console.log(`\n   📝 Result for file ${index + 1}:`);
          console.log(`      - CustomID:    ${customId}`);
          console.log(`      - Output Name: ${name}`);
          console.log(`      - Source URL:  ${sourceUrl}`);
          
          if (result.error) {
            const errorType = analyzeError(result.error, customId, sourceUrl);
            
            if (errorType === 'DUPLICATE_ENTRY') {
              duplicateCount++;
              console.log(`      ♻️  DUPLICATE: File already exists on Uploadthing`);
              
              // In a production environment, we would fetch the existing URL here
              // For now, we note it and could implement a way to retrieve it later
              console.log(`      ℹ️  NOTE: Will need to fetch existing URL separately`);
            } else {
              failureCount++;
              otherErrorCount++;
              console.log(`      ❌ FAILED: ${result.error.message || 'Unknown error'}`);
            }
            return;
          }
          
          // Get URL from the result (handling V7 API changes)
          const uploadUrl = getUrlFromResponse(result);
          if (uploadUrl) {
            successCount++;
            productUploads[productId].push(uploadUrl);
            console.log(`      ✅ SUCCESS: Uploaded to ${uploadUrl}`);
          } else {
            failureCount++;
            console.log(`      ❌ FAILED: Could not extract URL from response`);
          }
        });
        
      } catch (batchError) {
        console.error(`\n❌ BATCH ERROR:`);
        console.error(batchError);
        console.error(`Decision: Continuing with next batch`);
        failureCount += batch.length;
      }
      
      // Sleep to avoid rate limiting
      if (i + BATCH_SIZE < allUploadFiles.length) {
        console.log('\n⏳ Waiting 1 second before next batch to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log("\n==================================================");
    console.log("📊 UPLOAD PROCESS SUMMARY");
    console.log("==================================================");
    console.log(`✅ Successfully processed: ${successCount} files`);
    console.log(`♻️  Duplicate entries:     ${duplicateCount} files`);
    console.log(`❌ Failed uploads:        ${failureCount - duplicateCount} files`);
    console.log(`📋 Total files processed: ${allUploadFiles.length} files`);
    
    // Update products with the new upload URLs
    const updatedProducts = products.map(product => {
      const uploads = productUploads[product.id] || [];
      
      console.log(`\n🏷️  Product ${product.id} (${product.name}):`);
      console.log(`   - Original images: ${product.images.length}`);
      console.log(`   - Successful uploads: ${uploads.length}`);
      
      if (uploads.length > 0) {
        console.log(`   - Upload URLs:`);
        uploads.forEach((url, idx) => {
          console.log(`     ${idx+1}. ${url}`);
        });
      }
      
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
    console.log(`\n📄 Updated product data written to ${originalFilePath}`);
    
  } catch (error) {
    console.error("\n❌ FATAL ERROR:");
    console.error(error);
  }
}

// Execute the upload function
uploadProductImages().catch(console.error);
