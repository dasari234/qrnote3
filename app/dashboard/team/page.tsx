import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkIsSuperAdmin } from '@/lib/rbac';
import { TeamPageClient } from '@/components/team/team-page-client';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in?redirect=/dashboard/team');

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    select: { orgId: true, role: true },
  });

  if (!membership) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          You are not a member of any organization yet.
        </p>
      </div>
    );
  }

  const { orgId, role } = membership;

  const [org, members, pendingInvites, superAdmin] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    }),
    prisma.organizationMember.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orgInvite.findMany({
      where: { orgId, accepted: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
    checkIsSuperAdmin(user.id),
  ]);

  // Enrich members with profile data
  const profileIds = members.map((m) => m.userId);
  const profiles = await prisma.profile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true, email: true, fullName: true },
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const enrichedMembers = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
    email: profileMap[m.userId]?.email ?? m.userId,
    fullName: profileMap[m.userId]?.fullName ?? null,
  }));

  return (
    <TeamPageClient
      orgId={orgId}
      orgName={org?.name ?? ''}
      currentUserId={user.id}
      currentUserRole={role}
      isSuperAdmin={superAdmin}
      members={enrichedMembers}
      pendingInvites={pendingInvites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
      }))}
    />
  );
}
