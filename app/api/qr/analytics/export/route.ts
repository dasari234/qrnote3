import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { startDate, endDate } = await req.json();
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const scans = await prisma.scanEvent.findMany({
      where: { scannedAt: { gte: start, lte: end } },
      include: { },
      orderBy: { scannedAt: 'desc' },
    });

    // Build CSV
    const header = ['id', 'qr_id', 'scanned_at', 'country', 'region', 'city', 'browser', 'os', 'device', 'language', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign'];
    const rows = scans.map(s => [
      s.id,
      s.qrId,
      s.scannedAt.toISOString(),
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
      s.utmCampaign || ''
    ]);

    const csv = [header, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

    return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="scan-export.csv"' } });
  } catch (err: any) {
    console.error('export error', err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
