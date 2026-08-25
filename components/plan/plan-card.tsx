'use client';

import { useCart } from '@/components/providers/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { toast } from 'sonner'; // Import your toast engine

export default function PlanCard({ plan }: { plan: any }) {
  const { add } = useCart();

  function addToCart() {
    // Prevent adding the Free plan to a shopping cart
    if (plan.name === 'Free') {
      toast.info('You are already on the Free tier!');
      return;
    }

    add({
      id: plan.id,
      name: plan.name,
      price: plan.price, // price in paise
      qty: 1,
    });

    // Success feedback so the user knows it worked
    toast.success(`${plan.name} plan added to your cart!`);
  }

  return (
    <Card
      // Added w-full h-full to auto-center and vertically stretch all cards evenly
      className={`relative flex flex-col justify-between w-full h-full bg-card text-card-foreground border-border transition-all hover:shadow-md ${
        plan.popular
          ? 'border-primary ring-1 ring-primary shadow-sm dark:bg-muted/5'
          : 'hover:border-muted-foreground/20'
      }`}
    >
      {/* Popular badge toggle */}
      {plan.popular && (
        <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
          Popular
        </span>
      )}

      <CardHeader className="pt-6">
        <CardTitle className="text-lg text-foreground font-bold">
          {plan.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {plan.description}
        </p>
        <div className="text-3xl font-bold text-foreground mt-2 flex items-baseline">
          ₹{(plan.price / 100).toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            /mo
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-6 flex-1 flex flex-col justify-between">
        {/* Dynamic list rendering if features array exists */}
        <div className="space-y-2">
          {plan.features?.map((f: string) => (
            <div
              key={f}
              className="flex items-start gap-2 text-sm text-foreground/90"
            >
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <span className="leading-tight">{f}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Action Trigger Button */}
        <Button
          variant={plan.popular ? 'default' : 'outline'}
          className="w-full mt-6"
          onClick={addToCart}
          disabled={plan.name === 'Free'} // Disable the button for the Free tier
        >
          {plan.name === 'Free' ? 'Current Plan' : 'Add to cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
