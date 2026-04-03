'use client';
import { useActionState, useState, useRef, useCallback } from 'react';
import { createTicketAction, type CreateTicketState } from './actions';
import { CustomSelect } from '../../../../components/CustomSelect';
import { PRIORITY_LABELS } from '../../../../lib/translations';
import { Paperclip, X, Upload, ArrowLeft } from 'lucide-react';
import { attachmentsApi } from '../../../../lib/api/attachments';
import { ticketsApi } from '../../../../lib/api/tickets';
import { createTicketSchema, MAX_FILE_SIZE } from '../../../../lib/schemas/ticket.schema';
import { mapZodErrors } from '../../../../lib/schemas/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SITES = ['Valleyfield', 'Beauharnois', 'Montreal', 'Brossard', 'Bromont', 'Hemmingford'];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface CreateTicketFormProps {
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function CreateTicketForm({ categories, departments }: CreateTicketFormProps) {
  const router = useRouter();
  const [priority, setPriority] = useState('MEDIUM');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [site, setSite] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [clientError, setClientError] = useState('');
  const [clientFieldErrors, setClientFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const valid: File[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        setClientError(`"${file.name}" depasse la limite de 10 Mo`);
        continue;
      }
      if (files.some((f) => f.name === file.name && f.size === file.size)) continue;
      valid.push(file);
    }
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setClientFieldErrors({});

    const formEl = e.target as HTMLFormElement;
    const title = (formEl.elements.namedItem('title') as HTMLInputElement)?.value?.trim();
    const description = (formEl.elements.namedItem('description') as HTMLTextAreaElement)?.value?.trim();

    const data = {
      title,
      description,
      priority,
      categoryId: categoryId || undefined,
      departmentId: departmentId || undefined,
      site: site || undefined,
    };

    const result = createTicketSchema.safeParse(data);
    if (!result.success) {
      setClientFieldErrors(mapZodErrors(result.error));
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await ticketsApi.create(result.data);

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Televersement des fichiers (${i + 1}/${files.length})...`);
          await attachmentsApi.upload(ticket.id, files[i]);
        }
      }

      router.push(`/billets/${ticket.id}`);
    } catch (err: any) {
      setUploadProgress(null);
      setClientError(err.response?.data?.message || 'Erreur lors de la creation');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErrors = clientFieldErrors;
  const error = clientError;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Link href="/billets" className="flex items-center gap-2 text-xs text-lumen-text-secondary font-medium hover:text-primary transition-colors">
          <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all">
            <ArrowLeft size={14} />
          </span>
          Retour aux billets
        </Link>
        <h1 className="text-lg font-bold">Nouveau billet</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">{error}</div>
        )}

        <div>
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Titre *</label>
          <input
            type="text"
            name="title"
            maxLength={200}
            placeholder="Decrivez brievement le probleme..."
            className={`w-full bg-lumen-bg-secondary border rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary ${fieldErrors.title ? 'border-red-500/50' : 'border-lumen-border-primary'}`}
          />
          {fieldErrors.title && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Description *</label>
          <textarea
            rows={6}
            name="description"
            placeholder="Fournissez les details du probleme, les etapes pour le reproduire..."
            className={`w-full bg-lumen-bg-secondary border rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none ${fieldErrors.description ? 'border-red-500/50' : 'border-lumen-border-primary'}`}
          />
          {fieldErrors.description && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Priorité</label>
            <input type="hidden" name="priority" value={priority} />
            <CustomSelect
              value={priority}
              onChange={setPriority}
              options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Catégorie <span className="text-red-400">*</span></label>
            <input type="hidden" name="categoryId" value={categoryId} />
            <CustomSelect
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            {fieldErrors.categoryId && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.categoryId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Département <span className="text-red-400">*</span></label>
            <input type="hidden" name="departmentId" value={departmentId} />
            <CustomSelect
              value={departmentId}
              onChange={setDepartmentId}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
            {fieldErrors.departmentId && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.departmentId}</p>}
          </div>
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Site (usine ou bureau) <span className="text-red-400">*</span></label>
            <input type="hidden" name="site" value={site} />
            <CustomSelect
              value={site}
              onChange={setSite}
              options={SITES.map((s) => ({ value: s, label: s }))}
            />
            {fieldErrors.site && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.site}</p>}
          </div>
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Pieces jointes</label>
          <div
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-lumen-border-primary hover:border-lumen-text-tertiary bg-lumen-bg-secondary'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload size={20} className={`mx-auto mb-2 ${isDragOver ? 'text-primary' : 'text-lumen-text-tertiary'}`} />
            <p className="text-xs text-lumen-text-secondary">
              Glissez-deposez vos fichiers ici ou <span className="text-primary font-medium">parcourir</span>
            </p>
            <p className="text-[10px] text-lumen-text-tertiary mt-1">Maximum 10 Mo par fichier</p>
          </div>

          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-2 bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-xs"
                >
                  <Paperclip size={14} className="text-lumen-text-tertiary shrink-0" />
                  <span className="text-lumen-text-primary truncate flex-1">{file.name}</span>
                  <span className="text-lumen-text-tertiary shrink-0">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="text-lumen-text-tertiary hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {uploadProgress || (submitting ? 'Creation...' : 'Creer le billet')}
          </button>
          <Link href="/billets" className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
