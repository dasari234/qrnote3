import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, amount } = body; // amount in paise
    if (!code || typeof amount !== 'number') return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const now = new Date();
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) return NextResponse.json({ valid: false, reason: 'not found or inactive' });
    if (coupon.validFrom && coupon.validFrom > now) return NextResponse.json({ valid: false, reason: 'not yet valid' });
    if (coupon.validUntil && coupon.validUntil < now) return NextResponse.json({ valid: false, reason: 'expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ valid: false, reason: 'usage limit reached' });

    // calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.floor((amount * coupon.amount) / 100);
    } else if (coupon.type === 'fixed') {
      discount = coupon.amount;
    }
    const finalAmount = Math.max(0, amount - discount);

    return NextResponse.json({ valid: true, discount, finalAmount, couponId: coupon.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
