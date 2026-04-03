import { auth } from '@/lib/auth';
import { serverFetch } from '@/lib/api/server-client';
import { RoleSelector } from './RoleSelector';

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

export default async function AdminPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const users = await serverFetch<any[]>('/users');

  return (
    <>
      <h1 className="text-2xl font-bold text-lumen-text-primary mb-6">Paramètres</h1>
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="p-4 border-b border-lumen-border-secondary">
          <h2 className="font-semibold text-lumen-text-primary">Gestion des utilisateurs</h2>
        </div>
        <table className="w-full">
          <thead className="bg-lumen-bg-tertiary text-xs text-lumen-text-tertiary uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Courriel</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lumen-border-secondary">
            {users.map((u: any) => {
              const isSelf = u.keycloakId === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-lumen-hover">
                  <td className="px-4 py-3 text-sm font-medium text-lumen-text-primary">
                    {u.firstName} {u.lastName}
                    {isSelf && <span className="text-[10px] text-lumen-text-tertiary ml-2">(vous)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-lumen-text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className={`text-xs px-2 py-1 rounded ${ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES.USER}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    ) : (
                      <RoleSelector userId={u.id} currentRole={u.role} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
