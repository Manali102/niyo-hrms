type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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

  // Client-side: Browser handles cookies automatically for same-origin requests
  // If we need to manually attach tokens from local storage, we would do it here
  // For now, we assume cookies are sufficient or handled by the browser
  
  return { headers, hasAccessToken: true };
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<{ ok: boolean; status: number; data?: T; error?: string; details?: unknown; }> {
  const url = buildUrl(path);
  const { headers, hasAccessToken } = await buildHeaders(options.headers, options.auth);

  // On client side, we might not be able to easily check for access token existence if it's in an httpOnly cookie
  // So we skip the pre-check and let the server respond with 401 if needed
  
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


