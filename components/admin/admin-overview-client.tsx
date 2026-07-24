'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, Building2, QrCode, Users } from 'lucide-react';
import Link from 'next/link';

interface Stat {
  totalOrgs: number;
  totalUsers: number;
  totalQrCodes: number;
  totalScans: number;
}

interface RecentOrg {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  workspaceCount: number;
  createdAt: string;
}

interface RecentUser {
  id: string;
  email: string;
  fullName: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
}

interface Props {
  stats: Stat;
  recentOrgs: RecentOrg[];
  recentUsers: RecentUser[];
}

const statCards = [
  { key: 'totalOrgs', label: 'Organizations', icon: Building2, href: '/dashboard/admin/orgs' },
  { key: 'totalUsers', label: 'Users', icon: Users, href: '/dashboard/admin/users' },
  { key: 'totalQrCodes', label: 'QR Codes', icon: QrCode, href: null },
  { key: 'totalScans', label: 'Total Scans', icon: BarChart3, href: null },
] as const;

export function AdminOverviewClient({ stats, recentOrgs, recentUsers }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide statistics across all organizations.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const value = stats[card.key];
          const content = (
            <Card className={`bg-card text-card-foreground border-border transition-all ${card.href
                ? 'hover:shadow-md hover:border-muted-foreground/30 cursor-pointer dark:hover:bg-muted/10'
                : ''
              }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
              </CardContent>
            </Card>
          );
          return card.href ? (
            <Link key={card.key} href={card.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={card.key}>{content}</div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent orgs */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <CardTitle className="text-base text-foreground">Recent Organizations</CardTitle>
            <Button variant="ghost" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground">
              <Link href="/dashboard/admin/orgs">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/dashboard/admin/orgs/${org.id}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted/40 dark:hover:bg-muted/10 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-xs font-bold text-primary">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''} ·{' '}
                      {org.workspaceCount} workspace{org.workspaceCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <CardTitle className="text-base text-foreground">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground">
              <Link href="/dashboard/admin/users">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/20 dark:hover:bg-muted/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted dark:bg-muted/60 border border-border text-xs font-bold text-muted-foreground dark:text-foreground">
                    {(u.fullName ?? u.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.fullName ?? u.email}
                    </p>
                    {u.fullName && (
                      <p className="truncate text-xs text-muted-foreground mt-0.5">{u.email}</p>
                    )}
                  </div>
                  {u.isSuperAdmin && (
                    <Badge variant="destructive" className="text-xs shrink-0">
                      Admin
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
