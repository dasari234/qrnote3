import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: ['5 dynamic QR codes', '100 scans/month', 'Basic analytics', '1 workspace'],
  },
  {
    name: 'Starter',
    price: '$19',
    features: ['100 dynamic QR codes', '5,000 scans/month', 'Full analytics', 'Custom branding'],
  },
  {
    name: 'Pro',
    price: '$49',
    features: ['1,000 dynamic QR codes', '50,000 scans/month', 'Team collaboration', 'Bulk import'],
    popular: true, // Tag explicitly to handle conditional border logic safely
  },
  {
    name: 'Business',
    price: '$149',
    features: ['Unlimited QR codes', '500K scans/month', 'API access', 'Priority support'],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Stripe subscription integration arrives in Phase 4.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col justify-between bg-card text-card-foreground border-border transition-all hover:shadow-md ${plan.popular
                ? 'border-primary ring-1 ring-primary shadow-sm dark:bg-muted/5'
                : 'hover:border-muted-foreground/20'
              }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
                Popular
              </span>
            )}

            <CardHeader className="pt-6">
              <CardTitle className="text-lg text-foreground font-bold">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-foreground mt-2 flex items-baseline">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-6 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="leading-tight">{f}</span>
                  </div>
                ))}
              </div>

              {/* Proactively adding action buttons since it's a pricing section */}
              <Button
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full mt-6"
                disabled
              >
                {plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
