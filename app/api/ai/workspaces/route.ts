import {
    getUserWorkspaces,
} from "@/lib/ai/workspace-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
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

  const workspaces =
    await getUserWorkspaces(user.id);

  return Response.json({
    workspaces,
  });
}
