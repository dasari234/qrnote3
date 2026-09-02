import { prisma } from "@/lib/prisma";

export interface AdminAIModel {
  id: string;
  modelKey: string;
  provider: string;
  providerModel: string;
  name: string;
  gatewayModel: string | null;
  enabled: boolean;
  maxOutputTokens: number;
}

export async function getAdminAIModel(
  modelKey: string,
): Promise<AdminAIModel | null> {
  const rows =
    await prisma.$queryRaw<
      AdminAIModel[]
    >`
      SELECT
        m.id,
        m.model_key AS "modelKey",
        p.slug AS provider,
        m.provider_model AS "providerModel",
        m.name,
        m.gateway_model AS "gatewayModel",
        m.enabled,
        m.max_output_tokens AS "maxOutputTokens"

      FROM public.ai_models m

      JOIN public.ai_providers p
        ON p.id = m.provider_id

      WHERE
        m.model_key = ${modelKey}

        AND m.enabled = true

        AND p.enabled = true

      LIMIT 1
    `;

  return rows[0] ?? null;
}

export async function getFeatureFlag(
  key: string,
) {
  const rows =
    await prisma.$queryRaw<
      Array<{
        enabled: boolean;
      }>
    >`
      SELECT enabled
      FROM public.ai_feature_flags
      WHERE key = ${key}
      LIMIT 1
    `;

  return rows[0]?.enabled ?? false;
}
