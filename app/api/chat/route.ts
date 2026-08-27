import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { getAIConfig } from "@/lib/ai/config";
import { resolveAIModel } from "@/lib/ai/router";

interface ChatRequestBody {
  modelId?: string;
  messages?: UIMessage[];
}

function isValidMessages(
  messages: unknown,
): messages is UIMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message === "object" &&
        message !== null,
    )
  );
}

export async function POST(req: Request) {
  try {
    const body =
      (await req.json()) as ChatRequestBody;

    const modelId = body.modelId;

    if (!modelId) {
      return Response.json(
        {
          error: {
            code: "MODEL_REQUIRED",
            message: "modelId is required.",
          },
        },
        { status: 400 },
      );
    }

    if (!isValidMessages(body.messages)) {
      return Response.json(
        {
          error: {
            code: "INVALID_MESSAGES",
            message: "Invalid messages payload.",
          },
        },
        { status: 400 },
      );
    }

    const config = getAIConfig();

    const model = resolveAIModel(modelId);

    const modelMessages =
      await convertToModelMessages(
        body.messages,
      );

    const result = streamText({
      model,
      messages: modelMessages,

      temperature: config.temperature,

      maxOutputTokens: config.maxTokens,

      onError({ error }) {
        console.error("AI stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI chat request failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to process AI request.";

    return Response.json(
      {
        error: {
          code: "AI_REQUEST_FAILED",
          message,
        },
      },
      { status: 500 },
    );
  }
}
