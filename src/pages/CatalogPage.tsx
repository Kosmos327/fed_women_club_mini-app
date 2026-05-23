import { Button, Card, Div, Group, Spacing, Text, Title } from '@vkontakte/vkui';
import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getPartnerImageSrc } from '../utils/partnerImage';
import type { ApiPartner } from '../api/client';
import { getPartnerCategoryName, getPartnerCategoryNames } from '../utils/format';

type CatalogPageProps = {
  partners: ApiPartner[];
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};


export function CatalogPage({ partners, onBack, onPartnerClick }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    partners.forEach((partner) => {
      getPartnerCategoryNames(partner).forEach((category) => categorySet.add(category));
    });
    return ['Все', ...Array.from(categorySet)];
  }, [partners]);
  const filteredPartners = useMemo(
    () => (activeCategory === 'Все'
      ? partners
      : partners.filter((partner) => getPartnerCategoryNames(partner).includes(activeCategory))),
    [activeCategory, partners],
  );

  if (import.meta.env.DEV) {
    const firstPartner = partners[0];
    console.debug('Catalog category diagnostics', {
      partnersCount: partners.length,
      firstPartnerKeys: firstPartner ? Object.keys(firstPartner) : [],
      firstPartnerCategoryFields: firstPartner
        ? {
            category: firstPartner.category,
            category_name: firstPartner.category_name,
            type: firstPartner.type,
            service_category: firstPartner.service_category,
          }
        : null,
      computedCategories: categories,
    });
  }

  return (
    <AppShell titleClassName="bloom-panel-header-title-compact" title="Партнёры">
      <Group className="fade-up">
        <Div className="bloom-page-title-card">Партнёры</Div>
        {partners.length === 0 ? (
          <EmptyState header="Партнёров пока нет" description="В вашем городе пока нет партнёров" />
        ) : (
          <>
            <Div className="catalog-filters glass-panel">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`catalog-filter-chip ${activeCategory === category ? 'catalog-filter-chip--active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </Div>
            {filteredPartners.length === 0 ? <EmptyState header="Ничего не найдено" description="Попробуйте выбрать другую категорию" /> : null}
            <Div className="partner-catalog-grid">
              {filteredPartners.map((partner, index) => {
              const partnerName = partner.name ?? partner.title ?? 'Партнёр клуба';
              const partnerCity = partner.city_name ?? partner.city;
              const partnerDescription = partner.description ?? partner.short_description;
              const partnerBenefit = partner.discount_text ?? partner.benefit_text;
              const partnerImage = getPartnerImageSrc(partner);
              const normalizedCategory = getPartnerCategoryName(partner);
              const categoryLabel = normalizedCategory ?? 'Без категории';
              if (import.meta.env.DEV) {
                console.debug('Catalog partner image resolution', {
                  partnerId: partner.id,
                  partnerName,
                  partnerKeys: Object.keys(partner),
                  resolvedImage: partnerImage,
                });
              }

                return (
                <Card className="partner-card" mode="shadow" key={String(partner.id ?? `${partnerName}-${index}`)}>
                  <ImageWithFallback
                    src={partnerImage}
                    alt={partnerName}
                    className="partner-card__image"
                    placeholderClassName="partner-card__placeholder"
                    placeholderLabel={categoryLabel}
                  />
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
          </>
        )}
        <Div><Button className="bloom-button-muted" mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
