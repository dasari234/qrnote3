import type { AIModelDefinition } from "./types";

export const AI_MODELS: AIModelDefinition[] = [
  {
    id: "openai-gpt-5",
    provider: "openai",
    model: "gpt-5",
    name: "GPT-5",
    description: "OpenAI general-purpose reasoning model",
    gatewayModel: "openai/gpt-5",
    enabled: true,
  },
  {
    id: "openai-gpt-5-mini",
    provider: "openai",
    model: "gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Fast and efficient OpenAI model",
    gatewayModel: "openai/gpt-5-mini",
    enabled: true,
  },
  {
    id: "anthropic-claude-sonnet",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    name: "Claude Sonnet",
    description: "Anthropic Claude Sonnet",
    gatewayModel: "anthropic/claude-sonnet-4-5",
    enabled: true,
  },
  {
    id: "google-gemini",
    provider: "google",
    model: "gemini-2.5-flash",
    name: "Gemini Flash",
    description: "Google Gemini fast model",
    gatewayModel: "google/gemini-2.5-flash",
    enabled: true,
  },
];

export const DEFAULT_MODEL = "openai-gpt-5";

export function getAIModel(
  modelId: string,
): AIModelDefinition | undefined {
  return AI_MODELS.find(
    (model) => model.id === modelId && model.enabled,
  );
}

export function getAIModels(): AIModelDefinition[] {
  return AI_MODELS.filter((model) => model.enabled);
}
