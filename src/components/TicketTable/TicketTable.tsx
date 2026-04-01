'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
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

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  numero: 70,
  title: 220,
  status: 110,
  priority: 110,
  category: 130,
  submitter: 140,
  assignee: 140,
  department: 130,
  created: 100,
  updated: 100,
};

const COLUMN_DEFS: Record<string, { label: string; render: (t: Ticket) => React.ReactNode }> = {
  numero: { label: 'ID', render: (t) => <span className="font-bold text-primary">#{t.ticketNumber}</span> },
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
  site: { label: 'Site', render: (t) => <span className="text-lumen-text-secondary">{t.site || '—'}</span> },
  created: { label: 'Créé le', render: (t) => <span className="text-lumen-text-tertiary">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span> },
  updated: { label: 'Modifié le', render: (t) => <span className="text-lumen-text-tertiary">{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</span> },
};

const SORT_MAP: Record<string, string> = { numero: 'ticketNumber', title: 'title', status: 'status', priority: 'priority', category: 'category', submitter: 'submitter', assignee: 'assignee', department: 'department', site: 'site', created: 'createdAt', updated: 'updatedAt' };

function SortableHeader({
  id,
  label,
  sortBy,
  sortOrder,
  onSort,
  width,
  onResizeStart,
  isLast,
}: {
  id: string;
  label: string;
  sortBy: string;
  sortOrder: string;
  onSort: (col: string) => void;
  width: number;
  onResizeStart: (e: React.MouseEvent, colId: string) => void;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
  };
  const isSorted = sortBy === SORT_MAP[id];

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`relative px-3 py-3 text-left text-[13px] text-lumen-text-primary font-bold uppercase tracking-wide select-none whitespace-nowrap border-b-2 border-lumen-border-primary ${
        !isLast ? 'border-r border-lumen-border-secondary/50' : ''
      }`}
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
      {/* Resize handle */}
      {!isLast && (
        <div
          onMouseDown={(e) => onResizeStart(e, id)}
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-10"
        />
      )}
    </th>
  );
}

export function TicketTable({ tickets, columnOrder, visibleColumns, onColumnOrderChange, sortBy, sortOrder, onSort }: TicketTableProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumen-column-widths');
      return saved ? JSON.parse(saved) : { ...DEFAULT_COL_WIDTHS };
    }
    return { ...DEFAULT_COL_WIDTHS };
  });

  const resizingRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('lumen-column-widths', JSON.stringify(colWidths));
  }, [colWidths]);

  const handleResizeStart = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colId] || DEFAULT_COL_WIDTHS[colId] || 120;
    resizingRef.current = { colId, startX, startWidth };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(60, resizingRef.current.startWidth + delta);
      setColWidths((prev) => ({ ...prev, [resizingRef.current!.colId]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [colWidths]);

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
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-lumen-bg-tertiary">
            <SortableContext items={displayColumns} strategy={horizontalListSortingStrategy}>
              <tr>
                {displayColumns.map((colId, idx) => (
                  <SortableHeader
                    key={colId}
                    id={colId}
                    label={COLUMN_DEFS[colId]?.label || colId}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                    width={colWidths[colId] || DEFAULT_COL_WIDTHS[colId] || 120}
                    onResizeStart={handleResizeStart}
                    isLast={idx === displayColumns.length - 1}
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
                {displayColumns.map((colId, idx) => (
                  <td
                    key={colId}
                    className={`px-3 py-2.5 text-xs overflow-hidden text-ellipsis ${
                      idx < displayColumns.length - 1 ? 'border-r border-lumen-border-secondary/50' : ''
                    }`}
                    style={{
                      width: `${colWidths[colId] || DEFAULT_COL_WIDTHS[colId] || 120}px`,
                      minWidth: `${colWidths[colId] || DEFAULT_COL_WIDTHS[colId] || 120}px`,
                      maxWidth: `${colWidths[colId] || DEFAULT_COL_WIDTHS[colId] || 120}px`,
                    }}
                  >
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
    </div>
  );
}
