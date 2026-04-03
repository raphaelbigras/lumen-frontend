'use client';
import Link from 'next/link';
import { LayoutDashboard, Ticket, SlidersHorizontal, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarNavLink } from './SidebarNavLink';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['ADMIN', 'AGENT', 'USER'], color: 'from-blue-500/20 to-blue-600/10 text-blue-400', activeGlow: 'shadow-blue-500/10' },
  { href: '/billets', icon: Ticket, label: 'Billets', roles: ['ADMIN', 'AGENT', 'USER'], color: 'from-violet-500/20 to-purple-600/10 text-violet-400', activeGlow: 'shadow-violet-500/10' },
  { href: '/categories', icon: SlidersHorizontal, label: 'Champs personnalises', roles: ['ADMIN', 'AGENT'], color: 'from-amber-500/20 to-orange-600/10 text-amber-400', activeGlow: 'shadow-amber-500/10' },
];

const ADMIN_ITEM = { href: '/admin', icon: Settings, label: 'Parametres', color: 'from-slate-400/20 to-slate-500/10 text-slate-400', activeGlow: 'shadow-slate-400/10' };

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole: string;
}

export function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-lumen-bg-sidebar border-r border-lumen-border-secondary flex flex-col py-4 px-3 z-50 transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? '64px' : '220px' }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className={`flex items-center justify-center gap-3 mb-6 group ${collapsed ? '' : 'px-2'}`}
      >
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-blue-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/60 group-hover:scale-105 transition-all duration-300 shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-blue-500 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300" />
          <span className="relative text-white font-black text-lg" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>L</span>
        </div>
        {!collapsed && (
          <div className="relative overflow-hidden">
            <span
              className="absolute inset-0 text-[17px] font-black tracking-wider text-primary blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
              aria-hidden="true"
            >
              LUMEN
            </span>
            <span
              className="relative text-[17px] font-black tracking-wider bg-gradient-to-r from-white via-blue-200 to-primary bg-clip-text text-transparent group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-300 transition-all duration-300"
              style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
            >
              LUMEN
            </span>
          </div>
        )}
      </Link>

      {!collapsed && (
        <div className="text-[10px] font-semibold uppercase tracking-widest text-lumen-text-tertiary/60 px-3 mb-2">Navigation</div>
      )}

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.filter((item) => item.roles.includes(userRole)).map((item) => (
          <SidebarNavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="flex-1" />

      {userRole === 'ADMIN' && (
        <div className="border-t border-lumen-border-secondary pt-3 mt-3">
          <SidebarNavLink {...ADMIN_ITEM} collapsed={collapsed} />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="mt-3 flex items-center justify-center w-full py-2 rounded-xl text-lumen-text-tertiary hover:text-lumen-text-primary hover:bg-white/[0.03] transition-all duration-200"
        title={collapsed ? 'Agrandir' : 'Reduire'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
