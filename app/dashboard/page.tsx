import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Folder,
  MousePointerClick,
  Plus,
  QrCode,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
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

  let qrCodes: any[] = [];
  let totalScans = 0;
  let folderCount = 0;
  let activeCount = 0;

  if (wsIds.length > 0) {
    qrCodes = await prisma.qrCode.findMany({
      where: { workspaceId: { in: wsIds } },
      select: {
        id: true,
        name: true,
        type: true,
        isDynamic: true,
        scanCount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    totalScans = qrCodes.reduce((sum, q) => sum + (q.scanCount || 0), 0);
    activeCount = qrCodes.filter((q) => q.status === 'active').length;
    folderCount = await prisma.folder.count({ where: { workspaceId: { in: wsIds } } });
  }

  const stats = [
    { label: 'QR Codes', value: qrCodes.length, icon: QrCode, hint: 'In this workspace' },
    { label: 'Total Scans', value: totalScans, icon: MousePointerClick, hint: 'Across all QR codes' },
    { label: 'Folders', value: folderCount, icon: Folder, hint: 'Organize your codes' },
    { label: 'Active QRs', value: activeCount, icon: TrendingUp, hint: 'Currently live' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/qr/new">
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent QR Codes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/qr">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {qrCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <QrCode className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No QR codes yet</h3>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Create your first QR code to get started.
              </p>
              <Button asChild>
                <Link href="/dashboard/qr/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create QR Code
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {qrCodes.map((qr) => (
                <Link
                  key={qr.id}
                  href={`/dashboard/qr/${qr.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{qr.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {qr.type} · {qr.isDynamic ? 'Dynamic' : 'Static'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{qr.scanCount} scans</span>
                    <span
                      className={
                        qr.status === 'active'
                          ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium'
                      }
                    >
                      {qr.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
