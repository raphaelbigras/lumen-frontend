'use client';
import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { ticketsApi } from '../../../lib/api/tickets';
import { categoriesApi } from '../../../lib/api/categories';
import { TicketTable } from '../../../components/TicketTable/TicketTable';
import { FilterBar } from '../../../components/TicketTable/FilterBar';
import { ColumnVisibilityPopover } from '../../../components/TicketTable/ColumnVisibilityPopover';
import Link from 'next/link';

const DEFAULT_COLUMNS = ['title', 'status', 'priority', 'category', 'submitter', 'assignee', 'department', 'created', 'updated'];

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
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    }
    return DEFAULT_COLUMNS;
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumen-visible-columns');
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
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
    const sortMap: Record<string, string> = { title: 'title', status: 'status', priority: 'priority', created: 'createdAt', updated: 'updatedAt' };
    const field = sortMap[column] || column;
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
          <ColumnVisibilityPopover columns={allColumns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
          <Link href="/billets/nouveau" className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold">
            + Nouveau billet
          </Link>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={() => { setFilters({}); setPage(1); }}
        categories={categories || []}
      />

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
