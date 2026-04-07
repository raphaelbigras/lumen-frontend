import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api';

async function getAccessToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

async function serverRequest(path: string, options?: RequestInit): Promise<Response> {
  const token = await getAccessToken();

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  if (options?.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!text) {
    throw new Error('API returned an empty JSON response');
  }

  return JSON.parse(text) as T;
}

async function parseOptionalJsonResponse(res: Response): Promise<void>;
async function parseOptionalJsonResponse<T>(res: Response): Promise<T>;
async function parseOptionalJsonResponse<T>(res: Response): Promise<T | void> {
  if (res.status === 204 || res.status === 205) {
    return;
  }

  const text = await res.text();
  if (!text) {
    return;
  }

  return JSON.parse(text) as T;
}

export async function serverFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await serverRequest(path, options);
  return parseJsonResponse<T>(res);
}

export async function serverPost<T = void>(
  path: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const res = await serverRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
  return parseOptionalJsonResponse<T>(res);
}

export async function serverPatch<T = void>(
  path: string,
  body: unknown,
  options?: RequestInit,
): Promise<T> {
  const res = await serverRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  });
  return parseOptionalJsonResponse<T>(res);
}

export async function serverDelete<T = void>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await serverRequest(path, {
    method: 'DELETE',
    ...options,
  });
  return parseOptionalJsonResponse<T>(res);
}
