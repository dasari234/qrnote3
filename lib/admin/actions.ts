'use server';

import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/rbac';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function getAuthUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  return user.id;
}

/** Toggle isSuperAdmin flag on a profile */
export async function toggleSuperAdmin(targetUserId: string, value: boolean) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  // Prevent self-demotion — super admins cannot remove their own flag
  if (actorId === targetUserId && !value) {
    throw new Error('You cannot remove your own super admin status.');
  }

  await prisma.profile.update({
    where: { id: targetUserId },
    data: { isSuperAdmin: value },
  });
}

/** Remove a member from any org (super admin override) */
export async function adminRemoveMember(orgId: string, targetUserId: string) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  const member = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId: targetUserId } },
  });
  if (!member) throw new Error('Member not found.');
  if (member.role === 'owner') {
    throw new Error('Cannot remove the organization owner.');
  }

  await prisma.organizationMember.delete({
    where: { orgId_userId: { orgId, userId: targetUserId } },
  });
}

/** Change a member role (super admin override) */
export async function adminChangeMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: string
) {
  const actorId = await getAuthUserId();
  await requireSuperAdmin(actorId);

  await prisma.organizationMember.update({
    where: { orgId_userId: { orgId, userId: targetUserId } },
    data: { role: newRole as any },
  });
}
