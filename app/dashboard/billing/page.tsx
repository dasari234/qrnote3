import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Stripe subscription integration arrives in Phase 4.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === 'Pro' ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  {f}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
