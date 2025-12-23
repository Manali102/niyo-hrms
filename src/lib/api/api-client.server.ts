type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

import { cookies } from 'next/headers';
import { getSession, deleteSession } from '@/lib/api/session';
import { redirect } from 'next/navigation';

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  // Support passing through fetch init options if needed
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  auth?: boolean;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function buildUrl(path: string): string {
  const base = getBaseUrl();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

async function resolveAuthTokens(): Promise<AuthTokens> {
  const session = await getSession();
  let accessToken = session?.accessToken;
  let refreshToken = session?.refreshToken;

  if (!accessToken || !refreshToken) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (sessionCookie) {
      try {
        const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded) as { accessToken?: string; refreshToken?: string } | string;
        if (typeof parsed === 'string') {
          accessToken = accessToken ?? parsed;
        } else {
          accessToken = accessToken ?? parsed.accessToken;
          refreshToken = refreshToken ?? parsed.refreshToken;
        }
      } catch {
        accessToken = accessToken ?? sessionCookie;
      }
    }
  }

  return { accessToken, refreshToken };
}

async function buildHeaders(
  customHeaders: Record<string, string> | undefined,
  includeAuth: boolean | undefined
): Promise<{ headers: Record<string, string>; hasAccessToken: boolean; }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders ?? {}),
  };

  if (!includeAuth) {
    return { headers, hasAccessToken: false };
  }

  const { accessToken, refreshToken } = await resolveAuthTokens();
  if (!accessToken) {
    return { headers, hasAccessToken: false };
  }

  headers['access-token'] = accessToken;
  if (refreshToken) {
    headers['refresh-token'] = refreshToken;
  }

  return { headers, hasAccessToken: true };
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<{ ok: boolean; status: number; data?: T; error?: string; details?: unknown; }> {
  const url = buildUrl(path);
  const { headers, hasAccessToken } = await buildHeaders(options.headers, options.auth);

  if (options.auth && !hasAccessToken) {
    return { ok: false, status: 401, error: 'Access denied. No session token available.' };
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
  };

  const res = await fetch(url, init);
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // ignore parse error
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      await deleteSession();
      redirect('/login');
    }

    const message =
      (payload as { message?: string; error?: string } | null)?.error ??
      (payload as { message?: string } | null)?.message ??
      `Request failed with status ${res.status}`;
    return { ok: false, status: res.status, error: message, details: payload };
  }

  return { ok: true, status: res.status, data: payload as T };
}

export const apiClient = {
  get: <T = unknown>(path: string, options?: RequestOptions) => request<T>(path, { ...(options ?? {}), method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...(options ?? {}), method: 'POST', body }),
  put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...(options ?? {}), method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...(options ?? {}), method: 'PATCH', body }),
  delete: <T = unknown>(path: string, options?: RequestOptions) => request<T>(path, { ...(options ?? {}), method: 'DELETE' }),
};
