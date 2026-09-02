import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAdmin() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  }

  await requireSuperAdmin(user.id);

  return user;
}

export async function GET() {
  try {
    await getAdmin();

    const [
      providers,
      models,
      routing,
      costs,
      flags,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          id,
          slug,
          name,
          description,
          enabled,
          execution_mode AS "executionMode",
          api_key_env AS "apiKeyEnv",
          base_url AS "baseUrl",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM public.ai_providers
        ORDER BY name
      `,

      prisma.$queryRaw`
        SELECT
          m.id,
          m.model_key AS "modelKey",
          m.provider_id AS "providerId",
          p.slug AS provider,
          p.name AS "providerName",
          m.provider_model AS "providerModel",
          m.name,
          m.description,
          m.gateway_model AS "gatewayModel",
          m.enabled,
          m.context_window AS "contextWindow",
          m.max_output_tokens AS "maxOutputTokens"
        FROM public.ai_models m
        JOIN public.ai_providers p
          ON p.id = m.provider_id
        ORDER BY p.name, m.name
      `,

      prisma.$queryRaw`
        SELECT
          r.id,
          r.workspace_id AS "workspaceId",
          r.provider_id AS "providerId",
          r.model_id AS "modelId",
          p.slug AS provider,
          m.model_key AS "modelKey",
          r.priority,
          r.enabled
        FROM public.ai_routing_rules r
        LEFT JOIN public.ai_providers p
          ON p.id = r.provider_id
        LEFT JOIN public.ai_models m
          ON m.id = r.model_id
        ORDER BY r.priority ASC
      `,

      prisma.$queryRaw`
        SELECT
          c.id,
          c.model_id AS "modelId",
          m.model_key AS "modelKey",
          c.input_per_million AS "inputPerMillion",
          c.output_per_million AS "outputPerMillion",
          c.currency
        FROM public.ai_model_costs c
        JOIN public.ai_models m
          ON m.id = c.model_id
        ORDER BY m.name
      `,

      prisma.$queryRaw`
        SELECT
          id,
          key,
          name,
          description,
          enabled,
          environment
        FROM public.ai_feature_flags
        ORDER BY name
      `,
    ]);

    return Response.json({
      providers,
      models,
      routing,
      costs,
      featureFlags: flags,
    });
  } catch (error) {
    console.error(
      "Admin AI config GET failed:",
      error,
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load AI configuration.",
      },
      { status: 500 },
    );
  }
}
