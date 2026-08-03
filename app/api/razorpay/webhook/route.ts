import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Razorpay webhook handler.
 * Configure the webhook URL in Razorpay dashboard and set RAZORPAY_WEBHOOK_SECRET.
 *
 * Razorpay sends signature in 'x-razorpay-signature' header.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const payload = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (!signature || signature !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(payload);
    const { event: eventType, payload: eventPayload } = event;

    // Handle payment.captured, payment.failed, order.paid etc.
    if (eventType === "payment.captured") {
      const payment = eventPayload?.payment?.entity;
      if (payment && payment.order_id) {
        const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
        if (order) {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              razorpayPaymentId: payment.id,
              razorpaySignature: signature,
              status: payment.status || "captured",
              method: payment.method,
            },
          });
          await prisma.order.update({ where: { id: order.id }, data: { status: "paid" } });
        }
      }
    } else if (eventType === "payment.failed") {
      const payment = eventPayload?.payment?.entity;
      if (payment && payment.order_id) {
        const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
        if (order) {
          await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } });
        }
      }
    }

    // Acknowledge
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}
