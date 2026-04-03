'use client';
import { useState, useTransition } from 'react';
import { deleteAttachmentAction } from './actions';
import { attachmentsApi } from '../../../../lib/api/attachments';
import { Paperclip, Download, Trash2, Upload, FileText, Image, File } from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  deletedAt?: string | null;
}

interface AttachmentSectionProps {
  ticketId: string;
  attachments: Attachment[];
  canManage: boolean;
  userRole: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function AttachmentSection({ ticketId, attachments, canManage, userRole }: AttachmentSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = attachments.filter((a) => !a.deletedAt);

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) continue;
        await attachmentsApi.upload(ticketId, file);
      }
      window.location.reload();
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId: string) => {
    const { url } = await attachmentsApi.getDownloadUrlForTicket(ticketId, attachmentId);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lumen-text-primary flex items-center gap-2">
          <Paperclip size={16} className="text-lumen-text-tertiary" />
          Pieces jointes
          {filtered.length > 0 && (
            <span className="text-[10px] bg-lumen-bg-secondary border border-lumen-border-primary rounded-full px-2 py-0.5 text-lumen-text-tertiary font-normal">
              {filtered.length}
            </span>
          )}
        </h2>
      </div>

      {filtered.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {filtered.map((att) => {
            const Icon = getFileIcon(att.mimeType);
            return (
              <div key={att.id} className="flex items-center gap-2.5 bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2.5 group">
                <Icon size={16} className="text-lumen-text-tertiary shrink-0" />
                <span className="text-xs text-lumen-text-primary truncate flex-1">{att.filename}</span>
                <span className="text-[10px] text-lumen-text-tertiary shrink-0">{formatSize(att.size)}</span>
                <button
                  onClick={() => handleDownload(att.id)}
                  className="px-2 py-1.5 rounded-md text-lumen-text-tertiary hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                  title="Télécharger"
                >
                  <Download size={14} />
                </button>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => confirm('Supprimer cette pièce jointe ?') && startTransition(() => deleteAttachmentAction(ticketId, att.id))}
                    className="px-2 py-1.5 rounded-md text-lumen-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100 ml-1"
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
          {uploading ? 'Televersement...' : <>Glissez vos fichiers ou <span className="text-primary font-medium">parcourir</span></>}
        </p>
        <p className="text-[10px] text-lumen-text-tertiary mt-0.5">Max 10 Mo par fichier</p>
      </div>
    </div>
  );
}
