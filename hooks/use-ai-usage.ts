'use client';

import { useEffect, useState } from 'react';

import { useChatApp } from '@/context/ai-chat-context';

interface Usage {
  requestCount: number;
  totalTokens: number;
  estimatedCost: number;
}

export function useAIUsage() {
  const { workspaceId } = useChatApp();

  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setUsage(null);
      return;
    }

    const currentWorkspaceId = workspaceId;

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/ai/usage?workspaceId=${encodeURIComponent(currentWorkspaceId)}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUsage(data.usage);
        }
      } catch (error) {
        console.error('Failed to load AI usage:', error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return usage;
}
