export default function CategoriesLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-48 bg-lumen-bg-tertiary rounded-lg" />
        <div className="h-8 w-40 bg-lumen-bg-tertiary rounded-lg" />
      </div>
      <div className="flex gap-1 mb-4">
        <div className="h-8 w-28 bg-lumen-bg-tertiary rounded-md" />
        <div className="h-8 w-32 bg-lumen-bg-tertiary rounded-md" />
      </div>
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="h-10 bg-lumen-bg-tertiary rounded-t-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-lumen-border-secondary" />
        ))}
      </div>
    </div>
  );
}
