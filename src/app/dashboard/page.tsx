'use client';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../lib/api/tickets';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../../components/Navbar';
import { TicketStatusBadge } from '../../components/TicketStatusBadge';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.getAll(),
  });

  const stats = tickets
    ? {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <span className="text-gray-500">Welcome, {user?.name}</span>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'border-gray-300' },
              { label: 'Open', value: stats.open, color: 'border-blue-400' },
              { label: 'In Progress', value: stats.inProgress, color: 'border-yellow-400' },
              { label: 'Resolved', value: stats.resolved, color: 'border-green-400' },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-lg p-6 border-l-4 ${s.color} shadow-sm`}>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
            <Link href="/tickets" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets?.slice(0, 10).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${ticket.id}`} className="text-indigo-600 hover:underline font-medium">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{ticket.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
