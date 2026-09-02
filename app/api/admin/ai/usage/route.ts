import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          error:
            "Authentication required.",
        },
        { status: 401 },
      );
    }

    await requireSuperAdmin(user.id);

    const [
      summary,
      activeUsers,
    ] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          requests: number;
          inputTokens: number;
          outputTokens: number;
          totalTokens: number;
          estimatedCost: number;
        }>
      >`
        SELECT
          COALESCE(
            SUM(request_count),
            0
          )::int AS requests,

          COALESCE(
            SUM(input_tokens),
            0
          )::bigint AS "inputTokens",

          COALESCE(
            SUM(output_tokens),
            0
          )::bigint AS "outputTokens",

          COALESCE(
            SUM(total_tokens),
            0
          )::bigint AS "totalTokens",

          COALESCE(
            SUM(estimated_cost),
            0
          )::float AS "estimatedCost"

        FROM public.ai_usage_monthly

        WHERE month =
          date_trunc(
            'month',
            now()
          )::date
      `,

      prisma.$queryRaw<
        Array<{
          count: number;
        }>
      >`
        SELECT COUNT(
          DISTINCT user_id
        )::int AS count
        FROM public.ai_usage
        WHERE created_at >=
          date_trunc(
            'month',
            now()
          )
      `,
    ]);

    const result =
      summary[0] ?? {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      };

    return Response.json({
      ...result,
      activeUsers:
        activeUsers[0]?.count ?? 0,
    });
  } catch (error) {
    console.error(
      "Admin usage failed:",
      error,
    );

    return Response.json(
      {
        error:
          "Unable to load usage.",
      },
      { status: 500 },
    );
  }
}
