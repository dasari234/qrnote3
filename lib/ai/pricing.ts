export interface ModelPricing {
  provider: string;
  modelId: string;

  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING: ModelPricing[] = [
  {
    provider: 'openai',
    modelId: 'openai-gpt-5',

    inputPerMillion: 0,
    outputPerMillion: 0,
  },

  {
    provider: 'anthropic',
    modelId: 'anthropic-claude-sonnet',

    inputPerMillion: 0,
    outputPerMillion: 0,
  },

  {
    provider: 'google',
    modelId: 'google-gemini',

    inputPerMillion: 0,
    outputPerMillion: 0,
  },
];

export function calculateCost(
  provider: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number
) {
  const pricing = MODEL_PRICING.find(
    (item) => item.provider === provider && item.modelId === modelId
  );

  if (!pricing) {
    return 0;
  }

  return (
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
}
