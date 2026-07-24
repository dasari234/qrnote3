'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toggleSuperAdmin } from '@/lib/admin/actions';
import { Building2, Search, ShieldAlert } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
  orgCount: number;
  createdAt: string;
}

interface Props {
  currentUserId: string;
  users: UserRow[];
}

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

export function AdminUsersClient({ currentUserId, users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function handleToggleSuperAdmin(userId: string, currentValue: boolean) {
    const newValue = !currentValue;
    startTransition(async () => {
      try {
        await toggleSuperAdmin(userId, newValue);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isSuperAdmin: newValue } : u
          )
        );
        toast.success(
          newValue ? 'Super admin access granted.' : 'Super admin access revoked.'
        );
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to update super admin status.');
      }
    });
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} user{users.length !== 1 ? 's' : ''} on the platform. Toggle super admin access here.
          </p>
        </div>

        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="userSearch"
                placeholder="Search by name or email…"
                className="pl-9 bg-background text-foreground border-input placeholder:text-muted-foreground/60 focus-visible:ring-ring"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No users found.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((u) => {
                  const isCurrentUser = u.id === currentUserId;
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                      <Avatar className="h-9 w-9 shrink-0 border border-border">
                        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                          {getInitials(u.fullName, u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {u.fullName ?? u.email}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground font-normal">(you)</span>
                          )}
                        </div>
                        {u.fullName && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {u.email}
                          </p>
                        )}
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground cursor-help bg-muted/40 dark:bg-muted/30 px-2 py-1 rounded-md border border-border/30">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span className="font-mono font-medium">{u.orgCount}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover text-popover-foreground border-border shadow-md">
                          <p>{u.orgCount} organization{u.orgCount !== 1 ? 's' : ''}</p>
                        </TooltipContent>
                      </Tooltip>

                      {u.isSuperAdmin ? (
                        <Badge variant="destructive" className="shrink-0 gap-1 text-xs font-semibold">
                          <ShieldAlert className="h-3 w-3" />
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 text-xs border-border text-muted-foreground bg-muted/20 dark:bg-muted/5">
                          User
                        </Badge>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Switch
                              checked={u.isSuperAdmin}
                              onCheckedChange={() =>
                                handleToggleSuperAdmin(u.id, u.isSuperAdmin)
                              }
                              disabled={isPending || isCurrentUser}
                              aria-label={`Toggle super admin for ${u.email}`}
                              className="data-[state=checked]:bg-destructive dark:data-[state=checked]:bg-destructive/80"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover text-popover-foreground border-border shadow-md max-w-xs text-center">
                          {isCurrentUser
                            ? 'You cannot change your own super admin status.'
                            : u.isSuperAdmin
                              ? 'Revoke super admin access'
                              : 'Grant super admin access'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );

}
