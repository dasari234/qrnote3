import { NextResponse } from "next/server";

import { searchKnowledge } from "@/lib/ai/rag";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!query) {
      return NextResponse.json(
        {
          error:
            "query is required.",
        },
        { status: 400 },
      );
    }

    const results =
      await searchKnowledge(
        user.id,
        query,
        8,
      );

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error(
      "RAG API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to search knowledge.",
      },
      { status: 500 },
    );
  }
}
