import { z } from 'zod';

// Product schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  numericPrice: z.number(),
  image: z.string(),
  category: z.enum(['men', 'women']),
  collections: z.array(z.string()),
});

export type Product = z.infer<typeof ProductSchema>;

// Sample product data
export const products: Product[] = [
  {
    id: 1,
    name: "Gianna green silk dress",
    price: "5,985",
    numericPrice: 5985,
    image: "/product-images/green-dress.jpg",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Bestsellers"],
  },
  {
    id: 2,
    name: "The Luna dress",
    price: "5,090",
    numericPrice: 5090,
    image: "/product-images/luna-dress.jpg",
    category: "women",
    collections: ["New Arrivals", "Evening Wear", "Luxury"],
  },
  {
    id: 3,
    name: "Azul jeans",
    price: "4,030",
    numericPrice: 4030,
    image: "/product-images/azul-jeans.jpg",
    category: "men",
    collections: ["New Arrivals", "Denim", "Casual"],
  },
  {
    id: 4,
    name: "Sunset indigo skirt",
    price: "5,970",
    numericPrice: 5970,
    image: "/product-images/indigo-skirt.jpg",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials"],
  },
  {
    id: 5,
    name: "Malibu Midnight bohemian skirt",
    price: "4,685",
    numericPrice: 4685,
    image: "/product-images/bohemian-skirt.jpg",
    category: "women",
    collections: ["New Arrivals", "Boho Chic"],
  },
  {
    id: 6,
    name: "Malibu Midnight backless top",
    price: "2,400",
    numericPrice: 2400,
    image: "/product-images/backless-top.jpg",
    category: "women",
    collections: ["New Arrivals", "Summer Essentials", "Beach Wear"],
  },
  {
    id: 7,
    name: "Daydream Corset Top",
    price: "3,585",
    numericPrice: 3585,
    image: "/product-images/corset-top.jpg",
    category: "women",
    collections: ["New Arrivals", "Trending Now"],
  },
  {
    id: 8,
    name: "Terra luxe leather jacket",
    price: "9,525",
    numericPrice: 9525,
    image: "/product-images/leather-jacket.jpg",
    category: "men",
    collections: ["New Arrivals", "Luxury", "Outerwear"],
  },
  {
    id: 9,
    name: "Classic Oxford Shirt",
    price: "3,250",
    numericPrice: 3250,
    image: "/product-images/oxford-shirt.jpg",
    category: "men",
    collections: ["New Arrivals", "Essentials", "Workwear"],
  },
  {
    id: 10,
    name: "Urban Slim Chinos",
    price: "4,150",
    numericPrice: 4150,
    image: "/product-images/chinos.jpg",
    category: "men",
    collections: ["New Arrivals", "Denim", "Casual"],
  },
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
