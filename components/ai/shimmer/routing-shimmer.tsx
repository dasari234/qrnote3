export function RoutingShimmer({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-5"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border"
        aria-busy="true"
        aria-label="Loading routing rules"
      >
        <div className="bg-muted/50 px-4 py-3">
          <div className="animate-pulse grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-4 rounded bg-muted"
              />
            ))}
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={row}
              className="animate-pulse grid grid-cols-5 items-center gap-4 px-4 py-4"
            >
              <div className="h-4 w-8 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="ml-auto h-8 w-20 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
