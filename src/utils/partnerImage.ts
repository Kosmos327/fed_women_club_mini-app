import type { ApiPartner } from '../api/client';

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toMediaUrl = (value: unknown): string | null => {
  const raw = toNonEmptyString(value);
  if (!raw) return null;
  if (ABSOLUTE_URL_REGEX.test(raw) || raw.startsWith('data:image/')) return raw;

  const baseUrl = toNonEmptyString(import.meta.env.VITE_API_BASE_URL);
  if (!baseUrl) {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  try {
    const apiOrigin = new URL(baseUrl).origin;
    return new URL(raw, `${apiOrigin}/`).toString();
  } catch {
    return raw;
  }
};

const normalizePhotoCollection = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value) || value.length === 0) return [];
  const objects = value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  const hasActiveFlag = objects.some((item) => Object.prototype.hasOwnProperty.call(item, 'is_active'));
  const filtered = hasActiveFlag ? objects.filter((item) => item.is_active === true) : objects;
  return [...filtered].sort((a, b) => {
    const sortOrderA = typeof a.sort_order === 'number' ? a.sort_order : Number(a.sort_order ?? Number.MAX_SAFE_INTEGER);
    const sortOrderB = typeof b.sort_order === 'number' ? b.sort_order : Number(b.sort_order ?? Number.MAX_SAFE_INTEGER);
    if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;
    const idA = typeof a.id === 'number' ? a.id : Number(a.id ?? Number.MAX_SAFE_INTEGER);
    const idB = typeof b.id === 'number' ? b.id : Number(b.id ?? Number.MAX_SAFE_INTEGER);
    return idA - idB;
  });
};

const pickPhotoUrlsFromCollection = (value: unknown): string[] => {
  const items = normalizePhotoCollection(value);
  const result: string[] = [];
  for (const record of items) {
    const src =
      toMediaUrl(record.photo_url) ??
      toMediaUrl(record.image_url) ??
      toMediaUrl(record.cover_url) ??
      toMediaUrl(record.logo_url) ??
      toMediaUrl(record.avatar_url) ??
      toMediaUrl(record.main_photo_url) ??
      toMediaUrl(record.photo) ??
      toMediaUrl(record.image) ??
      toMediaUrl(record.cover) ??
      toMediaUrl(record.logo) ??
      toMediaUrl(record.url);

    if (src) result.push(src);
  }
  return result;
};

export const getPartnerImages = (partner: ApiPartner | null): string[] => {
  if (!partner) return [];
  const urls = [
    ...pickPhotoUrlsFromCollection(partner.photos),
    ...pickPhotoUrlsFromCollection(partner.partner_photos),
    toMediaUrl(partner.photo_url),
    toMediaUrl(partner.image_url),
    toMediaUrl(partner.cover_url),
    toMediaUrl(partner.logo_url),
    toMediaUrl(partner.avatar_url),
    toMediaUrl(partner.main_photo_url),
    toMediaUrl(partner.photo),
    toMediaUrl(partner.image),
    toMediaUrl(partner.cover),
    toMediaUrl(partner.logo),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(urls)];
};

export const getPartnerImageSrc = (partner: ApiPartner | null): string | null => getPartnerImages(partner)[0] ?? null;
