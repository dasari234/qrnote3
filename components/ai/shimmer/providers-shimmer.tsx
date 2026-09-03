export function ProvidersShimmer() {
  return (
    <div
      className="grid gap-4 md:grid-cols-3"
      aria-busy="true"
      aria-label="Loading providers"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-card p-5"
        >
          <div className="animate-pulse space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </div>

              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>

              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>

            <div className="h-9 w-20 rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
