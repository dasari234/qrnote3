import { sendEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Razorpay webhook handler (extended):
 * - Verifies signature using RAZORPAY_WEBHOOK_SECRET
 * - Stores webhook event in webhook_events table
 * - Processes common events: payment.captured, subscription.charged, subscription.created, payment.failed
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const payload = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  if (!signature || signature !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(payload);
    const eventType = event.event;

    // Persist webhook event for visibility / retry
    const saved = await prisma.webhookEvent.create({
      data: { eventType, payload: event as any },
    });

    // Process select events
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (payment && payment.order_id) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId: payment.order_id },
        });
        if (order) {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              razorpayPaymentId: payment.id,
              razorpaySignature: signature,
              status: payment.status || 'captured',
              method: payment.method,
            },
          });
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid' },
          });

          // create invoice record
          const invoice = await prisma.invoice.create({
            data: {
              orderId: order.id,
              amount: payment.amount || order.amount,
              currency: order.currency,
              razorpayInvoiceId: null,
              sent: false,
            },
          });

          // send invoice email to user if email available
          if (order.userId) {
            const profile = await prisma.profile.findUnique({
              where: { id: order.userId },
            });
            if (profile?.email) {
              const html = `<p>Hi ${profile.fullName || ''},</p><p>Thank you for your payment of ₹${((invoice.amount || 0) / 100).toFixed(2)}. Your order id: ${order.id}.</p>`;
              try {
                await sendEmail({
                  to: profile.email,
                  subject: 'Your payment receipt',
                  html,
                });
                await prisma.invoice.update({
                  where: { id: invoice.id },
                  data: { sent: true },
                });
              } catch (e) {
                console.error('Failed to send invoice email', e);
              }
            }
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment && payment.order_id) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId: payment.order_id },
        });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'failed' },
          });
        }
      }
    } else if (eventType?.startsWith('subscription.')) {
      const sub = event.payload?.subscription?.entity;
      if (sub) {
        const dbSub = await prisma.subscription.findUnique({
          where: { razorpaySubscriptionId: sub.id },
        });
        if (dbSub) {
          await prisma.subscription.update({
            where: { id: dbSub.id },
            data: {
              status: sub.status as any,
              currentPeriodStart: new Date((sub.current_start || 0) * 1000),
              currentPeriodEnd: new Date((sub.current_end || 0) * 1000),
            },
          });
        }
      }
    }

    // mark webhook processed
    await prisma.webhookEvent.update({
      where: { id: saved.id },
      data: { processed: true, attempts: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('webhook error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
