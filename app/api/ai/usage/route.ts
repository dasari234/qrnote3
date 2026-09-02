import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
    getCurrentUsage,
} from "@/lib/ai/quota";

import {
    getWorkspaceForUser,
} from "@/lib/ai/workspace-access";

export async function GET(
  request: Request,
) {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

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

  const url =
    new URL(request.url);

  const workspaceId =
    url.searchParams.get(
      "workspaceId",
    );

  if (!workspaceId) {
    return Response.json(
      {
        error: {
          code: "WORKSPACE_REQUIRED",
          message:
            "Workspace is required.",
        },
      },
      { status: 400 },
    );
  }

  const workspace =
    await getWorkspaceForUser(
      user.id,
      workspaceId,
    );

  if (!workspace) {
    return Response.json(
      {
        error: {
          code:
            "WORKSPACE_ACCESS_DENIED",
          message:
            "You do not have access to this workspace.",
        },
      },
      { status: 403 },
    );
  }

  const usage =
    await getCurrentUsage(
      user.id,
      workspaceId,
    );

  return Response.json({
    usage,
  });
}
