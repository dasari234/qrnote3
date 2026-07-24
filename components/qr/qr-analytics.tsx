'use client';

import { useState, useEffect } from 'react';
import { getPerQrAnalytics } from '@/lib/qr/analytics-actions';
import { DailyScansChart } from '@/components/analytics/daily-scans-chart';
import { BreakdownChart } from '@/components/analytics/breakdown-chart';
import { DonutChart } from '@/components/analytics/donut-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/analytics/date-range-filter';
import { useSearchParams } from 'next/navigation';

interface PerQrAnalyticsProps {
  qrId: string;
  totalScans: number;
}

export function PerQrAnalytics({ qrId, totalScans }: PerQrAnalyticsProps) {
  const searchParams = useSearchParams();
  const range = (searchParams.get('range') || '30d') as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPerQrAnalytics(qrId, range).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [qrId, range]);

  if (totalScans === 0) {
    return (
      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground font-medium">
            No scans yet. Share your QR code to start collecting data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
        <CardTitle className="text-lg text-foreground font-bold">Analytics</CardTitle>
        <DateRangeFilter current={range} />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {loading || !data ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground font-medium animate-pulse">
            Loading analytics…
          </div>
        ) : (
          <>
            {/* Quick insights overview cells */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 dark:bg-muted/10 p-4 shadow-inner transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Scans in range</p>
                <p className="mt-1.5 text-2xl font-black text-foreground">{data.totalScans.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 dark:bg-muted/10 p-4 shadow-inner transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Top device</p>
                <p className="mt-1.5 text-2xl font-black text-foreground truncate capitalize">
                  {data.deviceBreakdown[0]?.name || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 dark:bg-muted/10 p-4 shadow-inner transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Top country</p>
                <p className="mt-1.5 text-2xl font-black text-foreground truncate">
                  {data.countries[0]?.name || '—'}
                </p>
              </div>
            </div>

            {/* Daily Scans Line Grid */}
            {data.dailyScans.length > 0 && (
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <h4 className="mb-4 font-bold uppercase tracking-wider text-xs text-muted-foreground/90">Daily Scans</h4>
                <div className="pt-2">
                  <DailyScansChart data={data.dailyScans} />
                </div>
              </div>
            )}

            {/* Breakdown distribution blocks row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/90">Devices</h4>
                <div className="py-2 flex justify-center">
                  <DonutChart data={data.deviceBreakdown} />
                </div>
              </div>
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground/90">Browsers</h4>
                <div>
                  <BreakdownChart data={data.browserBreakdown} title="Browser" />
                </div>
              </div>
            </div>

            {/* Geo City Data Loops */}
            {data.cities.length > 0 && (
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <h4 className="mb-4 font-bold uppercase tracking-wider text-xs text-muted-foreground/90">Top Cities</h4>
                <div>
                  <BreakdownChart data={data.cities} title="City" />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
