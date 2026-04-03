'use client';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="flex items-center gap-1.5 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary hover:text-lumen-text-primary"
    >
      <RefreshCw size={14} />
    </button>
  );
}
