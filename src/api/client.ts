import { loadAppMode } from '../services/appMode';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api/v1'
).replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'before-choosing:auth-token:v1';

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function clientRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function requestHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-App-Mode': loadAppMode(),
    'X-Client-Request-Id': clientRequestId(),
  });
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  new Headers(extra).forEach((value, key) => headers.set(key, value));
  return headers;
}

function notifyAuthRequired(): void {
  clearAccessToken();
  window.dispatchEvent(new CustomEvent('before-choosing:auth-required'));
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  requestId: string;
  retryable: boolean;

  constructor(message: string, status = 0, options: {
    code?: string;
    requestId?: string;
    retryable?: boolean;
  } = {}) {
    const requestId = options.requestId || '';
    super(requestId ? `${message}\n请求编号：${requestId}` : message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = options.code || (status ? 'REQUEST_FAILED' : 'NETWORK_ERROR');
    this.requestId = requestId;
    this.retryable = options.retryable ?? (status === 0 || [429, 502, 503, 504].includes(status));
  }
}

type ErrorPayload = {
  detail?: string;
  request_id?: string;
  error?: { code?: string; message?: string; request_id?: string; retryable?: boolean };
};

function responseError(response: Response, payload: ErrorPayload | null): ApiClientError {
  const requestId = payload?.error?.request_id
    || payload?.request_id
    || response.headers.get('X-Request-Id')
    || '';
  return new ApiClientError(
    payload?.error?.message || payload?.detail || `操作未完成（${response.status}），请稍后重试。`,
    response.status,
    { code: payload?.error?.code, requestId, retryable: payload?.error?.retryable },
  );
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders(init?.headers),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiClientError('暂时无法连接服务，请检查网络后重试。');
  }

  const payload = await response.json().catch(() => null) as
    | ErrorPayload
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      notifyAuthRequired();
    }
    throw responseError(response, payload);
  }
  return payload as T;
}

export async function apiStreamRequest(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  const streamHeaders = new Headers(init?.headers);
  streamHeaders.set('Accept', 'text/event-stream');
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders(streamHeaders),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiClientError('暂时无法连接服务，请检查网络后重试。');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as ErrorPayload | null;
    if (response.status === 401 && !path.startsWith('/auth/')) notifyAuthRequired();
    throw responseError(response, payload);
  }
  return response;
}

export async function apiFormRequest<T>(path: string, form: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-App-Mode': loadAppMode(),
        'X-Client-Request-Id': clientRequestId(),
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: form,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiClientError('暂时无法连接服务，请检查网络后重试。');
  }

  const payload = await response.json().catch(() => null) as
    | ErrorPayload
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      notifyAuthRequired();
    }
    throw responseError(response, payload);
  }
  return payload as T;
}

export async function auditEvent(
  action: string,
  target = '',
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (loadAppMode() !== 'use' || !getAccessToken()) return;
  try {
    await apiRequest('/audit/events', {
      method: 'POST',
      body: JSON.stringify({ action, target, metadata }),
    });
  } catch {
    // Audit failure must not block a user operation.
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
