'use server';

import { prisma } from '@/lib/prisma';
import { QRType, QRStyle } from '@/lib/types';
import { resolveDestination, generateUniqueShortCode } from '@/lib/qr/factory';

export async function createQrCode(input: {
  workspaceId: string;
  name: string;
  type: QRType;
  payload: Record<string, any>;
  isDynamic: boolean;
  style: QRStyle;
  createdBy: string;
  folderId?: string;
  tagIds?: string[];
}) {
  let shortCode: string | null = null;
  let destinationUrl: string | null = null;

  if (input.isDynamic) {
    shortCode = await generateUniqueShortCode(async (code) => {
      const existing = await prisma.qrCode.findUnique({
        where: { shortCode: code },
        select: { id: true },
      });
      return !!existing;
    });
    destinationUrl = resolveDestination(input.type, input.payload);
  }

  const qr = await prisma.qrCode.create({
    data: {
      workspaceId: input.workspaceId,
      folderId: input.folderId || null,
      createdBy: input.createdBy,
      name: input.name,
      type: input.type,
      isDynamic: input.isDynamic,
      shortCode,
      destinationUrl,
      payload: input.payload,
      style: input.style as any,
      status: 'active',
      ...(input.tagIds && input.tagIds.length > 0
        ? { tags: { connect: input.tagIds.map((id) => ({ id })) } }
        : {}),
    },
  });

  return { id: qr.id, shortCode: qr.shortCode };
}

export async function updateQrCode(input: {
  id: string;
  name: string;
  type: QRType;
  payload: Record<string, any>;
  isDynamic: boolean;
  style: QRStyle;
  status: string;
  folderId?: string | null;
  tagIds?: string[];
}) {
  const destinationUrl = input.isDynamic
    ? resolveDestination(input.type, input.payload)
    : null;

  await prisma.qrCode.update({
    where: { id: input.id },
    data: {
      name: input.name,
      type: input.type,
      payload: input.payload,
      isDynamic: input.isDynamic,
      destinationUrl,
      style: input.style as any,
      status: input.status as any,
      folderId: input.folderId || null,
      ...(input.tagIds !== undefined
        ? { tags: { set: input.tagIds.map((id) => ({ id })) } }
        : {}),
    },
  });
}

export async function deleteQrCode(id: string) {
  await prisma.qrCode.delete({ where: { id } });
}

export async function updateQrStatus(id: string, status: 'active' | 'paused' | 'archived') {
  await prisma.qrCode.update({ where: { id }, data: { status } });
}
