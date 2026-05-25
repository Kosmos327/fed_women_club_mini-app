import type { ApiPartner } from '../api/client';

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

  const register = (candidate: Record<string, unknown>) => {
    const slug = normalizeKey(candidate.slug ?? candidate.category_slug);
    const label =
      normalizeText(candidate.name) ??
      normalizeText(candidate.title) ??
      normalizeText(candidate.label) ??
      normalizeText(candidate.category_name) ??
      normalizeText(candidate.category);
    const nameKey = normalizeKey(label);

    if (!slug && !nameKey) return;

    const existing = (slug ? bySlug.get(slug) : null) ?? (nameKey ? byName.get(nameKey) : null) ?? null;
    const finalLabel = existing?.label ?? label ?? slug ?? 'Категория';
    const finalSlug = existing?.slug ?? slug ?? nameKey ?? '';
    const normalizedCategory = { label: finalLabel, slug: finalSlug };

    if (slug) bySlug.set(slug, normalizedCategory);
    if (nameKey) byName.set(nameKey, normalizedCategory);
  };

  partners.forEach((partner) => {
    extractCategoryCandidates(partner).forEach(register);
  });

  return Array.from(new Set([...bySlug.values(), ...byName.values()]));
};
