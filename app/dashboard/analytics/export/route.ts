import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get('range') || '30d') as '7d' | '30d' | '90d' | 'all';

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

  const days = range === 'all' ? null : parseInt(range);
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const scans = await prisma.scanEvent.findMany({
    where: scanWhere,
    select: {
      scannedAt: true,
      country: true,
      region: true,
      city: true,
      browser: true,
      os: true,
      device: true,
      language: true,
      referrer: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      qr: { select: { name: true } },
    },
    orderBy: { scannedAt: 'desc' },
  });

  const headers = [
    'scanned_at',
    'qr_name',
    'country',
    'region',
    'city',
    'browser',
    'os',
    'device',
    'language',
    'referrer',
    'utm_source',
    'utm_medium',
    'utm_campaign',
  ];

  const rows = scans.map((s) => [
    s.scannedAt.toISOString(),
    escapeCsv(s.qr.name),
    s.country || '',
    s.region || '',
    s.city || '',
    s.browser || '',
    s.os || '',
    s.device || '',
    s.language || '',
    s.referrer || '',
    s.utmSource || '',
    s.utmMedium || '',
    s.utmCampaign || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="scan-events-export.csv"',
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
