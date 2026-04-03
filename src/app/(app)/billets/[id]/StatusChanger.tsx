'use client';
import { useTransition } from 'react';
import { updateTicketAction } from './actions';
import { CustomSelect } from '../../../../components/CustomSelect';
import { STATUS_LABELS } from '../../../../lib/translations';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

export function StatusChanger({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <label className="block text-xs text-lumen-text-tertiary mb-1">Changer le statut</label>
      <CustomSelect
        value={currentStatus}
        onChange={(val) => {
          startTransition(async () => {
            await updateTicketAction(ticketId, { status: val });
          });
        }}
        options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] || s }))}
        placeholder=""
      />
    </div>
  );
}
