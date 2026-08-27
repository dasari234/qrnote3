import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export type AIProvider = "openai" | "anthropic" | "google";

export function getModel(provider: AIProvider, model: string) {
  switch (provider) {
    case "openai":
      return openai(model);

    case "anthropic":
      return anthropic(model);

    case "google":
      return google(model);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
