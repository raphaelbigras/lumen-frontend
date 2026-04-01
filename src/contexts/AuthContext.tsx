'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getKeycloak } from '../lib/keycloak';
import Keycloak from 'keycloak-js';

let initStarted = false;

interface AuthContextValue {
  keycloak: Keycloak | null;
  initialized: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  keycloak: null,
  initialized: false,
  user: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [kc, setKc] = useState<Keycloak | null>(null);

  useEffect(() => {
    if (initStarted) return;
    initStarted = true;
    const keycloak = getKeycloak();
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((authenticated) => {
        if (authenticated) {
          const parsed = keycloak.tokenParsed as any;
          setUser({
            id: parsed.sub,
            email: parsed.email,
            name: `${parsed.given_name} ${parsed.family_name}`,
            role: parsed.realm_access?.roles?.includes('ADMIN')
              ? 'ADMIN'
              : parsed.realm_access?.roles?.includes('AGENT')
              ? 'AGENT'
              : 'USER',
          });
        }
        setKc(keycloak);
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, []);

  return (
    <AuthContext.Provider value={{ keycloak: kc, initialized, user, logout: () => kc?.logout() }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
