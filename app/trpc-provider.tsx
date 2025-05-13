'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import posthog from 'posthog-js';
import { logger } from '@/utils/logger';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  // Create a new client for every new posthogId
  const [trpcClient, setTrpcClient] = useState<ReturnType<typeof trpc.createClient> | null>(null);

  // Initialize PostHog and set up the tRPC client
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const initializeClient = () => {
      try {
        // Try to get the current PostHog ID
        const currentId = posthog.get_distinct_id();
        
        if (currentId) {
          logger.info('Creating tRPC client with PostHog ID:', currentId);
          
          // Create a new client with the current PostHog ID
          const client = trpc.createClient({
            links: [
              httpBatchLink({
                url: '/api/trpc',
                headers: () => {
                  // Get the ID dynamically on each request
                  const id = posthog.get_distinct_id();
                  logger.info('Adding PostHog ID to request headers:', id);
                  return {
                    'x-posthog-id': id || ''
                  };
                },
              }),
            ],
          });
          
          setTrpcClient(client);
        } else {
          logger.warn('PostHog ID not available yet, initializing PostHog');
          
          // Initialize PostHog if needed
          posthog.init(
            process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_default_key',
            {
              api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
              loaded: function(ph) {
                const newId = ph.get_distinct_id();
                logger.info('PostHog initialized with ID:', newId);
                
                // Create client after PostHog is loaded
                initializeClient();
              }
            }
          );
        }
      } catch (error) {
        logger.error('Error initializing tRPC client:', error);
      }
    };
    
    // Run initialization
    initializeClient();
    
    // Add event listeners for PostHog ID changes
    const handlePostHogIdChange = () => {
      logger.info('PostHog ID changed, reinitializing tRPC client');
      initializeClient();
    };
    
    window.addEventListener('posthog-id-change', handlePostHogIdChange);
    
    return () => {
      window.removeEventListener('posthog-id-change', handlePostHogIdChange);
    };
  }, []);

  // Always create a default client for SSR/initial render to avoid hydration issues
  const client = trpcClient || trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers: () => ({}),
      }),
    ],
  });

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
