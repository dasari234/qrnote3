export function FeatureFlagsShimmer({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div
      className="grid gap-4 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading feature flags"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border p-5"
        >
          <div className="animate-pulse flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-5 w-36 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>

            <div className="h-8 w-20 shrink-0 rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
