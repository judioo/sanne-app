const fs = require('fs');
const { execSync } = require('child_process');

// Function to fetch HTML content from a specific page
function fetchPageContent(pageNum) {
  console.log(`Fetching page ${pageNum}...`);
  const command = `curl 'https://sanne.com/shop?page=${pageNum}' \\
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \\
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \\
  -H 'cache-control: no-cache' \\
  -b 'frontend_lang=en_GB; session_id=e18563e154ddac6c8319b36cc637b4fa9e86abd4; tz=Asia/Dubai; cookieyes-consent=consentid:d05NOVBZdnpnUEc3TlVTWDE3M3VPSUJOR2NXSTVWWTU,consent:yes,action:yes,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes,other:yes,lastRenewedDate:1734959335000; _ga=GA1.1.476039891.1746161170;' \\
  -H 'dnt: 1' \\
  -H 'pragma: no-cache' \\
  -H 'sec-ch-ua: "Chromium";v="135", "Not-A.Brand";v="8"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'`;

  try {
    const html = execSync(command).toString();
    return html;
  } catch (error) {
    console.error(`Error fetching page ${pageNum}:`, error.message);
    return null;
  }
}

// Function to extract products from HTML
function extractProducts(html) {
  const products = [];
  
  // Find all product elements
  const productRegex = /<td class="oe_product" data-name="Product">([\s\S]*?)<\/td>/g;
  let productMatch;
  
  while ((productMatch = productRegex.exec(html)) !== null) {
    try {
      const productHtml = productMatch[1];
      
      // Extract product URL and title
      const titleRegex = /<a class="text-black text-decoration-none"[^>]*href="([^"]*)"[^>]*content="([^"]*)"[^>]*>([^<]*)<\/a>/;
      const titleMatch = productHtml.match(titleRegex);
      
      if (!titleMatch) continue;
      
      const productUrl = titleMatch[1];
      const title = titleMatch[3];
      
      // Extract product images - make sure to capture all images
      const imageRegex = /<img src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/>/g;
      const images = [];
      let imageMatch;
      
      while ((imageMatch = imageRegex.exec(productHtml)) !== null) {
        const imageUrl = imageMatch[1];
        if (imageUrl && !images.includes(`https://sanne.com${imageUrl}`)) {
          images.push(`https://sanne.com${imageUrl}`);
        }
      }
      
      // Extract product price
      const priceRegex = /<span class="oe_currency_value">([^<]*)<\/span>/;
      const priceMatch = productHtml.match(priceRegex);
      
      if (!priceMatch) continue;
      
      const price = priceMatch[1];
      
      // Determine category
      let category = 'women';
      if (title.toLowerCase().includes('jeans') || 
          title.toLowerCase().includes('shirt') || 
          title.toLowerCase().includes('t-shirt') ||
          title.toLowerCase().includes('chinos')) {
        category = 'men';
      }
      
      // Add collections based on product title
      const collections = ["New Arrivals"];
      if (title.toLowerCase().includes('dress')) {
        collections.push('Evening Wear');
      }
      if (title.toLowerCase().includes('silk') || title.toLowerCase().includes('luxe')) {
        collections.push('Luxury');
      }
      if (title.toLowerCase().includes('jeans') || title.toLowerCase().includes('denim')) {
        collections.push('Denim');
      }
      if (title.toLowerCase().includes('t-shirt') || title.toLowerCase().includes('casual')) {
        collections.push('Casual');
      }
      if (title.toLowerCase().includes('blazer') || title.toLowerCase().includes('oxford')) {
        collections.push('Workwear');
      }
      if (title.toLowerCase().includes('summer') || title.toLowerCase().includes('linen')) {
        collections.push('Summer Essentials');
      }
      
      // Create product object
      products.push({
        title,
        price,
        numericPrice: parseFloat(price.replace(',', '')),
        productUrl: `/shop/${productUrl.split('/shop/')[1].split('#')[0]}`,
        images,
        category,
        collections
      });
    } catch (error) {
      console.error('Error processing product:', error);
    }
  }
  
  return products;
}

// Function to check if a page has products
function hasProducts(html) {
  return html.includes('<td class="oe_product" data-name="Product">');
}

// Main function to fetch all products from all pages
async function fetchAllProducts() {
  let allProducts = [];
  let pageNum = 0;
  let hasMoreProducts = true;
  
  while (hasMoreProducts && pageNum < 5) { // Limit to 5 pages for safety
    const html = fetchPageContent(pageNum);
    
    if (!html) {
      console.error(`Failed to fetch page ${pageNum}, stopping pagination.`);
      break;
    }
    
    if (!hasProducts(html)) {
      console.log(`No more products found on page ${pageNum}, ending pagination.`);
      hasMoreProducts = false;
      break;
    }
    
    const products = extractProducts(html);
    console.log(`Found ${products.length} products on page ${pageNum}`);
    
    allProducts = [...allProducts, ...products];
    pageNum++;
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Deduplicate products based on title
  const uniqueProducts = [];
  const productTitles = new Set();
  
  allProducts.forEach(product => {
    if (!productTitles.has(product.title)) {
      productTitles.add(product.title);
      uniqueProducts.push(product);
    }
  });
  
  console.log(`Found ${uniqueProducts.length} unique products across ${pageNum} pages`);
  
  // Add unique IDs to products
  uniqueProducts.forEach((product, index) => {
    product.id = index + 1;
  });
  
  // Write products to JSON file
  fs.writeFileSync('sanne_all_products.json', JSON.stringify(uniqueProducts, null, 2));
  
  // Generate TypeScript code
  generateProductDataFile(uniqueProducts);
  
  return uniqueProducts;
}

// Function to generate product-data.ts file
function generateProductDataFile(products) {
  const tsCode = `import { z } from 'zod';

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
});

export type Product = z.infer<typeof ProductSchema>;

// Product data fetched from Sanne shop API
export const products: Product[] = ${JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.title,
    price: p.price,
    numericPrice: p.numericPrice,
    images: p.images,
    productUrl: p.productUrl,
    category: p.category,
    collections: p.collections
  })), null, 2)};

// Function to get all available collections
export function getAllCollections(): string[] {
  const collectionsSet = new Set<string>();
  
  products.forEach(product => {
    product.collections.forEach(collection => {
      collectionsSet.add(collection);
    });
  });
  
  return Array.from(collectionsSet).sort();
}`;

  fs.writeFileSync('server/product-data.ts', tsCode);
  console.log('Product data TypeScript file generated successfully!');
}

// Execute the main function
fetchAllProducts().catch(console.error);
