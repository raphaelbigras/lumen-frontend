'use client';
import { useState, useTransition } from 'react';
import { closeTicketAction, reopenTicketAction } from './actions';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export function CloseTicketButton({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-status-resolved-bg text-status-resolved-text border border-status-resolved-text/20 px-3 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
      >
        <CheckCircle2 size={14} />
        J&apos;ai trouve une solution
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-lumen-text-primary">Fermer le billet</h3>
              <button onClick={() => setOpen(false)} className="text-lumen-text-tertiary hover:text-lumen-text-secondary">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-3">Decrivez brievement comment vous avez resolu le probleme.</p>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Redemarrage du service, mise a jour du pilote..."
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) return;
                  startTransition(async () => {
                    await closeTicketAction(ticketId, reason.trim());
                    setOpen(false);
                    setReason('');
                  });
                }}
                disabled={isPending || !reason.trim()}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isPending ? 'Fermeture...' : 'Fermer le billet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ReopenTicketButton({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-status-open-bg text-status-open-text border border-status-open-text/20 px-3 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
      >
        <RotateCcw size={14} />
        Reouvrir le billet
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-lumen-text-primary">Reouvrir le billet</h3>
              <button onClick={() => setOpen(false)} className="text-lumen-text-tertiary hover:text-lumen-text-secondary">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-3">Decrivez pourquoi vous souhaitez reouvrir ce billet.</p>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Le probleme persiste, nouvelle erreur apparue..."
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) return;
                  startTransition(async () => {
                    await reopenTicketAction(ticketId, reason.trim());
                    setOpen(false);
                    setReason('');
                  });
                }}
                disabled={isPending || !reason.trim()}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isPending ? 'Reouverture...' : 'Reouvrir le billet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
