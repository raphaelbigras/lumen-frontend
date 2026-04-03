import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api';

async function getAccessToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export async function serverFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function serverPost<T>(
  path: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  return serverFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function serverPatch<T>(
  path: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  return serverFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function serverDelete<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return serverFetch<T>(path, {
    method: 'DELETE',
    ...options,
  });
}
