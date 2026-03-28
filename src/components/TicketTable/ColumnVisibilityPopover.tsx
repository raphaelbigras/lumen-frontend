'use client';
import { useState, useRef, useEffect } from 'react';
import { Columns } from 'lucide-react';

interface ColumnVisibilityPopoverProps {
  columns: { id: string; label: string }[];
  visibleColumns: string[];
  onToggle: (id: string) => void;
}

export function ColumnVisibilityPopover({ columns, visibleColumns, onToggle }: ColumnVisibilityPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg px-3 py-1.5 text-xs text-lumen-text-secondary hover:text-lumen-text-primary"
      >
        <Columns size={14} />
        Colonnes
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-lumen-bg-tertiary border border-lumen-border-primary rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
          {columns.map((col) => (
            <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-lumen-hover cursor-pointer text-xs text-lumen-text-secondary">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.id)}
                onChange={() => onToggle(col.id)}
                className="rounded border-lumen-border-primary"
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
