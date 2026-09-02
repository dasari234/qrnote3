import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function searchKnowledge(
  userId: string,
  query: string,
  limit = Number(process.env.AI_RAG_TOP_K ?? 8)
) {
  const embeddingModel = openai.embedding(
    'text-embedding-3-small'
  );

  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc(
    'match_ai_document_chunks',
    {
      query_embedding: embedding,
      match_user_id: userId,
      match_count: limit,
      similarity_threshold: 0.65,
    }
  );

  if (error) {
    throw new Error(
      `Knowledge search failed: ${error.message}`
    );
  }

  return data ?? [];
}
