export interface AIPlan {
  id: string;
  name: string;
  monthlyRequests: number;
  monthlyTokens: number;
  requestsPerMinute: number;
  maxOutputTokens: number;
}

export const AI_PLANS: Record<string, AIPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyRequests: 100,
    monthlyTokens: 100_000,
    requestsPerMinute: 10,
    maxOutputTokens: 2_000,
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyRequests: 1_000,
    monthlyTokens: 1_000_000,
    requestsPerMinute: 30,
    maxOutputTokens: 4_000,
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyRequests: 10_000,
    monthlyTokens: 10_000_000,
    requestsPerMinute: 60,
    maxOutputTokens: 8_000,
  },
};
