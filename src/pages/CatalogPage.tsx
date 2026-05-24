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
  selectedCategorySlug: string;
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
    const bySlug = new Map<string, string>();
    partners.forEach((partner) => {
      const slugs = getPartnerCategorySlugs(partner);
      const label = getPartnerCategoryName(partner) ?? null;
      slugs.forEach((slug) => {
        if (!bySlug.has(slug)) bySlug.set(slug, label ?? slug);
      });
    });
    return Array.from(bySlug.entries()).map(([slug, label]) => ({ label, value: slug }));
  }, [partners]);

  return (
    <AppShell titleClassName="bloom-panel-header-title-compact" title="Партнёры">
      <Group className="fade-up">
        <Div className="bloom-page-title-card">Партнёры</Div>
        <Div className="catalog-filters glass-panel">
          <Text>Город: {selectedCityLabel}</Text>
          {isProfileCityFallback ? <Text className="state-note">Каталог показывается по городу из профиля.</Text> : null}
          <Select value={selectedCityId} onChange={(event) => onCityChange(event.target.value)} options={cities.map((city) => ({ label: city.name, value: String(city.id) }))} placeholder="Выберите город" />
          <Select value={selectedCategorySlug} onChange={(event) => onCategoryChange(event.target.value)} options={[{ label: 'Все категории', value: '' }, ...categories]} placeholder="Категория" />
          <Spacing size={8} />
          <Button mode="secondary" onClick={onResetAllFilters}>Сбросить фильтры</Button>
        </Div>

        {partners.length === 0 ? (
          <EmptyState
            header={selectedCategorySlug ? 'Партнёры не найдены в этой категории' : 'В выбранном городе пока нет партнёров'}
            description={selectedCategorySlug ? 'В этой категории и городе партнёров пока нет. Попробуйте выбрать другую категорию или город.' : 'Попробуйте выбрать другой город или сбросить фильтры.'}
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
              const categoryLabel = normalizedCategory ?? 'Без категории';

              return (
                <Card className="partner-card" mode="shadow" key={String(partner.id ?? `${partnerName}-${index}`)}>
                  <ImageWithFallback src={partnerImage} alt={partnerName} className="partner-card__image" placeholderClassName="partner-card__placeholder" placeholderLabel={categoryLabel} />
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
