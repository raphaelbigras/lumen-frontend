'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CategoryTable } from './CategoryTable';
import { DepartmentTable } from './DepartmentTable';
import { Plus } from 'lucide-react';

interface CustomFieldsClientProps {
  categories: any[];
  departments: any[];
  initialTab: string;
}

export function CustomFieldsClient({ categories, departments, initialTab }: CustomFieldsClientProps) {
  const router = useRouter();
  const tab = initialTab === 'departments' ? 'departments' : 'categories';
  const [creating, setCreating] = useState(false);

  const switchTab = (t: string) => {
    setCreating(false);
    router.push(`/categories?tab=${t}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold">Champs personnalisés</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
        >
          <Plus size={14} /> {tab === 'categories' ? 'Nouvelle catégorie' : 'Nouveau département'}
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg p-1 w-fit">
        <button
          onClick={() => switchTab('categories')}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'categories' ? 'bg-primary text-white shadow-sm' : 'text-lumen-text-secondary hover:text-lumen-text-primary'}`}
        >
          Catégories {categories && <span className="ml-1 opacity-60">({categories.length})</span>}
        </button>
        <button
          onClick={() => switchTab('departments')}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'departments' ? 'bg-primary text-white shadow-sm' : 'text-lumen-text-secondary hover:text-lumen-text-primary'}`}
        >
          Départements {departments && <span className="ml-1 opacity-60">({departments.length})</span>}
        </button>
      </div>

      {tab === 'categories' && (
        <CategoryTable categories={categories} creating={creating} onCreateDone={() => setCreating(false)} />
      )}
      {tab === 'departments' && (
        <DepartmentTable departments={departments} creating={creating} onCreateDone={() => setCreating(false)} />
      )}
    </div>
  );
}
