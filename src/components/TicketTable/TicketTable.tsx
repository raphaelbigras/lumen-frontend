'use client';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/translations';
import type { Ticket } from '../../lib/api/tickets';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  columnOrder: string[];
  visibleColumns: string[];
  onColumnOrderChange: (newOrder: string[]) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const COLUMN_DEFS: Record<string, { label: string; render: (t: Ticket) => React.ReactNode }> = {
  title: { label: 'Titre', render: (t) => <span className="font-medium text-lumen-text-primary">{t.title}</span> },
  status: { label: 'Statut', render: (t) => <TicketStatusBadge status={t.status} /> },
  priority: {
    label: 'Priorité',
    render: (t) => (
      <span className="flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_COLORS[t.priority]}`} />
        <span className="text-lumen-text-secondary">{PRIORITY_LABELS[t.priority] || t.priority}</span>
      </span>
    ),
  },
  category: { label: 'Catégorie', render: (t) => <span className="text-lumen-text-secondary">{t.category?.name || '—'}</span> },
  submitter: { label: 'Soumis par', render: (t) => <span className="text-lumen-text-secondary">{t.submitter.firstName} {t.submitter.lastName}</span> },
  assignee: {
    label: 'Assigné à',
    render: (t) => {
      const agent = t.assignments?.[0]?.agent;
      return <span className="text-lumen-text-secondary">{agent ? `${agent.firstName} ${agent.lastName}` : 'Non assigné'}</span>;
    },
  },
  department: { label: 'Département', render: (t) => <span className="text-lumen-text-secondary">{t.department?.name || '—'}</span> },
  created: { label: 'Créé le', render: (t) => <span className="text-lumen-text-tertiary">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span> },
  updated: { label: 'Modifié le', render: (t) => <span className="text-lumen-text-tertiary">{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</span> },
};

const SORT_MAP: Record<string, string> = { title: 'title', status: 'status', priority: 'priority', created: 'createdAt', updated: 'updatedAt' };

function SortableHeader({ id, label, sortBy, sortOrder, onSort }: { id: string; label: string; sortBy: string; sortOrder: string; onSort: (col: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isSorted = sortBy === (SORT_MAP[id] || id);

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-3 py-2 text-left text-[11px] text-lumen-text-tertiary font-medium uppercase tracking-wider select-none whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        <span {...attributes} {...listeners} className="cursor-grab text-lumen-text-tertiary/50 hover:text-lumen-text-tertiary">
          <GripVertical size={12} />
        </span>
        <button onClick={() => onSort(id)} className="flex items-center gap-1 hover:text-lumen-text-secondary">
          {label}
          {isSorted && (sortOrder === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
        </button>
      </div>
    </th>
  );
}

export function TicketTable({ tickets, columnOrder, visibleColumns, onColumnOrderChange, sortBy, sortOrder, onSort }: TicketTableProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const displayColumns = columnOrder.filter((id) => visibleColumns.includes(id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      onColumnOrderChange(arrayMove(columnOrder, oldIndex, newIndex));
    }
  }

  return (
    <div className="bg-lumen-bg-secondary border border-lumen-border-secondary rounded-lg overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full">
          <thead className="bg-lumen-bg-tertiary">
            <SortableContext items={displayColumns} strategy={horizontalListSortingStrategy}>
              <tr>
                {displayColumns.map((colId) => (
                  <SortableHeader
                    key={colId}
                    id={colId}
                    label={COLUMN_DEFS[colId]?.label || colId}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                ))}
              </tr>
            </SortableContext>
          </thead>
          <tbody className="divide-y divide-lumen-border-secondary">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => router.push(`/billets/${ticket.id}`)}
                className="hover:bg-lumen-hover cursor-pointer"
              >
                {displayColumns.map((colId) => (
                  <td key={colId} className="px-3 py-2.5 text-xs">
                    {COLUMN_DEFS[colId]?.render(ticket)}
                  </td>
                ))}
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={displayColumns.length} className="px-3 py-8 text-center text-xs text-lumen-text-tertiary">
                  Aucun billet trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
