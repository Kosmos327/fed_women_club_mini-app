import type { ApiOffer } from '../api/client';

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, '').replace(',', '.');
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
};

const formatRubles = (value: number | null): string => {
  if (value == null) return '—';
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
};

export type OfferPricingView = {
  basePrice: number | null;
  memberPrice: number | null;
  savingAmount: number | null;
  hasBasePrice: boolean;
  hasMemberPrice: boolean;
  hasSaving: boolean;
  basePriceLabel: string;
  memberPriceLabel: string;
  savingLabel: string;
};

export function getOfferPricingView(offer: ApiOffer): OfferPricingView {
  const basePrice = parseNumber(offer.base_price ?? offer.regular_price ?? offer.price ?? offer.old_price);
  const memberPriceRaw = parseNumber(
    offer.final_price ?? offer.member_price ?? offer.club_price ?? offer.discounted_price ?? offer.price_with_discount,
  );
  const discountPercent = parseNumber(offer.discount_percent ?? offer.discount);

  const memberPrice = memberPriceRaw
    ?? (basePrice != null && discountPercent != null ? basePrice * (1 - discountPercent / 100) : null);

  const savingAmount = basePrice != null && memberPrice != null ? basePrice - memberPrice : null;
  const hasSaving = savingAmount != null && savingAmount > 0;

  return {
    basePrice,
    memberPrice,
    savingAmount,
    hasBasePrice: basePrice != null,
    hasMemberPrice: memberPrice != null,
    hasSaving,
    basePriceLabel: formatRubles(basePrice),
    memberPriceLabel: formatRubles(memberPrice),
    savingLabel: hasSaving ? `−${Math.round(savingAmount).toLocaleString('ru-RU')} ₽` : '—',
  };
}
