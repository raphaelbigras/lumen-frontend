'use client';
import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { ticketsApi } from '../../../lib/api/tickets';
import { categoriesApi } from '../../../lib/api/categories';
import { TicketTable } from '../../../components/TicketTable/TicketTable';
import { ColumnVisibilityPopover } from '../../../components/TicketTable/ColumnVisibilityPopover';
import Link from 'next/link';
import { RefreshCw, Download } from 'lucide-react';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../../lib/translations';

const DEFAULT_COLUMNS = ['title', 'status', 'priority', 'category', 'submitter', 'assignee', 'department', 'site', 'created', 'updated'];

const STATUS_TOGGLE_COLORS: Record<string, string> = {
  OPEN: 'bg-status-open-bg text-status-open-text border-status-open-text/30',
  IN_PROGRESS: 'bg-status-progress-bg text-status-progress-text border-status-progress-text/30',
  PENDING: 'bg-status-pending-bg text-status-pending-text border-status-pending-text/30',
  RESOLVED: 'bg-status-resolved-bg text-status-resolved-text border-status-resolved-text/30',
  CLOSED: 'bg-status-closed-bg text-status-closed-text border-status-closed-text/30',
};

export default function BilletsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

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

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
    sortBy,
    sortOrder,
    ...filters,
  };
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketsApi.getAll(params),
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60_000,
  });

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    if (!value) {
      const next = { ...filters };
      delete next[key];
      setFilters(next);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const handleSort = (column: string) => {
    const sortMap: Record<string, string> = { title: 'title', status: 'status', priority: 'priority', category: 'category', submitter: 'submitter', assignee: 'assignee', department: 'department', site: 'site', created: 'createdAt', updated: 'updatedAt' };
    const field = sortMap[column];
    if (!field) return;
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const allColumns = [
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Billets</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary placeholder:text-lumen-text-tertiary outline-none w-48"
          />
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary hover:text-lumen-text-primary"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => {
              if (!data?.data?.length) return;
              const rows = data.data.map((t) => ({
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
            }}
            disabled={!data?.data?.length}
            className="flex items-center gap-1.5 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary hover:text-lumen-text-primary disabled:opacity-30"
            title="Exporter en CSV"
          >
            <Download size={14} />
          </button>
          <ColumnVisibilityPopover columns={allColumns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
          <Link href="/billets/nouveau" className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all">
            + Nouveau billet
          </Link>
        </div>
      </div>

      {/* Status toggle buttons */}
      <div className="flex items-center gap-1.5 mb-4">
        <button
          onClick={() => { handleFilterChange('status', ''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            !filters.status
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
          }`}
        >
          Tous
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFilterChange('status', filters.status === key ? '' : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filters.status === key
                ? STATUS_TOGGLE_COLORS[key]
                : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-lumen-text-tertiary">Chargement...</div>
      ) : (
        <>
          <TicketTable
            tickets={data?.data || []}
            columnOrder={columnOrder}
            visibleColumns={visibleColumns}
            onColumnOrderChange={setColumnOrder}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs text-lumen-text-tertiary">
              <span>{data?.total} billets au total</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-lumen-bg-tertiary border border-lumen-border-primary disabled:opacity-30">
                  &larr; Précédent
                </button>
                <span className="px-3 py-1">Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-lumen-bg-tertiary border border-lumen-border-primary disabled:opacity-30">
                  Suivant &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
