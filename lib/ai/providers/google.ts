import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

import type { AIModelDefinition } from "../types";

export function createGoogleModel(
  definition: AIModelDefinition,
): LanguageModel {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured.",
    );
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  return google(definition.model);
}
