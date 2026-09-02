import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { PDFParse } from 'pdf-parse';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = Number(process.env.AI_MAX_FILE_SIZE ?? 20) * 1024 * 1024;

const MAX_TEXT_LENGTH = 2_000_000;

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',

  'application/pdf',

  'text/plain',
  'text/markdown',
  'text/csv',

  'application/json',
]);

export function validateAIFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (!file.size) {
    return {
      valid: false,
      error: 'The uploaded file is empty.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds the ${Math.round(
        MAX_FILE_SIZE / 1024 / 1024
      )} MB limit.`,
    };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error:
        'Unsupported file type. Supported files are images, PDF, TXT, Markdown, CSV and JSON.',
    };
  }

  return {
    valid: true,
  };
}

function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);

    const chunk = normalized.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

async function extractText(
  bytes: Uint8Array,
  mimeType: string
): Promise<string | null> {
  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({
      data: bytes,
    });

    try {
      const result = await parser.getText();

      return result.text?.slice(0, MAX_TEXT_LENGTH) ?? '';
    } finally {
      await parser.destroy();
    }
  }

  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return new TextDecoder().decode(bytes).slice(0, MAX_TEXT_LENGTH);
  }

  return null;
}

/**
 * Inserts a single embedding using PostgreSQL RPC.
 *
 * We intentionally don't use Prisma here because Prisma cannot
 * reliably write PostgreSQL vector fields.
 */
async function insertDocumentChunk(input: {
  attachmentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc('insert_ai_document_chunk', {
    p_attachment_id: input.attachmentId,
    p_user_id: input.userId,
    p_chunk_index: input.chunkIndex,
    p_content: input.content,
    p_embedding: input.embedding,
  });

  if (error) {
    throw new Error(`Failed to insert document chunk: ${error.message}`);
  }

  return data;
}

export async function processAttachment(input: {
  attachmentId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}) {
  try {
    const text = await extractText(input.bytes, input.mimeType);

    // Images don't have text extraction.
    if (text === null) {
      await prisma.aiAttachment.update({
        where: {
          id: input.attachmentId,
        },
        data: {
          status: 'ready',
        },
      });

      return;
    }

    await prisma.aiAttachment.update({
      where: {
        id: input.attachmentId,
      },
      data: {
        extractedText: text,
      },
    });

    const chunks = chunkText(text);

    if (!chunks.length) {
      await prisma.aiAttachment.update({
        where: {
          id: input.attachmentId,
        },
        data: {
          status: 'ready',
        },
      });

      return;
    }

    const embeddingModel = openai.embedding('text-embedding-3-small');

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });

    /**
     * IMPORTANT:
     *
     * Do NOT do:
     *
     * prisma.aiDocumentChunk.createMany(...)
     *
     * because embedding is PostgreSQL vector(1536).
     */
    for (let index = 0; index < chunks.length; index++) {
      await insertDocumentChunk({
        attachmentId: input.attachmentId,
        userId: input.userId,
        chunkIndex: index,
        content: chunks[index],
        embedding: embeddings[index],
      });
    }

    await prisma.aiAttachment.update({
      where: {
        id: input.attachmentId,
      },
      data: {
        status: 'ready',
      },
    });
  } catch (error) {
    console.error(`Failed to process attachment ${input.attachmentId}:`, error);

    await prisma.aiAttachment.update({
      where: {
        id: input.attachmentId,
      },
      data: {
        status: 'failed',
      },
    });

    throw error;
  }
}

export function isVisionFile(mimeType: string) {
  return mimeType.startsWith('image/');
}

export function isRagFile(mimeType: string) {
  return (
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    mimeType === 'text/csv' ||
    mimeType === 'application/json'
  );
}
