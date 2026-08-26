// src/app/chat/layout.tsx
'use client';

import { AiChatProvider } from '@/context/ai-chat-context';
import { CopilotKit } from '@copilotkit/react-core';
import "@copilotkit/react-ui/styles.css";

export default function ChatFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AiChatProvider>
      {/* Target internal streaming agent pipelines safely */}
      <CopilotKit runtimeUrl="/api/copilotkit">
        <div className="w-full min-h-screen bg-background text-foreground antialiased">
          {children}
        </div>
      </CopilotKit>
    </AiChatProvider>
  );
}
