import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const url = new URL(req.url);

  const search =
    url.searchParams.get("search")?.trim();

  const conversations =
    await prisma.aiConversation.findMany({
      where: {
        userId: user.id,

        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        title: true,
        modelId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return Response.json({
    conversations,
  });
}

export async function POST() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const conversation =
    await prisma.aiConversation.create({
      data: {
        userId: user.id,
        title: "New chat",
      },

      select: {
        id: true,
        title: true,
        modelId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return Response.json(
    {
      conversation,
    },
    { status: 201 },
  );
}
