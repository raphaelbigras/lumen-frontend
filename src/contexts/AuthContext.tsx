'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

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

  const initialized = status !== 'loading';
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name!,
        role: session.user.role,
      }
    : null;

  return (
    <AuthContext.Provider value={{ initialized, user, logout: () => signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
