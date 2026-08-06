import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Create a Razorpay subscription for the given plan.
 * POST body: { planId: string }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { planId } = body;
    if (!planId) return NextResponse.json({ error: "planId required" }, { status: 400 });

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (!plan.razorpayPlanId) return NextResponse.json({ error: "Plan missing razorpayPlanId" }, { status: 400 });

    // Create or reuse a Razorpay customer for this user. For simplicity create a new customer and save id on subscription.
    const customer = await razorpay.customers.create({
      name: user.user_metadata?.full_name || user.email,
      email: user.email,
    });

    // Create subscription
    const rzpSub = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // optional, depends on plan billing cycles; adjust as needed
      customer_id: customer.id,
    });

    // Persist subscription
    const dbSub = await prisma.subscription.create({
      data: {
        planId: plan.id,
        userId: user.id,
        razorpaySubscriptionId: rzpSub.id,
        status: rzpSub.status as any,
      },
    });

    return NextResponse.json({ ok: true, subscription: { id: dbSub.id, razorpayId: rzpSub.id, status: rzpSub.status } });
  } catch (err: any) {
    console.error("create-subscription error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
