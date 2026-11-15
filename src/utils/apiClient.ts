export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
  isNetworkError: boolean;
}

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryStaticFallback<T>(
  url: string,
  init: RequestInit
): Promise<ApiResponse<T> | null> {
  if (!url.startsWith('/api/auth/') && !url.startsWith('/api/admin/')) {
    return null;
  }
  try {
    const { handleStaticAuthFallback } = await import('./localAuthFallback');
    const result = await handleStaticAuthFallback(url, init);
    return result as ApiResponse<T> | null;
  } catch {
    return null;
  }
}

export async function apiFetchJson<T = Record<string, unknown>>(
  url: string,
  options: RequestInit & { retries?: number; timeoutMs?: number } = {}
): Promise<ApiResponse<T>> {
  const {
    retries = 2,
    timeoutMs = 15000,
    headers: customHeaders,
    ...fetchInit
  } = options;

  let lastStatus = 0;
  let lastErrorMessage: string | null = null;
  let lastWasNetworkError = false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedHeaders = new Headers(customHeaders);
      if (!mergedHeaders.has('Accept')) {
        mergedHeaders.set('Accept', 'application/json');
      }
      if (fetchInit.body && !mergedHeaders.has('Content-Type')) {
        mergedHeaders.set('Content-Type', 'application/json');
      }

      const res = await fetch(url, {
        ...fetchInit,
        credentials: fetchInit.credentials ?? 'include',
        cache: 'no-store',
        headers: mergedHeaders,
        signal: fetchInit.signal ?? controller.signal,
      });

      clearTimeout(timer);
      lastStatus = res.status;

      const rawText = await res.text().catch(() => '');
      let parsed: T | null = null;
      if (rawText) {
        try {
          parsed = JSON.parse(rawText) as T;
        } catch {
          parsed = null;
        }
      }

      const serverErr =
        parsed && typeof parsed === 'object' && 'error' in parsed && typeof (parsed as { error?: unknown }).error === 'string'
          ? (parsed as { error: string }).error
          : null;

      // If host returns 404/405 or platform 5xx (without an explicit backend JSON error string) for auth/admin routes, switch seamlessly to client fallback
      if (
        (res.status === 404 || res.status === 405 || (res.status >= 500 && !serverErr)) &&
        (url.startsWith('/api/auth/') || url.startsWith('/api/admin/'))
      ) {
        const fb = await tryStaticFallback<T>(url, fetchInit);
        if (fb) return fb;
      }

      if (RETRYABLE_STATUSES.has(res.status) && attempt < retries) {
        await wait(350 * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data: parsed,
          errorMessage:
            serverErr ||
            (res.status >= 500
              ? 'Server is temporarily waking up. Please try again in a moment.'
              : `Request failed (HTTP ${res.status}).`),
          isNetworkError: false,
        };
      }

      if (rawText && parsed === null) {
        if (attempt < retries) {
          await wait(350 * (attempt + 1));
          continue;
        }
        const fb = await tryStaticFallback<T>(url, fetchInit);
        if (fb) return fb;
        return {
          ok: false,
          status: res.status,
          data: null,
          errorMessage: 'Unexpected non-JSON response from server. Please refresh and try again.',
          isNetworkError: false,
        };
      }

      return {
        ok: true,
        status: res.status,
        data: parsed,
        errorMessage: null,
        isNetworkError: false,
      };
    } catch (err) {
      clearTimeout(timer);
      lastWasNetworkError = true;
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastErrorMessage = isAbort
        ? 'Connection timed out while contacting the server. Please try again.'
        : 'Unable to reach the authentication server. Please check your connection and try again.';

      if (attempt < retries) {
        await wait(350 * (attempt + 1));
        continue;
      }
    }
  }

  const fb = await tryStaticFallback<T>(url, fetchInit);
  if (fb) return fb;

  return {
    ok: false,
    status: lastStatus,
    data: null,
    errorMessage:
      lastErrorMessage || 'Unable to reach the server. Please try again.',
    isNetworkError: lastWasNetworkError,
  };
}
