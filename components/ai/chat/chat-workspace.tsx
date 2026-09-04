'use client';

import { useChat } from '@ai-sdk/react';

import { DefaultChatTransport, type UIMessage } from 'ai';

import { useCallback, useEffect, useRef, useState } from 'react';

import ChatComposer from './chat-composer';
import ChatMessageList from './chat-message-list';

interface ChatConversation {
  id: string;
  title: string;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatWorkspaceProps {
  conversationId: string | null;

  onConversationCreated?: (conversation: ChatConversation) => void;

  onConversationUpdated?: (conversationId: string) => void;
}

export default function ChatWorkspace({
  conversationId,
  onConversationCreated,
  onConversationUpdated,
}: ChatWorkspaceProps) {
  const [loading, setLoading] = useState(false);

  /*
   * Tracks conversations that were created
   * by the first prompt.
   *
   * Their messages already exist in the
   * useChat state, so don't immediately
   * overwrite them with a database fetch.
   */
  const skipNextLoadRef = useRef<string | null>(null);

  const requestIdRef = useRef(0);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const loadConversation = useCallback(
    async (id: string) => {
      const requestId = ++requestIdRef.current;

      setLoading(true);

      try {
        const response = await fetch(`/api/conversations/${id}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Unable to load conversation.');
        }

        const data = await response.json();

        const persistedMessages = (data.conversation?.messages ?? []).map(
          (message: UIMessage) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
          })
        );

        /*
         * Ignore responses from old
         * requests after the user switches
         * conversations quickly.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        setMessages(persistedMessages);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error('Failed to load conversation:', error);

        setMessages([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [setMessages]
  );

  useEffect(() => {
    /*
     * New chat.
     */
    if (!conversationId) {
      requestIdRef.current += 1;
      setMessages([]);
      setLoading(false);
      return;
    }

    /*
     * The composer just created this
     * conversation. Keep the active
     * useChat state.
     */
    if (skipNextLoadRef.current === conversationId) {
      skipNextLoadRef.current = null;

      setLoading(false);

      return;
    }

    void loadConversation(conversationId);
  }, [conversationId, loadConversation, setMessages]);

  function handleConversationCreated(conversation: ChatConversation) {
    skipNextLoadRef.current = conversation.id;

    onConversationCreated?.(conversation);
  }

  const showLoading = loading && messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        status={status}
        loading={showLoading}
        error={error}
      />

      <ChatComposer
        conversationId={conversationId}
        sendMessage={sendMessage}
        status={status}
        onConversationCreated={handleConversationCreated}
        onConversationUpdated={onConversationUpdated}
      />
    </div>
  );
}
