'use client';

import { useCallback, useState } from 'react';

import ChatHeader from './chat-header';
import ChatSidebar from './chat-sidebar';
import { ChatConversation } from './chat-types';
import ChatWorkspace from './chat-workspace';


interface ChatShellProps {
  initialConversations: ChatConversation[];

  initialConversationId?: string;
}

export default function ChatShell({
  initialConversations,
  initialConversationId,
}: ChatShellProps) {
  const [conversations, setConversations] =
    useState<ChatConversation[]>(initialConversations);

  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /*
   * Start a truly empty chat.
   *
   * No API call is made here.
   */
  const handleNewChat = useCallback(() => {
    setConversationId(null);
  }, []);

  /*
   * Add newly created conversation
   * to the sidebar and select it.
   */
  const handleConversationCreated = useCallback(
    (conversation: ChatConversation) => {
      setConversations((current) => {
        const exists = current.some((item) => item.id === conversation.id);

        if (exists) {
          return current.map((item) =>
            item.id === conversation.id ? conversation : item
          );
        }

        return [conversation, ...current];
      });

      setConversationId(conversation.id);
    },
    []
  );

  const handleConversationDelete = useCallback(
    (id: string) => {
      setConversations((current) => current.filter((item) => item.id !== id));

      if (conversationId === id) {
        setConversationId(null);
      }
    },
    [conversationId]
  );

  /*
   * Refresh the conversation list after
   * the AI response has been persisted.
   *
   * This picks up the generated title
   * and updatedAt value.
   */
  const refreshConversations = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await fetch('/api/conversations', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh conversations.');
      }

      const data = await response.json();

      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && (
        <ChatSidebar
          conversations={conversations}
          selectedId={conversationId}
          onSelect={setConversationId}
          onNewChat={handleNewChat}
          onDelete={handleConversationDelete}
          loading={refreshing}
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((value) => !value)} />

        <ChatWorkspace
          conversationId={conversationId}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={refreshConversations}
        />
      </section>
    </div>
  );
}
