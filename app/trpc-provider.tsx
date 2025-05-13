'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import posthog from 'posthog-js';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [posthogId, setPosthogId] = useState<string>('');
  
  // Create a ref to hold the trpcClient
  const trpcClientRef = useRef<ReturnType<typeof trpc.createClient> | null>(null);
  
  // Create a function to get or create the trpcClient
  const getTrpcClient = useCallback(() => {
    if (!trpcClientRef.current) {
      trpcClientRef.current = trpc.createClient({
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
      });
    }
    return trpcClientRef.current;
  }, [posthogId]);
  
  // Get PostHog ID on initial render
  useEffect(() => {
    // Make sure we're in the browser environment
    if (typeof window !== 'undefined') {
      // Initialize PostHog if needed - use a safer check
      try {
        // Try to get the distinct ID, which will work if PostHog is already initialized
        const id = posthog.get_distinct_id();
        console.log('PostHog ID retrieved:', id);
        setPosthogId(id);
      } catch (error) {
        // If getting the ID fails, initialize PostHog
        console.log('Initializing PostHog...');
        posthog.init(
          // Use the public PostHog key - or an environment variable if available
          process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_your_key_here', 
          {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            loaded: function(ph) {
              const id = ph.get_distinct_id();
              console.log('PostHog initialized with ID:', id);
              setPosthogId(id);
            }
          }
        );
      }
    }
  }, []);
  
  // Get the trpcClient based on the current posthogId
  const trpcClient = getTrpcClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
