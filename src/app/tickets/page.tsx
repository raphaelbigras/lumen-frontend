'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../lib/api/tickets';
import { Navbar } from '../../components/Navbar';
import { TicketStatusBadge } from '../../components/TicketStatusBadge';
import Link from 'next/link';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketsPage() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', status, priority],
    queryFn: () => ticketsApi.getAll({ ...(status && { status }), ...(priority && { priority }) }),
  });

  const filtered = tickets?.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <Link
            href="/tickets/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            New Ticket
          </Link>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p || 'All priorities'}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Submitter</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered?.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${ticket.id}`} className="text-indigo-600 hover:underline font-medium">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.priority}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ticket.submitter.firstName} {ticket.submitter.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No tickets found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
