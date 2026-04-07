import { Suspense } from 'react';
import { serverFetch } from '@/lib/api/server-client';
import { TicketListClient } from './TicketListClient';
import type { PaginatedTickets } from '../../../lib/api/tickets';

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

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold">Billets</h1>
      </div>

      {/* Status toggle buttons — RSC links */}
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
  );
}
