const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'bloomclub_access_token';

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

export type ApiUser = {
  id?: number | string;
  full_name?: string;
  name?: string;
  first_name?: string;
  email?: string;
  login?: string;
} & Record<string, unknown>;

export type ApiCity = {
  id: number;
  name: string;
  slug: string;
};

export type ApiClient = {
  id?: number | string;
  full_name?: string;
  phone?: string;
  contact_email?: string;
  city?: string;
  city_name?: string;
  city_slug?: string;
  custom_city?: string;
} & Record<string, unknown>;

export type ApiSubscription = {
  is_active?: boolean;
  active?: boolean;
  expires_at?: string | null;
  end_date?: string | null;
  price?: number | string | null;
  amount?: number | string | null;
} & Record<string, unknown>;

export type ApiPaymentRequest = {
  id?: number | string;
  status?: string;
  amount?: number | string | null;
  price?: number | string | null;
  created_at?: string | null;
  payment_url?: string | null;
  comment?: string | null;
  message?: string | null;
} & Record<string, unknown>;

export type ApiVerification = {
  id?: number | string;
  code?: string;
  status?: string;
  partner_name?: string;
  partner?: string | Record<string, unknown>;
  expires_at?: string | null;
  created_at?: string | null;
  used_at?: string | null;
  offer_id?: number | string | null;
  offer_name?: string | null;
  offer_title?: string | null;
  service_name?: string | null;
  service_title?: string | null;
  offer?: string | Record<string, unknown> | null;
  service?: string | Record<string, unknown> | null;
} & Record<string, unknown>;

export type ApiPartner = {
  id?: number | string;
  name?: string;
  title?: string;
  category?: string;
  category_name?: string;
  type?: string;
  service_category?: string;
  city?: string;
  city_name?: string;
  address?: string;
  description?: string;
  short_description?: string;
  discount_text?: string;
  benefit_text?: string;
  photo_url?: string;
  image_url?: string;
  cover_url?: string;
  logo_url?: string;
  avatar_url?: string;
  main_photo_url?: string;
  photo?: string;
  image?: string;
  cover?: string;
  logo?: string;
  photos?: unknown[];
  partner_photos?: unknown[];
  is_active?: boolean;
} & Record<string, unknown>;

export type ApiOffer = {
  id?: number | string;
  name?: string;
  title?: string;
  short_benefit?: string;
  description?: string;
  terms?: string;
  base_price?: number | string | null;
  price?: number | string | null;
  discount_percent?: number | string | null;
  discount?: number | string | null;
  final_price?: number | string | null;
  price_with_discount?: number | string | null;
  is_active?: boolean;
  status?: string;
  sort_order?: number | string | null;
  photos?: Array<{
    id?: number | string;
    url?: string | null;
    alt_text?: string | null;
    sort_order?: number | string | null;
  }> | null;
  photo_url?: string | null;
  image_url?: string | null;
  cover_url?: string | null;
} & Record<string, unknown>;



export type ApiSavingsMoneyValue = number | string | null;

export type ApiSavingsItem = {
  id?: number | string;
  used_at?: string | null;
  partner_id?: number | string;
  partner_name?: string | null;
  offer_id?: number | string;
  offer_title?: string | null;
  base_price?: ApiSavingsMoneyValue;
  final_price?: ApiSavingsMoneyValue;
  discount_percent?: ApiSavingsMoneyValue;
  saving_amount?: ApiSavingsMoneyValue;
} & Record<string, unknown>;

export type ApiSavingsResponse = {
  total_saving_amount: ApiSavingsMoneyValue;
  currency: string;
  period: {
    from_date: string | null;
    to_date: string | null;
  };
  items: ApiSavingsItem[];
} & Record<string, unknown>;

export type ApiClientUpdatePayload = {
  full_name?: string;
  phone?: string;
  contact_email?: string;
  city_slug?: string;
  custom_city?: string;
} & Record<string, unknown>;

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

export async function getMe<T = { user?: ApiUser; client?: ApiClient } & Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/me');
}

export async function updateMe<T = { user?: ApiUser; client?: ApiClient } & Record<string, unknown>>(
  payload: ApiClientUpdatePayload,
): Promise<T> {
  return apiFetch<T>('/api/v1/clients/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getSubscription<T = ApiSubscription>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/me/subscription');
}

export async function getCities<T = ApiCity[]>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/cities');
}

export async function getPartners<T = ApiPartner[]>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/catalog/partners');
}

export async function getVerifications<T = ApiVerification[]>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/me/verifications');
}

export async function getPartnerOffers<T = ApiOffer[]>(partnerId: string): Promise<T> {
  return apiFetch<T>(`/api/v1/clients/partners/${partnerId}/offers`);
}

export async function createVerification<T = ApiVerification>(
  partnerId: string,
  payload?: { offer_id?: string | number },
): Promise<T> {
  return apiFetch<T>(`/api/v1/clients/partners/${partnerId}/verify`, {
    method: 'POST',
    body: payload ? JSON.stringify(payload) : undefined,
  });
}


export async function getSavings<T = ApiSavingsResponse>(
  params?: { from_date?: string; to_date?: string },
): Promise<T> {
  const query = new URLSearchParams();
  if (params?.from_date) query.set('from_date', params.from_date);
  if (params?.to_date) query.set('to_date', params.to_date);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<T>(`/api/v1/clients/me/savings${suffix}`);
}

export async function createPaymentRequest<T = ApiPaymentRequest>(): Promise<T> {
  return apiFetch<T>('/api/v1/clients/me/payment-requests', {
    method: 'POST',
  });
}

export async function markPaymentRequestPaid<T = ApiPaymentRequest>(paymentRequestId: string | number): Promise<T> {
  return apiFetch<T>(`/api/v1/clients/me/payment-requests/${paymentRequestId}/mark-paid`, {
    method: 'POST',
  });
}
