import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function getUser() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET(
  _req: Request,
  context: RouteContext,
) {
  const user = await getUser();

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

  const { id } = await context.params;

  const conversation =
    await prisma.aiConversation.findFirst({
      where: {
        id,
        userId: user.id,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!conversation) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message:
            "Conversation not found.",
        },
      },
      { status: 404 },
    );
  }

  return Response.json({
    conversation,
  });
}

export async function PATCH(
  req: Request,
  context: RouteContext,
) {
  const user = await getUser();

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

  const { id } = await context.params;

  const body = await req.json();

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  if (!title) {
    return Response.json(
      {
        error: {
          code: "INVALID_TITLE",
          message:
            "Conversation title is required.",
        },
      },
      { status: 400 },
    );
  }

  const existing =
    await prisma.aiConversation.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

  if (!existing) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message:
            "Conversation not found.",
        },
      },
      { status: 404 },
    );
  }

  const conversation =
    await prisma.aiConversation.update({
      where: {
        id,
      },

      data: {
        title: title.slice(0, 100),
        updatedAt: new Date(),
      },
    });

  return Response.json({
    conversation,
  });
}

export async function DELETE(
  _req: Request,
  context: RouteContext,
) {
  const user = await getUser();

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

  const { id } = await context.params;

  const existing =
    await prisma.aiConversation.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

  if (!existing) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message:
            "Conversation not found.",
        },
      },
      { status: 404 },
    );
  }

  await prisma.aiConversation.delete({
    where: {
      id,
    },
  });

  return new Response(null, {
    status: 204,
  });
}
