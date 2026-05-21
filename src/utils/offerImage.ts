import type { ApiOffer } from '../api/client';

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
  if (!baseUrl) return raw.startsWith('/') ? raw : `/${raw}`;

  try {
    const apiOrigin = new URL(baseUrl).origin;
    return new URL(raw, `${apiOrigin}/`).toString();
  } catch {
    return raw;
  }
};

export const getOfferImages = (offer: ApiOffer | null): string[] => {
  if (!offer) return [];

  const sortedPhotos = Array.isArray(offer.photos)
    ? [...offer.photos].sort((a, b) => Number(a?.sort_order ?? Number.MAX_SAFE_INTEGER) - Number(b?.sort_order ?? Number.MAX_SAFE_INTEGER))
    : [];

  const urls = [
    ...sortedPhotos.map((photo) => toMediaUrl(photo?.url)),
    toMediaUrl(offer.photo_url),
    toMediaUrl(offer.image_url),
    toMediaUrl(offer.cover_url),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(urls)];
};
