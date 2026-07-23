'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { type Role } from '@/lib/rbac-client';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Users,
  FolderOpen,
  MoreHorizontal,
  Shield,
  Trash2,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { adminChangeMemberRole, adminRemoveMember } from '@/lib/admin/actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

interface MemberRow {
  id: string;
  userId: string;
  role: Role;
  createdAt: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
}

interface WorkspaceRow {
  id: string;
  name: string;
  qrCount: number;
  createdAt: string;
}

interface Props {
  org: OrgInfo;
  members: MemberRow[];
  workspaces: WorkspaceRow[];
  qrCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  editor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const ALL_ROLES: Role[] = ['owner', 'admin', 'editor', 'viewer'];

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    return fullName
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminOrgDetailClient({ org, members: initialMembers, workspaces, qrCount }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();

  function handleChangeRole(targetUserId: string, newRole: Role) {
    startTransition(async () => {
      try {
        await adminChangeMemberRole(org.id, targetUserId, newRole);
        setMembers((prev) =>
          prev.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m))
        );
        toast.success('Role updated.');
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to update role.');
      }
    });
  }

  function handleRemoveMember(targetUserId: string, email: string) {
    startTransition(async () => {
      try {
        await adminRemoveMember(org.id, targetUserId);
        setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
        toast.success(`${email} removed from organization.`);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to remove member.');
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/admin/orgs"
          className="hover:text-foreground transition-colors"
        >
          Organizations
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{org.name}</span>
      </div>

      {/* Org header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
          {org.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
          <p className="text-sm text-muted-foreground">
            /{org.slug} &nbsp;·&nbsp; Created{' '}
            {new Date(org.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Members', value: members.length, icon: Users },
          { label: 'Workspaces', value: workspaces.length, icon: FolderOpen },
          { label: 'QR Codes', value: qrCount, icon: QrCode },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 pt-5 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Members
          </CardTitle>
          <CardDescription>
            As a super admin you can change roles and remove members from any organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {members.map((member) => {
              const isOwner = member.role === 'owner';
              return (
                <div key={member.id} className="flex items-center gap-3 px-6 py-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(member.fullName, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {member.fullName ?? member.email}
                      </p>
                      {member.isSuperAdmin && (
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      )}
                    </div>
                    {member.fullName && (
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-xs font-medium capitalize',
                      ROLE_COLORS[member.role]
                    )}
                  >
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Change role
                      </DropdownMenuLabel>
                      {ALL_ROLES.filter((r) => r !== member.role).map((r) => (
                        <DropdownMenuItem
                          key={r}
                          onClick={() => handleChangeRole(member.userId, r)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Set as {ROLE_LABELS[r]}
                        </DropdownMenuItem>
                      ))}
                      {!isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleRemoveMember(member.userId, member.email)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from org
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workspaces table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4" />
            Workspaces
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {workspaces.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No workspaces in this organization.
            </p>
          ) : (
            <div className="divide-y">
              {workspaces.map((ws) => (
                <div key={ws.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{ws.name}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ws.qrCount} QR code{ws.qrCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
