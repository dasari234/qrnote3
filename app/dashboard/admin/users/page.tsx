import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminUsersClient } from '@/components/admin/admin-users-client';

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  // Fetch org membership count per user
  const memberships = await prisma.organizationMember.groupBy({
    by: ['userId'],
    _count: { userId: true },
  });
  const membershipMap = Object.fromEntries(
    memberships.map((m) => [m.userId, m._count.userId])
  );

  return (
    <AdminUsersClient
      currentUserId={currentUser?.id ?? ''}
      users={users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName ?? null,
        isSuperAdmin: u.isSuperAdmin,
        orgCount: membershipMap[u.id] ?? 0,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
