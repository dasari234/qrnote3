export type AIProviderId = "openai" | "anthropic" | "google";

export type AIExecutionMode = "direct" | "gateway";

export interface AIModelDefinition {
  id: string;
  provider: AIProviderId;
  model: string;
  name: string;
  description?: string;
  gatewayModel: string;
  enabled: boolean;
}

export interface AIChatRequest {
  modelId: string;
  messages: unknown[];
}

export interface AIProviderConfig {
  provider: AIProviderId;
  apiKey?: string;
}

export interface AIRouterOptions {
  modelId: string;
  messages: unknown[];
  temperature?: number;
  maxTokens?: number;
}
