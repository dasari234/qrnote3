import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { processAttachment, validateAIFile } from '@/lib/ai/attachments';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const STORAGE_BUCKET = process.env.AI_STORAGE_BUCKET ?? 'ai-files';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const fileValue = formData.get('file');
    const conversationId = formData.get('conversationId')?.toString() || null;

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_REQUIRED',
            message: 'A file is required.',
          },
        },
        { status: 400 }
      );
    }

    const validation = validateAIFile(fileValue);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FILE',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    if (conversationId) {
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!conversation) {
        return NextResponse.json(
          {
            error: {
              code: 'CONVERSATION_NOT_FOUND',
              message: 'Conversation not found.',
            },
          },
          { status: 404 }
        );
      }
    }

    const extension = fileValue.name.includes('.')
      ? (fileValue.name.split('.').pop()?.toLowerCase() ?? 'bin')
      : 'bin';

    const storagePath = `${user.id}/${new Date()
      .toISOString()
      .slice(0, 10)}/${randomUUID()}.${extension}`;

    const bytes = new Uint8Array(await fileValue.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, bytes, {
        contentType: fileValue.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload failed:', uploadError);

      return NextResponse.json(
        {
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Unable to upload the file.',
          },
        },
        { status: 500 }
      );
    }

    let attachment: Awaited<ReturnType<typeof prisma.aiAttachment.create>> | undefined;

    try {
      attachment = await prisma.aiAttachment.create({
        data: {
          userId: user.id,
          conversationId,
          fileName: fileValue.name,
          mimeType: fileValue.type || 'application/octet-stream',
          sizeBytes: fileValue.size,
          storagePath,
          status: 'processing',
        },
      });

      await processAttachment({
        attachmentId: attachment.id,
        userId: user.id,
        fileName: fileValue.name,
        mimeType: fileValue.type || 'application/octet-stream',
        bytes,
      });

      const updated = await prisma.aiAttachment.findUnique({
        where: {
          id: attachment.id,
        },
      });

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(storagePath, 60 * 60);

      if (signedUrlError) {
        throw signedUrlError;
      }

      return NextResponse.json({
        attachment: {
          id: updated?.id,
          fileName: updated?.fileName,
          mimeType: updated?.mimeType,
          sizeBytes: updated?.sizeBytes,
          status: updated?.status,
          url: signedUrlData.signedUrl,
        },
      });
    } catch (processingError) {
      console.error('Attachment processing failed:', processingError);

      if (attachment) {
        await prisma.aiAttachment.update({
          where: {
            id: attachment.id,
          },
          data: {
            status: 'failed',
          },
        });

        return NextResponse.json({
          attachment: {
            id: attachment.id,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
            status: 'failed',
          },
        });
      }

      throw processingError;
    }
  } catch (error) {
    console.error('AI file upload failed:', error);

    return NextResponse.json(
      {
        error: {
          code: 'AI_FILE_UPLOAD_FAILED',
          message:
            error instanceof Error ? error.message : 'Unable to upload file.',
        },
      },
      { status: 500 }
    );
  }
}
