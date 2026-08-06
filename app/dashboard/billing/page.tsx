import { prisma } from "@/lib/prisma";
import PlanCard from "@/components/plan/PlanCard";
import { CartProvider } from "@/components/providers/cart/CartProvider";

/**
 * Server page that lists plans. PlanCard is a client component and
 * uses CartProvider to enable add-to-cart.
 */
export default async function BillingPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });

  return (
    <CartProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Stripe subscription integration arrives in Phase 4.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id}>
              {/* @ts-ignore server -> client prop */}
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </CartProvider>
  );
}
