import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      org: { select: { id: true, name: true, slug: true } },
    },
  });

  const orgIds = memberships.map((m) => m.orgId);

  const workspaces =
    orgIds.length > 0
      ? await prisma.workspace.findMany({
          where: { orgId: { in: orgIds } },
          select: { id: true, orgId: true, name: true },
        })
      : [];

  const profile = {
    email: user.email ?? '',
    fullName: (user.user_metadata?.full_name as string) ?? '',
  };

  return (
    <DashboardShell
      organizations={memberships.map((m) => ({
        id: m.org.id,
        name: m.org.name,
        slug: m.org.slug,
        role: m.role,
      }))}
      workspaces={workspaces.map((w) => ({ id: w.id, org_id: w.orgId, name: w.name }))}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
