import { DashboardStatsShimmer } from "../shimmer/stats-shimmer";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-28 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>

        <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Statistics cards */}
      <DashboardStatsShimmer />

    </div>
  );
}
