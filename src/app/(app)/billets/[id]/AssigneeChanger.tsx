'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ChevronDown, Search, UserPlus } from 'lucide-react';
import { assignTicketAction } from './actions';

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AssigneeChangerProps {
  ticketId: string;
  currentAssignee: { id: string; firstName: string; lastName: string } | null;
  users: AssignableUser[];
}

export function AssigneeChanger({ ticketId, currentAssignee, users }: AssigneeChangerProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<AssignableUser | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const full = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
      return full.includes(q);
    });
  }, [users, query]);

  const submit = (agentId: string) => {
    startTransition(async () => {
      await assignTicketAction(ticketId, agentId);
    });
  };

  const handleSelect = (user: AssignableUser) => {
    setOpen(false);
    setQuery('');
    if (currentAssignee && currentAssignee.id !== user.id) {
      // Reassignment — confirm first
      setPending(user);
      return;
    }
    if (currentAssignee && currentAssignee.id === user.id) return;
    // First assignment — no confirmation
    submit(user.id);
  };

  const currentLabel = currentAssignee
    ? `${currentAssignee.firstName} ${currentAssignee.lastName}`
    : 'Non assigné';

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-left outline-none hover:border-lumen-text-tertiary focus:border-primary transition-colors"
        >
          <span
            className={
              currentAssignee ? 'text-lumen-text-primary' : 'text-lumen-text-tertiary italic'
            }
          >
            {currentLabel}
          </span>
          <ChevronDown
            size={14}
            className={`text-lumen-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-lumen-border-secondary">
              <Search size={12} className="text-lumen-text-tertiary" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="flex-1 bg-transparent text-xs text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-lumen-text-tertiary italic">
                  Aucun résultat
                </p>
              )}
              {filtered.map((u) => {
                const isCurrent = currentAssignee?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      isCurrent
                        ? 'text-primary bg-primary/5 font-medium'
                        : 'text-lumen-text-primary hover:bg-lumen-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="text-[10px] text-lumen-text-tertiary uppercase">
                        {u.role === 'ADMIN' ? 'Admin' : 'Agent'}
                      </span>
                    </div>
                    <div className="text-[10px] text-lumen-text-tertiary">{u.email}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isPending && (
          <p className="mt-1 text-[10px] text-lumen-text-tertiary italic">Enregistrement…</p>
        )}
      </div>

      {pending && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setPending(null)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-lumen-text-primary">
                  Réassigner le billet
                </h3>
                <p className="text-xs text-lumen-text-tertiary mt-0.5">
                  Confirmer la réassignation à un autre agent.
                </p>
              </div>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-5">
              <span className="inline-block bg-lumen-bg-secondary px-2 py-1 rounded text-[11px] font-medium text-lumen-text-primary">
                {currentAssignee
                  ? `${currentAssignee.firstName} ${currentAssignee.lastName}`
                  : 'Non assigné'}
              </span>
              <span className="mx-2 text-lumen-text-tertiary">→</span>
              <span className="inline-block bg-primary/10 px-2 py-1 rounded text-[11px] font-medium text-primary">
                {pending.firstName} {pending.lastName}
              </span>
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-lumen-text-secondary bg-lumen-bg-secondary border border-lumen-border-primary hover:text-lumen-text-primary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const agent = pending;
                  setPending(null);
                  submit(agent.id);
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
