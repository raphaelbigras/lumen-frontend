'use client';
import { useState, useTransition } from 'react';
import { updateTicketAction } from './actions';
import { CustomSelect } from '../../../../components/CustomSelect';
import { PRIORITY_LABELS } from '../../../../lib/translations';
import { Gauge, Tag, Building2 } from 'lucide-react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface Option {
  id: string;
  name: string;
}

type FieldKey = 'priority' | 'categoryId' | 'departmentId';

interface PendingChange {
  field: FieldKey;
  label: string; // French title for the modal
  fromLabel: string;
  toLabel: string;
  toValue: string;
  icon: 'priority' | 'category' | 'department';
}

interface InlineFieldEditorsProps {
  ticketId: string;
  currentPriority: string;
  currentCategoryId?: string;
  currentDepartmentId?: string;
  categories: Option[];
  departments: Option[];
}

export function InlineFieldEditors({
  ticketId,
  currentPriority,
  currentCategoryId,
  currentDepartmentId,
  categories,
  departments,
}: InlineFieldEditorsProps) {
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState(currentPriority);
  const [categoryId, setCategoryId] = useState(currentCategoryId || '');
  const [departmentId, setDepartmentId] = useState(currentDepartmentId || '');
  const [pending, setPending] = useState<PendingChange | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || '—';
  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name || '—';

  const confirm = () => {
    if (!pending) return;
    const change = pending;
    setPending(null);
    startTransition(async () => {
      await updateTicketAction(ticketId, { [change.field]: change.toValue });
      // Sync local state after success
      if (change.field === 'priority') setPriority(change.toValue);
      if (change.field === 'categoryId') setCategoryId(change.toValue);
      if (change.field === 'departmentId') setDepartmentId(change.toValue);
    });
  };

  const ModalIcon =
    pending?.icon === 'priority' ? Gauge : pending?.icon === 'category' ? Tag : Building2;

  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] text-lumen-text-tertiary mb-1">Priorité</label>
          <CustomSelect
            value={priority}
            onChange={(val) => {
              if (!val || val === priority) return;
              setPending({
                field: 'priority',
                label: 'Changer la priorité',
                fromLabel: PRIORITY_LABELS[priority] || priority,
                toLabel: PRIORITY_LABELS[val] || val,
                toValue: val,
                icon: 'priority',
              });
            }}
            options={PRIORITIES.map((p) => ({
              value: p,
              label: PRIORITY_LABELS[p] || p,
            }))}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-[11px] text-lumen-text-tertiary mb-1">Catégorie</label>
          <CustomSelect
            value={categoryId}
            onChange={(val) => {
              if (!val || val === categoryId) return;
              setPending({
                field: 'categoryId',
                label: 'Changer la catégorie',
                fromLabel: categoryName(categoryId),
                toLabel: categoryName(val),
                toValue: val,
                icon: 'category',
              });
            }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-[11px] text-lumen-text-tertiary mb-1">Département</label>
          <CustomSelect
            value={departmentId}
            onChange={(val) => {
              if (!val || val === departmentId) return;
              setPending({
                field: 'departmentId',
                label: 'Changer le département',
                fromLabel: departmentName(departmentId),
                toLabel: departmentName(val),
                toValue: val,
                icon: 'department',
              });
            }}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            placeholder=""
          />
        </div>

        {isPending && (
          <p className="text-[10px] text-lumen-text-tertiary italic">Enregistrement…</p>
        )}
      </div>

      {pending && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setPending(null)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ModalIcon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-lumen-text-primary">{pending.label}</h3>
                <p className="text-xs text-lumen-text-tertiary mt-0.5">
                  Confirmer la modification du billet.
                </p>
              </div>
            </div>
            <p className="text-xs text-lumen-text-secondary mb-5">
              <span className="inline-block bg-lumen-bg-secondary px-2 py-1 rounded text-[11px] font-medium text-lumen-text-primary">
                {pending.fromLabel}
              </span>
              <span className="mx-2 text-lumen-text-tertiary">→</span>
              <span className="inline-block bg-primary/10 px-2 py-1 rounded text-[11px] font-medium text-primary">
                {pending.toLabel}
              </span>
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-lumen-text-secondary bg-lumen-bg-secondary border border-lumen-border-primary hover:text-lumen-text-primary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirm}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
