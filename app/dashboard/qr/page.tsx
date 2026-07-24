import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Download, Plus, QrCode as QrCodeIcon, Search, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';

export default async function QrListPage({
  searchParams: searchParamsPromise
}: {
  searchParams: Promise<{ q?: string; tag?: string; folder?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const workspaces = await prisma.workspace.findMany({
    where: { orgId: { in: orgIds } },
    select: { id: true },
  });
  const wsIds = workspaces.map((w) => w.id);

  const where: any = { workspaceId: { in: wsIds } };
  if (searchParams.q) {
    where.name = { contains: searchParams.q, mode: 'insensitive' };
  }
  if (searchParams.folder) {
    where.folderId = searchParams.folder;
  }
  if (searchParams.tag) {
    where.tags = { some: { id: searchParams.tag } };
  }

  const [qrCodes, folders, tags] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        isDynamic: true,
        shortCode: true,
        status: true,
        scanCount: true,
        createdAt: true,
        tags: { select: { id: true, name: true, color: true } },
        folder: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    wsIds.length > 0
      ? prisma.folder.findMany({ where: { workspaceId: { in: wsIds } }, select: { id: true, name: true } })
      : [],
    wsIds.length > 0
      ? prisma.tag.findMany({ where: { workspaceId: { in: wsIds } }, select: { id: true, name: true, color: true } })
      : [],
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage, and download QR codes for anything.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/qr/export" className="hover:bg-accent hover:text-accent-foreground">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/qr/new">
              <Plus className="mr-2 h-4 w-4" />
              Create QR Code
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search QR codes…"
            defaultValue={searchParams.q}
            className="pl-9 bg-background text-foreground border-input focus-visible:ring-ring"
          />
        </form>
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <Link href="/dashboard/qr">
              <Badge variant={!searchParams.tag ? 'default' : 'secondary'} className="cursor-pointer transition-colors">
                All
              </Badge>
            </Link>
            {tags.map((tag) => (
              <Link key={tag.id} href={`/dashboard/qr?tag=${tag.id}${searchParams.q ? `&q=${searchParams.q}` : ''}`}>
                <Badge variant={searchParams.tag === tag.id ? 'default' : 'secondary'} className="cursor-pointer transition-colors">
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {qrCodes.length === 0 ? (
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted dark:bg-muted/50">
              <QrCodeIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground">No QR codes yet</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              {searchParams.q || searchParams.tag
                ? 'Try adjusting your filters.'
                : 'Create your first QR code to get started.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/qr/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qr) => (
            <Link key={qr.id} href={`/dashboard/qr/${qr.id}`}>
              <Card className="h-full bg-card text-card-foreground border-border transition-all hover:shadow-md hover:border-primary/40 dark:hover:bg-muted/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <QrCodeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">{qr.name}</h3>
                      <Badge
                        variant={qr.status === 'active' ? 'default' : 'secondary'}
                        className={`flex-shrink-0 transition-colors ${qr.status === 'active'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground dark:bg-muted/60'
                          }`}
                      >
                        {qr.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="capitalize">{qr.type}</span>
                      <span>·</span>
                      <span>{qr.isDynamic ? 'Dynamic' : 'Static'}</span>
                      <span>·</span>
                      <span>{qr.scanCount} scans</span>
                    </div>
                    {qr.folder && (
                      <p className="mt-1 text-xs text-muted-foreground">📁 {qr.folder.name}</p>
                    )}
                    {qr.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {qr.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              border: `1px solid ${tag.color}30`
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {qr.shortCode && (
                      <p className="mt-2 truncate text-xs text-muted-foreground font-mono bg-muted/40 dark:bg-muted/20 px-1.5 py-0.5 rounded w-fit">
                        /q/{qr.shortCode}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
