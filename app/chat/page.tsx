"use client";

import ChatShell from "@/components/ai/chat/chat-shell";
import { AiChatProvider } from "@/context/ai-chat-context";

export default function ChatPage() {
  return (
    <AiChatProvider>
      <ChatShell />
    </AiChatProvider>
  );
}
