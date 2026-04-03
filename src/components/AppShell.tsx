'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}

export function AppShell({ children, userRole, userName }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex h-screen bg-lumen-bg-primary overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} userRole={userRole} />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? '64px' : '220px' }}
      >
        <Topbar userName={userName} />
        <main className="flex-1 overflow-auto p-5 bg-lumen-bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
