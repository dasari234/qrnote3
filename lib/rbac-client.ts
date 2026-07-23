/**
 * Client-safe RBAC helpers — no server/db imports.
 * Import these in Client Components ("use client") for UI-level permission checks.
 */

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

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

const ROLE_RANK: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === 'owner') return true;
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}
