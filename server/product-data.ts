import { z } from 'zod';
import productData from '@/etc/acquiring/data/product-data.json';

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
  uploads: z.array(z.object({
    originalUrl: z.string(),
    ufsUrl: z.string(),
    key: z.string(),
    description: z.string()
  })).optional()
});

export type Product = z.infer<typeof ProductSchema>;

// Product data with uploadthing URLs
// Parse and validate the imported JSON against our schema
export const products: Product[] = ProductSchema.array().parse(productData);



// Function to get all available collections
export function getAllCollections(): string[] {
  const collectionsSet = new Set<string>();
  
  products.forEach(product => {
    product.collections.forEach(collection => {
      collectionsSet.add(collection);
    });
  });
  
  return Array.from(collectionsSet);
}
