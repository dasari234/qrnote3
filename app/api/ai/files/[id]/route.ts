import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const BUCKET = process.env.AI_STORAGE_BUCKET ?? 'ai-files';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const attachment = await prisma.aiAttachment.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        {
          error: 'Attachment not found.',
        },
        { status: 404 }
      );
    }

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([attachment.storagePath]);

    if (storageError) {
      console.error('Storage deletion failed:', storageError);
    }

    await prisma.aiAttachment.delete({
      where: {
        id: attachment.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Attachment deletion failed:', error);

    return NextResponse.json(
      {
        error: 'Unable to delete attachment.',
      },
      { status: 500 }
    );
  }
}
