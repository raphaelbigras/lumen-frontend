'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, LogOut } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/billets': 'Billets',
  '/billets/nouveau': 'Nouveau billet',
  '/categories': 'Catégories',
  '/admin': 'Utilisateurs',
};

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const pageLabel = ROUTE_LABELS[pathname] || (pathname.startsWith('/billets/') ? 'Détail du billet' : '');

  return (
    <header className="h-12 border-b border-lumen-border-secondary bg-lumen-bg-secondary flex items-center justify-between px-5">
      <div className="text-xs text-lumen-text-tertiary">
        Accueil / <span className="text-lumen-text-primary">{pageLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-lumen-border-secondary border border-lumen-border-primary rounded-md px-3 py-1.5">
          <Search size={14} className="text-lumen-text-tertiary" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-xs text-lumen-text-secondary placeholder:text-lumen-text-tertiary outline-none w-40"
          />
        </div>
        <button className="relative text-lumen-text-tertiary hover:text-lumen-text-secondary">
          <Bell size={18} />
        </button>
        {user && (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {user.name?.charAt(0) || 'U'}
          </div>
        )}
        <button onClick={logout} title="Déconnexion" className="text-lumen-text-tertiary hover:text-red-400">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
