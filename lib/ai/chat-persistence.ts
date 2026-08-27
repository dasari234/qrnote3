import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { UIMessage } from "ai";

export function getTextFromMessage(
  message: UIMessage,
): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function getConversationTitle(
  messages: UIMessage[],
): string {
  const firstUserMessage = messages.find(
    (message) => message.role === "user",
  );

  if (!firstUserMessage) {
    return "New chat";
  }

  const text = getTextFromMessage(
    firstUserMessage,
  );

  if (!text) {
    return "New chat";
  }

  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= 60) {
    return normalized;
  }

  return `${normalized
    .slice(0, 57)
    .trimEnd()}...`;
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
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
    throw new Error("Conversation not found.");
  }

  const existing = await prisma.aiMessage.findMany({
    where: { conversationId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((message) => message.id));

  const newMessages = messages
    .filter((message) => !existingIds.has(message.id))
    .map((message) => ({
      id: message.id,
      conversationId,
      userId,
      role: message.role,
      // 2. Safely cast the complex layout array to satisfy Prisma's strict JSON type constraints
      parts: message.parts as unknown as Prisma.InputJsonValue,
      modelId: message.role === "assistant" ? modelId : null,
    }));

  if (newMessages.length > 0) {
    await prisma.aiMessage.createMany({
      data: newMessages,
    });
  }

  const title = getConversationTitle(messages);

  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: {
      modelId,
      updatedAt: new Date(),
      ...(conversation.title === "New chat" && title !== "New chat"
        ? { title }
        : {}),
    },
  });
}
