'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const;

export function DateRangeFilter({ current = '30d' }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
      {RANGES.map((r) => (
        <Button
          key={r.value}
          variant={current === r.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleChange(r.value)}
          className="h-7 px-3 text-xs"
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
