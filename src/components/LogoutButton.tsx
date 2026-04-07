'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { logoutFromKeycloak } from '@/lib/auth-client';

export function LogoutButton() {
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutFromKeycloak(session?.idToken);
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      title="Deconnexion"
      disabled={isLoggingOut}
      className="text-lumen-text-tertiary hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut size={16} />
    </button>
  );
}
