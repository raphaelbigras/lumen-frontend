'use client';
import { useState } from 'react';
import { History } from 'lucide-react';
import dynamic from 'next/dynamic';

const TicketHistoryPanel = dynamic(
  () => import('../../../../components/TicketHistoryPanel').then(m => ({ default: m.TicketHistoryPanel })),
  { ssr: false },
);

export function HistoryButton({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-lumen-bg-secondary border border-lumen-border-primary px-3 py-2 rounded-lg text-xs font-medium text-lumen-text-secondary hover:text-lumen-text-primary hover:border-primary transition-colors"
      >
        <History size={14} />
        Historique du billet
      </button>
      {open && <TicketHistoryPanel ticketId={ticketId} onClose={() => setOpen(false)} />}
    </>
  );
}
