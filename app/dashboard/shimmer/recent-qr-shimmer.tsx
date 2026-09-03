export function RecentQrShimmer({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div
      className="space-y-2"
      aria-busy="true"
      aria-label="Loading recent QR codes"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />

            <div className="animate-pulse space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
