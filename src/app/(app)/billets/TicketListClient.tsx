'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnVisibilityPopover } from '../../../components/TicketTable/ColumnVisibilityPopover';
import { RefreshCw, Download } from 'lucide-react';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../../lib/translations';
import { ticketsApi } from '../../../lib/api/tickets';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { PaginatedTickets } from '../../../lib/api/tickets';

const TicketTable = dynamic(
  () => import('../../../components/TicketTable/TicketTable').then(m => ({ default: m.TicketTable })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary animate-pulse">
        <div className="h-10 bg-lumen-bg-tertiary rounded-t-lg" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-lumen-border-secondary" />
        ))}
      </div>
    ),
  },
);

const DEFAULT_COLUMNS = ['numero', 'title', 'status', 'priority', 'category', 'submitter', 'assignee', 'department', 'site', 'created', 'updated'];
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

interface TicketListClientProps {
  initialData: PaginatedTickets;
  currentPage: number;
  currentLimit: number;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  currentSearch: string;
  currentStatus: string;
}

export function TicketListClient({
  initialData,
  currentPage,
  currentLimit,
  currentSortBy,
  currentSortOrder,
  currentSearch,
  currentStatus,
}: TicketListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [exporting, setExporting] = useState(false);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumen-column-order');
      if (saved) {
        const parsed = JSON.parse(saved);
        const missing = DEFAULT_COLUMNS.filter((c) => !parsed.includes(c));
        return [...parsed, ...missing];
      }
    }
    return DEFAULT_COLUMNS;
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumen-visible-columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        const missing = DEFAULT_COLUMNS.filter((c) => !parsed.includes(c));
        return [...parsed, ...missing];
      }
    }
    return DEFAULT_COLUMNS;
  });

  useEffect(() => {
    localStorage.setItem('lumen-column-order', JSON.stringify(columnOrder));
  }, [columnOrder]);
  useEffect(() => {
    localStorage.setItem('lumen-visible-columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Navigate with URL search params
  function navigate(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const values: Record<string, string> = {
      page: String(currentPage),
      limit: String(currentLimit),
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(currentSearch ? { search: currentSearch } : {}),
      ...(currentStatus ? { status: currentStatus } : {}),
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) p.set(k, v);
    }
    router.push(`/billets?${p.toString()}`);
  }

  const handleSort = (column: string) => {
    const sortMap: Record<string, string> = { numero: 'ticketNumber', title: 'title', status: 'status', priority: 'priority', category: 'category', submitter: 'submitter', assignee: 'assignee', department: 'department', site: 'site', created: 'createdAt', updated: 'updatedAt' };
    const field = sortMap[column];
    if (!field) return;
    if (currentSortBy === field) {
      navigate({ sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      navigate({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const handleSearchSubmit = () => {
    navigate({ search: search || undefined, page: '1' });
  };

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {
        page: '1',
        limit: '10000',
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      };
      if (currentSearch) exportParams.search = currentSearch;
      if (currentStatus) exportParams.status = currentStatus;
      const allData = await ticketsApi.getAll(exportParams);
      if (!allData.data.length) return;

      const rows = allData.data.map((t) => ({
        '#': t.ticketNumber,
        Titre: t.title,
        Statut: STATUS_LABELS[t.status] || t.status,
        Priorite: PRIORITY_LABELS[t.priority] || t.priority,
        Categorie: t.category?.name || '',
        'Soumis par': `${t.submitter.firstName} ${t.submitter.lastName}`,
        'Assigne a': t.assignments?.[0]?.agent ? `${t.assignments[0].agent.firstName} ${t.assignments[0].agent.lastName}` : '',
        Departement: t.department?.name || '',
        Site: t.site || '',
        'Cree le': new Date(t.createdAt).toLocaleDateString('fr-FR'),
        'Modifie le': new Date(t.updatedAt).toLocaleDateString('fr-FR'),
      }));
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(';'), ...rows.map((r) => headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(';'))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billets_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(initialData.total / currentLimit);

  const allColumns = [
    { id: 'numero', label: 'ID' },
    { id: 'title', label: 'Titre' },
    { id: 'status', label: 'Statut' },
    { id: 'priority', label: 'Priorite' },
    { id: 'category', label: 'Categorie' },
    { id: 'submitter', label: 'Soumis par' },
    { id: 'assignee', label: 'Assigne a' },
    { id: 'department', label: 'Departement' },
    { id: 'site', label: 'Site' },
    { id: 'created', label: 'Cree le' },
    { id: 'updated', label: 'Modifie le' },
  ];

  return (
    <>
      {/* Toolbar row — search + actions */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
        className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary placeholder:text-lumen-text-tertiary outline-none w-48"
      />
      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-1.5 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary hover:text-lumen-text-primary"
      >
        <RefreshCw size={14} />
      </button>
      <ColumnVisibilityPopover columns={allColumns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
      <Link href="/billets/nouveau" className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all">
        + Nouveau billet
      </Link>

      {/* Export + pagination — full width below */}
      <div className="w-full mt-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleExportCsv}
            disabled={exporting || !initialData.total}
            className="flex items-center gap-2 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-4 py-2 text-xs font-semibold text-lumen-text-secondary hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30"
          >
            <Download size={14} />
            {exporting ? 'Export en cours...' : `Exporter en CSV (${initialData.total || 0} billets)`}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-lumen-text-tertiary">
              <span>Afficher</span>
              <select
                value={currentLimit}
                onChange={(e) => navigate({ limit: e.target.value, page: '1' })}
                className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded px-2 py-1 text-xs text-lumen-text-secondary outline-none cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>par page</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-xs text-lumen-text-tertiary">
                <button onClick={() => navigate({ page: String(Math.max(1, currentPage - 1)) })} disabled={currentPage === 1} className="px-2.5 py-1 rounded bg-lumen-bg-tertiary border border-lumen-border-primary disabled:opacity-30 hover:text-lumen-text-secondary">
                  &larr;
                </button>
                <span className="px-2 py-1">{currentPage} / {totalPages}</span>
                <button onClick={() => navigate({ page: String(Math.min(totalPages, currentPage + 1)) })} disabled={currentPage === totalPages} className="px-2.5 py-1 rounded bg-lumen-bg-tertiary border border-lumen-border-primary disabled:opacity-30 hover:text-lumen-text-secondary">
                  &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        <TicketTable
          tickets={initialData.data || []}
          columnOrder={columnOrder}
          visibleColumns={visibleColumns}
          onColumnOrderChange={setColumnOrder}
          sortBy={currentSortBy}
          sortOrder={currentSortOrder}
          onSort={handleSort}
        />
        {initialData.total > 0 && (
          <div className="mt-2 text-xs text-lumen-text-tertiary">
            {initialData.total} billet{initialData.total !== 1 ? 's' : ''} au total
          </div>
        )}
      </div>
    </>
  );
}
