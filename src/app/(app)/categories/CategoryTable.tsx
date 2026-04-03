'use client';
import { useState, useTransition } from 'react';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from './actions';
import { Trash2, Pencil } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
  _count?: { tickets: number };
}

export function CategoryTable({ categories, creating, onCreateDone }: { categories: Category[]; creating: boolean; onCreateDone: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const result = await createCategoryAction(name.trim());
      if (result.error) { setError(result.error); return; }
      setError('');
      setNewName('');
      onCreateDone();
    });
  };

  const handleUpdate = (id: string, name: string) => {
    startTransition(async () => {
      const result = await updateCategoryAction(id, name.trim());
      if (result.error) { setError(result.error); return; }
      setError('');
      setEditingId(null);
    });
  };

  return (
    <>
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
                      if (e.key === 'Escape') { onCreateDone(); setNewName(''); }
                    }}
                    placeholder="Nom de la catégorie..."
                    className="bg-lumen-bg-secondary border border-lumen-border-primary rounded px-2 py-1 text-sm text-lumen-text-primary outline-none focus:border-primary w-64"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => newName.trim() && handleCreate(newName)} disabled={!newName.trim()} className="text-xs text-primary hover:underline disabled:opacity-30 mr-2">Créer</button>
                  <button onClick={() => { onCreateDone(); setNewName(''); }} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">Annuler</button>
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-lumen-hover">
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
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
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-lumen-text-tertiary hover:text-lumen-text-secondary" title="Modifier"><Pencil size={14} /></button>
                    <button
                      onClick={() => confirm(`Supprimer "${cat.name}" ?`) && startTransition(() => deleteCategoryAction(cat.id))}
                      disabled={cat.isDefault}
                      className="text-lumen-text-tertiary hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Supprimer"
                    ><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !creating && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-lumen-text-tertiary">Aucune catégorie</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
