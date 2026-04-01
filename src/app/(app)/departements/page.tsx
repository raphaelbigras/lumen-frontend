'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, Department } from '../../../lib/api/departments';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Pencil } from 'lucide-react';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (user && user.role === 'USER') router.replace('/dashboard');
  }, [user, router]);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
    enabled: user?.role !== 'USER',
  });

  const createMutation = useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setCreating(false);
      setNewName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => departmentsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: departmentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  const startEdit = (dep: Department) => {
    setEditingId(dep.id);
    setEditName(dep.name);
  };

  const handleCreate = () => {
    if (newName.trim()) createMutation.mutate({ name: newName.trim() });
  };

  const handleUpdate = () => {
    if (editingId && editName.trim()) updateMutation.mutate({ id: editingId, name: editName.trim() });
  };

  const handleDelete = (dep: Department) => {
    if (confirm(`Supprimer le département "${dep.name}" ?`)) {
      deleteMutation.mutate(dep.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Départements</h1>
        <button
          onClick={() => { setCreating(true); setNewName(''); }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
        >
          <Plus size={14} /> Nouveau département
        </button>
      </div>

      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        {isLoading ? (
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
              {creating && (
                <tr>
                  <td className="px-4 py-2" colSpan={3}>
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate();
                        if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                      }}
                      placeholder="Nom du département..."
                      className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={handleCreate} disabled={!newName.trim()} className="text-xs text-primary hover:underline disabled:opacity-30 mr-2">
                      Créer
                    </button>
                    <button onClick={() => setCreating(false)} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
                      Annuler
                    </button>
                  </td>
                </tr>
              )}
              {departments?.map((dep) => (
                <tr key={dep.id} className="hover:bg-lumen-hover">
                  <td className="px-4 py-3">
                    {editingId === dep.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={handleUpdate}
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
                      <button
                        onClick={() => startEdit(dep)}
                        className="text-lumen-text-tertiary hover:text-lumen-text-secondary"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(dep)}
                        className="text-lumen-text-tertiary hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments?.length === 0 && !creating && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-lumen-text-tertiary">Aucun département</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
