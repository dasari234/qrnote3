"use client";

import React, { useState } from "react";
import { useCart } from "@/components/providers/cart/CartProvider";
import { toast } from "sonner";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("window undefined");
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject("failed to load razorpay");
    document.body.appendChild(s);
  });
}

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ planId: i.id, qty: i.qty })),
        }),
      });

      const data = await resp.json();
      if (!data?.order) {
        toast.error(data?.error || "Failed to create order");
        setLoading(false);
        return;
      }

      await loadRazorpayScript();

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "QRNote",
        description: "Purchase",
        order_id: data.order.id,
        handler: async (response: any) => {
          // Verify on server
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vr = await v.json();
          if (vr.ok) {
            toast.success("Payment successful");
            clear();
            // navigate to orders page
            window.location.href = "/dashboard/orders";
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {},
        theme: { color: "#0ea5ff" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed");
      });
      rzp.open();
    } catch (err: any) {
      console.error("checkout error", err);
      toast.error("Checkout error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cart</h1>
      <div>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between border rounded p-2 mb-2">
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-muted-foreground">Qty: {it.qty}</div>
            </div>
            <div className="flex items-center gap-4">
              <div>₹{(it.price * it.qty / 100).toFixed(2)}</div>
              <button onClick={() => remove(it.id)} className="btn btn-ghost">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">Total: ₹{(total() / 100).toFixed(2)}</div>
        <div>
          <button onClick={clear} className="btn btn-outline mr-2">Clear</button>
          <button onClick={checkout} className="btn btn-primary" disabled={loading}>
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
