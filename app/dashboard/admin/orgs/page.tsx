import { prisma } from '@/lib/prisma';
import { AdminOrgsClient } from '@/components/admin/admin-orgs-client';

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

  return (
    <AdminOrgsClient
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
