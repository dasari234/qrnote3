"use client";

import React from "react";
import { useCart } from "@/components/providers/cart/CartProvider";

export default function PlanCard({ plan }: { plan: any }) {
  const { add } = useCart();

  function addToCart() {
    add({
      id: plan.id,
      name: plan.name,
      price: plan.price, // expecting price in paise
      qty: 1,
    });
  }

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{plan.name}</h3>
      <p className="text-sm text-muted-foreground">{plan.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-lg font-bold">₹{(plan.price / 100).toFixed(2)}</div>
        <button onClick={addToCart} className="btn btn-primary">
          Add to cart
        </button>
      </div>
    </div>
  );
}
