import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { logger } from '@/utils/logger';
import { PostHog } from 'posthog-node';

// Create Redis instance for rate limiting
const rateLimitRedis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

// Initialize PostHog for server-side tracking
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com' }
);

const MAX_REQUESTS = 5;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Interface for rate limit record in Redis
interface RateLimitRecord {
  count: number;
  lastUpdate: number;
  embargoEndTime: number;
}

// Create a tRPC instance with context
export const t = initTRPC.context<{
  headers: {
    'x-posthog-id'?: string;
  };
}>().create();

// Middleware for rate limiting
const rateLimit = t.middleware(async ({ ctx, next }) => {
  // Safely access headers - they might be undefined in some contexts
  const headers = ctx.headers || {};
  const posthogId = headers['x-posthog-id'];
  
  // If no posthog ID is provided, block the request
  if (!posthogId) {
    logger.error('Rate limiting failed: No PostHog ID provided');
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify({
        error: 'Missing client identification',
        details: 'Client identity required for this endpoint'
      })
    });
  }
  
  logger.info('Rate limiting for user:', posthogId);
  
  const cacheKey = `rl-${posthogId}`;
  const now = Date.now();
  
  // Get current rate limit data
  let rateLimitData: RateLimitRecord | null = await rateLimitRedis.get(cacheKey);
  
  // If no record exists or it's older than 5 minutes, create a fresh one
  if (!rateLimitData || (now - rateLimitData.lastUpdate > FIVE_MINUTES_MS)) {
    logger.info('Rate limit reset for user:', posthogId);
    rateLimitData = {
      count: 1,
      lastUpdate: now,
      embargoEndTime: now + FIVE_MINUTES_MS
    };
    await rateLimitRedis.set(cacheKey, rateLimitData);
    return next();
  }
  
  // Check if user is currently embargoed
  if (rateLimitData.count >= MAX_REQUESTS && now < rateLimitData.embargoEndTime) {
    logger.warn('Rate limit exceeded for user:', posthogId);
    
    // Track the embargo hit event in PostHog
    posthog.capture({
      distinctId: posthogId,
      event: 'Rate_Limit_Embargo_Hit',
      properties: {
        count: rateLimitData.count,
        embargoEndTime: rateLimitData.embargoEndTime,
        remainingTime: rateLimitData.embargoEndTime - now,
        requestTimestamp: now
      }
    });
    
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: JSON.stringify({
        embargoEndTime: rateLimitData.embargoEndTime,
        message: 'Rate limit exceeded. Try again later.'
      })
    });
  }
  
  // Update count and continue
  rateLimitData.count += 1;
  rateLimitData.lastUpdate = now;
  
  // If this request pushes them over the limit, set embargo time
  if (rateLimitData.count >= MAX_REQUESTS) {
    logger.warn('Rate limit exceeded for user:', posthogId);
    rateLimitData.embargoEndTime = now + FIVE_MINUTES_MS;
    
    // Track the new embargo creation in PostHog
    posthog.capture({
      distinctId: posthogId,
      event: 'Rate_Limit_Embargo_Set',
      properties: {
        count: rateLimitData.count,
        embargoEndTime: rateLimitData.embargoEndTime,
        embargoLength: FIVE_MINUTES_MS,
        requestTimestamp: now
      }
    });
  }
  
  // Update Redis
  logger.info('Updating rate limit for user:', posthogId);
  await rateLimitRedis.set(cacheKey, rateLimitData);
  
  return next();
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Rate-limited procedure specifically for dressing room
export const rateLimitedProcedure = t.procedure.use(rateLimit);
