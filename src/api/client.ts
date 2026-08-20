const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '');

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
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiClientError('无法连接后端，请确认 backend 已在 8000 端口启动。');
  }

  const payload = await response.json().catch(() => null) as
    | { detail?: string }
    | null;
  if (!response.ok) {
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
      headers: { Accept: 'application/json' },
      body: form,
    });
  } catch {
    throw new ApiClientError('无法连接后端，请确认 backend 已在 8000 端口启动。');
  }

  const payload = await response.json().catch(() => null) as
    | { detail?: string }
    | null;
  if (!response.ok) {
    throw new ApiClientError(
      payload?.detail || `后端请求失败（${response.status}）`,
      response.status,
    );
  }
  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
