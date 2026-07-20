import Link from 'next/link';
import {
  QrCode,
  ArrowRight,
  BarChart3,
  Palette,
  Users,
  Zap,
  Shield,
  Globe,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">QRNote</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-muted/40" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Dynamic QR codes with real-time analytics</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              QR codes that{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                work as hard as you do
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create, manage, and track dynamic QR codes for your team. Edit destinations
              on the fly, brand every code, and get deep scan analytics — all in one platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · 5 dynamic QR codes on the free plan
            </p>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'URL', color: 'from-blue-500/10 to-blue-600/5' },
                { label: 'Wi-Fi', color: 'from-green-500/10 to-green-600/5' },
                { label: 'vCard', color: 'from-orange-500/10 to-orange-600/5' },
              ].map((item) => (
                <Card
                  key={item.label}
                  className={`overflow-hidden border-2 bg-gradient-to-br ${item.color}`}
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white p-3 shadow-md">
                      <QrCode className="h-24 w-24 text-black" />
                    </div>
                    <span className="text-sm font-medium">{item.label} QR</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to scale
            </h2>
            <p className="mt-4 text-muted-foreground">
              From a single QR to millions of scans — QRNote grows with your team.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Dynamic QR Codes',
                desc: 'Change the destination anytime without reprinting. Short links keep your codes future-proof.',
              },
              {
                icon: BarChart3,
                title: 'Scan Analytics',
                desc: 'Track every scan — location, device, browser, time. Understand your audience in real time.',
              },
              {
                icon: Palette,
                title: 'Custom Branding',
                desc: 'Match your brand with custom colors, logos, and frames. Every QR is an extension of your identity.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                desc: 'Organizations, workspaces, and role-based access. Work together without stepping on each other.',
              },
              {
                icon: Globe,
                title: '20+ QR Types',
                desc: 'URL, Wi-Fi, vCard, SMS, email, PDF, social, reviews, events, menus and more — all built in.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Row-level security, audit logs, and SSO. Your data stays yours, locked down at the database.',
              },
            ].map((f) => (
              <Card key={f.title} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you grow.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Free', price: '$0', features: ['5 dynamic QRs', '100 scans/mo', '1 workspace'] },
              { name: 'Starter', price: '$19', features: ['100 dynamic QRs', '5K scans/mo', 'Custom branding'] },
              { name: 'Pro', price: '$49', features: ['1,000 QRs', '50K scans/mo', 'Team collaboration'], highlight: true },
              { name: 'Business', price: '$149', features: ['Unlimited QRs', '500K scans/mo', 'API access'] },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlight ? 'border-2 border-primary shadow-lg' : ''}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2 text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/sign-up">Get started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-10 text-center text-primary-foreground shadow-xl">
            <h2 className="text-3xl font-bold tracking-tight">Ready to create your first QR?</h2>
            <p className="mt-4 text-primary-foreground/80">
              Join teams using QRNote to manage campaigns at scale.
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link href="/sign-up">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="font-semibold">QRNote</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QRNote. Built with Next.js + Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
