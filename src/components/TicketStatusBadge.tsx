import { STATUS_LABELS, STATUS_STYLES } from '../lib/translations';

export function TicketStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { bg: 'bg-lumen-border-primary', text: 'text-lumen-text-tertiary' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
