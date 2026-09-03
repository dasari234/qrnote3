export function DashboardStatsShimmer() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading dashboard statistics"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
            </div>

            <div className="h-8 w-16 rounded bg-muted" />

            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
