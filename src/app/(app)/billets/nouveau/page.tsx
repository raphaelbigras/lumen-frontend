'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../../../lib/api/tickets';
import { categoriesApi } from '../../../../lib/api/categories';
import { departmentsApi } from '../../../../lib/api/departments';
import { attachmentsApi } from '../../../../lib/api/attachments';
import { PRIORITY_LABELS } from '../../../../lib/translations';
import { Paperclip, X, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '../../../../components/CustomSelect';
import { createTicketSchema, MAX_FILE_SIZE } from '../../../../lib/schemas/ticket.schema';
import { mapZodErrors } from '../../../../lib/schemas/utils';

const SITES = ['Valleyfield', 'Beauharnois', 'Montréal', 'Brossard', 'Bromont', 'Hemmingford'];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function NouveauBilletPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [site, setSite] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60_000,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    staleTime: 5 * 60_000,
  });

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid: File[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" dépasse la limite de 10 Mo`);
        continue;
      }
      if (files.some((f) => f.name === file.name && f.size === file.size)) continue;
      valid.push(file);
    }
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  }, [files]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; categoryId: string; departmentId: string; site: string }) => {
      const ticket = await ticketsApi.create(data);

      if (files.length > 0) {
        setUploadProgress(`Téléversement des fichiers (0/${files.length})...`);
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Téléversement des fichiers (${i + 1}/${files.length})...`);
          await attachmentsApi.upload(ticket.id, files[i]);
        }
      }

      return ticket;
    },
    onSuccess: (data) => router.push(`/billets/${data.id}`),
    onError: (err: any) => {
      setUploadProgress(null);
      setError(err.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = createTicketSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId: categoryId || undefined,
      departmentId: departmentId || undefined,
      site: site || undefined,
    });

    if (!result.success) {
      setFieldErrors(mapZodErrors(result.error));
      return;
    }

    mutation.mutate(result.data);
  };

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
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Décrivez brièvement le problème..."
            className={`w-full bg-lumen-bg-secondary border rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary ${fieldErrors.title ? 'border-red-500/50' : 'border-lumen-border-primary'}`}
          />
          {fieldErrors.title && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Description *</label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fournissez les détails du problème, les étapes pour le reproduire..."
            className={`w-full bg-lumen-bg-secondary border rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none ${fieldErrors.description ? 'border-red-500/50' : 'border-lumen-border-primary'}`}
          />
          {fieldErrors.description && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Priorité</label>
            <CustomSelect
              value={priority}
              onChange={setPriority}
              options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Catégorie <span className="text-red-400">*</span></label>
            <CustomSelect
              value={categoryId}
              onChange={setCategoryId}
              options={categories?.map((c) => ({ value: c.id, label: c.name })) || []}
            />
            {fieldErrors.categoryId && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.categoryId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Département <span className="text-red-400">*</span></label>
            <CustomSelect
              value={departmentId}
              onChange={setDepartmentId}
              options={departments?.map((d) => ({ value: d.id, label: d.name })) || []}
            />
            {fieldErrors.departmentId && <p className="text-red-400 text-[11px] mt-1">{fieldErrors.departmentId}</p>}
          </div>
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Site (usine ou bureau) <span className="text-red-400">*</span></label>
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
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Pièces jointes</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              Glissez-déposez vos fichiers ici ou <span className="text-primary font-medium">parcourir</span>
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
            disabled={mutation.isPending}
            className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {uploadProgress || (mutation.isPending ? 'Création...' : 'Créer le billet')}
          </button>
          <Link href="/billets" className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
