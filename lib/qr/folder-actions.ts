'use server';

import { prisma } from '@/lib/prisma';

export async function createFolder(input: { workspaceId: string; name: string; parentId?: string }) {
  return prisma.folder.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      parentId: input.parentId || null,
    },
  });
}

export async function renameFolder(id: string, name: string) {
  return prisma.folder.update({ where: { id }, data: { name } });
}

export async function deleteFolder(id: string) {
  await prisma.folder.delete({ where: { id } });
}

export async function moveQrToFolder(qrId: string, folderId: string | null) {
  return prisma.qrCode.update({
    where: { id: qrId },
    data: { folderId },
  });
}

export async function createTag(input: { workspaceId: string; name: string; color?: string }) {
  return prisma.tag.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      color: input.color || '#6b7280',
    },
  });
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
}

export async function assignTags(qrId: string, tagIds: string[]) {
  return prisma.qrCode.update({
    where: { id: qrId },
    data: { tags: { set: tagIds.map((id) => ({ id })) } },
  });
}
