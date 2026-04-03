'use client';
import { useTransition } from 'react';
import { updateUserRoleAction } from './actions';
import { CustomSelect } from '../../../components/CustomSelect';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  AGENT: 'Agent',
  USER: 'Utilisateur',
};

export function RoleSelector({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <CustomSelect
      value={currentRole}
      onChange={(val) => {
        startTransition(() => updateUserRoleAction(userId, val));
      }}
      options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
      placeholder=""
    />
  );
}
