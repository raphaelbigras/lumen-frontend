'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../../../lib/api/tickets';
import { categoriesApi } from '../../../../lib/api/categories';
import { attachmentsApi } from '../../../../lib/api/attachments';
import { PRIORITY_LABELS } from '../../../../lib/translations';
import { Paperclip, X, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
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
    mutationFn: async (data: { title: string; description: string; priority: string; categoryId?: string }) => {
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
    mutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId: categoryId || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <Link href="/billets" className="flex items-center gap-2 text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary transition-colors">
          <span className="w-7 h-7 rounded-lg bg-lumen-bg-tertiary border border-lumen-border-primary flex items-center justify-center hover:border-lumen-text-tertiary transition-colors">
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
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Décrivez brièvement le problème..."
            className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs text-lumen-text-tertiary mb-1.5">Description *</label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fournissez les détails du problème, les étapes pour le reproduire..."
            className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary placeholder:text-lumen-text-tertiary outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Priorité</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary outline-none focus:border-primary"
            >
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-lumen-text-tertiary mb-1.5">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-lumen-bg-secondary border border-lumen-border-primary rounded-lg px-3 py-2 text-sm text-lumen-text-primary outline-none focus:border-primary"
            >
              <option value="">— Sélectionner —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
            disabled={mutation.isPending || !title.trim() || !description.trim()}
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
