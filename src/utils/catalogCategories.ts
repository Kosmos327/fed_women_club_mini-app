import type { ApiPartner } from '../api/client';
import { formatPartnerCategoryLabel } from './format';

export type CatalogCategory = {
  label: string;
  slug: string;
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
};

const normalizeKey = (value: unknown): string | null => normalizeText(value)?.toLowerCase() ?? null;
const isSlugLike = (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim().toLowerCase());

const prettifySlug = (slug: string): string => {
  const known = formatPartnerCategoryLabel(slug);
  if (known) return known;
  return slug
    .split('-')
    .map((chunk) => (chunk ? `${chunk[0].toUpperCase()}${chunk.slice(1)}` : chunk))
    .join(' ');
};

const extractCategoryCandidates = (partner: ApiPartner): Array<Record<string, unknown>> => {
  const result: Array<Record<string, unknown>> = [];
  const push = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(push);
      return;
    }

    if (typeof value === 'string') {
      result.push({ name: value });
      return;
    }

    if (typeof value === 'object') {
      result.push(value as Record<string, unknown>);
    }
  };

  push({ slug: partner.category_slug, name: partner.category_name });
  push(partner.category);
  push(partner.categories);
  push(partner.category_slugs);
  push(partner.service_category);
  push((partner as Record<string, unknown>).legacy_category);
  return result;
};

export const buildDedupedCategories = (partners: ApiPartner[]): CatalogCategory[] => {
  const bySlug = new Map<string, CatalogCategory>();
  const byName = new Map<string, CatalogCategory>();
  const translitNameToSlug = new Map<string, string>();

  [['krasota', 'Красота'], ['manikyur-pedikyur', 'Маникюр / педикюр'], ['brovi-resnitsy', 'Брови / ресницы'], ['kosmetologiya', 'Косметология']].forEach(([slug, label]) => {
    translitNameToSlug.set(normalizeKey(label) ?? label.toLowerCase(), slug);
  });

  const register = (candidate: Record<string, unknown>) => {
    const slug = normalizeKey(candidate.slug ?? candidate.category_slug);
    const rawLabel =
      normalizeText(candidate.name) ??
      normalizeText(candidate.title) ??
      normalizeText(candidate.label) ??
      normalizeText(candidate.category_name) ??
      normalizeText(candidate.category);
    const normalizedLabelKey = normalizeKey(rawLabel);

    const inferredSlug = slug
      ?? (normalizedLabelKey ? translitNameToSlug.get(normalizedLabelKey) ?? null : null)
      ?? (rawLabel && isSlugLike(rawLabel) ? normalizeKey(rawLabel) : null);

    const displayLabel = rawLabel
      ? (formatPartnerCategoryLabel(rawLabel) ?? (isSlugLike(rawLabel) ? prettifySlug(rawLabel.toLowerCase()) : rawLabel))
      : (inferredSlug ? prettifySlug(inferredSlug) : null);
    const nameKey = normalizeKey(displayLabel);

    if (!inferredSlug && !nameKey) return;

    const existing = (inferredSlug ? bySlug.get(inferredSlug) : null) ?? (nameKey ? byName.get(nameKey) : null) ?? null;
    const finalLabel = existing?.label && !isSlugLike(existing.label)
      ? existing.label
      : displayLabel ?? existing?.label ?? (inferredSlug ? prettifySlug(inferredSlug) : 'Категория');
    const finalSlug = existing?.slug ?? inferredSlug ?? nameKey ?? '';
    const normalizedCategory = { label: finalLabel, slug: finalSlug };

    if (inferredSlug) bySlug.set(inferredSlug, normalizedCategory);
    if (nameKey) byName.set(nameKey, normalizedCategory);
    if (normalizedLabelKey && inferredSlug) translitNameToSlug.set(normalizedLabelKey, inferredSlug);
  };

  partners.forEach((partner) => {
    extractCategoryCandidates(partner).forEach(register);
  });

  return Array.from(new Set([...bySlug.values(), ...byName.values()]));
};
