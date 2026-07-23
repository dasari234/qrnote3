'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  memberCount: number;
  workspaceCount: number;
  createdAt: string;
}

interface Props {
  orgs: OrgRow[];
}

export function AdminOrgsClient({ orgs }: Props) {
  const [search, setSearch] = useState('');

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      o.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            {orgs.length} organization{orgs.length !== 1 ? 's' : ''} on the platform.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, slug, or owner email…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No organizations found.
            </p>
          ) : (
            <div className="divide-y">
              {filtered.map((org) => (
                <Link
                  key={org.id}
                  href={`/dashboard/admin/orgs/${org.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{org.name}</p>
                      <span className="text-xs text-muted-foreground">/{org.slug}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      Owner: {org.ownerName ? `${org.ownerName} (${org.ownerEmail})` : org.ownerEmail}
                    </p>
                  </div>
                  <div className="hidden shrink-0 gap-2 sm:flex">
                    <Badge variant="outline" className="text-xs">
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {org.workspaceCount} workspace{org.workspaceCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
