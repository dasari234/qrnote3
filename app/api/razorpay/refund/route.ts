import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { requireSuperAdmin } from "@/lib/rbac";

/**
 * Refund a captured payment. Admin-only endpoint.
 * POST body: { paymentId: string, amount?: number, reason?: string }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // require super admin
    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { paymentId, amount, reason } = body;
    if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });

    // Issue refund via Razorpay
    const refund = await razorpay.payments.refund(paymentId, { amount });

    // Persist refund record (if payment maps to our Payment model)
    const payment = await prisma.payment.findUnique({ where: { razorpayPaymentId: paymentId } });
    const dbRefund = await prisma.refund.create({
      data: {
        paymentId: payment ? payment.id : "",
        razorpayRefundId: refund.id,
        amount: refund.amount || amount || 0,
        reason: reason || null,
        status: refund.status || "created",
      },
    });

    // Update payment/order status if needed
    if (payment && dbRefund.status === "processed") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "refunded" } });
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: "refunded" } });
    }

    return NextResponse.json({ ok: true, refund });
  } catch (err: any) {
    console.error("refund error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
