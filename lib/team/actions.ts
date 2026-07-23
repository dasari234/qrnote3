'use server';

import { prisma } from '@/lib/prisma';
import { canAssignRole, getOrgRole, requireOrgPermission } from '@/lib/rbac';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';

async function getAuthUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');
  return user.id;
}

// ---------------------------------------------------------------------------
// Invite a member
// ---------------------------------------------------------------------------

export async function inviteMember(input: {
  orgId: string;
  email: string;
  role: Role;
}) {
  const userId = await getAuthUserId();
  const actorRole = await requireOrgPermission(userId, input.orgId, 'member:invite');

  if (!canAssignRole(actorRole, input.role)) {
    throw new Error(
      `You cannot invite someone with role "${input.role}" (your role: ${actorRole}).`
    );
  }

  // Check if the email is already a member
  const existingProfile = await prisma.profile.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existingProfile) {
    const alreadyMember = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: { orgId: input.orgId, userId: existingProfile.id },
      },
    });
    if (alreadyMember) {
      throw new Error('This user is already a member of the organization.');
    }
  }

  // Upsert invite (replace any existing pending invite for the same email+org)
  const token = randomUUID();
  const expiresAt = addDays(new Date(), 7);

  const invite = await prisma.orgInvite.upsert({
    where: { orgId_email: { orgId: input.orgId, email: input.email } },
    update: { token, role: input.role, accepted: false, expiresAt },
    create: {
      orgId: input.orgId,
      email: input.email,
      role: input.role,
      token,
      expiresAt,
    },
  });

  // Send invite email via Supabase
  const org = await prisma.organization.findUnique({
    where: { id: input.orgId },
    select: { name: true },
  });

  const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;

  const adminClient = createAdminSupabaseClient();
  await adminClient.auth.admin.inviteUserByEmail(input.email, {
    data: {
      invite_token: token,
      org_name: org?.name ?? 'an organization',
      invite_url: inviteUrl,
    },
    redirectTo: inviteUrl,
  });

  return { inviteId: invite.id, inviteUrl };
}

// ---------------------------------------------------------------------------
// Accept an invite
// ---------------------------------------------------------------------------

export async function acceptInvite(token: string) {
  const userId = await getAuthUserId();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated.');

  const invite = await prisma.orgInvite.findUnique({ where: { token } });
  if (!invite) throw new Error('Invite not found.');
  if (invite.accepted) throw new Error('This invite has already been used.');
  if (invite.expiresAt < new Date()) throw new Error('This invite has expired.');
  if (invite.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    throw new Error('This invite was sent to a different email address.');
  }

  // Add member + mark invite accepted in one transaction
  await prisma.$transaction([
    prisma.organizationMember.upsert({
      where: { orgId_userId: { orgId: invite.orgId, userId } },
      update: { role: invite.role },
      create: { orgId: invite.orgId, userId, role: invite.role },
    }),
    prisma.orgInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    }),
  ]);

  return { orgId: invite.orgId };
}

// ---------------------------------------------------------------------------
// Change a member's role
// ---------------------------------------------------------------------------

export async function changeMemberRole(input: {
  orgId: string;
  targetUserId: string;
  newRole: Role;
}) {
  const actorId = await getAuthUserId();
  const actorRole = await requireOrgPermission(actorId, input.orgId, 'member:changeRole');

  if (!canAssignRole(actorRole, input.newRole)) {
    throw new Error(
      `You cannot assign the role "${input.newRole}" (your role: ${actorRole}).`
    );
  }

  const targetRole = await getOrgRole(input.targetUserId, input.orgId);
  if (!targetRole) throw new Error('Target user is not a member of this organization.');
  if (targetRole === 'owner' && actorRole !== 'owner') {
    throw new Error("Only the owner can change another owner's role.");
  }

  await prisma.organizationMember.update({
    where: { orgId_userId: { orgId: input.orgId, userId: input.targetUserId } },
    data: { role: input.newRole },
  });
}

// ---------------------------------------------------------------------------
// Remove a member
// ---------------------------------------------------------------------------

export async function removeMember(input: {
  orgId: string;
  targetUserId: string;
}) {
  const actorId = await getAuthUserId();
  const actorRole = await requireOrgPermission(actorId, input.orgId, 'member:remove');

  const targetRole = await getOrgRole(input.targetUserId, input.orgId);
  if (!targetRole) throw new Error('Target user is not a member of this organization.');
  if (targetRole === 'owner') {
    throw new Error('The organization owner cannot be removed.');
  }
  if (actorRole === 'admin' && targetRole === 'admin') {
    throw new Error('Admins cannot remove other admins.');
  }

  await prisma.organizationMember.delete({
    where: { orgId_userId: { orgId: input.orgId, userId: input.targetUserId } },
  });
}

// ---------------------------------------------------------------------------
// Revoke a pending invite
// ---------------------------------------------------------------------------

export async function revokeInvite(input: { orgId: string; inviteId: string }) {
  const actorId = await getAuthUserId();
  await requireOrgPermission(actorId, input.orgId, 'member:invite');

  await prisma.orgInvite.delete({
    where: { id: input.inviteId },
  });
}
