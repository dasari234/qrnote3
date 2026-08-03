import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST body:
 * { planId: string }      // buy a single plan
 * OR
 * { items: [{ planId: string, qty?: number }] }
 *
 * Returns razorpay order object and local order id.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    let lineItems: Array<{ planId: string; qty: number }> = [];

    if (body.planId) {
      lineItems.push({ planId: body.planId, qty: 1 });
    } else if (Array.isArray(body.items)) {
      lineItems = body.items.map((i: any) => ({ planId: i.planId, qty: i.qty ?? 1 }));
    } else {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Resolve plans and calculate amount (paise)
    const planIds = lineItems.map((li) => li.planId);
    const plans = await prisma.plan.findMany({
      where: { id: { in: planIds } },
    });

    if (plans.length === 0) {
      return NextResponse.json({ error: "No plans found" }, { status: 400 });
    }

    // Build amount
    const amount = lineItems.reduce((sum, li) => {
      const plan = plans.find((p) => p.id === li.planId);
      return sum + (plan ? plan.price * li.qty : 0);
    }, 0);

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create local order, attach userId if available
    const receipt = `rcpt_${Date.now()}`;
    const dbOrder = await prisma.order.create({
      data: {
        planId: lineItems[0].planId ?? null,
        amount,
        currency: "INR",
        receipt,
        status: "open",
        userId: user?.id ?? null,
      },
    });

    // Create Razorpay order (amount must be in paise)
    const rzpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${dbOrder.id}`,
      payment_capture: 1,
    });

    // Save razorpay order id to DB
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
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
