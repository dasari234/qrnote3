'use server';

import { prisma } from '@/lib/prisma';
import { generateUniqueShortCode, resolveDestination } from '@/lib/qr/factory';
import { QRStyle, QRType } from '@/lib/types';

import { requireOrgPermission } from '@/lib/rbac';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/** Resolve the orgId for a given workspaceId */
async function getOrgIdForWorkspace(workspaceId: string): Promise<string> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { orgId: true },
  });
  if (!ws) throw new Error('Workspace not found.');
  return ws.orgId;
}

/** Resolve the orgId for a given QR code id */
async function getOrgIdForQr(qrId: string): Promise<string> {
  const qr = await prisma.qrCode.findUnique({
    where: { id: qrId },
    include: { workspace: { select: { orgId: true } } },
  });
  if (!qr) throw new Error('QR code not found.');
  return qr.workspace.orgId;
}

/** Get the authenticated user's id — throws if unauthenticated */
async function getAuthUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  return user.id;
}

// ---------------------------------------------------------------------------

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
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForWorkspace(input.workspaceId);
  await requireOrgPermission(userId, orgId, 'qr:create');

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
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForQr(input.id);
  await requireOrgPermission(userId, orgId, 'qr:edit');

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
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForQr(id);
  await requireOrgPermission(userId, orgId, 'qr:delete');
  await prisma.qrCode.delete({ where: { id } });
}

export async function updateQrStatus(
  id: string,
  status: 'active' | 'paused' | 'archived'
) {
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForQr(id);
  await requireOrgPermission(userId, orgId, 'qr:edit');
  await prisma.qrCode.update({ where: { id }, data: { status } });
}
