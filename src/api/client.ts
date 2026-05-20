const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'bloomclub_access_token';

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

export type ApiUser = Record<string, unknown>;
export type ApiClient = Record<string, unknown>;

export type MiniAppLoginSuccess = {
  access_token: string;
  token_type: string;
  user: ApiUser;
  client: ApiClient;
};

export type MiniAppLoginJoinRequired = {
  status: 'join_via_bot_required';
  message: string;
};

export type MiniAppLoginResponse = MiniAppLoginSuccess | MiniAppLoginJoinRequired;

export function setAccessToken(token: string): void {
  accessToken = token;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function miniAppLogin(launchParams: string): Promise<MiniAppLoginResponse> {
  return apiFetch<MiniAppLoginResponse>('/api/v1/auth/vk-miniapp-login', {
    method: 'POST',
    body: JSON.stringify({ launch_params: launchParams }),
  });
}

export async function getMe<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>('/api/v1/users/me');
}

export async function getSubscription<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>('/api/v1/subscription');
}

export async function getPartners<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>('/api/v1/partners');
}

export async function getVerifications<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>('/api/v1/verifications');
}

export async function createVerification<T = Record<string, unknown>>(partnerId: string): Promise<T> {
  return apiFetch<T>('/api/v1/verifications', {
    method: 'POST',
    body: JSON.stringify({ partner_id: partnerId }),
  });
}
