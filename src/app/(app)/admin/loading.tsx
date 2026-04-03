export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 bg-lumen-bg-tertiary rounded-lg mb-6" />
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="p-4 border-b border-lumen-border-secondary">
          <div className="h-5 w-48 bg-lumen-bg-tertiary rounded" />
        </div>
        <div className="h-10 bg-lumen-bg-tertiary" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-lumen-border-secondary" />
        ))}
      </div>
    </div>
  );
}
