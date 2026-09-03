export function CostsShimmer({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      aria-busy="true"
      aria-label="Loading costs"
    >
      <div className="bg-muted/50 px-4 py-3">
        <div className="animate-pulse grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`h-4 rounded bg-muted ${
                index > 0 ? "ml-auto w-24" : "w-32"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="animate-pulse grid grid-cols-4 items-center gap-4 px-4 py-4"
          >
            <div className="h-4 w-32 rounded bg-muted" />

            <div className="ml-auto h-4 w-20 rounded bg-muted" />

            <div className="ml-auto h-4 w-20 rounded bg-muted" />

            <div className="ml-auto h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
