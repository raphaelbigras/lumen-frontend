export default function BilletsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-lumen-bg-tertiary rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-48 bg-lumen-bg-tertiary rounded-lg" />
          <div className="h-8 w-8 bg-lumen-bg-tertiary rounded-lg" />
          <div className="h-8 w-32 bg-lumen-bg-tertiary rounded-lg" />
        </div>
      </div>
      {/* Status toggles skeleton */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-lumen-bg-tertiary rounded-lg" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="h-10 bg-lumen-bg-tertiary rounded-t-lg" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-lumen-border-secondary" />
        ))}
      </div>
    </div>
  );
}
