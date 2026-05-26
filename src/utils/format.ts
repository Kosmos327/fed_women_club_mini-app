function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return '—';

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatDateTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return '—';

  const formattedDate = formatDate(value);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${formattedDate}, ${hours}:${minutes}`;
}

export function formatSubscriptionStatus(status?: string | null, isActive?: boolean): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'expired') return 'истекла';
  if (normalizedStatus === 'paused') return 'приостановлена';
  if (normalizedStatus === 'blocked') return 'заблокирована';
  if (normalizedStatus === 'active') return 'активна';
  if (normalizedStatus === 'inactive') return 'не активна';

  if (isActive === true) return 'активна';
  if (isActive === false) return 'не активна';

  return status?.trim() || 'не активна';
}

export function formatVerificationStatus(status?: string | null): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'active') return 'Активна';
  if (normalizedStatus === 'used') return 'Использована';
  if (normalizedStatus === 'confirmed') return 'Подтверждена';
  if (normalizedStatus === 'expired') return 'Истекла';
  if (normalizedStatus === 'cancelled') return 'Отменена';
  if (normalizedStatus === 'pending') return 'Ожидает';

  return status?.trim() || '—';
}

export function formatMoney(value: string | number | null | undefined, suffix = '₽'): string {
  if (value == null) return '—';

  const normalized = typeof value === 'number'
    ? value
    : Number(String(value).replace(',', '.').replace(/\s+/g, ''));

  if (!Number.isFinite(normalized)) return '—';

  return `${Math.round(normalized).toLocaleString('ru-RU')} ${suffix}`;
}

type NameLikeObject = Record<string, unknown>;

const PARTNER_CATEGORY_LABELS: Record<string, string> = {
  krasota: 'Красота',
  'красота': 'Красота',
  'manikyur-pedikyur': 'Маникюр / педикюр',
  'brovi-resnitsy': 'Брови / ресницы',
  kosmetologiya: 'Косметология',
};

const PARTNER_CITY_LABELS: Record<string, string> = {
  novosibirsk: 'Новосибирск',
  'новосибирск': 'Новосибирск',
  cherepovets: 'Череповец',
  'череповец': 'Череповец',
};

function normalizeDisplayText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  const [firstChar, ...tail] = Array.from(value);
  return `${firstChar.toLocaleUpperCase('ru-RU')}${tail.join('')}`;
}

function normalizeLookupKey(value: string): string {
  return normalizeDisplayText(value).toLowerCase();
}

function extractDisplayValue(input: unknown): string | null {
  if (typeof input === 'string') {
    const normalized = normalizeDisplayText(input);
    return normalized.length > 0 ? normalized : null;
  }

  if (!input || typeof input !== 'object') return null;

  const objectValue = input as NameLikeObject;
  for (const key of ['name', 'title', 'label', 'slug']) {
    const candidate = objectValue[key];
    if (typeof candidate === 'string') {
      const normalized = normalizeDisplayText(candidate);
      if (normalized) return normalized;
    }
  }

  return null;
}

function formatPartnerLabel(value: unknown, knownLabels: Record<string, string>): string | null {
  const source = extractDisplayValue(value);
  if (!source) return null;

  const lookupKey = normalizeLookupKey(source);
  const known = knownLabels[lookupKey];
  if (known) return known;

  const looksLikeRussianLower = /^[а-яё0-9\s-]+$/i.test(source) && source === source.toLocaleLowerCase('ru-RU');
  if (looksLikeRussianLower) return capitalizeFirst(source);

  return source;
}

export function formatPartnerCategoryLabel(value: unknown): string | null {
  return formatPartnerLabel(value, PARTNER_CATEGORY_LABELS);
}

export function formatPartnerCityLabel(value: unknown): string | null {
  return formatPartnerLabel(value, PARTNER_CITY_LABELS);
}

function collectPartnerFieldCandidates(value: unknown, output: unknown[]): void {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectPartnerFieldCandidates(entry, output));
    return;
  }
  output.push(value);
}

export function getPartnerCategoryDisplayLabel(partner: Record<string, unknown>): string | null {
  const rawCandidates: unknown[] = [];

  collectPartnerFieldCandidates(partner.category, rawCandidates);
  collectPartnerFieldCandidates(partner.category_name, rawCandidates);
  collectPartnerFieldCandidates(partner.category_slug, rawCandidates);
  collectPartnerFieldCandidates(partner.categories, rawCandidates);

  for (const candidate of rawCandidates) {
    const formatted = formatPartnerCategoryLabel(candidate);
    if (formatted) return formatted;
  }

  return null;
}

export function getPartnerCityDisplayLabel(partner: Record<string, unknown>): string | null {
  const rawCandidates: unknown[] = [];

  collectPartnerFieldCandidates(partner.city, rawCandidates);
  collectPartnerFieldCandidates(partner.city_name, rawCandidates);
  collectPartnerFieldCandidates(partner.city_slug, rawCandidates);

  for (const candidate of rawCandidates) {
    const formatted = formatPartnerCityLabel(candidate);
    if (formatted) return formatted;
  }

  return null;
}
