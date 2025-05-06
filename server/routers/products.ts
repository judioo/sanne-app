import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { products, getAllCollections } from '../product-data';

export const productsRouter = router({
  // Get all products with optional filtering and pagination
  getAll: publicProcedure
    .input(
      z.object({
        category: z.enum(['all', 'men', 'women']).optional().default('all'),
        sortBy: z.enum(['price_asc', 'price_desc']).optional(),
        search: z.string().optional(),
        collection: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
      })
    )
    .query(({ input }) => {
      let filteredProducts = [...products];

      // Filter by category
      if (input.category !== 'all') {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === input.category
        );
      }

      // Filter by collection if provided
      if (input.collection) {
        const collectionName = input.collection;
        filteredProducts = filteredProducts.filter((product) =>
          product.collections.includes(collectionName)
        );
      }

      // Filter by search term
      if (input.search) {
        const searchTerm = input.search.toLowerCase();
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by price
      if (input.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.numericPrice - b.numericPrice);
      } else if (input.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.numericPrice - a.numericPrice);
      }

      // Calculate pagination values
      const page = input.page || 1;
      const limit = input.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      // Calculate total pages
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);
      
      // Get paginated products
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasMore: page < totalPages,
        }
      };
    }),

  // Get all available collections
  getCollections: publicProcedure.query(() => {
    return getAllCollections();
  }),
  
  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return products.find((product) => product.id === input.id);
    }),
});
