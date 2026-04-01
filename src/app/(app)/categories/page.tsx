'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, Category } from '../../../lib/api/categories';
import { departmentsApi, Department } from '../../../lib/api/departments';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Pencil } from 'lucide-react';

export default function CustomFieldsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'categories' | 'departments'>('categories');

  // Categories state
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [catCreating, setCatCreating] = useState(false);
  const [catNewName, setCatNewName] = useState('');

  // Departments state
  const [depEditingId, setDepEditingId] = useState<string | null>(null);
  const [depEditName, setDepEditName] = useState('');
  const [depCreating, setDepCreating] = useState(false);
  const [depNewName, setDepNewName] = useState('');

  useEffect(() => {
    if (user && user.role === 'USER') router.replace('/dashboard');
  }, [user, router]);

  // Categories queries
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    enabled: user?.role !== 'USER',
  });

  const catCreateMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setCatCreating(false); setCatNewName(''); },
  });

  const catUpdateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoriesApi.update(id, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setCatEditingId(null); },
  });

  const catDeleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // Departments queries
  const { data: departments, isLoading: depLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    enabled: user?.role !== 'USER',
  });

  const depCreateMutation = useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setDepCreating(false); setDepNewName(''); },
  });

  const depUpdateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => departmentsApi.update(id, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setDepEditingId(null); },
  });

  const depDeleteMutation = useMutation({
    mutationFn: departmentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Champs personnalisés</h1>
        <button
          onClick={() => tab === 'categories' ? (setCatCreating(true), setCatNewName('')) : (setDepCreating(true), setDepNewName(''))}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
        >
          <Plus size={14} /> {tab === 'categories' ? 'Nouvelle catégorie' : 'Nouveau département'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('categories')}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'categories' ? 'bg-primary text-white shadow-sm' : 'text-lumen-text-secondary hover:text-lumen-text-primary'}`}
        >
          Catégories {categories && <span className="ml-1 opacity-60">({categories.length})</span>}
        </button>
        <button
          onClick={() => setTab('departments')}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'departments' ? 'bg-primary text-white shadow-sm' : 'text-lumen-text-secondary hover:text-lumen-text-primary'}`}
        >
          Départements {departments && <span className="ml-1 opacity-60">({departments.length})</span>}
        </button>
      </div>

      {/* Categories Table */}
      {tab === 'categories' && (
        <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
          {catLoading ? (
            <div className="p-8 text-center text-lumen-text-tertiary">Chargement...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-lumen-bg-tertiary text-[11px] text-lumen-text-tertiary uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Billets</th>
                  <th className="px-4 py-3 text-left">Créé le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lumen-border-secondary">
                {catCreating && (
                  <tr>
                    <td className="px-4 py-2" colSpan={3}>
                      <input
                        autoFocus
                        type="text"
                        value={catNewName}
                        onChange={(e) => setCatNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && catNewName.trim()) catCreateMutation.mutate({ name: catNewName.trim() });
                          if (e.key === 'Escape') { setCatCreating(false); setCatNewName(''); }
                        }}
                        placeholder="Nom de la catégorie..."
                        className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => catNewName.trim() && catCreateMutation.mutate({ name: catNewName.trim() })} disabled={!catNewName.trim()} className="text-xs text-primary hover:underline disabled:opacity-30 mr-2">Créer</button>
                      <button onClick={() => setCatCreating(false)} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">Annuler</button>
                    </td>
                  </tr>
                )}
                {categories?.map((cat) => (
                  <tr key={cat.id} className="hover:bg-lumen-hover">
                    <td className="px-4 py-3">
                      {catEditingId === cat.id ? (
                        <input
                          autoFocus type="text" value={catEditName}
                          onChange={(e) => setCatEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && catEditName.trim()) catUpdateMutation.mutate({ id: catEditingId!, name: catEditName.trim() });
                            if (e.key === 'Escape') setCatEditingId(null);
                          }}
                          onBlur={() => catEditName.trim() && catUpdateMutation.mutate({ id: catEditingId!, name: catEditName.trim() })}
                          className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-lumen-text-primary">{cat.name}</span>
                          {cat.isDefault && <span className="text-[10px] bg-lumen-bg-tertiary text-lumen-text-tertiary px-1.5 py-0.5 rounded">défaut</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-lumen-text-secondary">{cat._count?.tickets ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-lumen-text-tertiary">{new Date(cat.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setCatEditingId(cat.id); setCatEditName(cat.name); }} className="text-lumen-text-tertiary hover:text-lumen-text-secondary" title="Modifier"><Pencil size={14} /></button>
                        <button onClick={() => confirm(`Supprimer "${cat.name}" ?`) && catDeleteMutation.mutate(cat.id)} disabled={cat.isDefault} className="text-lumen-text-tertiary hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed" title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories?.length === 0 && !catCreating && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-lumen-text-tertiary">Aucune catégorie</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Departments Table */}
      {tab === 'departments' && (
        <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
          {depLoading ? (
            <div className="p-8 text-center text-lumen-text-tertiary">Chargement...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-lumen-bg-tertiary text-[11px] text-lumen-text-tertiary uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Billets</th>
                  <th className="px-4 py-3 text-left">Créé le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lumen-border-secondary">
                {depCreating && (
                  <tr>
                    <td className="px-4 py-2" colSpan={3}>
                      <input
                        autoFocus type="text" value={depNewName}
                        onChange={(e) => setDepNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && depNewName.trim()) depCreateMutation.mutate({ name: depNewName.trim() });
                          if (e.key === 'Escape') { setDepCreating(false); setDepNewName(''); }
                        }}
                        placeholder="Nom du département..."
                        className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => depNewName.trim() && depCreateMutation.mutate({ name: depNewName.trim() })} disabled={!depNewName.trim()} className="text-xs text-primary hover:underline disabled:opacity-30 mr-2">Créer</button>
                      <button onClick={() => setDepCreating(false)} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">Annuler</button>
                    </td>
                  </tr>
                )}
                {departments?.map((dep) => (
                  <tr key={dep.id} className="hover:bg-lumen-hover">
                    <td className="px-4 py-3">
                      {depEditingId === dep.id ? (
                        <input
                          autoFocus type="text" value={depEditName}
                          onChange={(e) => setDepEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && depEditName.trim()) depUpdateMutation.mutate({ id: depEditingId!, name: depEditName.trim() });
                            if (e.key === 'Escape') setDepEditingId(null);
                          }}
                          onBlur={() => depEditName.trim() && depUpdateMutation.mutate({ id: depEditingId!, name: depEditName.trim() })}
                          className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                        />
                      ) : (
                        <span className="text-sm font-medium text-lumen-text-primary">{dep.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-lumen-text-secondary">{dep._count?.tickets ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-lumen-text-tertiary">{new Date(dep.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setDepEditingId(dep.id); setDepEditName(dep.name); }} className="text-lumen-text-tertiary hover:text-lumen-text-secondary" title="Modifier"><Pencil size={14} /></button>
                        <button onClick={() => confirm(`Supprimer "${dep.name}" ?`) && depDeleteMutation.mutate(dep.id)} className="text-lumen-text-tertiary hover:text-red-400" title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments?.length === 0 && !depCreating && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-lumen-text-tertiary">Aucun département</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
