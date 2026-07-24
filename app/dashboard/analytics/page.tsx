import Link from 'next/link';
import { getAnalyticsOverview, getDailyScans, getTopQrCodes, getGeoInsights, getUtmInsights, getRecentScans, DateRange } from '@/lib/qr/analytics-actions';
import { DailyScansChart } from '@/components/analytics/daily-scans-chart';
import { BreakdownChart } from '@/components/analytics/breakdown-chart';
import { DonutChart } from '@/components/analytics/donut-chart';
import { DateRangeFilter } from '@/components/analytics/date-range-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, QrCode, MousePointerClick, Globe, Monitor } from 'lucide-react';

const VALID_RANGES = ['7d', '30d', '90d', 'all'] as const;

export default async function AnalyticsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const searchParams = await searchParamsPromise;

  const range = (VALID_RANGES.includes(searchParams.range as any)
    ? searchParams.range
    : '30d') as DateRange;

  const [overview, dailyScans, topQrs, geo, utm, recentScans] = await Promise.all([
    getAnalyticsOverview(range),
    getDailyScans(range),
    getTopQrCodes(range),
    getGeoInsights(range),
    getUtmInsights(range),
    getRecentScans(range),
  ]);

  if (!overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No data available. Create QR codes and start scanning to see analytics.
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Total Scans', value: overview.totalScans, icon: MousePointerClick, hint: `Last ${range}` },
    { label: 'QR Codes', value: overview.qrCount, icon: QrCode, hint: `${overview.activeQrCount} active` },
    { label: 'Top Device', value: overview.topDevice, icon: Monitor, hint: 'Most used' },
    { label: 'Top Country', value: geo.countries[0]?.name || '—', icon: Globe, hint: 'By scans' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track scans across all your QR codes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter current={range} />
          <Button variant="outline" asChild className="hover:bg-accent hover:text-accent-foreground">
            <Link href={`/dashboard/analytics/export?range=${range}`}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card text-card-foreground border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily scans chart */}
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyScans.length > 0 ? (
            <DailyScansChart data={dailyScans} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No scan data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdowns row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={overview.deviceBreakdown} />
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={overview.browserBreakdown} title="Browsers" />
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={overview.osBreakdown} title="OS" />
          </CardContent>
        </Card>
      </div>

      {/* Top QR codes + Geo */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {topQrs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No scans yet</p>
            ) : (
              <div className="space-y-2">
                {topQrs.map((qr: any, i) => (
                  <Link
                    key={qr.id}
                    href={`/dashboard/qr/${qr.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors dark:hover:bg-muted/30"
                  >
                    <span className="text-sm truncate pr-2">
                      <span className="mr-2 text-muted-foreground font-mono">#{i + 1}</span>
                      {qr.name}
                      <span className="ml-2 text-xs text-muted-foreground bg-muted dark:bg-muted/50 px-1.5 py-0.5 rounded capitalize font-medium">
                        {qr.type}
                      </span>
                    </span>
                    <span className="text-sm font-semibold flex-shrink-0">{qr.scans} scans</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {geo.countries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No geo data yet</p>
            ) : (
              <BreakdownChart data={geo.countries} title="Country" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geo details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            {geo.cities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No city data yet</p>
            ) : (
              <BreakdownChart data={geo.cities} title="City" />
            )}
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top Regions</CardTitle>
          </CardHeader>
          <CardContent>
            {geo.regions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No region data yet</p>
            ) : (
              <BreakdownChart data={geo.regions} title="Region" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* UTM Attribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">UTM Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={utm.sources} title="Source" />
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">UTM Mediums</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={utm.mediums} title="Medium" />
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground">UTM Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={utm.campaigns} title="Campaign" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
