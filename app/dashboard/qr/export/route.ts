import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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

  const qrCodes = await prisma.qrCode.findMany({
    where: { workspaceId: { in: wsIds } },
    select: {
      name: true,
      type: true,
      isDynamic: true,
      shortCode: true,
      destinationUrl: true,
      status: true,
      scanCount: true,
      createdAt: true,
      tags: { select: { name: true } },
      folder: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'name',
    'type',
    'dynamic',
    'short_code',
    'destination_url',
    'status',
    'scan_count',
    'folder',
    'tags',
    'created_at',
  ];

  const rows = qrCodes.map((q) => [
    escapeCsv(q.name),
    q.type,
    q.isDynamic ? 'true' : 'false',
    q.shortCode || '',
    q.destinationUrl || '',
    q.status,
    String(q.scanCount),
    q.folder?.name || '',
    q.tags.map((t) => t.name).join(';'),
    q.createdAt.toISOString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="qr-codes-export.csv"',
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
