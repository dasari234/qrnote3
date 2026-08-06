import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';

export async function GET(req: Request) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return NextResponse.json({ ok: false, error: 'ADMIN_EMAIL not configured' }, { status: 500 });

    // Generate monthly summary (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const revenue = await prisma.order.aggregate({ where: { status: 'paid', createdAt: { gte: since } }, _sum: { amount: true } });
    const ordersCount = await prisma.order.count({ where: { createdAt: { gte: since } } });
    const scansCount = await prisma.scanEvent.count({ where: { scannedAt: { gte: since } } });

    const body = `Monthly report:\nRevenue: ₹${((revenue._sum.amount || 0)/100).toFixed(2)}\nOrders: ${ordersCount}\nScans: ${scansCount}`;

    try {
      await sendEmail({ to: adminEmail, subject: 'Monthly QRNote report', html: `<pre>${body}</pre>` });
    } catch (e) {
      console.error('send email failed', e);
    }

    return NextResponse.json({ ok: true, revenue: revenue._sum.amount || 0, ordersCount, scansCount });
  } catch (err: any) {
    console.error('report generate error', err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
