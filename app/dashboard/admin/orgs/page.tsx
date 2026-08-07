import { AdminOrgsClient } from '@/components/admin/admin-orgs-client';
import { adminDeleteOrganization } from '@/lib/admin/actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function AdminOrgsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { members: true, workspaces: true } },
    },
  });

  // Resolve owner emails
  const ownerIds = [...new Set(orgs.map((o) => o.ownerId))];
  const ownerProfiles = await prisma.profile.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, email: true, fullName: true },
  });
  const ownerMap = Object.fromEntries(ownerProfiles.map((p) => [p.id, p]));

  // Create an inline server function to trigger revalidation
  async function handleDelete(id: string) {
    'use server';
    try {
      await adminDeleteOrganization(id);
      revalidatePath('/dashboard/admin/orgs');
      return { success: true, message: 'Organization deleted successfully.' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Failed to delete organization.' };
    }
  }

  return (
    <AdminOrgsClient
      onDeleteOrg={handleDelete}
      orgs={orgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        ownerId: o.ownerId,
        ownerEmail: ownerMap[o.ownerId]?.email ?? '—',
        ownerName: ownerMap[o.ownerId]?.fullName ?? null,
        memberCount: o._count.members,
        workspaceCount: o._count.workspaces,
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
