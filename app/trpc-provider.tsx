'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import posthog from 'posthog-js';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [posthogId, setPosthogId] = useState<string>('');
  
  // Get PostHog ID on initial render
  useEffect(() => {
    // Initialize PostHog if needed
    if (typeof window !== 'undefined') {
      const id = posthog.get_distinct_id();
      setPosthogId(id);
    }
  }, []);

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            return {
              'x-posthog-id': posthogId || '',
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
