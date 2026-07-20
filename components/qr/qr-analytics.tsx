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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scans yet. Share your QR code to start collecting data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Analytics</CardTitle>
        <DateRangeFilter current={range} />
      </CardHeader>
      <CardContent className="space-y-6">
        {loading || !data ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Loading analytics…
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Scans in range</p>
                <p className="mt-1 text-2xl font-bold">{data.totalScans}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Top device</p>
                <p className="mt-1 text-2xl font-bold">
                  {data.deviceBreakdown[0]?.name || '—'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Top country</p>
                <p className="mt-1 text-2xl font-bold">
                  {data.countries[0]?.name || '—'}
                </p>
              </div>
            </div>

            {data.dailyScans.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Daily Scans</h4>
                <DailyScansChart data={data.dailyScans} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium">Devices</h4>
                <DonutChart data={data.deviceBreakdown} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Browsers</h4>
                <BreakdownChart data={data.browserBreakdown} title="Browser" />
              </div>
            </div>

            {data.cities.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Top Cities</h4>
                <BreakdownChart data={data.cities} title="City" />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
