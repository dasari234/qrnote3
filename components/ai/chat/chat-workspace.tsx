"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";

import ChatComposer from "./chat-composer";
import ChatMessageList from "./chat-message-list";

interface ChatConversation {
  id: string;
  title: string;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatWorkspaceProps {
  conversationId: string | null;

  onConversationCreated?: (
    conversation: ChatConversation,
  ) => void;
}

export default function ChatWorkspace({
  conversationId,
  onConversationCreated,
}: ChatWorkspaceProps) {
  const [loading, setLoading] =
    useState(false);

  /*
   * When the first prompt creates a conversation,
   * the parent changes conversationId.
   *
   * We must NOT immediately reload the conversation
   * from the database because the AI response may
   * still be streaming in memory.
   */
  const skipNextLoadRef =
    useRef(false);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
  } = useChat({
    transport:
      new DefaultChatTransport({
        api: "/api/chat",
      }),
  });

  /*
   * Load persisted messages whenever the
   * selected conversation changes.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadConversation() {
      /*
       * New/empty chat.
       */
      if (!conversationId) {
        setMessages([]);
        return;
      }

      /*
       * First prompt created this conversation.
       * Keep the in-memory useChat messages.
       */
      if (skipNextLoadRef.current) {
        skipNextLoadRef.current = false;
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load conversation.",
          );
        }

        const data =
          await response.json();

        const persistedMessages: UIMessage[] =
          (
            data.conversation
              ?.messages ?? []
          ).map(
            (message: UIMessage) => ({
              id: message.id,
              role: message.role,
              parts: message.parts,
            }),
          );

        if (!cancelled) {
          setMessages(
            persistedMessages,
          );
        }
      } catch (loadError) {
        console.error(
          "Failed to load conversation:",
          loadError,
        );

        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, setMessages]);

  function handleConversationCreated(
    conversation: ChatConversation,
  ) {
    /*
     * The composer has already submitted the first
     * message into this useChat instance.
     *
     * Keep those messages instead of fetching the
     * database immediately.
     */
    skipNextLoadRef.current = true;

    onConversationCreated?.(
      conversation,
    );
  }

  const showLoading =
    loading && messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        status={status}
        loading={showLoading}
        error={error}
      />

      <ChatComposer
        conversationId={
          conversationId
        }
        sendMessage={sendMessage}
        status={status}
        onConversationCreated={
          handleConversationCreated
        }
      />
    </div>
  );
}
