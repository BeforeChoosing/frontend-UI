import { loadAppMode } from '../services/appMode';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '');

const CLIENT_REQUEST_ID_KEY = 'before-choosing:client-request-id:v1';
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
  const existing = window.sessionStorage.getItem(CLIENT_REQUEST_ID_KEY);
  if (existing) return existing;
  const value = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(CLIENT_REQUEST_ID_KEY, value);
  return value;
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

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders(init?.headers),
    });
  } catch {
    throw new ApiClientError('无法连接后端，请确认 backend 已在 8000 端口启动。');
  }

  const payload = await response.json().catch(() => null) as
    | { detail?: string }
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      notifyAuthRequired();
    }
    throw new ApiClientError(
      payload?.detail || `后端请求失败（${response.status}）`,
      response.status,
    );
  }
  return payload as T;
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
  } catch {
    throw new ApiClientError('无法连接后端，请确认 backend 已在 8000 端口启动。');
  }

  const payload = await response.json().catch(() => null) as
    | { detail?: string }
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      notifyAuthRequired();
    }
    throw new ApiClientError(
      payload?.detail || `后端请求失败（${response.status}）`,
      response.status,
    );
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
