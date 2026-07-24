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
    // Update: Injected contextual surface variables to isolate the tab background cleanly
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-1">
      {RANGES.map((r) => (
        <Button
          key={r.value}
          variant={current === r.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleChange(r.value)}
          className={`h-7 px-3 text-xs transition-all ${current === r.value
              ? 'bg-background text-foreground shadow-sm hover:bg-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-muted/40'
            }`}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
