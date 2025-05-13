'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import posthog from 'posthog-js';
import { logger } from '@/utils/logger';

// PostHog public key - this should be replaced with an environment variable in production
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_default_key';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  // Initialize on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize PostHog if not already initialized
    try {
      // Check if PostHog is already initialized - this will throw if not
      posthog.get_distinct_id();
      logger.info('PostHog already initialized');
    } catch (e) {
      // Initialize PostHog
      logger.info('Initializing PostHog with key:', POSTHOG_KEY.substring(0, 8) + '...');
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
      });
    }
  }, []);

  // Create a tRPC client
  const [trpcClient] = useState(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers: () => {
            // Only run on client side
            if (typeof window !== 'undefined') {
              try {
                // Guarantee we get the current ID at request time
                const id = posthog.get_distinct_id();
                if (id) {
                  logger.info('Setting x-posthog-id header:', id);
                  return { 'x-posthog-id': id };
                }
              } catch (e) {
                logger.error('Error getting PostHog ID:', e);
              }
            }
            return {};
          },
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
