import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    let lineItems: Array<{ planId: string; qty: number }> = [];
    const couponCode: string | undefined = body.couponCode;
    // 1. Capture the custom calculated total from the frontend
    const customTotal: number | undefined = body.customTotal;

    if (body.planId) {
      lineItems.push({ planId: body.planId, qty: 1 });
    } else if (Array.isArray(body.items)) {
      lineItems = body.items.map((i: any) => ({
        planId: i.planId,
        qty: i.qty ?? 1,
      }));
    } else {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const planIds = lineItems.map((li) => li.planId);
    const plans = await prisma.plan.findMany({
      where: { id: { in: planIds } },
    });
    if (plans.length === 0)
      return NextResponse.json({ error: 'No plans found' }, { status: 400 });

    // Build amount
    const rawAmount = lineItems.reduce((sum, li) => {
      const plan = plans.find((p) => p.id === li.planId);
      return sum + (plan ? plan.price * li.qty : 0);
    }, 0);

    let discount = 0;
    let appliedCouponId: string | null = null;

    if (couponCode) {
      const now = new Date();
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (!coupon)
        return NextResponse.json(
          { error: 'Coupon not found' },
          { status: 400 }
        );
      if (!coupon.active)
        return NextResponse.json({ error: 'Coupon inactive' }, { status: 400 });
      if (coupon.validFrom && coupon.validFrom > now)
        return NextResponse.json(
          { error: 'Coupon not yet valid' },
          { status: 400 }
        );
      if (coupon.validUntil && coupon.validUntil < now)
        return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
        return NextResponse.json(
          { error: 'Coupon usage exhausted' },
          { status: 400 }
        );

      if (coupon.type === 'percentage')
        discount = Math.floor((rawAmount * coupon.amount) / 100);
      else if (coupon.type === 'fixed') discount = coupon.amount;

      appliedCouponId = coupon.id;
    }

    // 2. Base pricing logic validation
    const standardAmountAfterDiscount = Math.max(0, rawAmount - discount);

    // 3. Fall back to standard logic if frontend customTotal parameter is absent
    let platformFee = 0;
    let feeGst = 0;
    let finalOrderAmount = standardAmountAfterDiscount;

    if (customTotal && customTotal > 0) {
      finalOrderAmount = customTotal;
      platformFee = Math.round(standardAmountAfterDiscount * 0.02);
      feeGst = Math.round(platformFee * 0.18);
    }

    const receipt = `rcpt_${Date.now()}`;
    const dbOrder = await prisma.order.create({
      data: {
        planId: lineItems[0]?.planId ?? null,
        amount: finalOrderAmount,
        currency: 'INR',
        receipt,
        status: 'open',
        userId: user?.id ?? null,
        // Optional: If your Prisma schema has fields for tracking fees, assign them here:
        // gatewayFee: platformFee,
        // gatewayGst: feeGst,
      },
    });

    // increment coupon useCount if applied
    if (appliedCouponId) {
      await prisma.coupon.update({
        where: { id: appliedCouponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 4. Create Razorpay order with type-safe true parameter mapping
    const rzpOrder = await razorpay.orders.create({
      amount: finalOrderAmount,
      currency: 'INR',
      receipt: `order_${dbOrder.id}`,
      payment_capture: true,
    });

    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
      localOrderId: dbOrder.id,
    });
  } catch (err: any) {
    console.error('create-order error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
