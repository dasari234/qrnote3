import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = Number(url.searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const revenue = await prisma.order.aggregate({
      where: { status: 'paid', createdAt: { gte: since } },
      _sum: { amount: true },
    });

    const ordersCount = await prisma.order.count({ where: { createdAt: { gte: since } } });
    const scansCount = await prisma.scanEvent.count({ where: { scannedAt: { gte: since } } });

    return NextResponse.json({ ok: true, revenue: revenue._sum.amount || 0, ordersCount, scansCount });
  } catch (err: any) {
    console.error('analytics summary error', err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
