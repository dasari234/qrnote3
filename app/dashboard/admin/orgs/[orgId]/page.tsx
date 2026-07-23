import { AdminOrgDetailClient } from '@/components/admin/admin-org-detail-client';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ orgId: string }>;
}

export default async function AdminOrgDetailPage({ params }: Props) {
    const { orgId } = await params;

    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
            members: { orderBy: { createdAt: 'asc' } },
            workspaces: {
                include: { _count: { select: { qrCodes: true } } },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!org) notFound();

    const memberUserIds = org.members.map((m) => m.userId);
    const profiles = await prisma.profile.findMany({
        where: { id: { in: memberUserIds } },
        select: { id: true, email: true, fullName: true, isSuperAdmin: true },
    });
    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

    const qrCount = await prisma.qrCode.count({
        where: { workspace: { orgId } },
    });

    return (
        <AdminOrgDetailClient
            org={{
                id: org.id,
                name: org.name,
                slug: org.slug,
                ownerId: org.ownerId,
                createdAt: org.createdAt.toISOString(),
            }}
            members={org.members.map((m) => ({
                id: m.id,
                userId: m.userId,
                role: m.role,
                createdAt: m.createdAt.toISOString(),
                email: profileMap[m.userId]?.email ?? m.userId,
                fullName: profileMap[m.userId]?.fullName ?? null,
                isSuperAdmin: profileMap[m.userId]?.isSuperAdmin ?? false,
            }))}
            workspaces={org.workspaces.map((w) => ({
                id: w.id,
                name: w.name,
                qrCount: w._count.qrCodes,
                createdAt: w.createdAt.toISOString(),
            }))}
            qrCount={qrCount}
        />
    );
}
