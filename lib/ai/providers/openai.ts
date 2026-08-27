import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { AIModelDefinition } from "../types";

export function createOpenAIModel(
  definition: AIModelDefinition,
): LanguageModel {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  const openai = createOpenAI({
    apiKey,
  });

  return openai(definition.model);
}
