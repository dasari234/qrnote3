'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { can, canAssignRole, type Role } from '@/lib/rbac-client';
import {
    changeMemberRole,
    inviteMember,
    removeMember,
    revokeInvite,
} from '@/lib/team/actions';
import { cn } from '@/lib/utils';
import {
    Check,
    Clock,
    Copy,
    Mail,
    MoreHorizontal,
    Shield,
    Trash2,
    UserPlus,
    Users
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Member {
  id: string;
  userId: string;
  role: Role;
  createdAt: string;
  email: string;
  fullName: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
}

interface Props {
  orgId: string;
  orgName: string;
  currentUserId: string;
  currentUserRole: Role;
  isSuperAdmin: boolean;
  members: Member[];
  pendingInvites: PendingInvite[];
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
// Main component
// ---------------------------------------------------------------------------

export function TeamPageClient({
  orgId,
  orgName,
  currentUserId,
  currentUserRole,
  isSuperAdmin,
  members: initialMembers,
  pendingInvites: initialInvites,
}: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canInvite =
    isSuperAdmin || can(currentUserRole, 'member:invite');
  const canRemove =
    isSuperAdmin || can(currentUserRole, 'member:remove');
  const canChangeRole =
    isSuperAdmin || can(currentUserRole, 'member:changeRole');

  // ---------------------------------------------------------------------------
  // Invite
  // ---------------------------------------------------------------------------

  function handleInvite() {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    startTransition(async () => {
      try {
        const result = await inviteMember({
          orgId,
          email: inviteEmail.trim(),
          role: inviteRole,
        });
        setInviteLink(result.inviteUrl);
        toast.success('Invite sent! An email was delivered to the recipient.');
        // Optimistically add to pending list
        setInvites((prev) => [
          {
            id: result.inviteId,
            email: inviteEmail.trim(),
            role: inviteRole,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to send invite.');
      }
    });
  }

  function handleCopyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCloseInviteDialog() {
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('editor');
    setInviteLink(null);
    setCopied(false);
  }

  // ---------------------------------------------------------------------------
  // Change role
  // ---------------------------------------------------------------------------

  function handleChangeRole(targetUserId: string, newRole: Role) {
    startTransition(async () => {
      try {
        await changeMemberRole({ orgId, targetUserId, newRole });
        setMembers((prev) =>
          prev.map((m) => (m.userId === targetUserId ? { ...m, role: newRole } : m))
        );
        toast.success('Role updated.');
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to update role.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Remove member
  // ---------------------------------------------------------------------------

  function handleRemoveMember(targetUserId: string, email: string) {
    startTransition(async () => {
      try {
        await removeMember({ orgId, targetUserId });
        setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
        toast.success(`${email} has been removed.`);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to remove member.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Revoke invite
  // ---------------------------------------------------------------------------

  function handleRevokeInvite(inviteId: string, email: string) {
    startTransition(async () => {
      try {
        await revokeInvite({ orgId, inviteId });
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        toast.success(`Invite for ${email} revoked.`);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to revoke invite.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const assignableRoles: Role[] = (['admin', 'editor', 'viewer'] as Role[]).filter(
    (r) => isSuperAdmin || canAssignRole(currentUserRole, r)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage members and invitations for{' '}
            <span className="font-medium text-foreground">{orgName}</span>.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setShowInviteDialog(true)} className="shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Members
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {members.length} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No members found.
            </p>
          ) : (
            <div className="divide-y">
              {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const isOwner = member.role === 'owner';
                const showActions =
                  !isCurrentUser &&
                  !isOwner &&
                  (canChangeRole || canRemove);

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-6 py-4"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(member.fullName, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.fullName ?? member.email}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
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
                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            disabled={isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Member actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {canChangeRole && (
                            <>
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Change role
                              </DropdownMenuLabel>
                              {assignableRoles
                                .filter((r) => r !== member.role)
                                .map((r) => (
                                  <DropdownMenuItem
                                    key={r}
                                    onClick={() =>
                                      handleChangeRole(member.userId, r)
                                    }
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Set as {ROLE_LABELS[r]}
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canRemove && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleRemoveMember(member.userId, member.email)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Pending Invitations
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {invites.length}
              </span>
            </CardTitle>
            <CardDescription>
              Invitations expire 7 days after being sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires{' '}
                      {new Date(invite.expiresAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-xs font-medium capitalize',
                      ROLE_COLORS[invite.role]
                    )}
                  >
                    {ROLE_LABELS[invite.role]}
                  </Badge>
                  {canInvite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      onClick={() =>
                        handleRevokeInvite(invite.id, invite.email)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revoke invite</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog open={showInviteDialog} onOpenChange={handleCloseInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              Send an email invite to add someone to{' '}
              <span className="font-medium">{orgName}</span>.
            </DialogDescription>
          </DialogHeader>

          {!inviteLink ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      handleInvite();
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as Role)}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className="font-medium capitalize">{ROLE_LABELS[r]}</span>
                        {r === 'admin' && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            — manage members, all QR ops
                          </span>
                        )}
                        {r === 'editor' && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            — create &amp; edit QR codes
                          </span>
                        )}
                        {r === 'viewer' && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            — read-only access
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                An email has been sent to{' '}
                <span className="font-medium text-foreground">{inviteEmail}</span>. You
                can also copy the link below to share manually.
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                <span className="flex-1 truncate text-xs font-mono text-muted-foreground">
                  {inviteLink}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            {!inviteLink ? (
              <>
                <Button variant="outline" onClick={handleCloseInviteDialog}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={isPending}>
                  {isPending ? 'Sending…' : 'Send Invite'}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseInviteDialog}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
