'use client';
import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { logoutFromKeycloak } from '@/lib/auth-client';

interface AuthContextValue {
  initialized: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  initialized: false,
  user: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const hasRedirectedForRefreshError = useRef(false);

  const initialized = status !== 'loading';
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name!,
        role: session.user.role,
      }
    : null;

  useEffect(() => {
    if (session?.error !== 'RefreshTokenError') {
      hasRedirectedForRefreshError.current = false;
      return;
    }

    if (hasRedirectedForRefreshError.current) {
      return;
    }

    hasRedirectedForRefreshError.current = true;
    const callbackUrl = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }, [session?.error]);

  return (
    <AuthContext.Provider
      value={{ initialized, user, logout: () => logoutFromKeycloak(session?.idToken) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
