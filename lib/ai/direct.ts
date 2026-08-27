import type { LanguageModel } from "ai";

import { getAIModel } from "./models";
import type { AIProviderId } from "./types";

import { createAnthropicModel } from "./providers/anthropic";
import { createGoogleModel } from "./providers/google";
import { createOpenAIModel } from "./providers/openai";

export function createDirectModel(
  modelId: string,
): LanguageModel {
  const definition = getAIModel(modelId);

  if (!definition) {
    throw new Error(
      `Unsupported or disabled AI model: ${modelId}`,
    );
  }

  switch (definition.provider as AIProviderId) {
    case "openai":
      return createOpenAIModel(definition);

    case "anthropic":
      return createAnthropicModel(definition);

    case "google":
      return createGoogleModel(definition);

    default:
      throw new Error(
        `Unsupported AI provider: ${definition.provider}`,
      );
  }
}
