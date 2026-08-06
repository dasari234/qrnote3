// Updated create-order to support couponCode and trial handling
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    let lineItems: Array<{ planId: string; qty: number }> = [];
    const couponCode: string | undefined = body.couponCode;

    if (body.planId) {
      lineItems.push({ planId: body.planId, qty: 1 });
    } else if (Array.isArray(body.items)) {
      lineItems = body.items.map((i: any) => ({ planId: i.planId, qty: i.qty ?? 1 }));
    } else {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const planIds = lineItems.map((li) => li.planId);
    const plans = await prisma.plan.findMany({ where: { id: { in: planIds } } });
    if (plans.length === 0) return NextResponse.json({ error: 'No plans found' }, { status: 400 });

    // Build amount
    const rawAmount = lineItems.reduce((sum, li) => {
      const plan = plans.find((p) => p.id === li.planId);
      return sum + (plan ? plan.price * li.qty : 0);
    }, 0);

    let discount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode) {
      const now = new Date();
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 400 });
      if (!coupon.active) return NextResponse.json({ error: 'Coupon inactive' }, { status: 400 });
      if (coupon.validFrom && coupon.validFrom > now) return NextResponse.json({ error: 'Coupon not yet valid' }, { status: 400 });
      if (coupon.validUntil && coupon.validUntil < now) return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ error: 'Coupon usage exhausted' }, { status: 400 });

      if (coupon.type === 'percentage') discount = Math.floor((rawAmount * coupon.amount) / 100);
      else if (coupon.type === 'fixed') discount = coupon.amount;

      appliedCouponId = coupon.id;
    }

    const amount = Math.max(0, rawAmount - discount);

    const receipt = `rcpt_${Date.now()}`;
    const dbOrder = await prisma.order.create({
      data: {
        planId: lineItems[0].planId ?? null,
        amount,
        currency: 'INR',
        receipt,
        status: 'open',
        userId: user?.id ?? null,
        couponId: appliedCouponId,
        discount,
      }
    });

    // increment coupon useCount if applied
    if (appliedCouponId) {
      await prisma.coupon.update({ where: { id: appliedCouponId }, data: { usedCount: { increment: 1 } } });
    }

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({ amount, currency: 'INR', receipt: `order_${dbOrder.id}`, payment_capture: 1 });

    await prisma.order.update({ where: { id: dbOrder.id }, data: { razorpayOrderId: rzpOrder.id } });

    return NextResponse.json({ ok: true, order: { id: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency }, localOrderId: dbOrder.id });
  } catch (err: any) {
    console.error('create-order error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
