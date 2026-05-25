import { Button, Card, Div, Group, Select, Spacing, Text, Title } from '@vkontakte/vkui';
import { useMemo } from 'react';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getPartnerImageSrc } from '../utils/partnerImage';
import type { ApiCity, ApiPartner } from '../api/client';
import { getPartnerCategoryName, getPartnerCategorySlugs } from '../utils/format';

type CatalogPageProps = {
  partners: ApiPartner[];
  cities: ApiCity[];
  selectedCityId: string;
  selectedCategorySlug: string | null;
  selectedCityLabel: string;
  isProfileCityFallback: boolean;
  onCityChange: (cityId: string) => void;
  onCategoryChange: (categorySlug: string) => void;
  onResetAllFilters: () => void;
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};

export function CatalogPage({ partners, cities, selectedCityId, selectedCategorySlug, selectedCityLabel, isProfileCityFallback, onCityChange, onCategoryChange, onResetAllFilters, onBack, onPartnerClick }: CatalogPageProps) {
  const categories = useMemo(() => {
    const dedupedCategories = new Map<string, { label: string; value: string }>();
    const normalize = (value: unknown): string | null => {
      if (typeof value !== 'string') return null;
      const cleaned = value.trim();
      return cleaned.length > 0 ? cleaned : null;
    };

    const registerCategory = (candidate: { slug?: unknown; id?: unknown; name?: unknown; title?: unknown }) => {
      const slug = normalize(candidate.slug)?.toLowerCase();
      const id = candidate.id != null ? String(candidate.id).trim() : '';
      const label = normalize(candidate.name) ?? normalize(candidate.title);
      const normalizedLabel = label?.toLowerCase();
      const key = slug ? `slug:${slug}` : id ? `id:${id}` : normalizedLabel ? `name:${normalizedLabel}` : null;
      if (!key || !label) return;
      if (!dedupedCategories.has(key)) dedupedCategories.set(key, { label, value: slug ?? normalizedLabel ?? id });
    };

    partners.forEach((partner) => {
      const fromPartnerLabel = getPartnerCategoryName(partner);
      const fromPartnerSlugs = getPartnerCategorySlugs(partner);
      fromPartnerSlugs.forEach((slug) => registerCategory({ slug, name: fromPartnerLabel ?? slug }));
      if (Array.isArray(partner.categories)) {
        partner.categories.forEach((entry) => {
          if (entry && typeof entry === 'object') {
            const category = entry as Record<string, unknown>;
            registerCategory({
              slug: category.slug,
              id: category.id,
              name: category.name,
              title: category.title,
            });
          }
        });
      }
    });

    return Array.from(dedupedCategories.values());
  }, [partners]);

  if (import.meta.env.DEV) {
    console.debug('Catalog visibility diagnostics', {
      loadedPartnersCount: partners.length,
      visiblePartnersCount: partners.length,
      selectedCityId: selectedCityId || null,
      selectedCategorySlug,
    });
  }

  return (
    <AppShell titleClassName="bloom-panel-header-title-compact" title="Партнёры">
      <Group className="fade-up">
        <Div className="bloom-page-title-card">Партнёры</Div>
        <Div className="catalog-filters-panel glass-panel">
          <Div className="catalog-city-row">
            <Text className="catalog-city-row__label">Город</Text>
            <Text className="catalog-city-row__value">{selectedCityLabel}</Text>
          </Div>
          <Select
            value={selectedCityId}
            onChange={(event) => onCityChange(event.target.value)}
            options={cities.map((city) => ({ label: city.name, value: String(city.id) }))}
            placeholder={isProfileCityFallback && selectedCityLabel ? selectedCityLabel : 'Выберите город'}
          />
          <Div className="catalog-chips" role="tablist" aria-label="Категории каталога">
            <button type="button" className={`catalog-filter-chip ${!selectedCategorySlug ? 'catalog-filter-chip--active' : ''}`} onClick={() => onCategoryChange('')}>Все</button>
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`catalog-filter-chip ${selectedCategorySlug === category.value ? 'catalog-filter-chip--active' : ''}`}
                onClick={() => onCategoryChange(category.value)}
                title={category.label}
              >
                {category.label}
              </button>
            ))}
          </Div>
          <Button className="catalog-reset-button" mode="secondary" size="s" onClick={onResetAllFilters}>Сбросить фильтры</Button>
        </Div>

        {partners.length === 0 ? (
          <EmptyState
            header="Партнёры не найдены"
            description="Попробуйте выбрать категорию «Все» или другой город."
          />
        ) : (
          <Div className="partner-catalog-grid">
            {partners.map((partner, index) => {
              const partnerName = partner.name ?? partner.title ?? 'Партнёр клуба';
              const partnerCity = partner.city_name ?? partner.city;
              const partnerDescription = partner.description ?? partner.short_description;
              const partnerBenefit = partner.discount_text ?? partner.benefit_text;
              const partnerImage = getPartnerImageSrc(partner);
              const normalizedCategory = getPartnerCategoryName(partner);

              return (
                <Card className="partner-card" mode="shadow" key={String(partner.id ?? `${partnerName}-${index}`)}>
                  <ImageWithFallback src={partnerImage} alt={partnerName} className="partner-card__image" placeholderClassName="partner-card__placeholder" placeholderLabel={partnerName} />
                  <Div>
                    <Title className="partner-card__title" level="2" weight="2">{partnerName}</Title>
                    <div className="partner-badges">
                      {normalizedCategory ? <span className="bloom-badge">{normalizedCategory}</span> : null}
                      {partnerCity ? <span className="bloom-badge">{partnerCity}</span> : null}
                    </div>
                    {partner.address ? <Text className="partner-card__address">{partner.address}</Text> : null}
                    {partnerDescription ? <Text className="partner-card__description">{partnerDescription}</Text> : null}
                    {partnerBenefit ? <Text className="partner-card__benefit">{partnerBenefit}</Text> : null}
                    <Spacing size={12} />
                    <Button className="bloom-button-primary partner-card__button" mode="secondary" stretched size="m" onClick={() => onPartnerClick(partner)}>Подробнее</Button>
                  </Div>
                </Card>
              );
            })}
          </Div>
        )}
        <Div><Button className="bloom-button-muted" mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
