'use client';

import React, { createContext, useContext, useState } from 'react';

export type ScreenType = 'chat' | 'canvas';

export interface AIModel {
  id: string;
  provider: 'openai' | 'anthropic' | 'google';
  name: string;
  description?: string;
}

interface AiChatContextType {
  modelId: string;
  setModelId: (modelId: string) => void;

  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
}

export interface AIWorkspace {
  id: string;
  orgId: string;
  name: string;
  organizationName: string;
  organizationSlug: string;
}

interface AiChatContextType {
  modelId: string;
  setModelId: (modelId: string) => void;

  workspaceId: string | null;
  setWorkspaceId: (workspaceId: string | null) => void;

  workspaces: AIWorkspace[];

  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
}

const AiChatContext = createContext<AiChatContextType | undefined>(undefined);

export function AiChatProvider({
  children,
  initialWorkspaceId,
  initialWorkspaces,
}: {
  children: React.ReactNode;
  initialWorkspaceId?: string | null;
  initialWorkspaces?: AIWorkspace[];
}) {
  const [modelId, setModelId] = useState('openai-gpt-5');

  const [workspaceId, setWorkspaceId] = useState<string | null>(
    initialWorkspaceId ?? null
  );

  const [workspaces] = useState<AIWorkspace[]>(initialWorkspaces ?? []);

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('chat');

  return (
    <AiChatContext.Provider
      value={{
        modelId,
        setModelId,
        workspaceId,
        setWorkspaceId,
        workspaces,
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
    throw new Error('useChatApp must be used within an AiChatProvider');
  }

  return context;
}
