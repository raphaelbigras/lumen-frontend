'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
const STATUS_TOGGLE_COLORS: Record<string, string> = {
  OPEN: 'bg-status-open-bg text-status-open-text border-status-open-text/30',
  IN_PROGRESS: 'bg-status-progress-bg text-status-progress-text border-status-progress-text/30',
  PENDING: 'bg-status-pending-bg text-status-pending-text border-status-pending-text/30',
  RESOLVED: 'bg-status-resolved-bg text-status-resolved-text border-status-resolved-text/30',
  CLOSED: 'bg-status-closed-bg text-status-closed-text border-status-closed-text/30',
};

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
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const normalizedSearch = search.trim();
    const normalizedCurrentSearch = currentSearch.trim();

    if (normalizedSearch === normalizedCurrentSearch) return;

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', String(currentLimit));
      params.set('sortBy', currentSortBy);
      params.set('sortOrder', currentSortOrder);
      if (normalizedSearch) params.set('search', normalizedSearch);
      if (currentStatus) params.set('status', currentStatus);
      router.replace(`/billets?${params.toString()}`);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search, currentSearch, currentLimit, currentSortBy, currentSortOrder, currentStatus, router]);

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

  function getStatusHref(nextStatus?: string) {
    const p = new URLSearchParams();
    const values: Record<string, string> = {
      page: '1',
      limit: String(currentLimit),
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      ...(currentSearch ? { search: currentSearch } : {}),
      ...(nextStatus ? { status: nextStatus } : {}),
    };
    for (const [k, v] of Object.entries(values)) {
      if (v) p.set(k, v);
    }
    return `/billets?${p.toString()}`;
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
    navigate({ search: search.trim() || undefined, page: '1' });
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
        Priorité: PRIORITY_LABELS[t.priority] || t.priority,
        Catégorie: t.category?.name || '',
        'Soumis par': `${t.submitter.firstName} ${t.submitter.lastName}`,
        'Assigné à': t.assignments?.[0]?.agent ? `${t.assignments[0].agent.firstName} ${t.assignments[0].agent.lastName}` : '',
        Département: t.department?.name || '',
        Site: t.site || '',
        'Créé le': new Date(t.createdAt).toLocaleDateString('fr-FR'),
        'Modifié le': new Date(t.updatedAt).toLocaleDateString('fr-FR'),
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
    { id: 'priority', label: 'Priorité' },
    { id: 'category', label: 'Catégorie' },
    { id: 'submitter', label: 'Soumis par' },
    { id: 'assignee', label: 'Assigné à' },
    { id: 'department', label: 'Département' },
    { id: 'site', label: 'Site' },
    { id: 'created', label: 'Créé le' },
    { id: 'updated', label: 'Modifié le' },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar row — search + actions */}
      <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <div className="hidden">
        <Link
          href={getStatusHref()}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            !currentStatus
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
          }`}
        >
          Tous
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={getStatusHref(currentStatus === key ? undefined : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              currentStatus === key
                ? STATUS_TOGGLE_COLORS[key]
                : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Export + pagination — full width below */}
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
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

        <div className="mt-2 mb-2 flex flex-wrap items-center gap-1.5">
          <Link
            href={getStatusHref()}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              !currentStatus
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
            }`}
          >
            Tous
          </Link>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={getStatusHref(currentStatus === key ? undefined : key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                currentStatus === key
                  ? STATUS_TOGGLE_COLORS[key]
                  : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
              }`}
            >
              {label}
            </Link>
          ))}
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
    </div>
  );
}
