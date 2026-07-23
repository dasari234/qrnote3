import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkIsSuperAdmin } from '@/lib/rbac';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }

  try {
    // Fetch memberships, workspaces, and super-admin flag in parallel
    const [memberships, workspaces, isSuperAdmin] = await Promise.all([
      prisma.organizationMember.findMany({
        where: { userId: user.id },
        include: {
          org: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.workspace.findMany({
        where: {
          org: {
            members: {
              some: { userId: user.id }
            }
          }
        },
        select: { id: true, orgId: true, name: true },
      }),
      checkIsSuperAdmin(user.id),
    ]);

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
        isSuperAdmin={isSuperAdmin}
      >
        {children}
      </DashboardShell>
    );
  } catch (error) {
    console.error("Dashboard database connection error:", error);

    // Graceful fallback UI instead of a hard application crash
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-semibold text-destructive">Connection Problem</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          We are having trouble reaching our database. Please refresh the page or try again in a few moments.
        </p>
      </div>
    );
  }
}
