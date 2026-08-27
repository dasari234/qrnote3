import type { LanguageModel } from "ai";

import { getAIConfig } from "./config";
import { createDirectModel } from "./direct";
import { createGatewayModel } from "./gateway";
import { getAIModel } from "./models";

export function resolveAIModel(
  modelId: string,
): LanguageModel {
  const definition = getAIModel(modelId);

  if (!definition) {
    throw new Error(
      `AI model "${modelId}" does not exist or is disabled.`,
    );
  }

  const config = getAIConfig();

  switch (config.executionMode) {
    case "direct":
      return createDirectModel(modelId);

    case "gateway":
      return createGatewayModel(modelId);

    default:
      throw new Error(
        `Unsupported AI execution mode: ${config.executionMode}`,
      );
  }
}
