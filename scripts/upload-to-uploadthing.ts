import { UTApi } from "uploadthing/server";
import { products } from "../server/product-data";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to upload product images to uploadthing and update product data
 * 
 * Usage: 
 * 1. Install dependencies: pnpm add uploadthing
 * 2. Set your UPLOADTHING_SECRET in .env
 * 3. Run with: pnpx tsx scripts/upload-to-uploadthing.ts
 */

// Types for Uploadthing response
type UploadthingResponse = {
  data?: {
    url: string;
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

// Initialize the uploadthing API client
const utapi = new UTApi({
  apiKey: process.env.UPLOADTHING_SECRET,
});

// Type for mapping product IDs to upload URLs
type ProductUploadMap = {
  [productId: number]: string[];
};

async function uploadProductImages() {
  console.log("Starting upload process for all product images...");
  
  // Create a structure to prepare all image uploads
  const allUploadFiles: { url: string; name: string; customId: string }[] = [];
  
  // Prepare all file upload requests
  products.forEach(product => {
    product.images.forEach((imageUrl, index) => {
      // Get the file extension from the URL
      const extension = path.extname(imageUrl.split('?')[0]) || '.jpg';
      
      // Create a unique name for the file
      const fileName = `product-${product.id}-image-${index + 1}${extension}`;
      
      // Add to all files to upload
      allUploadFiles.push({
        url: imageUrl,
        name: fileName,
        customId: `product-${product.id}`
      });
    });
  });
  
  console.log(`Prepared ${allUploadFiles.length} files for upload`);

  try {
    // Upload all files in batches to avoid rate limiting
    const BATCH_SIZE = 10;
    const productUploads: ProductUploadMap = {};
    
    for (let i = 0; i < allUploadFiles.length; i += BATCH_SIZE) {
      const batch = allUploadFiles.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allUploadFiles.length / BATCH_SIZE)}`);
      
      const uploadedFiles = await utapi.uploadFilesFromUrl(batch);
      
      // Process the results
      uploadedFiles.forEach((result: UploadthingResponse, index: number) => {
        if (result.error) {
          console.error(`Failed to upload ${batch[index].url}: ${result.error.message}`);
          return;
        }
        
        // Extract product ID from customId
        const customId = batch[index].customId;
        const productId = parseInt(customId.replace('product-', ''));
        
        // Initialize the array if needed
        if (!productUploads[productId]) {
          productUploads[productId] = [];
        }
        
        // Add the URL to the product uploads
        if (result.data) {
          productUploads[productId].push(result.data.url);
        }
      });
      
      // Sleep to avoid rate limiting
      if (i + BATCH_SIZE < allUploadFiles.length) {
        console.log('Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log("All uploads completed successfully");
    
    // Update products with the new upload URLs
    const updatedProducts = products.map(product => {
      const uploads = productUploads[product.id] || [];
      return {
        ...product,
        uploads
      };
    });
    
    // Write the updated product data back to a file
    const outputPath = path.join(__dirname, '../server/product-data-with-uploads.ts');
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
    
    fs.writeFileSync(outputPath, fileContent);
    console.log(`Updated product data written to ${outputPath}`);
    
  } catch (error) {
    console.error("Error during upload process:", error);
  }
}

// Execute the upload function
uploadProductImages().catch(console.error);
