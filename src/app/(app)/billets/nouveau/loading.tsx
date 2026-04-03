export default function NouveauLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-32 bg-lumen-bg-tertiary rounded-lg" />
        <div className="h-6 w-36 bg-lumen-bg-tertiary rounded-lg" />
      </div>
      <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-6 space-y-4">
        <div className="h-10 bg-lumen-bg-secondary rounded-lg" />
        <div className="h-32 bg-lumen-bg-secondary rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-lumen-bg-secondary rounded-lg" />
          <div className="h-10 bg-lumen-bg-secondary rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-lumen-bg-secondary rounded-lg" />
          <div className="h-10 bg-lumen-bg-secondary rounded-lg" />
        </div>
        <div className="h-24 bg-lumen-bg-secondary rounded-lg" />
        <div className="h-9 w-32 bg-lumen-bg-secondary rounded-lg" />
      </div>
    </div>
  );
}
