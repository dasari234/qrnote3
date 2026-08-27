import type { LanguageModel } from "ai";

import { getAIConfig } from "./config";
import { getAIModel } from "./models";

export function createGatewayModel(
  modelId: string,
): LanguageModel {
  const definition = getAIModel(modelId);

  if (!definition) {
    throw new Error(
      `Unsupported or disabled AI model: ${modelId}`,
    );
  }

  const config = getAIConfig();

  if (!config.gatewayApiKey) {
    throw new Error(
      "AI_GATEWAY_API_KEY is not configured.",
    );
  }

  /**
   * Gateway integration is intentionally isolated here.
   *
   * When the gateway provider is enabled in your Vercel
   * deployment, this function becomes the only place that
   * needs to know how gateway models are constructed.
   */

  throw new Error(
    "AI Gateway execution is not configured yet. Set AI_EXECUTION_MODE=direct or configure the gateway adapter.",
  );
}
