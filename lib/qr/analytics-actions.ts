'use server';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type DateRange = '7d' | '30d' | '90d' | 'all';

const RANGE_DAYS: Record<DateRange, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

export async function getWorkspaceIdsForUser(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const workspaces = await prisma.workspace.findMany({
    where: { orgId: { in: orgIds } },
    select: { id: true },
  });
  return workspaces.map((w) => w.id);
}

function getStartDate(range: DateRange): Date | null {
  const days = RANGE_DAYS[range];
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function getAnalyticsOverview(range: DateRange) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return null;

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const [totalScans, qrCount, activeQrCount, recentScans] = await Promise.all([
    prisma.scanEvent.count({ where: scanWhere }),
    prisma.qrCode.count({ where: { workspaceId: { in: wsIds } } }),
    prisma.qrCode.count({ where: { workspaceId: { in: wsIds }, status: 'active' } }),
    prisma.scanEvent.findMany({
      where: scanWhere,
      select: { device: true, browser: true, country: true, os: true },
    }),
  ]);

  const deviceCounts = aggregate(recentScans.map((s) => s.device || 'Unknown'));
  const browserCounts = aggregate(recentScans.map((s) => s.browser || 'Unknown'));
  const osCounts = aggregate(recentScans.map((s) => s.os || 'Unknown'));

  return {
    totalScans,
    qrCount,
    activeQrCount,
    topDevice: deviceCounts[0]?.[0] || '—',
    topBrowser: browserCounts[0]?.[0] || '—',
    topOs: osCounts[0]?.[0] || '—',
    deviceBreakdown: deviceCounts.map(([name, count]) => ({ name, count })),
    browserBreakdown: browserCounts.map(([name, count]) => ({ name, count })),
    osBreakdown: osCounts.map(([name, count]) => ({ name, count })),
  };
}

export async function getDailyScans(range: DateRange) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return [];

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const scans = await prisma.scanEvent.findMany({
    where: scanWhere,
    select: { scannedAt: true },
    orderBy: { scannedAt: 'asc' },
  });

  const byDay = new Map<string, number>();
  for (const s of scans) {
    const day = s.scannedAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }

  // Fill in missing days
  if (startDate) {
    const days = RANGE_DAYS[range]!;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, 0);
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function getTopQrCodes(range: DateRange, limit = 10) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return [];

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const scans = await prisma.scanEvent.findMany({
    where: scanWhere,
    select: { qrId: true },
  });

  const counts = new Map<string, number>();
  for (const s of scans) {
    counts.set(s.qrId, (counts.get(s.qrId) || 0) + 1);
  }

  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const qrCodes = await prisma.qrCode.findMany({
    where: { id: { in: topIds.map(([id]) => id) } },
    select: { id: true, name: true, type: true, scanCount: true },
  });

  return topIds
    .map(([id, count]) => {
      const qr = qrCodes.find((q) => q.id === id);
      return qr ? { id, name: qr.name, type: qr.type, scans: count } : null;
    })
    .filter(Boolean);
}

export async function getGeoInsights(range: DateRange, limit = 10) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return { countries: [], cities: [], regions: [] };

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const scans = await prisma.scanEvent.findMany({
    where: scanWhere,
    select: { country: true, city: true, region: true },
  });

  const countries = aggregate(scans.map((s) => s.country || 'Unknown'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
  const cities = aggregate(scans.map((s) => s.city || 'Unknown').filter((c) => c !== 'Unknown'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
  const regions = aggregate(scans.map((s) => s.region || 'Unknown'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));

  return { countries, cities, regions };
}

export async function getUtmInsights(range: DateRange) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return { sources: [], mediums: [], campaigns: [] };

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const scans = await prisma.scanEvent.findMany({
    where: scanWhere,
    select: { utmSource: true, utmMedium: true, utmCampaign: true },
  });

  return {
    sources: aggregate(scans.map((s) => s.utmSource || 'Direct'))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    mediums: aggregate(scans.map((s) => s.utmMedium || 'None'))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
    campaigns: aggregate(scans.map((s) => s.utmCampaign || 'None'))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
  };
}

export async function getRecentScans(range: DateRange, limit = 20) {
  const wsIds = await getWorkspaceIdsForUser();
  if (wsIds.length === 0) return [];

  const startDate = getStartDate(range);
  const scanWhere: any = { qr: { workspaceId: { in: wsIds } } };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  return prisma.scanEvent.findMany({
    where: scanWhere,
    select: {
      id: true,
      scannedAt: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      os: true,
      language: true,
      referrer: true,
      qr: { select: { name: true } },
    },
    orderBy: { scannedAt: 'desc' },
    take: limit,
  });
}

export async function getPerQrAnalytics(qrId: string, range: DateRange) {
  const startDate = getStartDate(range);
  const scanWhere: any = { qrId };
  if (startDate) scanWhere.scannedAt = { gte: startDate };

  const [scans, dailyScans, deviceBreakdown, geoData] = await Promise.all([
    prisma.scanEvent.count({ where: scanWhere }),
    prisma.scanEvent.findMany({
      where: scanWhere,
      select: { scannedAt: true },
      orderBy: { scannedAt: 'asc' },
    }),
    prisma.scanEvent.findMany({
      where: scanWhere,
      select: { device: true, browser: true, os: true, country: true, city: true },
    }),
    prisma.scanEvent.findMany({
      where: scanWhere,
      select: { country: true, city: true },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (const s of dailyScans) {
    const day = s.scannedAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }
  if (startDate) {
    const days = RANGE_DAYS[range]!;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, 0);
    }
  }
  const daily = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    totalScans: scans,
    dailyScans: daily,
    deviceBreakdown: aggregate(deviceBreakdown.map((s) => s.device || 'Unknown')).map(([name, count]) => ({ name, count })),
    browserBreakdown: aggregate(deviceBreakdown.map((s) => s.browser || 'Unknown')).map(([name, count]) => ({ name, count })),
    countries: aggregate(geoData.map((s) => s.country || 'Unknown')).slice(0, 10).map(([name, count]) => ({ name, count })),
    cities: aggregate(geoData.map((s) => s.city || 'Unknown').filter((c) => c !== 'Unknown')).slice(0, 10).map(([name, count]) => ({ name, count })),
  };
}

function aggregate(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}
