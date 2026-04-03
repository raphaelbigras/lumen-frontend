'use client';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <button onClick={() => signOut()} title="Deconnexion" className="text-lumen-text-tertiary hover:text-red-400">
      <LogOut size={16} />
    </button>
  );
}
