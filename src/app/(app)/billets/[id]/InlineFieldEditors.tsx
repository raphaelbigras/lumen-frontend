'use client';
import { useState, useTransition } from 'react';
import { updateTicketAction } from './actions';
import { CustomSelect } from '../../../../components/CustomSelect';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../../../lib/translations';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface Option {
  id: string;
  name: string;
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

  const submit = (data: Record<string, string>) => {
    startTransition(async () => {
      await updateTicketAction(ticketId, data);
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] text-lumen-text-tertiary mb-1">Priorité</label>
        <CustomSelect
          value={priority}
          onChange={(val) => {
            if (!val || val === priority) return;
            setPriority(val);
            submit({ priority: val });
          }}
          options={PRIORITIES.map((p) => ({
            value: p,
            label: PRIORITY_LABELS[p] || p,
          }))}
          placeholder=""
        />
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-lumen-text-tertiary">
          <span className={`inline-block w-2 h-2 rounded-full ${PRIORITY_COLORS[priority]}`} />
          {PRIORITY_LABELS[priority] || priority}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-lumen-text-tertiary mb-1">Catégorie</label>
        <CustomSelect
          value={categoryId}
          onChange={(val) => {
            if (!val || val === categoryId) return;
            setCategoryId(val);
            submit({ categoryId: val });
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
            setDepartmentId(val);
            submit({ departmentId: val });
          }}
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          placeholder=""
        />
      </div>

      {isPending && (
        <p className="text-[10px] text-lumen-text-tertiary italic">Enregistrement…</p>
      )}
    </div>
  );
}
