'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api/client';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  AGENT: 'Agent',
  USER: 'Utilisateur',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-500/15 text-purple-400',
  AGENT: 'bg-blue-500/15 text-blue-400',
  USER: 'bg-lumen-bg-tertiary text-lumen-text-secondary',
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/users/${userId}/role`, { role }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  // user.id from AuthContext is the Keycloak sub, match against keycloakId
  const isSelf = (u: any) => u.keycloakId === user?.id;

  return (
    <>
      <h1 className="text-2xl font-bold text-lumen-text-primary mb-6">Paramètres</h1>
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="p-4 border-b border-lumen-border-secondary">
          <h2 className="font-semibold text-lumen-text-primary">Gestion des utilisateurs</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-lumen-text-tertiary">Chargement...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-lumen-bg-tertiary text-xs text-lumen-text-tertiary uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Courriel</th>
                <th className="px-4 py-3 text-left">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lumen-border-secondary">
              {users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-lumen-hover">
                  <td className="px-4 py-3 text-sm font-medium text-lumen-text-primary">
                    {u.firstName} {u.lastName}
                    {isSelf(u) && <span className="text-[10px] text-lumen-text-tertiary ml-2">(vous)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-lumen-text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    {isSelf(u) ? (
                      <span className={`text-xs px-2 py-1 rounded ${ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES.USER}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                        className="text-xs bg-lumen-bg-tertiary border border-lumen-border-primary text-lumen-text-primary rounded px-2 py-1 outline-none cursor-pointer focus:border-primary"
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
