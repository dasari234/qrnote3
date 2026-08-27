import { NextResponse } from "next/server";

import { getAIModels } from "@/lib/ai/models";

export async function GET() {
  try {
    const models = getAIModels();

    return NextResponse.json({
      models: models.map((model) => ({
        id: model.id,
        provider: model.provider,
        name: model.name,
        description: model.description,
      })),
    });
  } catch (error) {
    console.error("Failed to load AI models:", error);

    return NextResponse.json(
      {
        error: {
          code: "MODELS_LOAD_FAILED",
          message: "Unable to load AI models.",
        },
      },
      { status: 500 },
    );
  }
}
