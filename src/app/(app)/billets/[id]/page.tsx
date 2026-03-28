'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ticketsApi } from '../../../../lib/api/tickets';
import { commentsApi } from '../../../../lib/api/comments';
import { TicketStatusBadge } from '../../../../components/TicketStatusBadge';
import { useAuth } from '../../../../contexts/AuthContext';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../../../lib/translations';

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

  if (isLoading) return <div className="text-lumen-text-tertiary py-8 text-center">Chargement...</div>;
  if (!ticket) return <div className="text-lumen-text-tertiary py-8 text-center">Billet introuvable</div>;

  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-lg font-bold text-lumen-text-primary">{ticket.title}</h1>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-sm text-lumen-text-secondary whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <h2 className="font-semibold text-lumen-text-primary mb-4">Activité</h2>
            <div className="space-y-4">
              {(ticket as any).comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.author.firstName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-lumen-text-primary">
                      {comment.author.firstName} {comment.author.lastName}
                      <span className="text-lumen-text-tertiary font-normal ml-2 text-xs">
                        {new Date(comment.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </p>
                    <p className="text-sm text-lumen-text-secondary mt-1">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-lumen-border-secondary pt-4">
              <textarea
                rows={3}
                placeholder="Ajouter un commentaire..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
              />
              <button
                onClick={() => commentBody.trim() && commentMutation.mutate(commentBody.trim())}
                disabled={commentMutation.isPending || !commentBody.trim()}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg disabled:opacity-50 text-xs font-semibold"
              >
                {commentMutation.isPending ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-lumen-text-tertiary uppercase tracking-wider mb-3">Détails</h3>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-lumen-text-tertiary">Priorité</dt>
                <dd className="font-medium text-lumen-text-primary flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_COLORS[ticket.priority]}`} />
                  {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                </dd>
              </div>
              {ticket.category && (
                <div>
                  <dt className="text-lumen-text-tertiary">Catégorie</dt>
                  <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.category.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-lumen-text-tertiary">Soumis par</dt>
                <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.submitter.firstName} {ticket.submitter.lastName}</dd>
              </div>
              {ticket.department && (
                <div>
                  <dt className="text-lumen-text-tertiary">Département</dt>
                  <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.department.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-lumen-text-tertiary">Créé le</dt>
                <dd className="font-medium text-lumen-text-primary mt-0.5">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</dd>
              </div>
            </dl>
          </div>

          {canManage && (
            <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
              <h3 className="text-[11px] font-semibold text-lumen-text-tertiary uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                <label className="block text-xs text-lumen-text-tertiary">Changer le statut</label>
                <select
                  value={ticket.status}
                  onChange={(e) => updateMutation.mutate({ status: e.target.value })}
                  className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary outline-none focus:border-primary"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
