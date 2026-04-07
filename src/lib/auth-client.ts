'use client';

import { signOut } from 'next-auth/react';

function buildKeycloakLogoutUrl(idToken?: string) {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  if (!keycloakUrl || !realm || !clientId) {
    return null;
  }

  const baseUrl = keycloakUrl.endsWith('/') ? keycloakUrl : `${keycloakUrl}/`;
  const logoutUrl = new URL(
    `realms/${realm}/protocol/openid-connect/logout`,
    baseUrl,
  );

  logoutUrl.searchParams.set(
    'post_logout_redirect_uri',
    window.location.origin,
  );
  logoutUrl.searchParams.set('client_id', clientId);

  if (idToken) {
    logoutUrl.searchParams.set('id_token_hint', idToken);
  }

  return logoutUrl.toString();
}

export async function logoutFromKeycloak(idToken?: string) {
  const logoutUrl = buildKeycloakLogoutUrl(idToken);

  await signOut({
    redirect: false,
    callbackUrl: '/',
  });

  if (logoutUrl) {
    window.location.assign(logoutUrl);
    return;
  }

  window.location.assign('/');
}
