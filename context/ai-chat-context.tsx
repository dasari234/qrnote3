'use client';

import React, { createContext, useContext, useState } from 'react';

type ProviderType = 'openai' | 'anthropic' | 'ollama' | 'google';
type ScreenType = 'chat' | 'canvas';

interface AiChatContextType {
  provider: ProviderType;
  setProvider: (p: ProviderType) => void;
  currentScreen: ScreenType;
  setCurrentScreen: (s: ScreenType) => void;
}

const AiChatContext = createContext<AiChatContextType | undefined>(undefined);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ProviderType>('openai');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('chat');

  return (
    <AiChatContext.Provider value={{ provider, setProvider, currentScreen, setCurrentScreen }}>
      {children}
    </AiChatContext.Provider>
  );
}

export function useChatApp() {
  const context = useContext(AiChatContext);
  if (!context) throw new Error('useChatApp must be used within an AiChatProvider');
  return context;
}
