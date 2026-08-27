import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

import type { AIModelDefinition } from "../types";

export function createAnthropicModel(
  definition: AIModelDefinition,
): LanguageModel {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured.",
    );
  }

  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic(definition.model);
}
