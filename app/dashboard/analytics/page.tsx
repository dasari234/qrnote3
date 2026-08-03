import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AnalyticsPage() {
  // Basic metrics for last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [revenue, ordersCount, scansCount, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'paid', createdAt: { gte: since } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.scanEvent.count({ where: { scannedAt: { gte: since } } }),
    prisma.order.findMany({ where: { status: 'paid' }, orderBy: { createdAt: 'desc' }, take: 10, include: { user: true, payments: true } }),
  ]);

  const revenueAmount = (revenue._sum.amount || 0) / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/orders" className="btn btn-outline">Orders</Link>
          <Link href="/dashboard/billing" className="btn btn-outline">Plans</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="text-sm text-muted-foreground">Revenue (30d)</div>
          <div className="text-2xl font-bold">₹{revenueAmount.toFixed(2)}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-muted-foreground">Orders (30d)</div>
          <div className="text-2xl font-bold">{ordersCount}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-muted-foreground">Scans (30d)</div>
          <div className="text-2xl font-bold">{scansCount}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Recent Paid Orders</h2>
        <div className="mt-3 space-y-2">
          {recentOrders.map((o) => (
            <div key={o.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">Order {o.id}</div>
                <div className="text-sm text-muted-foreground">{o.user?.email || '—'} • ₹{(o.amount/100).toFixed(2)}</div>
              </div>
              <div className="text-sm text-muted-foreground">{format(new Date(o.createdAt), 'PPP p')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Link href="/api/qr/analytics/export" className="btn">Export scans (CSV)</Link>
        <Link href="/api/reports/generate" className="btn btn-outline">Generate monthly report</Link>
      </div>
    </div>
  );
}
