import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Expected body (posted by client checkout handler):
 * {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string
 * }
 *
 * Verifies HMAC signature and updates local DB records.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing fields' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json(
        { ok: false, error: 'Signature mismatch' },
        { status: 400 }
      );
    }

    // Find the local order
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Upsert payment entry
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        method: 'razorpay',
      },
    });

    // Mark order paid
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('verify error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
