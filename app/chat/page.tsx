import ChatShell from '@/components/ai/chat/chat-shell';
import { AiChatProvider } from '@/context/ai-chat-context';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation'; // Added for safe unauthorized handling

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || '';
}

export default async function ChatPage() {
  const userId = await getAuthenticatedUserId();

  // If no session exists, safely redirect the user to a login screen
  if (!userId) {
    redirect('/login');
  }

  // Fetch active conversations sorted by recent update intervals
  const rawConversations = await prisma.aiConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  // Map database entries to match client-side serialized string dates
  const initialConversations = rawConversations.map((chat) => ({
    id: chat.id,
    title: chat.title,
    modelId: chat.modelId,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return (
    <AiChatProvider>
      <ChatShell
        initialConversations={initialConversations}
        initialConversationId={initialConversations[0]?.id}
      />
    </AiChatProvider>
  );
}
