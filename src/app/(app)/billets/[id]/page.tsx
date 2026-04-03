import { auth } from '@/lib/auth';
import { serverFetch } from '@/lib/api/server-client';
import { TicketStatusBadge } from '../../../../components/TicketStatusBadge';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../../../lib/translations';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CommentForm } from './CommentForm';
import { StatusChanger } from './StatusChanger';
import { AttachmentSection } from './AttachmentSection';
import { CloseTicketButton, ReopenTicketButton } from './TicketModals';
import { HistoryButton } from './HistoryButton';
import { notFound } from 'next/navigation';
import type { Ticket } from '../../../../lib/api/tickets';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const userRole = session?.user?.role || 'USER';
  const userId = session?.user?.id;

  let ticket: any;
  try {
    ticket = await serverFetch<Ticket>(`/tickets/${id}`);
  } catch {
    notFound();
  }

  const canManage = userRole === 'ADMIN' || userRole === 'AGENT';
  const isSubmitter = userId === ticket.submitter?.keycloakId;
  const canClose = isSubmitter && !['CLOSED', 'RESOLVED'].includes(ticket.status);
  const canReopen = isSubmitter && ['CLOSED', 'RESOLVED'].includes(ticket.status);
  const attachments = ticket.attachments?.filter((a: any) => !a.deletedAt) || [];

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/billets" className="inline-flex items-center gap-2 text-xs text-lumen-text-secondary font-medium hover:text-primary transition-colors mb-4">
        <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all">
          <ArrowLeft size={14} />
        </span>
        Retour aux billets
      </Link>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Ticket header */}
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-lg font-bold text-lumen-text-primary">
                <span className="text-primary">#{ticket.ticketNumber}</span> — {ticket.title}
              </h1>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-sm text-lumen-text-secondary whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          <AttachmentSection ticketId={id} attachments={attachments} canManage={canManage} />

          {/* Comments */}
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <h2 className="font-semibold text-lumen-text-primary mb-4">Activite</h2>
            <div className="space-y-4">
              {ticket.comments?.map((comment: any) => (
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
            <CommentForm ticketId={id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-lumen-text-tertiary uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-lumen-text-tertiary">Priorite</dt>
                <dd className="font-medium text-lumen-text-primary flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_COLORS[ticket.priority]}`} />
                  {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                </dd>
              </div>
              {ticket.category && (
                <div>
                  <dt className="text-lumen-text-tertiary">Categorie</dt>
                  <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.category.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-lumen-text-tertiary">Soumis par</dt>
                <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.submitter.firstName} {ticket.submitter.lastName}</dd>
              </div>
              {ticket.department && (
                <div>
                  <dt className="text-lumen-text-tertiary">Departement</dt>
                  <dd className="font-medium text-lumen-text-primary mt-0.5">{ticket.department.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-lumen-text-tertiary">Cree le</dt>
                <dd className="font-medium text-lumen-text-primary mt-0.5">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</dd>
              </div>
              <div className="pt-2 mt-2 border-t border-lumen-border-secondary">
                <HistoryButton ticketId={id} />
              </div>
            </dl>
          </div>

          {(canManage || canClose || canReopen) && (
            <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
              <h3 className="text-[11px] font-semibold text-lumen-text-tertiary uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-3">
                {canManage && <StatusChanger ticketId={id} currentStatus={ticket.status} />}
                {canClose && <CloseTicketButton ticketId={id} />}
                {canReopen && <ReopenTicketButton ticketId={id} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
