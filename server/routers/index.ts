import { router } from '../trpc';
import { productRouter } from './products';

export const appRouter = router({
  products: productRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
