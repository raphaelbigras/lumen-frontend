import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: 'RefreshTokenError';
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'AGENT' | 'USER';
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    role: 'ADMIN' | 'AGENT' | 'USER';
    error?: 'RefreshTokenError';
  }
}

function extractRoleFromAccessToken(accessToken: string): 'ADMIN' | 'AGENT' | 'USER' {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    const roles: string[] = payload?.realm_access?.roles || [];
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('AGENT')) return 'AGENT';
  } catch (e) {
    console.error('[auth] Failed to decode access token:', e);
  }
  return 'USER';
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: `${process.env.AUTH_KEYCLOAK_ISSUER}`,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      // First-time login — persist tokens and role
      if (account) {
        token.access_token = account.access_token!;
        token.expires_at = account.expires_at!;
        token.refresh_token = account.refresh_token;
      }

      // Always extract role from current access token
      token.role = extractRoleFromAccessToken(token.access_token);

      // Token still valid
      if (Date.now() < token.expires_at * 1000) {
        return token;
      }

      // Token expired — refresh it
      if (!token.refresh_token) {
        token.error = 'RefreshTokenError';
        return token;
      }

      try {
        const response = await fetch(
          `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.AUTH_KEYCLOAK_ID!,
              client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refresh_token,
            }),
          },
        );

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          access_token: tokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
          refresh_token: tokens.refresh_token ?? token.refresh_token,
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        token.error = 'RefreshTokenError';
        return token;
      }
    },

    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.error = token.error;
      session.user.id = token.sub!;
      session.user.role = token.role;
      return session;
    },
  },
});
