import { Ratelimit } from '@upstash/ratelimit';

import { getRedis } from '@/lib/redis';

let limiter: Ratelimit | null = null;

function getLimiter() {
  if (limiter) {
    return limiter;
  }

  limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'qrnote:ai:ratelimit',
  });

  return limiter;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkAIRateLimit(
  userId: string,
  workspaceId: string
): Promise<RateLimitResult> {
  const identifier = `${userId}:${workspaceId}`;

  const result = await getLimiter().limit(identifier);

  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
