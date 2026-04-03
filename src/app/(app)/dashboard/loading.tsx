export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-40 bg-lumen-bg-tertiary rounded-lg" />
        <div className="h-8 w-8 bg-lumen-bg-tertiary rounded-lg" />
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="col-span-2 h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
        <div className="h-64 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
      </div>
      {/* Bottom row skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-48 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
        <div className="h-48 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
      </div>
    </div>
  );
}
