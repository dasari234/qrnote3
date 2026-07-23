/**
 * RBAC — Role Based Access Control
 *
 * Permission matrix:
 *   owner  → full access (create, edit, delete, invite, change roles, remove members, transfer)
 *   admin  → create, edit, delete QR codes; invite members; change roles below admin; remove non-owners
 *   editor → create + edit QR codes (cannot delete, cannot manage members)
 *   viewer → read only
 */

import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Permission definitions
// ---------------------------------------------------------------------------

export type Permission =
  | 'qr:create'
  | 'qr:edit'
  | 'qr:delete'
  | 'member:invite'
  | 'member:remove'
  | 'member:changeRole'
  | 'org:settings';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'qr:create',
    'qr:edit',
    'qr:delete',
    'member:invite',
    'member:remove',
    'member:changeRole',
    'org:settings',
  ],
  admin: [
    'qr:create',
    'qr:edit',
    'qr:delete',
    'member:invite',
    'member:remove',
    'member:changeRole',
  ],
  editor: ['qr:create', 'qr:edit'],
  viewer: [],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// ---------------------------------------------------------------------------
// Server-side helpers (call from Server Actions)
// ---------------------------------------------------------------------------

/**
 * Resolve the calling user's role in an org.
 * Returns null if the user is not a member.
 */
export async function getOrgRole(
  userId: string,
  orgId: string
): Promise<Role | null> {
  const member = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
    select: { role: true },
  });
  return member?.role ?? null;
}

/**
 * Assert a permission in a Server Action.
 * Throws a descriptive error if the user lacks the permission.
 */
export async function requireOrgPermission(
  userId: string,
  orgId: string,
  permission: Permission
): Promise<Role> {
  const role = await getOrgRole(userId, orgId);
  if (!role) throw new Error('You are not a member of this organization.');
  if (!can(role, permission))
    throw new Error(
      `Forbidden: your role (${role}) cannot perform "${permission}".`
    );
  return role;
}

/**
 * Check whether a user is a super admin.
 */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });
  return profile?.isSuperAdmin ?? false;
}

/**
 * Assert super admin access. Throws if not.
 */
export async function requireSuperAdmin(userId: string): Promise<void> {
  const ok = await checkIsSuperAdmin(userId);
  if (!ok) throw new Error('Forbidden: super admin access required.');
}

// ---------------------------------------------------------------------------
// Helpers for UI — role ordering (used when capping role changes)
// ---------------------------------------------------------------------------

const ROLE_RANK: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

/** Returns true if actorRole can assign targetRole (cannot assign equal or higher than self) */
export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === 'owner') return true; // owner can assign anything
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}
