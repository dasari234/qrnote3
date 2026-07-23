import { prisma } from '@/lib/prisma';
import { AdminOverviewClient } from '@/components/admin/admin-overview-client';

export default async function AdminOverviewPage() {
  const [
    totalOrgs,
    totalUsers,
    totalQrCodes,
    totalScans,
    recentOrgs,
    recentUsers,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.profile.count(),
    prisma.qrCode.count(),
    prisma.scanEvent.count(),
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { members: true, workspaces: true } },
      },
    }),
    prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        fullName: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminOverviewClient
      stats={{ totalOrgs, totalUsers, totalQrCodes, totalScans }}
      recentOrgs={recentOrgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        memberCount: o._count.members,
        workspaceCount: o._count.workspaces,
        createdAt: o.createdAt.toISOString(),
      }))}
      recentUsers={recentUsers.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName ?? null,
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
