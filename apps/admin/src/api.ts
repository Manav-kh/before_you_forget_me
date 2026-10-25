import { useCallback, useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(message: string, public status = 0, public fields?: Record<string, string[]>) { super(message); }
}

export async function request<T>(path: string, options: { method?: string; body?: unknown; csrf?: string; signal?: AbortSignal } = {}): Promise<T> {
  const multipart = options.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`/api/admin/${path}`, { credentials: 'include', cache: 'no-store', method: options.method ?? 'GET', signal: options.signal, headers: { ...(!multipart && options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.csrf ? { 'X-CSRF-Token': options.csrf } : {}) }, body: options.body === undefined ? undefined : multipart ? options.body as FormData : JSON.stringify(options.body) });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('The studio could not reach the server. Check your connection and try again.');
  }
  const payload = await response.json().catch(() => null) as { data?: T; error?: string; fields?: Record<string,string[]> } | null;
  if (!response.ok) {
    if (response.status === 401 && path !== 'login' && path !== 'session') window.dispatchEvent(new Event('studio-session-expired'));
    throw new ApiError(payload?.error ?? `The request could not be completed (${response.status}).`, response.status, payload?.fields);
  }
  if (!payload || !('data' in payload)) throw new ApiError('The server returned an unexpected response. Please try again.');
  return payload.data as T;
}

export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    request<T>(path, { signal: controller.signal }).then(setData).catch(error => { if (error.name !== 'AbortError') setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  return { data, loading, error, reload, setData };
}

export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.'; }
