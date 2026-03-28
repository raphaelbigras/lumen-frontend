import Link from 'next/link';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/translations';

interface AttentionListProps {
  tickets: any[];
}

export function AttentionList({ tickets }: AttentionListProps) {
  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-lumen-text-primary mb-3">Billets nécessitant attention</h3>
      <div className="space-y-0">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/billets/${ticket.id}`}
            className="flex items-center justify-between py-2 border-b border-lumen-border-secondary last:border-b-0 hover:bg-lumen-hover rounded px-1 transition-colors"
          >
            <div>
              <div className="text-xs text-lumen-text-primary">{ticket.title}</div>
              <div className="text-[11px] text-lumen-text-tertiary mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${PRIORITY_COLORS[ticket.priority]}`} />
                {PRIORITY_LABELS[ticket.priority] || ticket.priority}
              </div>
            </div>
            <TicketStatusBadge status={ticket.status} />
          </Link>
        ))}
        {tickets.length === 0 && (
          <div className="text-xs text-lumen-text-tertiary py-4 text-center">Aucun billet urgent</div>
        )}
      </div>
    </div>
  );
}
