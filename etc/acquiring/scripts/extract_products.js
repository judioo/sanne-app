const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync('sanne_shop_page0.html', 'utf8');

// Function to extract products
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
      
      // Extract product images
      const imageRegex = /<img src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/>/g;
      const images = [];
      let imageMatch;
      
      while ((imageMatch = imageRegex.exec(productHtml)) !== null) {
        const imageUrl = imageMatch[1];
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      }
      
      // Extract product price
      const priceRegex = /<span class="oe_currency_value">([^<]*)<\/span>\s*([^<]*)<\/span>/;
      const priceMatch = productHtml.match(priceRegex);
      
      if (!priceMatch) continue;
      
      const price = priceMatch[1];
      const currency = priceMatch[2].trim();
      
      // Extract category (if available)
      let category = 'unknown';
      if (title.toLowerCase().includes('dress') || title.toLowerCase().includes('skirt') || title.toLowerCase().includes('top') || title.toLowerCase().includes('blouse')) {
        category = 'women';
      } else if (title.toLowerCase().includes('jeans') || title.toLowerCase().includes('shirt') || title.toLowerCase().includes('jacket')) {
        category = 'men';
      }
      
      // Create product object
      const product = {
        title,
        price: `${price} ${currency}`,
        numericPrice: parseFloat(price.replace(',', '')),
        productUrl: `https://sanne.com${productUrl}`,
        images: images.map(img => `https://sanne.com${img}`),
        category
      };
      
      products.push(product);
    } catch (error) {
      console.error('Error processing product:', error);
    }
  }
  
  return products;
}

// Extract products
const products = extractProducts(html);

// Write products to JSON file
fs.writeFileSync('sanne_products.json', JSON.stringify(products, null, 2));

console.log(`Extracted ${products.length} products`);
console.log('First 3 products:');
console.log(JSON.stringify(products.slice(0, 3), null, 2));
