import type { AIExecutionMode } from "./types";

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    return undefined;
  }

  return value;
}

export function getAIExecutionMode(): AIExecutionMode {
  const mode = process.env.AI_EXECUTION_MODE || "direct";

  if (mode !== "direct" && mode !== "gateway") {
    throw new Error(
      `Invalid AI_EXECUTION_MODE: ${mode}. Expected "direct" or "gateway".`,
    );
  }

  return mode;
}

export function getAIConfig() {
  return {
    executionMode: getAIExecutionMode(),

    openaiApiKey: getOptionalEnv("OPENAI_API_KEY"),

    anthropicApiKey: getOptionalEnv(
      "ANTHROPIC_API_KEY",
    ),

    googleApiKey: getOptionalEnv(
      "GOOGLE_GENERATIVE_AI_API_KEY",
    ),

    gatewayApiKey: getOptionalEnv(
      "AI_GATEWAY_API_KEY",
    ),

    gatewayBaseUrl: getOptionalEnv(
      "AI_GATEWAY_BASE_URL",
    ),

    maxTokens: Number(
      process.env.AI_MAX_TOKENS || "4096",
    ),

    temperature: Number(
      process.env.AI_TEMPERATURE || "0.7",
    ),
  };
}
