export default function TicketDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="h-7 w-32 bg-lumen-bg-tertiary rounded-lg mb-4" />
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <div className="h-6 w-3/4 bg-lumen-bg-secondary rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-lumen-bg-secondary rounded" />
              <div className="h-4 w-5/6 bg-lumen-bg-secondary rounded" />
              <div className="h-4 w-2/3 bg-lumen-bg-secondary rounded" />
            </div>
          </div>
          <div className="h-32 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
          <div className="h-48 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
          <div className="h-32 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl" />
        </div>
      </div>
    </div>
  );
}
