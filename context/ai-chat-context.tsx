"use client";

import React, {
  createContext,
  useContext,
  useState,
} from "react";

export type ScreenType = "chat" | "canvas";

export interface AIModel {
  id: string;
  provider: "openai" | "anthropic" | "google";
  name: string;
  description?: string;
}

interface AiChatContextType {
  modelId: string;
  setModelId: (modelId: string) => void;

  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
}

const AiChatContext =
  createContext<AiChatContextType | undefined>(
    undefined,
  );

export function AiChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Model is now the source of truth.
   *
   * Example:
   * openai-gpt-4o
   * anthropic-claude-3-5-sonnet
   * google-gemini-1-5-pro
   */
  const [modelId, setModelId] =
    useState<string>("openai-gpt-5");

  const [currentScreen, setCurrentScreen] =
    useState<ScreenType>("chat");

  return (
    <AiChatContext.Provider
      value={{
        modelId,
        setModelId,
        currentScreen,
        setCurrentScreen,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useChatApp() {
  const context = useContext(AiChatContext);

  if (!context) {
    throw new Error(
      "useChatApp must be used within an AiChatProvider",
    );
  }

  return context;
}
