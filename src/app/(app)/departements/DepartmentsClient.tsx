'use client';
import { useState, useTransition } from 'react';
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from './actions';
import { Plus, Trash2, Pencil } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  createdAt: string;
  _count?: { tickets: number };
}

export function DepartmentsClient({ departments }: { departments: Department[] }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const result = await createDepartmentAction(name.trim());
      if (result.error) { setError(result.error); return; }
      setError('');
      setNewName('');
      setCreating(false);
    });
  };

  const handleUpdate = (id: string, name: string) => {
    startTransition(async () => {
      const result = await updateDepartmentAction(id, name.trim());
      if (result.error) { setError(result.error); return; }
      setError('');
      setEditingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-lg font-bold">Départements</h1>
        <button
          onClick={() => { setCreating(true); setNewName(''); }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
        >
          <Plus size={14} /> Nouveau département
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-3">{error}</div>}

      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
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
                    autoFocus type="text" value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newName.trim()) handleCreate(newName);
                      if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                    }}
                    placeholder="Nom du département..."
                    className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => newName.trim() && handleCreate(newName)} disabled={!newName.trim()} className="text-xs text-primary hover:underline disabled:opacity-30 mr-2">Créer</button>
                  <button onClick={() => setCreating(false)} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">Annuler</button>
                </td>
              </tr>
            )}
            {departments.map((dep) => (
              <tr key={dep.id} className="hover:bg-lumen-hover">
                <td className="px-4 py-3">
                  {editingId === dep.id ? (
                    <input
                      autoFocus type="text" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editName.trim()) handleUpdate(editingId!, editName);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => editName.trim() && handleUpdate(editingId!, editName)}
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
                    <button onClick={() => { setEditingId(dep.id); setEditName(dep.name); }} className="text-lumen-text-tertiary hover:text-lumen-text-secondary" title="Modifier"><Pencil size={14} /></button>
                    <button
                      onClick={() => confirm(`Supprimer "${dep.name}" ?`) && startTransition(() => deleteDepartmentAction(dep.id))}
                      className="text-lumen-text-tertiary hover:text-red-400"
                      title="Supprimer"
                    ><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {departments.length === 0 && !creating && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-lumen-text-tertiary">Aucun département</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
