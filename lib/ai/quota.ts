import { prisma } from '@/lib/prisma';

export interface AIUsageSummary {
  requestCount: number;
  totalTokens: number;
  estimatedCost: number;
}

export async function getCurrentUsage(
  userId: string,
  workspaceId: string
): Promise<AIUsageSummary> {
  const rows = await prisma.$queryRaw<AIUsageSummary[]>`
      SELECT
        request_count AS "requestCount",
        total_tokens AS "totalTokens",
        estimated_cost::float AS "estimatedCost"
      FROM public.ai_usage_monthly
      WHERE
        user_id = ${userId}::uuid
        AND workspace_id = ${workspaceId}::uuid
        AND month =
          date_trunc(
            'month',
            now()
          )::date
      LIMIT 1
    `;

  return (
    rows[0] ?? {
      requestCount: 0,
      totalTokens: 0,
      estimatedCost: 0,
    }
  );
}
