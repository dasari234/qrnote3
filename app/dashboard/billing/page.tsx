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
        <h1 className="text-2xl font-bold">Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
