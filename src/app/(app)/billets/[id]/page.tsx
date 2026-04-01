'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ticketsApi } from '../../../../lib/api/tickets';
import { commentsApi } from '../../../../lib/api/comments';
import { attachmentsApi } from '../../../../lib/api/attachments';
import { TicketStatusBadge } from '../../../../components/TicketStatusBadge';
import { useAuth } from '../../../../contexts/AuthContext';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../../../lib/translations';
import { Paperclip, Download, Trash2, Upload, FileText, Image, File, CheckCircle2, X, History, ArrowLeft, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CustomSelect } from '../../../../components/CustomSelect';
import Link from 'next/link';

const TicketHistoryPanel = dynamic(() => import('../../../../components/TicketHistoryPanel').then(m => ({ default: m.TicketHistoryPanel })), { ssr: false });

const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: () => ticketsApi.getById(params.id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ticketsApi.update(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => commentsApi.create(params.id, body),
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => attachmentsApi.delete(params.id, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (reason: string) => {
      await commentsApi.create(params.id, `Résolu par le demandeur : ${reason}`);
      return ticketsApi.update(params.id, { status: 'CLOSED' } as any);
    },
    onSuccess: () => {
      setShowCloseModal(false);
      setCloseReason('');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: async (reason: string) => {
      await commentsApi.create(params.id, `Billet réouvert par le demandeur : ${reason}`);
      return ticketsApi.update(params.id, { status: 'OPEN' } as any);
    },
    onSuccess: () => {
      setShowReopenModal(false);
      setReopenReason('');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    },
  });

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) continue;
        await attachmentsApi.upload(params.id, file);
      }
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-events', params.id] });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId: string) => {
    const { url } = await attachmentsApi.getDownloadUrlForTicket(params.id, attachmentId);
    window.open(url, '_blank');
  };

  if (isLoading) return <div className="text-lumen-text-tertiary py-8 text-center">Chargement...</div>;
  if (!ticket) return <div className="text-lumen-text-tertiary py-8 text-center">Billet introuvable</div>;

  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const isSubmitter = user?.id === (ticket.submitter as any).keycloakId;
  const canClose = isSubmitter && !['CLOSED', 'RESOLVED'].includes(ticket.status);
  const canReopen = isSubmitter && ['CLOSED', 'RESOLVED'].includes(ticket.status);
  const attachments = (ticket as any).attachments?.filter((a: any) => !a.deletedAt) || [];

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

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
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-lg font-bold text-lumen-text-primary">{ticket.title}</h1>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-sm text-lumen-text-secondary whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lumen-text-primary flex items-center gap-2">
                <Paperclip size={16} className="text-lumen-text-tertiary" />
                Pièces jointes
                {attachments.length > 0 && (
                  <span className="text-[10px] bg-lumen-bg-secondary border border-lumen-border-primary rounded-full px-2 py-0.5 text-lumen-text-tertiary font-normal">
                    {attachments.length}
                  </span>
                )}
              </h2>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {attachments.map((att: any) => {
                  const Icon = getFileIcon(att.mimeType);
                  return (
                    <div key={att.id} className="flex items-center gap-2.5 bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2.5 group">
                      <Icon size={16} className="text-lumen-text-tertiary shrink-0" />
                      <span className="text-xs text-lumen-text-primary truncate flex-1">{att.filename}</span>
                      <span className="text-[10px] text-lumen-text-tertiary shrink-0">{formatSize(att.size)}</span>
                      <button
                        onClick={() => handleDownload(att.id)}
                        className="text-lumen-text-tertiary hover:text-primary transition-colors shrink-0"
                        title="Télécharger"
                      >
                        <Download size={14} />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => deleteMutation.mutate(att.id)}
                          className="text-lumen-text-tertiary hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files; if (f?.length) handleFileUpload(f); }; input.click(); }}
              className={`border-2 border-dashed rounded-lg px-4 py-4 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-lumen-border-primary hover:border-lumen-text-tertiary bg-lumen-bg-secondary'
              }`}
            >
              <Upload size={16} className={`mx-auto mb-1.5 ${isDragOver ? 'text-primary' : 'text-lumen-text-tertiary'}`} />
              <p className="text-xs text-lumen-text-secondary">
                {uploading ? 'Téléversement...' : <>Glissez vos fichiers ou <span className="text-primary font-medium">parcourir</span></>}
              </p>
              <p className="text-[10px] text-lumen-text-tertiary mt-0.5">Max 10 Mo par fichier</p>
            </div>
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
                <div className="pt-2 mt-2 border-t border-lumen-border-secondary">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="w-full flex items-center justify-center gap-2 bg-lumen-bg-secondary border border-lumen-border-primary px-3 py-2 rounded-lg text-xs font-medium text-lumen-text-secondary hover:text-lumen-text-primary hover:border-primary transition-colors"
                  >
                    <History size={14} />
                    Historique du billet
                  </button>
                </div>
            </dl>
          </div>

          {(canManage || canClose || canReopen) && (
            <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
              <h3 className="text-[11px] font-semibold text-lumen-text-tertiary uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-3">
                {canManage && (
                  <div>
                    <label className="block text-xs text-lumen-text-tertiary mb-1">Changer le statut</label>
                    <CustomSelect
                      value={ticket.status}
                      onChange={(val) => updateMutation.mutate({ status: val })}
                      options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] || s }))}
                      placeholder=""
                    />
                  </div>
                )}
                {canClose && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-status-resolved-bg text-status-resolved-text border border-status-resolved-text/20 px-3 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    J&apos;ai trouvé une solution
                  </button>
                )}
                {canReopen && (
                  <button
                    onClick={() => setShowReopenModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-status-open-bg text-status-open-text border border-status-open-text/20 px-3 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    <RotateCcw size={14} />
                    Réouvrir le billet
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close ticket modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCloseModal(false)}>
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-lumen-text-primary">Fermer le billet</h3>
              <button onClick={() => setShowCloseModal(false)} className="text-lumen-text-tertiary hover:text-lumen-text-secondary">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-3">Décrivez brièvement comment vous avez résolu le problème.</p>
            <textarea
              rows={3}
              autoFocus
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Ex: Redémarrage du service, mise à jour du pilote..."
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => closeReason.trim() && closeMutation.mutate(closeReason.trim())}
                disabled={closeMutation.isPending || !closeReason.trim()}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {closeMutation.isPending ? 'Fermeture...' : 'Fermer le billet'}
              </button>
            </div>
          </div>
        </div>
      )}

        {showHistory && (
          <TicketHistoryPanel ticketId={params.id} onClose={() => setShowHistory(false)} />
        )}

      {/* Reopen ticket modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowReopenModal(false)}>
          <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-lumen-text-primary">Réouvrir le billet</h3>
              <button onClick={() => setShowReopenModal(false)} className="text-lumen-text-tertiary hover:text-lumen-text-secondary">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-3">Décrivez pourquoi vous souhaitez réouvrir ce billet.</p>
            <textarea
              rows={3}
              autoFocus
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Ex: Le problème persiste, nouvelle erreur apparue..."
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => reopenReason.trim() && reopenMutation.mutate(reopenReason.trim())}
                disabled={reopenMutation.isPending || !reopenReason.trim()}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {reopenMutation.isPending ? 'Réouverture...' : 'Réouvrir le billet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
