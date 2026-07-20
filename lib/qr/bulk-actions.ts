'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveDestination, generateUniqueShortCode } from '@/lib/qr/factory';

export interface BulkImportRow {
  name: string;
  type: string;
  url: string;
  dynamic: boolean;
}

export async function bulkImportQrCodes(
  workspaceId: string,
  rows: BulkImportRow[]
): Promise<{ created: number; errors: string[] }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let created = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.name || !row.url) {
      errors.push(`Skipped row: missing name or url`);
      continue;
    }

    try {
      let shortCode: string | null = null;
      let destinationUrl: string | null = null;

      if (row.dynamic) {
        shortCode = await generateUniqueShortCode(async (code) => {
          const existing = await prisma.qrCode.findUnique({
            where: { shortCode: code },
            select: { id: true },
          });
          return !!existing;
        });
        destinationUrl = row.url;
      }

      await prisma.qrCode.create({
        data: {
          workspaceId,
          createdBy: user.id,
          name: row.name,
          type: row.type || 'url',
          isDynamic: row.dynamic,
          shortCode,
          destinationUrl,
          payload: { url: row.url },
          style: { fgColor: '#000000', bgColor: '#ffffff' },
          status: 'active',
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`Failed to create "${row.name}": ${err.message}`);
    }
  }

  return { created, errors };
}
