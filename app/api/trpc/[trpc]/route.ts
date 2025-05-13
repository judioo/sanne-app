import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => {
      // Extract headers from the request
      return {
        headers: Object.fromEntries(req.headers.entries())
      };
    },
  });

export { handler as GET, handler as POST };
