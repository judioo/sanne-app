import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';

// Create Redis instance for rate limiting
const rateLimitRedis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

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
  const posthogId = ctx.headers['x-posthog-id'];
  
  // If no posthog ID is provided, let the request through but log it
  if (!posthogId) {
    console.warn('Rate limiting skipped: No PostHog ID provided');
    return next();
  }
  
  const cacheKey = `rate_limit:${posthogId}`;
  const now = Date.now();
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  
  // Get current rate limit data
  let rateLimitData: RateLimitRecord | null = await rateLimitRedis.get(cacheKey);
  
  // If no record exists or it's older than 5 minutes, create a fresh one
  if (!rateLimitData || (now - rateLimitData.lastUpdate > FIVE_MINUTES_MS)) {
    rateLimitData = {
      count: 1,
      lastUpdate: now,
      embargoEndTime: now + FIVE_MINUTES_MS
    };
    await rateLimitRedis.set(cacheKey, rateLimitData);
    return next();
  }
  
  // Check if user is currently embargoed
  if (rateLimitData.count > 5 && now < rateLimitData.embargoEndTime) {
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
  if (rateLimitData.count > 5) {
    rateLimitData.embargoEndTime = now + FIVE_MINUTES_MS;
  }
  
  // Update Redis
  await rateLimitRedis.set(cacheKey, rateLimitData);
  
  return next();
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Rate-limited procedure specifically for dressing room
export const rateLimitedProcedure = t.procedure.use(rateLimit);
