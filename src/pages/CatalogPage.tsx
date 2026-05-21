import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getPartnerImageSrc } from '../utils/partnerImage';
import type { ApiPartner } from '../api/client';

type CatalogPageProps = {
  partners: ApiPartner[];
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};


export function CatalogPage({ partners, onBack, onPartnerClick }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const resolveCategory = (partner: ApiPartner): string | null => {
    const value =
      (partner.category && typeof partner.category === 'object'
        ? ((partner.category as Record<string, unknown>).name ?? (partner.category as Record<string, unknown>).title)
        : partner.category) ??
      partner.category_name ??
      partner.type ??
      partner.service_category;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  };
  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(partners.map(resolveCategory).filter((value): value is string => Boolean(value))))],
    [partners],
  );
  const filteredPartners = useMemo(
    () => (activeCategory === 'Все' ? partners : partners.filter((partner) => resolveCategory(partner) === activeCategory)),
    [activeCategory, partners],
  );

  return (
    <AppShell title="Партнёры">
      <Group className="fade-up">
        <Header>Партнёры</Header>
        {partners.length === 0 ? (
          <EmptyState header="Партнёров пока нет" description="В вашем городе пока нет партнёров" />
        ) : (
          <>
            <Div className="catalog-filters">
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
              const categoryLabel = resolveCategory(partner) ?? 'Без категории';
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
                      {resolveCategory(partner) ? <span className="bloom-badge">{resolveCategory(partner)}</span> : null}
                      {partnerCity ? <span className="bloom-badge">{partnerCity}</span> : null}
                    </div>
                    {partner.address ? <Text className="partner-card__address">{partner.address}</Text> : null}
                    {partnerDescription ? <Text className="partner-card__description">{partnerDescription}</Text> : null}
                    {partnerBenefit ? <Text className="partner-card__benefit">{partnerBenefit}</Text> : null}
                    <Spacing size={12} />
                    <Button className="bloom-button-secondary partner-card__button" stretched size="m" onClick={() => onPartnerClick(partner)}>Подробнее</Button>
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
