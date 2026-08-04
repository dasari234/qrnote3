import { prisma } from '@/lib/prisma';

export default async function LandingPage() {
  const plans = await prisma.plan.findMany({ where: { deletedAt: null }, orderBy: { price: 'asc' } });

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">QRNote — Plans</h1>
      <p className="mt-2 text-muted-foreground">Choose a plan that fits your needs.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded p-6">
            <div className="text-lg font-semibold">{plan.name}</div>
            <div className="mt-2 text-2xl font-bold">₹{(plan.price/100).toFixed(2)}</div>
            <div className="mt-3 text-sm text-muted-foreground">{plan.description}</div>
            <div className="mt-4">
              <a href="/dashboard/billing" className="btn btn-primary">Buy</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
