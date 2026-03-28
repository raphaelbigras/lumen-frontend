'use client';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../lib/translations';
import { X } from 'lucide-react';

interface FilterBarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  categories: { id: string; name: string }[];
}

export function FilterBar({ filters, onFilterChange, onClearAll, categories }: FilterBarProps) {
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary outline-none"
        >
          <option value="">Statut</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary outline-none"
        >
          <option value="">Priorité</option>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filters.categoryId || ''}
          onChange={(e) => onFilterChange('categoryId', e.target.value)}
          className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary outline-none"
        >
          <option value="">Catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {activeFilters.length > 0 && (
          <button onClick={onClearAll} className="text-xs text-lumen-text-tertiary hover:text-lumen-text-secondary">
            Effacer tout
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeFilters.map(([key, value]) => {
            const label = key === 'status' ? STATUS_LABELS[value] : key === 'priority' ? PRIORITY_LABELS[value] : categories.find(c => c.id === value)?.name || value;
            return (
              <span key={key} className="inline-flex items-center gap-1 bg-lumen-border-primary text-lumen-text-secondary text-[10px] px-2 py-0.5 rounded">
                {label}
                <button onClick={() => onFilterChange(key, '')} className="hover:text-lumen-text-primary">
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
