'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api/client';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-lumen-text-primary mb-6">Administration</h1>
      <div className="bg-lumen-bg-secondary rounded-lg border border-lumen-border-secondary">
        <div className="p-4 border-b border-lumen-border-secondary">
          <h2 className="font-semibold text-lumen-text-primary">Utilisateurs</h2>
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
                  <td className="px-4 py-3 text-sm font-medium text-lumen-text-primary">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-sm text-lumen-text-secondary">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-lumen-bg-tertiary text-lumen-text-secondary px-2 py-1 rounded">{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
