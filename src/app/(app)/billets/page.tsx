import { Suspense } from 'react';
import { serverFetch } from '@/lib/api/server-client';
import { TicketListClient } from './TicketListClient';
import { STATUS_LABELS } from '../../../lib/translations';
import Link from 'next/link';
import type { PaginatedTickets } from '../../../lib/api/tickets';

const STATUS_TOGGLE_COLORS: Record<string, string> = {
  OPEN: 'bg-status-open-bg text-status-open-text border-status-open-text/30',
  IN_PROGRESS: 'bg-status-progress-bg text-status-progress-text border-status-progress-text/30',
  PENDING: 'bg-status-pending-bg text-status-pending-text border-status-pending-text/30',
  RESOLVED: 'bg-status-resolved-bg text-status-resolved-text border-status-resolved-text/30',
  CLOSED: 'bg-status-closed-bg text-status-closed-text border-status-closed-text/30',
};

interface BilletsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BilletsPage({ searchParams }: BilletsPageProps) {
  const params = await searchParams;
  const page = String(params.page || '1');
  const limit = String(params.limit || '25');
  const sortBy = String(params.sortBy || 'createdAt');
  const sortOrder = String(params.sortOrder || 'desc');
  const search = params.search ? String(params.search) : undefined;
  const status = params.status ? String(params.status) : undefined;

  const queryParams: Record<string, string> = { page, limit, sortBy, sortOrder };
  if (search) queryParams.search = search;
  if (status) queryParams.status = status;

  const queryString = new URLSearchParams(queryParams).toString();
  const data = await serverFetch<PaginatedTickets>(`/tickets?${queryString}`);

  // Build URL helper for status toggle links
  function statusUrl(s?: string) {
    const p = new URLSearchParams();
    p.set('page', '1');
    p.set('limit', limit);
    p.set('sortBy', sortBy);
    p.set('sortOrder', sortOrder);
    if (search) p.set('search', search);
    if (s) p.set('status', s);
    return `/billets?${p.toString()}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-lg font-bold">Billets</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={<div className="h-8 w-48 bg-lumen-bg-tertiary rounded-lg animate-pulse" />}>
            <TicketListClient
              initialData={data}
              currentPage={Number(page)}
              currentLimit={Number(limit)}
              currentSortBy={sortBy}
              currentSortOrder={sortOrder as 'asc' | 'desc'}
              currentSearch={search || ''}
              currentStatus={status || ''}
            />
          </Suspense>
        </div>
      </div>

      {/* Status toggle buttons — RSC links */}
      <div className="flex items-center gap-1.5 mb-4">
        <Link
          href={statusUrl()}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            !status
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
          }`}
        >
          Tous
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={statusUrl(status === key ? undefined : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              status === key
                ? STATUS_TOGGLE_COLORS[key]
                : 'bg-lumen-bg-tertiary text-lumen-text-tertiary border-lumen-border-primary hover:text-lumen-text-secondary'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
