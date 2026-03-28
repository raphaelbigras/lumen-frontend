'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../../../lib/api/tickets';
import { categoriesApi } from '../../../../lib/api/categories';
import { PRIORITY_LABELS } from '../../../../lib/translations';
import Link from 'next/link';

export default function NouveauBilletPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const mutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: (data) => router.push(`/billets/${data.id}`),
    onError: (err: any) => setError(err.response?.data?.message || 'Erreur lors de la création'),
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
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Nouveau billet</h1>
        <Link href="/billets" className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
          &larr; Retour aux billets
        </Link>
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

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending || !title.trim() || !description.trim()}
            className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {mutation.isPending ? 'Création...' : 'Créer le billet'}
          </button>
          <Link href="/billets" className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
