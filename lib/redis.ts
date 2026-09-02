import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis() {
  if (redis) {
    return redis;
  }

  const url = process.env.REDIS_URL;

  const token = process.env.REDIS_TOKEN;

  if (!url || !token) {
    throw new Error('REDIS_URL and REDIS_TOKEN are required.');
  }

  redis = new Redis({
    url,
    token,
  });

  return redis;
}
