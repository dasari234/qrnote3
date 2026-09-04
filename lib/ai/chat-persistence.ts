import { Prisma } from '@prisma/client';

import type { UIMessage } from 'ai';

import { prisma } from '@/lib/prisma';

export function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

export function getConversationTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');

  if (!firstUserMessage) {
    return 'New chat';
  }

  const text = getTextFromMessage(firstUserMessage);

  if (!text) {
    return 'New chat';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= 60) {
    return normalized;
  }

  return `${normalized.slice(0, 57).trimEnd()}...`;
}

export async function getConversationForUser(
  conversationId: string,
  userId: string
) {
  return prisma.aiConversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });
}

export async function saveChatMessages({
  conversationId,
  userId,
  modelId,
  messages,
}: {
  conversationId: string;

  userId: string;

  modelId: string;

  messages: UIMessage[];
}) {
  const conversation = await getConversationForUser(conversationId, userId);

  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  /*
   * Remove invalid duplicate messages
   * from the supplied array first.
   */
  const uniqueMessages = Array.from(
    new Map(messages.map((message) => [message.id, message])).values()
  );

  if (uniqueMessages.length > 0) {
    /*
     * Re-check existing IDs so this function
     * remains safe when called multiple times.
     */
    const existing = await prisma.aiMessage.findMany({
      where: {
        conversationId,
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existing.map((message) => message.id));

    const newMessages = uniqueMessages
      .filter((message) => !existingIds.has(message.id))
      .map((message) => ({
        id: message.id,

        conversationId,

        userId,

        role: message.role,

        /*
         * UIMessage.parts contains structured
         * objects, therefore preserve it exactly
         * as JSON.
         */
        parts: message.parts as unknown as Prisma.InputJsonValue,

        modelId: message.role === 'assistant' ? modelId : null,
      }));

    if (newMessages.length > 0) {
      await prisma.aiMessage.createMany({
        data: newMessages,

        /*
         * Protect against two simultaneous
         * persistence calls.
         */
        skipDuplicates: true,
      });
    }
  }

  const title = getConversationTitle(uniqueMessages);

  /*
   * Don't overwrite a manually renamed
   * conversation.
   */
  const shouldSetTitle =
    conversation.title === 'New chat' && title !== 'New chat';

  await prisma.aiConversation.update({
    where: {
      id: conversationId,
    },

    data: {
      modelId,

      updatedAt: new Date(),

      ...(shouldSetTitle
        ? {
            title: title.slice(0, 100),
          }
        : {}),
    },
  });
}
