'use client';

import { useCart } from '@/components/providers/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);

  async function applyCoupon() {
    if (!coupon) return toast.error('Enter coupon code');
    try {
      const resp = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon, amount: total() }),
      });
      const data = await resp.json();
      if (data.valid) {
        setAppliedDiscount(data.discount);
        toast.success(`Coupon applied: -₹${(data.discount / 100).toFixed(2)}`);
      } else {
        toast.error(data.reason || 'Invalid coupon');
      }
    } catch (e) {
      console.error(e);
      toast.error('Coupon check failed');
    }
  }

  // Calculate totals (All internal math stays in paise)
  const subtotal = total();
  const discount = appliedDiscount || 0;
  const amountBeforeFees = subtotal - discount;

  // Razorpay Fee: 2% of the total after discount
  const razorpayPlatformFee = Math.round(amountBeforeFees * 0.02);

  // GST: 18% on top of the Razorpay Platform Fee
  const razorpayGst = Math.round(razorpayPlatformFee * 0.18);

  // Combined Payment Gateway handling surcharge
  const totalGatewayCharges = razorpayPlatformFee + razorpayGst;

  // Final amount that the customer will pay at checkout
  const finalPayableAmount = amountBeforeFees + totalGatewayCharges;

  async function checkout() {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // 1. DYNAMIC FALLBACK: If window.Razorpay doesn't exist yet, force load it immediately
    if (!(window as any).Razorpay) {
      setLoading(true);
      const loadToast = toast.loading(
        'Initializing secure gateway connections...'
      );

      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error('Razorpay CDN failed to respond.'));
          document.body.appendChild(script);
        });
        toast.dismiss(loadToast);
      } catch (err) {
        toast.dismiss(loadToast);
        setLoading(false);
        toast.error(
          'Network block detected. Please disable Ad-Blockers and try again.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ planId: i.id, qty: i.qty })),
          couponCode: coupon || undefined,
          customTotal: finalPayableAmount,
        }),
      });

      const data = await resp.json();
      if (!data?.order) {
        toast.error(data?.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'QRNote',
        description: 'Purchase',
        order_id: data.order.id,
        handler: async (response: any) => {
          const v = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const vr = await v.json();
          if (vr.ok) {
            toast.success('Payment successful');
            clear();
            window.location.href = '/dashboard/orders';
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {},
        theme: { color: '#0ea5ff' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed');
      });
      rzp.open();
    } catch (err: any) {
      console.error('checkout error', err);
      toast.error('Checkout error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-1">
            Browse our plans and add your favorites
          </p>
          <Button asChild className="mt-4">
            <a href="/dashboard/billing">Browse Plans</a>
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg">{it.name}</div>
                  <div className="text-sm text-gray-500">
                    Quantity: {it.qty}
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                  <div className="font-medium text-gray-800">
                    ₹{((it.price * it.qty) / 100).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(it.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon & Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coupon Section */}
            <div className="md:col-span-2">
              <div className="bg-white p-4 rounded-lg shadow">
                <label
                  htmlFor="coupon"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Apply Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <Button onClick={applyCoupon} variant="secondary">
                    Apply
                  </Button>
                </div>
                {appliedDiscount !== null && (
                  <p className="mt-2 text-green-600 text-sm">
                    ✅ Coupon applied! You saved ₹
                    {(appliedDiscount / 100).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow space-y-2 overflow-hidden">
                <h2 className="text-lg font-semibold border-b pb-2">
                  Order Summary
                </h2>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{(discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>₹0.00</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 border-t pt-2 mt-1">
                  <span>Gateway Fee (2%)</span>
                  <span>₹{(razorpayPlatformFee / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST on Gateway Fee (18%)</span>
                  <span>₹{(razorpayGst / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Payable</span>
                  <span>₹{(finalPayableAmount / 100).toFixed(2)}</span>
                </div>

                {/* Button container */}
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="outline" onClick={clear} className="w-full">
                    Clear Cart
                  </Button>
                  <Button
                    onClick={checkout}
                    disabled={loading}
                    className="w-full whitespace-normal flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        {/* Your functional animated SVG loading spinner layout component */}
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        <span>Processing…</span>
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
