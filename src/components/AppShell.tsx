'use client';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-lumen-bg-primary">
        <div className="text-lumen-text-tertiary">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-lumen-bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-[220px]">
        <Topbar />
        <main className="flex-1 overflow-auto p-5 bg-lumen-bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
