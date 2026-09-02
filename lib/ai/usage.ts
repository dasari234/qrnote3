import { prisma } from '@/lib/prisma';

export interface RecordAIUsageInput {
  userId: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  conversationId?: string | null;
  provider: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost?: number;
  requestDurationMs?: number;
  status?: string;
}

function getMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function recordAIUsage(usage: RecordAIUsageInput) {
  const totalTokens = usage.inputTokens + usage.outputTokens;
  const month = getMonthStart();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
        INSERT INTO public.ai_usage (
          user_id,
          organization_id,
          workspace_id,
          conversation_id,
          provider,
          model_id,
          input_tokens,
          output_tokens,
          total_tokens,
          estimated_cost,
          request_duration_ms,
          status
        )
        VALUES (
          ${usage.userId}::uuid,
          ${usage.organizationId ?? null}::uuid,
          ${usage.workspaceId ?? null}::uuid,
          ${usage.conversationId ?? null}::uuid,
          ${usage.provider},
          ${usage.modelId},
          ${usage.inputTokens},
          ${usage.outputTokens},
          ${totalTokens},
          ${usage.estimatedCost ?? 0},
          ${usage.requestDurationMs ?? null},
          ${usage.status ?? 'completed'}
        )
      `;

    await tx.$executeRaw`
        INSERT INTO public.ai_usage_monthly (
          user_id,
          workspace_id,
          month,
          request_count,
          input_tokens,
          output_tokens,
          total_tokens,
          estimated_cost
        )
        VALUES (
          ${usage.userId}::uuid,
          ${usage.workspaceId ?? null}::uuid,
          ${month},
          1,
          ${usage.inputTokens},
          ${usage.outputTokens},
          ${totalTokens},
          ${usage.estimatedCost ?? 0}
        )
        ON CONFLICT (
          user_id,
          workspace_id,
          month
        )
        DO UPDATE SET
          request_count =
            public.ai_usage_monthly.request_count + 1,

          input_tokens =
            public.ai_usage_monthly.input_tokens
            + EXCLUDED.input_tokens,

          output_tokens =
            public.ai_usage_monthly.output_tokens
            + EXCLUDED.output_tokens,

          total_tokens =
            public.ai_usage_monthly.total_tokens
            + EXCLUDED.total_tokens,

          estimated_cost =
            public.ai_usage_monthly.estimated_cost
            + EXCLUDED.estimated_cost,

          updated_at = now()
      `;
  });
}
