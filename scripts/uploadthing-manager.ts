import * as fs from 'fs';
import * as path from 'path';
import { UTApi } from 'uploadthing/server';
import dotenv from 'dotenv';
import { products } from '../server/product-data';
import { UploadFileResult } from 'uploadthing/types';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get API key from environment variable
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

// Initialize UploadThing API client
const utapi = new UTApi({ apiKey: UPLOADTHING_TOKEN });


interface CustomFileMetadata {
    customId: string;
    productId: number;
    files: {url: string, name: string, customId: string}[];
    uploads: {originalUrl: string, ufsUrl: string, key: string}[];
}

interface UploadthingResponse {
    data: {
      // Legacy format
      url?: string;
      // New format in v7
      ufsUrl?: string;
      key?: string;
    };
  }

const getImageURLsFromProducts = () => {
    const imageList: {id: number, images: string[]}[] = [];
    products.forEach(p => {
        imageList.push({id: p.id, images: p.images});
    });
    return imageList;
}

const buildCustomFileMetadata = (imageList: {id: number, images: string[]}[]) => {
    const customFileMetadata: CustomFileMetadata[] = [];

    imageList.forEach(p => {
        const metadata: CustomFileMetadata = {
                customId: process.hrtime.bigint().toString() + "-" + p.id,//`product-${p.id}`,
                productId: p.id,
                files: [],
                uploads: []
        };
        p.images.forEach((url, index) => {
            // get the file extension from the URL
            const parts = url.match(/\.(\w+)$/);
            const extension = parts ? parts[1] : '';
            const name = `${metadata.customId}-${index}` + (extension ? `.${extension}` : '');

            metadata.files.push({
                url: url,
                name: name,
                customId: name
            });
        });
        customFileMetadata.push(metadata);
    });
    return customFileMetadata;
}

// Get URL from UploadThing response
function getUrlFromResponse(response: UploadFileResult): string | null {
    // Handle new UploadThing V7 response format
    console.log(`[getUrlFromResponse]Response: ${JSON.stringify(response, null, 2)}`);  
    return response?.data?.ufsUrl || response?.data?.url || null;
  }

const UploadMetaToUploadthing = async (customFileMetadata: CustomFileMetadata[]) => {
    // Process all products, not just the first one
    const result: CustomFileMetadata[] = [];
    
    // Process each metadata sequentially with await
    for (const metadata of customFileMetadata) {
        console.log(`Uploading ${metadata.files.length} files for product ${metadata.productId}`);
        console.log(metadata.files);
        // Upload the batch of files
        let uploadedFiles: UploadFileResult[] = [];
        try {
            uploadedFiles = await utapi.uploadFilesFromUrl(metadata.files);
        } catch (error) {
            console.log(`Failed to upload files for product ${metadata.productId}`);
            console.error(error);
            result.push(metadata); // Still add to result even if upload failed
            continue;
        }

        if (!uploadedFiles) {
            console.log(`Failed to upload files for product ${metadata.productId}`);
            result.push(metadata); // Still add to result even if upload failed
            continue;
        }

        // Process the results
        uploadedFiles.forEach((result: UploadFileResult, index: number) => {
            
            // Extract URL from the response
            const uploadUrl = getUrlFromResponse(result);
            
            if (uploadUrl) {
              console.log(`\n   📝 Result for file ${index + 1}:`);
              console.log(`      - CustomID:    ${metadata.customId}`);
              console.log(`      - Output Name: ${metadata.files[index].name}`);
              console.log(`      - Source URL:  ${metadata.files[index].url}`);
              console.log(`      - Upload URL:  ${uploadUrl}`);
              console.log(`      ✅ SUCCESS: ${uploadUrl}`);
              metadata.uploads.push({
                originalUrl: metadata.files[index].url,
                ufsUrl: uploadUrl,
                key: metadata.files[index].name
              });
                
            } else {
              console.log(`\n   📝 Result for file ${index + 1}:`);
              console.log(`      - CustomID:    ${metadata.customId}`);
              console.log(`      - Output Name: ${metadata.files[index].name}`);
              console.log(`      - Source URL:  ${metadata.files[index].url}`);
              console.log(`      ❌ FAILED: No URL in response`);
            }
        });
        
        result.push(metadata);
    }
    return result;
}

const main = async () => {
    try {
        console.log('Starting upload process...');
        const imageList = getImageURLsFromProducts();
        console.log(`Found ${imageList.length} products with images`);
        
        const customFileMetadata = buildCustomFileMetadata(imageList);
        console.log(`Built metadata for ${customFileMetadata.length} products`);
        
        const uploadedFiles = await UploadMetaToUploadthing(customFileMetadata);
        console.log(`Processed ${uploadedFiles.length} products`);
        
        // Make a deep copy of the products array to avoid modifying the imported module
        const productsToSave = JSON.parse(JSON.stringify(products));
        
        // Update uploads in the products copy
        uploadedFiles.forEach((file) => {
            const product = productsToSave.find((p: {id: number}) => p.id === file.productId);
            if (product) {
                product.uploads = file.uploads;
                console.log(`Updated product ${product.id} with ${file.uploads.length} uploads`);
            } else {
                console.log(`Product with ID ${file.productId} not found`);
            }
        });
        
        // Write to product-data.json
        const outputPath = path.resolve(process.cwd(), 'product-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(productsToSave, null, 2));
        console.log(`Successfully wrote data to ${outputPath}`);
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});