export function ModelsShimmer({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      aria-busy="true"
      aria-label="Loading models"
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
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>

            <div className="h-4 w-20 rounded bg-muted" />

            <div className="h-4 w-32 rounded bg-muted" />

            <div className="h-6 w-16 rounded-full bg-muted" />

            <div className="ml-auto h-8 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
