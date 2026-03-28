'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Ticket, FolderOpen, Users, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['ADMIN', 'AGENT', 'USER'] },
  { href: '/billets', icon: Ticket, label: 'Billets', roles: ['ADMIN', 'AGENT', 'USER'] },
  { href: '/categories', icon: FolderOpen, label: 'Catégories', roles: ['ADMIN', 'AGENT'] },
  { href: '/admin', icon: Users, label: 'Utilisateurs', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 bg-lumen-bg-sidebar border-r border-lumen-border-secondary flex flex-col items-center py-3 gap-1 z-50">
      <Link href="/dashboard" className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold text-sm mb-3">
        L
      </Link>
      {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-lumen-border-primary text-purple-400'
                : 'text-lumen-text-tertiary hover:text-lumen-text-secondary'
            }`}
          >
            <item.icon size={18} />
          </Link>
        );
      })}
      <div className="flex-1" />
      <button title="Paramètres" className="w-9 h-9 rounded-lg flex items-center justify-center text-lumen-text-tertiary hover:text-lumen-text-secondary transition-colors">
        <Settings size={18} />
      </button>
    </aside>
  );
}
