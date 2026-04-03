'use client';
import { useState, useTransition } from 'react';
import { updateTicketAction } from './actions';
import { CustomSelect } from '../../../../components/CustomSelect';
import { STATUS_LABELS } from '../../../../lib/translations';
import { ArrowRightLeft } from 'lucide-react';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

export function StatusChanger({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  return (
    <>
      <div>
        <label className="block text-xs text-lumen-text-tertiary mb-1">Changer le statut</label>
        <CustomSelect
          value={currentStatus}
          onChange={(val) => {
            if (val !== currentStatus) setPendingStatus(val);
          }}
          options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] || s }))}
          placeholder=""
        />
      </div>

      {pendingStatus && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setPendingStatus(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowRightLeft size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-lumen-text-primary">Changer le statut</h3>
                <p className="text-xs text-lumen-text-tertiary mt-0.5">Confirmer le changement de statut du billet.</p>
              </div>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-5">
              <span className="inline-block bg-lumen-bg-secondary px-2 py-1 rounded text-[11px] font-medium text-lumen-text-primary">
                {STATUS_LABELS[currentStatus] || currentStatus}
              </span>
              <span className="mx-2 text-lumen-text-tertiary">→</span>
              <span className="inline-block bg-primary/10 px-2 py-1 rounded text-[11px] font-medium text-primary">
                {STATUS_LABELS[pendingStatus] || pendingStatus}
              </span>
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingStatus(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-lumen-text-secondary bg-lumen-bg-secondary border border-lumen-border-primary hover:text-lumen-text-primary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const status = pendingStatus;
                  setPendingStatus(null);
                  startTransition(async () => {
                    await updateTicketAction(ticketId, { status });
                  });
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
