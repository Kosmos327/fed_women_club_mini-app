import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
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
  return (
    <AppShell title="Партнёры">
      <Group className="fade-up">
        <Header>Партнёры</Header>
        {partners.length === 0 ? (
          <EmptyState header="Партнёров пока нет" description="В вашем городе пока нет партнёров" />
        ) : (
          <Div className="partner-catalog-grid">
            {partners.map((partner, index) => {
              const partnerName = partner.name ?? partner.title ?? 'Партнёр клуба';
              const partnerCity = partner.city_name ?? partner.city;
              const partnerDescription = partner.description ?? partner.short_description;
              const partnerBenefit = partner.discount_text ?? partner.benefit_text;
              const partnerImage = getPartnerImageSrc(partner);
              const categoryLabel = partner.category ?? 'Партнёр клуба';

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
                      {partner.category ? <span className="bloom-badge">{partner.category}</span> : null}
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
        )}
        <Div><Button className="bloom-button-muted" mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
