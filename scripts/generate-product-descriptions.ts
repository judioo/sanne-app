import { products, Product } from '../server/product-data';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') }); 

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for enriched products
type EnrichedUpload = {
  originalUrl: string;
  ufsUrl: string;
  key: string;
  description?: string;
};

type EnrichedProduct = Omit<Product, 'uploads'> & {
  uploads: EnrichedUpload[];
};

// Function to format description text with newlines for readability
function formatDescription(text: string): string {
  // Split text into sentences
  const sentences = text.replace(/([.!?])\s+/g, "$1\n").split('\n');
  
  // Group sentences into paragraphs (roughly 2-3 sentences per paragraph)
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  for (const sentence of sentences) {
    if (currentParagraph.length + sentence.length > 80 && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = sentence;
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + sentence;
    }
  }
  
  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }
  
  // Join paragraphs with double newlines
  return paragraphs.join('\n\n');
}

// Function to generate a description for the front view
async function generateFrontViewDescription(imageUrl: string): Promise<string> {
  try {
    console.log(`Generating description for front view: ${imageUrl}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Please provide a detailed description of this garment's front view. Focus on style, color, material, cut, and any distinctive features. The description should be detailed enough to use as a prompt for an image generation model. Be specific about patterns, textures, and design elements. Keep your description under 250 words." 
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description = response.choices[0]?.message?.content || "No description available";
    return formatDescription(description);
  } catch (error) {
    console.error(`Error generating description for ${imageUrl}:`, error);
    return formatDescription("Failed to generate description");
  }
}

// Function to generate a description for the back view with context from front view
async function generateBackViewDescription(imageUrl: string, frontDescription: string): Promise<string> {
  try {
    console.log(`Generating description for back view: ${imageUrl}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Description of the front: ${frontDescription}\n\nNow, please provide a detailed description of the back view of this same garment. Focus on how the back differs from the front, noting any unique features, cuts, or details visible from behind. Keep your description under 250 words. The total combined description (front and back) should not exceed 500 words.` 
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description = response.choices[0]?.message?.content || "No description available";
    return formatDescription(description);
  } catch (error) {
    console.error(`Error generating description for ${imageUrl}:`, error);
    return formatDescription("Failed to generate description");
  }
}

async function enrichProducts() {
  console.log("Starting to enrich products with descriptions...");
  const enrichedProducts: EnrichedProduct[] = [];
  
  // Create progress log file
  const logStream = createWriteStream('description-progress.log', { flags: 'a' });
  logStream.write(`Started process at ${new Date().toISOString()}\n`);

  // Process each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`Processing product ${i + 1}/${products.length}: ${product.name}`);
    
    if (!product.uploads || product.uploads.length === 0) {
      console.log(`No uploads found for product: ${product.name}`);
      enrichedProducts.push(product as EnrichedProduct);
      continue;
    }

    const enrichedUploads: EnrichedUpload[] = [];
    
    // Process front and back images with context between them
    if (product.uploads && product.uploads.length >= 1) {
      const frontUpload = product.uploads[0];
      logStream.write(`Processing ${product.name} - front view\n`);
      
      // Generate front view description
      let frontDescription: string;
      try {
        frontDescription = await generateFrontViewDescription(frontUpload.ufsUrl);
        logStream.write(`✅ Generated description for ${product.name} - front view\n`);
      } catch (error) {
        frontDescription = "Failed to generate front view description due to an error";
        logStream.write(`❌ Failed for ${product.name} - front view: ${error}\n`);
      }
      
      // Add front view to enriched uploads
      enrichedUploads.push({
        ...frontUpload,
        description: frontDescription
      });
      
      // Process back view if available
      if (product.uploads.length >= 2) {
        const backUpload = product.uploads[1];
        logStream.write(`Processing ${product.name} - back view\n`);
        
        // Generate back view description with context from front view
        let backDescription: string;
        try {
          backDescription = await generateBackViewDescription(backUpload.ufsUrl, frontDescription);
          logStream.write(`✅ Generated description for ${product.name} - back view\n`);
        } catch (error) {
          backDescription = "Failed to generate back view description due to an error";
          logStream.write(`❌ Failed for ${product.name} - back view: ${error}\n`);
        }
        
        // Add back view to enriched uploads
        enrichedUploads.push({
          ...backUpload,
          description: backDescription
        });
      }
      
      // Add any remaining uploads without special processing
      for (let j = 2; j < product.uploads.length; j++) {
        enrichedUploads.push(product.uploads[j]);
      }
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    enrichedProducts.push({
      ...product,
      uploads: enrichedUploads
    });
    
    // Save progress after each product in case the script is interrupted
    await writeFile(
      resolve(__dirname, '../etc/acquiring/data/product-data.json'),
      JSON.stringify(enrichedProducts, null, 2)
    );
    
    logStream.write(`Completed product ${i + 1}/${products.length}: ${product.name}\n`);
    console.log(`Completed product ${i + 1}/${products.length}`);
  }
  
  logStream.end(`Finished process at ${new Date().toISOString()}\n`);
  console.log("All descriptions generated successfully!");
  
  // Write JSON result to file
  await writeFile(
    resolve(__dirname, '../etc/acquiring/data/product-data.json'),
    JSON.stringify(enrichedProducts, null, 2)
  );
  
  console.log("Enriched product data saved to etc/acquiring/data/product-data.json");
  
  // Generate a human-readable formatted version
  const formattedFile = resolve(__dirname, '../etc/acquiring/data/product-descriptions-formatted.txt');
  let formattedOutput = '';
  
  enrichedProducts.forEach((product: EnrichedProduct, index: number) => {
    formattedOutput += `\n${'-'.repeat(80)}\n`;
    formattedOutput += `Product ${index + 1}: ${product.name}\n`;
    formattedOutput += `Price: ${product.price} | Category: ${product.category}\n`;
    formattedOutput += `Collections: ${product.collections.join(', ')}\n`;
    formattedOutput += `${'-'.repeat(80)}\n\n`;
    
    if (product.uploads && product.uploads.length > 0) {
      formattedOutput += `FRONT VIEW DESCRIPTION:\n${'-'.repeat(20)}\n`;
      
      // Replace escape sequences with actual line breaks if description exists
      if (product.uploads[0].description) {
        const frontDescription = product.uploads[0].description.replace(/\\n/g, '\n');
        formattedOutput += `${frontDescription}\n\n`;
      } else {
        formattedOutput += `No description available\n\n`;
      }
      
      if (product.uploads.length > 1) {
        formattedOutput += `BACK VIEW DESCRIPTION:\n${'-'.repeat(20)}\n`;
        
        if (product.uploads[1].description) {
          const backDescription = product.uploads[1].description.replace(/\\n/g, '\n');
          formattedOutput += `${backDescription}\n\n`;
        } else {
          formattedOutput += `No description available\n\n`;
        }
      }
    }
    
    formattedOutput += `${'-'.repeat(80)}\n\n`;
  });
  
  // Write the formatted output
  await writeFile(formattedFile, formattedOutput);
  
  console.log(`Human-readable descriptions saved to etc/acquiring/data/product-descriptions-formatted.txt`);
}

// Run the script
enrichProducts().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});
