'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ticketsApi } from '../../../lib/api/tickets';
import { commentsApi } from '../../../lib/api/comments';
import { Navbar } from '../../../components/Navbar';
import { TicketStatusBadge } from '../../../components/TicketStatusBadge';
import { useAuth } from '../../../contexts/AuthContext';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: () => ticketsApi.getById(params.id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ticketsApi.update(params.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', params.id] }),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => commentsApi.create(params.id, body),
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
    },
  });

  if (isLoading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-8 text-center text-gray-400">Loading...</div></div>;
  if (!ticket) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-8 text-center text-gray-400">Ticket not found</div></div>;

  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Activity</h2>
              <div className="space-y-4">
                {(ticket as any).comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-medium flex-shrink-0">
                      {comment.author.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                        <span className="text-gray-400 font-normal ml-2 text-xs">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{comment.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4">
                <textarea
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => commentBody.trim() && commentMutation.mutate(commentBody.trim())}
                  disabled={commentMutation.isPending || !commentBody.trim()}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                  {commentMutation.isPending ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Details</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Priority</dt>
                  <dd className="font-medium">{ticket.priority}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Submitter</dt>
                  <dd className="font-medium">{ticket.submitter.firstName} {ticket.submitter.lastName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            {canManage && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Actions</h3>
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">Change Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateMutation.mutate({ status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
