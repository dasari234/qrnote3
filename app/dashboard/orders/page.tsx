import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Please sign in to view your orders.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { plan: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/dashboard/billing" className="btn btn-outline">
          Browse Plans
        </Link>
      </div>

      {orders.length === 0 && (
        <div className="text-sm text-muted-foreground">You have no orders yet.</div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Order {order.id}</div>
                <div className="text-sm text-muted-foreground">
                  {order.plan ? order.plan.name : "Custom"} • {order.currency} {(order.amount / 100).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium capitalize">{order.status}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(order.createdAt), "PPP p")}
                </div>
              </div>
            </div>

            {order.payments && order.payments.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium">Payments</div>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {order.payments.map((p) => (
                    <li key={p.id}>
                      {p.razorpayPaymentId} — {p.status} — {format(new Date(p.createdAt), "PPP p")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
