import { z } from 'zod';

// Product schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  numericPrice: z.number(),
  image: z.string(),
  productUrl: z.string().optional(),
  category: z.enum(['men', 'women']),
  collections: z.array(z.string()),
});

export type Product = z.infer<typeof ProductSchema>;

// Sample product data based on actual Sanne shop products
export const products: Product[] = [
  {
    id: 1,
    name: "Gianna green silk dress",
    price: "5,985",
    numericPrice: 5985,
    image: "https://sanne.com/web/image/product.product/2804/image_1920/Gianna%20green%20silk%20dress%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne227-gianna-green-silk-dress-483",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Bestsellers"],
  },
  {
    id: 2,
    name: "The Luna dress",
    price: "5,090",
    numericPrice: 5090,
    image: "https://sanne.com/web/image/product.product/2792/image_1920/The%20Luna%20dress%20%28UK6%29?unique=c19e08c",
    productUrl: "/shop/sanne225-the-luna-dress-481",
    category: "women",
    collections: ["New Arrivals", "Evening Wear", "Luxury"],
  },
  {
    id: 3,
    name: "Azul jeans",
    price: "4,030",
    numericPrice: 4030,
    image: "https://sanne.com/web/image/product.product/2798/image_1920/Azul%20jeans%20%28UK6%29?unique=c19e08c",
    productUrl: "/shop/sanne226-azul-jeans-482",
    category: "men",
    collections: ["New Arrivals", "Denim", "Casual"],
  },
  {
    id: 4,
    name: "Sunset indigo skirt",
    price: "5,970",
    numericPrice: 5970,
    image: "https://sanne.com/web/image/product.product/2810/image_1920/Sunset%20Indigo%20skirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne228-sunset-indigo-skirt-484",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials"],
  },
  {
    id: 5,
    name: "Malibu Midnight bohemian skirt",
    price: "4,685",
    numericPrice: 4685,
    image: "https://sanne.com/web/image/product.product/2786/image_1920/Malibu%20Midnight%20bohemian%20skirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne224-malibu-midnight-bohemian-skirt-480",
    category: "women",
    collections: ["New Arrivals", "Boho Chic"],
  },
  {
    id: 6,
    name: "Malibu Midnight backless top",
    price: "2,400",
    numericPrice: 2400,
    image: "https://sanne.com/web/image/product.product/2780/image_1920/Malibu%20Midnight%20backless%20top%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne223-malibu-midnight-backless-top-479",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Beach Wear"],
  },
  {
    id: 7,
    name: "Daydream Corset Top",
    price: "3,585",
    numericPrice: 3585,
    image: "https://sanne.com/web/image/product.product/2774/image_1920/Daydream%20Corset%20Top%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne222-daydream-corset-top-478",
    category: "women",
    collections: ["New Arrivals", "Trending Now"],
  },
  {
    id: 8,
    name: "Terra luxe leather jacket",
    price: "9,525",
    numericPrice: 9525,
    image: "https://sanne.com/web/image/product.product/2768/image_1920/Terra%20luxe%20leather%20jacket%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne221-terra-luxe-leather-jacket-477",
    category: "men",
    collections: ["New Arrivals", "Luxury", "Outerwear"],
  },
  {
    id: 9,
    name: "Classic Oxford Shirt",
    price: "3,250",
    numericPrice: 3250,
    image: "https://sanne.com/web/image/product.product/2762/image_1920/Classic%20Oxford%20Shirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne220-classic-oxford-shirt-476",
    category: "men",
    collections: ["New Arrivals", "Essentials", "Workwear"],
  },
  {
    id: 10,
    name: "Urban Slim Chinos",
    price: "4,150",
    numericPrice: 4150,
    image: "https://sanne.com/web/image/product.product/2756/image_1920/Urban%20Slim%20Chinos%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne219-urban-slim-chinos-475",
    category: "men",
    collections: ["New Arrivals", "Denim", "Casual"],
  },
  {
    id: 11,
    name: "Navy Pleated Maxi Skirt",
    price: "4,750",
    numericPrice: 4750,
    image: "https://sanne.com/web/image/product.product/2750/image_1920/Navy%20Pleated%20Maxi%20Skirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne218-navy-pleated-maxi-skirt-474",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials"],
  },
  {
    id: 12,
    name: "Navy Camisole Top",
    price: "2,890",
    numericPrice: 2890,
    image: "https://sanne.com/web/image/product.product/2744/image_1920/Navy%20Camisole%20Top%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne217-navy-camisole-top-473",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Beach Wear"],
  },
  {
    id: 13,
    name: "Denim Button-Front Flare Jeans",
    price: "4,350",
    numericPrice: 4350,
    image: "https://sanne.com/web/image/product.product/2738/image_1920/Denim%20Button-Front%20Flare%20Jeans%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne216-denim-button-front-flare-jeans-472",
    category: "women",
    collections: ["New Arrivals", "Denim", "Trending Now"],
  },
  {
    id: 14,
    name: "Tie-Dye Cotton Maxi Dress",
    price: "5,680",
    numericPrice: 5680,
    image: "https://sanne.com/web/image/product.product/2732/image_1920/Tie-Dye%20Cotton%20Maxi%20Dress%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne215-tie-dye-cotton-maxi-dress-471",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Boho Chic"],
  },
  {
    id: 15,
    name: "Linen Blend Relaxed Shirt",
    price: "3,490",
    numericPrice: 3490,
    image: "https://sanne.com/web/image/product.product/2726/image_1920/Linen%20Blend%20Relaxed%20Shirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne214-linen-blend-relaxed-shirt-470",
    category: "men",
    collections: ["New Arrivals", "Summer Essentials", "Casual"],
  },
  {
    id: 16,
    name: "Structured Blazer",
    price: "7,250",
    numericPrice: 7250,
    image: "https://sanne.com/web/image/product.product/2720/image_1920/Structured%20Blazer%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne213-structured-blazer-469",
    category: "women",
    collections: ["New Arrivals", "Workwear", "Essentials"],
  },
  {
    id: 17,
    name: "Organic Cotton T-Shirt",
    price: "1,950",
    numericPrice: 1950,
    image: "https://sanne.com/web/image/product.product/2714/image_1920/Organic%20Cotton%20T-Shirt%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne212-organic-cotton-t-shirt-468",
    category: "men",
    collections: ["New Arrivals", "Essentials", "Casual"],
  },
  {
    id: 18,
    name: "Silk Wrap Blouse",
    price: "4,290",
    numericPrice: 4290,
    image: "https://sanne.com/web/image/product.product/2708/image_1920/Silk%20Wrap%20Blouse%20%28UK6%29?unique=6035869",
    productUrl: "/shop/sanne211-silk-wrap-blouse-467",
    category: "women",
    collections: ["New Arrivals", "Workwear", "Luxury"],
  }
];

// Function to get all available collections
export function getAllCollections(): string[] {
  const collectionsSet = new Set<string>();
  
  products.forEach(product => {
    product.collections.forEach(collection => {
      collectionsSet.add(collection);
    });
  });
  
  return Array.from(collectionsSet).sort();
}
