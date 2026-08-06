import { prisma } from "@/lib/prisma";
import BillingClient from "@/app/dashboard/billing/BillingClient";

export default async function BillingPage() {
  // Fetch data cleanly on the server
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });

  // Pass down the server data safely to the client context boundary tree
  return <BillingClient plans={plans} />;
}
