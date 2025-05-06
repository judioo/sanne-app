import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { products } from '../product-data';

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        category: z.enum(['all', 'men', 'women']).optional().default('all'),
        sortBy: z.enum(['price_asc', 'price_desc']).optional(),
        search: z.string().optional(),
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

      return filteredProducts;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const product = products.find((p) => p.id === input.id);
      if (!product) {
        throw new Error(`Product with ID ${input.id} not found`);
      }
      return product;
    }),
});
