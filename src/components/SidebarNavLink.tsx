'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  color: string;
  activeGlow: string;
  collapsed: boolean;
}

export function SidebarNavLink({ href, icon: Icon, label, color, activeGlow, collapsed }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? `bg-gradient-to-r ${color} shadow-lg ${activeGlow}`
          : 'text-lumen-text-tertiary hover:text-lumen-text-primary hover:bg-white/[0.03]'
      }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0 ${
        isActive
          ? `bg-gradient-to-br ${color} shadow-md ${activeGlow}`
          : 'text-lumen-text-tertiary group-hover:text-lumen-text-secondary'
      }`}>
        <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
      </div>
      {!collapsed && (
        <span className={`text-[13px] font-medium tracking-tight transition-colors duration-200 whitespace-nowrap overflow-hidden ${
          isActive ? '' : 'text-lumen-text-secondary group-hover:text-lumen-text-primary'
        }`}>
          {label}
        </span>
      )}
    </Link>
  );
}
