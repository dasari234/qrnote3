'use server';

import { prisma } from '@/lib/prisma';
import { generateUniqueShortCode, resolveDestination } from '@/lib/qr/factory';
import { AB_KEY, getAbConfig, validateSlug } from '@/lib/qr/meta';
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

/**
 * Validate a custom vanity slug and confirm it is not already in use.
 * `excludeQrId` lets an update keep its own current slug.
 */
async function ensureUniqueSlug(
  slug: string,
  excludeQrId?: string
): Promise<string> {
  const trimmed = slug.trim();
  const err = validateSlug(trimmed);
  if (err) throw new Error(err);
  const existing = await prisma.qrCode.findUnique({
    where: { shortCode: trimmed },
    select: { id: true },
  });
  if (existing && existing.id !== excludeQrId) {
    throw new Error('That short code is already taken. Please choose another.');
  }
  return trimmed;
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
  customShortCode?: string;
  expiresAt?: Date;
  variant?: string;
  testName?: string;
}) {
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForWorkspace(input.workspaceId);
  await requireOrgPermission(userId, orgId, 'qr:create');

  let shortCode: string | null = null;
  let destinationUrl: string | null = null;

  if (input.isDynamic) {
    if (input.customShortCode && input.customShortCode.trim()) {
      shortCode = await ensureUniqueSlug(input.customShortCode);
    } else {
      shortCode = await generateUniqueShortCode(async (code) => {
        const existing = await prisma.qrCode.findUnique({
          where: { shortCode: code },
          select: { id: true },
        });
        return !!existing;
      });
    }
    destinationUrl = resolveDestination(input.type, input.payload);
  }

  const testId = input.variant ? `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null;

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
      expiresAt: input.expiresAt || null,
      variant: input.variant || null,
      testName: input.testName || null,
      testId: testId,
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
  customShortCode?: string;
  expiresAt?: Date | null;
  variant?: string | null;
  testName?: string;
}) {
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForQr(input.id);
  await requireOrgPermission(userId, orgId, 'qr:edit');

  const destinationUrl = input.isDynamic
    ? resolveDestination(input.type, input.payload)
    : null;

  // Allow changing the vanity slug on dynamic QRs.
  let shortCodeUpdate: string | undefined;
  if (input.isDynamic && input.customShortCode !== undefined) {
    const desired = input.customShortCode.trim();
    if (desired) shortCodeUpdate = await ensureUniqueSlug(desired, input.id);
  }

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
      expiresAt: input.expiresAt ?? undefined,
      variant: input.variant ?? undefined,
      testName: input.testName ?? undefined,
      ...(shortCodeUpdate ? { shortCode: shortCodeUpdate } : {}),
      ...(input.tagIds !== undefined
        ? { tags: { set: input.tagIds.map((id) => ({ id })) } }
        : {}),
    },
  });
}

/**
 * Clone an existing QR code — copies its type, payload, style, folder and
 * tags. Dynamic copies get a fresh short code and reset A/B scan counters.
 */
export async function duplicateQrCode(id: string) {
  const userId = await getAuthUserId();
  const orgId = await getOrgIdForQr(id);
  await requireOrgPermission(userId, orgId, 'qr:create');

  const source = await prisma.qrCode.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  });
  if (!source) throw new Error('QR code not found.');

  let shortCode: string | null = null;
  if (source.isDynamic) {
    shortCode = await generateUniqueShortCode(async (code) => {
      const existing = await prisma.qrCode.findUnique({
        where: { shortCode: code },
        select: { id: true },
      });
      return !!existing;
    });
  }

  // Reset A/B variant scan counters on the copy so analytics start clean.
  let payload = (source.payload as Record<string, any>) || {};
  const ab = getAbConfig(payload);
  if (ab) {
    payload = {
      ...payload,
      [AB_KEY]: {
        ...ab,
        variants: ab.variants.map((v) => ({ ...v, scans: 0 })),
      },
    };
  }

  const copy = await prisma.qrCode.create({
    data: {
      workspaceId: source.workspaceId,
      folderId: source.folderId,
      createdBy: userId,
      name: `${source.name} (copy)`,
      type: source.type,
      isDynamic: source.isDynamic,
      shortCode,
      destinationUrl: source.destinationUrl,
      payload,
      style: source.style as any,
      status: 'active',
      ...(source.expiresAt ? { expiresAt: source.expiresAt } : {}),
      ...(source.tags.length > 0
        ? { tags: { connect: source.tags.map((t) => ({ id: t.id })) } }
        : {}),
    },
  });

  return { id: copy.id };
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
