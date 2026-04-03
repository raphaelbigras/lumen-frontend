'use client';
import { Bell } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

interface TopbarProps {
  userName?: string;
}

export function Topbar({ userName }: TopbarProps) {
  return (
    <header className="h-12 border-b border-lumen-border-secondary bg-lumen-bg-secondary flex items-center justify-between px-5">
      <div className="text-xs font-medium text-lumen-text-secondary">Groupe Meloche Inc.</div>
      <div className="flex items-center gap-3">
        <button className="relative text-lumen-text-tertiary hover:text-lumen-text-secondary">
          <Bell size={18} />
        </button>
        {userName && (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {userName.charAt(0) || 'U'}
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}
