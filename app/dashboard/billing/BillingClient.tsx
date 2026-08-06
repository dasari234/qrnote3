"use client";

import PlanCard from "@/components/plan/PlanCard";

interface BillingClientProps {
    plans: any[];
}

export default function BillingClient({ plans }: BillingClientProps) {
    return (

        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
                <p className="text-sm text-muted-foreground">
                    Stripe subscription integration arrives in Phase 4.
                </p>
            </div>

            {/* Auto-centered and responsive grid alignment layout */}
            <div className="mx-auto mt-6 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch justify-center">
                {plans.map((plan) => (
                    <div key={plan.id} className="flex h-full">
                        <PlanCard plan={plan} />
                    </div>
                ))}
            </div>
        </div>

    );
}
