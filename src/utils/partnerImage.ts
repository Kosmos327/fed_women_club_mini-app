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

const pickPhotoFromCollection = (value: unknown): string | null => {
  if (!Array.isArray(value) || value.length === 0) return null;

  const activePhoto = value.find((item) => {
    if (!item || typeof item !== 'object') return false;
    const status = (item as Record<string, unknown>).is_active;
    return status === true;
  });

  const candidates = activePhoto ? [activePhoto, ...value] : value;

  for (const item of candidates) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
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

    if (src) return src;
  }

  return null;
};

export const getPartnerImageSrc = (partner: ApiPartner | null): string | null => {
  if (!partner) return null;

  return (
    toMediaUrl(partner.photo_url) ??
    toMediaUrl(partner.image_url) ??
    toMediaUrl(partner.cover_url) ??
    toMediaUrl(partner.logo_url) ??
    toMediaUrl(partner.avatar_url) ??
    toMediaUrl(partner.main_photo_url) ??
    toMediaUrl(partner.photo) ??
    toMediaUrl(partner.image) ??
    toMediaUrl(partner.cover) ??
    toMediaUrl(partner.logo) ??
    pickPhotoFromCollection(partner.photos) ??
    pickPhotoFromCollection(partner.partner_photos)
  );
};
