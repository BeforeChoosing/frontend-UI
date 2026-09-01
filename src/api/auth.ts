import { apiRequest, clearAccessToken, setAccessToken } from './client';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}
export interface AuthSession {
  access_token: string;
  token_type: 'bearer';
  expires_at: string;
  user: AuthUser;
}

export function login(email: string, password: string): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((session) => {
    setAccessToken(session.access_token);
    return session;
  });
}

export function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      ...(displayName?.trim() ? { display_name: displayName.trim() } : {}),
    }),
  }).then((session) => {
    setAccessToken(session.access_token);
    return session;
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<{ logged_out: boolean }>('/auth/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

export function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ detail: string }> {
  return apiRequest<{ detail: string }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });
}
