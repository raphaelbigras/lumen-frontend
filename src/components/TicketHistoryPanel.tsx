'use client';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi, TicketEvent } from '../lib/api/tickets';
import { STATUS_LABELS, PRIORITY_LABELS } from '../lib/translations';
import {
  X,
  Plus,
  ArrowRightLeft,
  Gauge,
  Tag,
  Pencil,
  FileText,
  UserPlus,
  UserMinus,
  MessageSquarePlus,
  MessageSquareOff,
  Paperclip,
  Trash2,
} from 'lucide-react';

const EVENT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  TICKET_CREATED: { label: 'Billet créé', icon: Plus, color: 'text-blue-400' },
  STATUS_CHANGED: { label: 'Statut modifié', icon: ArrowRightLeft, color: 'text-purple-400' },
  PRIORITY_CHANGED: { label: 'Priorité modifiée', icon: Gauge, color: 'text-orange-400' },
  CATEGORY_CHANGED: { label: 'Catégorie modifiée', icon: Tag, color: 'text-teal-400' },
  TITLE_CHANGED: { label: 'Titre modifié', icon: Pencil, color: 'text-yellow-400' },
  DESCRIPTION_CHANGED: { label: 'Description modifiée', icon: FileText, color: 'text-yellow-400' },
  ASSIGNED: { label: 'Agent assigné', icon: UserPlus, color: 'text-green-400' },
  UNASSIGNED: { label: 'Agent retiré', icon: UserMinus, color: 'text-red-400' },
  COMMENT_ADDED: { label: 'Commentaire ajouté', icon: MessageSquarePlus, color: 'text-indigo-400' },
  COMMENT_DELETED: { label: 'Commentaire supprimé', icon: MessageSquareOff, color: 'text-gray-400' },
  ATTACHMENT_ADDED: { label: 'Pièce jointe ajoutée', icon: Paperclip, color: 'text-cyan-400' },
  ATTACHMENT_DELETED: { label: 'Pièce jointe supprimée', icon: Trash2, color: 'text-gray-400' },
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventPayload({ event }: { event: TicketEvent }) {
  const { type, payload } = event;

  if (type === 'STATUS_CHANGED') {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1">
        <span className="bg-lumen-bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
          {STATUS_LABELS[payload.from] || payload.from}
        </span>
        <span className="mx-1.5 text-lumen-text-tertiary">→</span>
        <span className="bg-lumen-bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
          {STATUS_LABELS[payload.to] || payload.to}
        </span>
      </p>
    );
  }

  if (type === 'PRIORITY_CHANGED') {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1">
        <span className="bg-lumen-bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
          {PRIORITY_LABELS[payload.from] || payload.from}
        </span>
        <span className="mx-1.5 text-lumen-text-tertiary">→</span>
        <span className="bg-lumen-bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
          {PRIORITY_LABELS[payload.to] || payload.to}
        </span>
      </p>
    );
  }

  if (type === 'CATEGORY_CHANGED' && payload.fromName) {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1">
        {payload.fromName} → nouvelle catégorie
      </p>
    );
  }

  if (type === 'TITLE_CHANGED') {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1 truncate max-w-[280px]">
        « {payload.from} » → « {payload.to} »
      </p>
    );
  }

  if (type === 'ASSIGNED' && payload.agentName) {
    return <p className="text-xs text-lumen-text-secondary mt-1">{payload.agentName}</p>;
  }

  if (type === 'UNASSIGNED' && payload.agentName) {
    return <p className="text-xs text-lumen-text-secondary mt-1">{payload.agentName}</p>;
  }

  if (type === 'TICKET_CREATED' && payload.title) {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1 truncate max-w-[280px]">
        {payload.title}
      </p>
    );
  }

  if ((type === 'ATTACHMENT_ADDED' || type === 'ATTACHMENT_DELETED') && payload.filename) {
    return (
      <p className="text-xs text-lumen-text-secondary mt-1 truncate max-w-[280px]">
        {payload.filename}
      </p>
    );
  }

  return null;
}

export function TicketHistoryPanel({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['ticket-events', ticketId],
    queryFn: () => ticketsApi.getEvents(ticketId),
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-lumen-bg-tertiary border-l border-lumen-border-primary shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-lumen-border-primary shrink-0">
          <div>
            <h2 className="text-sm font-bold text-lumen-text-primary">Historique du billet</h2>
            {events && (
              <span className="text-[11px] text-lumen-text-tertiary">
                {events.length} événement{events.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-lumen-bg-secondary border border-lumen-border-primary flex items-center justify-center text-lumen-text-tertiary hover:text-lumen-text-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading && (
            <p className="text-sm text-lumen-text-tertiary text-center py-8">Chargement...</p>
          )}

          {events && events.length === 0 && (
            <p className="text-sm text-lumen-text-tertiary text-center py-8">Aucun événement</p>
          )}

          {events && events.length > 0 && (
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-lumen-border-primary" />

              {events.map((event, index) => {
                const config = EVENT_CONFIG[event.type] || {
                  label: event.type,
                  icon: FileText,
                  color: 'text-lumen-text-tertiary',
                };
                const Icon = config.icon;
                const isLast = index === events.length - 1;

                return (
                  <div key={event.id} className={`relative ${isLast ? '' : 'mb-5'}`}>
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-lumen-bg-secondary border border-lumen-border-primary flex items-center justify-center ${config.color}`}
                    >
                      <Icon size={12} />
                    </div>

                    {/* Event card */}
                    <div className="bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-lumen-text-tertiary whitespace-nowrap">
                          {formatRelativeDate(event.createdAt)}
                        </span>
                      </div>
                      <EventPayload event={event} />
                      <p className="text-[11px] text-lumen-text-tertiary mt-1.5">
                        par{' '}
                        <span className="text-lumen-text-secondary">
                          {event.actor.firstName} {event.actor.lastName}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
