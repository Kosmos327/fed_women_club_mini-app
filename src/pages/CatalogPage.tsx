import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import type { ApiPartner } from '../api/client';

type CatalogPageProps = {
  partners: ApiPartner[];
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};

const resolvePartnerImage = (partner: ApiPartner): string | null => {
  const imageSource = [
    partner.photo_url,
    partner.image_url,
    partner.cover,
    partner.avatar,
    partner.logo,
    (partner as Record<string, unknown>).logo_url,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);

  return typeof imageSource === 'string' ? imageSource : null;
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
              const partnerImage = resolvePartnerImage(partner);
              const categoryLabel = partner.category ?? 'Партнёр клуба';

              return (
                <Card className="partner-card" mode="shadow" key={String(partner.id ?? `${partnerName}-${index}`)}>
                  {partnerImage ? (
                    <img className="partner-card__image" src={partnerImage} alt={partnerName} loading="lazy" />
                  ) : (
                    <div className="partner-card__placeholder">
                      <Text weight="2">{categoryLabel}</Text>
                    </div>
                  )}
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
                    <Button className="partner-card__button" stretched size="m" onClick={() => onPartnerClick(partner)}>Подробнее</Button>
                  </Div>
                </Card>
              );
            })}
          </Div>
        )}
        <Div><Button mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
