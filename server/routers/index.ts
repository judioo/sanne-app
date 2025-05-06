import { router } from '../trpc';
import { productsRouter } from './products';

export const appRouter = router({
  products: productsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
