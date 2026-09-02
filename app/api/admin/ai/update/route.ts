import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RequestBody {
  type:
    | "provider"
    | "model"
    | "routing"
    | "cost"
    | "feature";

  id: string;

  enabled?: boolean;

  priority?: number;

  inputPerMillion?: number;

  outputPerMillion?: number;

  currency?: string;

  executionMode?:
    | "direct"
    | "gateway";

  maxOutputTokens?: number;
}

async function authorize() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required.",
    );
  }

  await requireSuperAdmin(user.id);

  return user;
}

export async function PATCH(
  request: Request,
) {
  try {
    await authorize();

    const body =
      (await request.json()) as RequestBody;

    if (!body.type || !body.id) {
      return Response.json(
        {
          error:
            "type and id are required.",
        },
        { status: 400 },
      );
    }

    switch (body.type) {
      case "provider": {
        if (
          typeof body.enabled !==
          "boolean"
        ) {
          break;
        }

        await prisma.$executeRaw`
          UPDATE public.ai_providers
          SET
            enabled = ${body.enabled},
            updated_at = now()
          WHERE id = ${body.id}::uuid
        `;

        break;
      }

      case "model": {
        if (
          typeof body.enabled !==
          "boolean"
        ) {
          break;
        }

        await prisma.$executeRaw`
          UPDATE public.ai_models
          SET
            enabled = ${body.enabled},
            updated_at = now()
          WHERE id = ${body.id}::uuid
        `;

        break;
      }

      case "routing": {
        if (
          typeof body.enabled !==
          "boolean"
        ) {
          break;
        }

        await prisma.$executeRaw`
          UPDATE public.ai_routing_rules
          SET
            enabled = ${body.enabled},
            priority = COALESCE(
              ${body.priority ?? null},
              priority
            ),
            updated_at = now()
          WHERE id = ${body.id}::uuid
        `;

        break;
      }

      case "cost": {
        if (
          typeof body.inputPerMillion !==
            "number" ||
          typeof body.outputPerMillion !==
            "number"
        ) {
          return Response.json(
            {
              error:
                "Invalid pricing.",
            },
            { status: 400 },
          );
        }

        await prisma.$executeRaw`
          INSERT INTO public.ai_model_costs (
            model_id,
            input_per_million,
            output_per_million,
            currency,
            updated_at
          )
          VALUES (
            ${body.id}::uuid,
            ${body.inputPerMillion},
            ${body.outputPerMillion},
            ${body.currency ?? "USD"},
            now()
          )
          ON CONFLICT (model_id)
          DO UPDATE SET
            input_per_million =
              EXCLUDED.input_per_million,
            output_per_million =
              EXCLUDED.output_per_million,
            currency =
              EXCLUDED.currency,
            updated_at = now()
        `;

        break;
      }

      case "feature": {
        if (
          typeof body.enabled !==
          "boolean"
        ) {
          break;
        }

        await prisma.$executeRaw`
          UPDATE public.ai_feature_flags
          SET
            enabled = ${body.enabled},
            updated_at = now()
          WHERE id = ${body.id}::uuid
        `;

        break;
      }

      default:
        return Response.json(
          {
            error:
              "Unsupported configuration type.",
          },
          { status: 400 },
        );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin AI config update failed:",
      error,
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update AI configuration.",
      },
      { status: 500 },
    );
  }
}
