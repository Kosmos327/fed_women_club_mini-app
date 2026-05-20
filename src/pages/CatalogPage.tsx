import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import type { ApiPartner } from '../api/client';

type CatalogPageProps = {
  partners: ApiPartner[];
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};

export function CatalogPage({ partners, onBack, onPartnerClick }: CatalogPageProps) {
  return (
    <AppShell title="Партнёры">
      <Group>
        <Header>Партнёры</Header>
        {partners.length === 0 ? (
          <EmptyState header="Партнёров пока нет" description="В вашем городе пока нет партнёров" />
        ) : (
          <Div>
            {partners.map((partner, index) => {
              const partnerName = partner.name ?? partner.title ?? 'Партнёр клуба';
              const partnerCity = partner.city_name ?? partner.city;
              const partnerDescription = partner.description ?? partner.short_description;
              const partnerBenefit = partner.discount_text ?? partner.benefit_text;

              return (
                <div key={String(partner.id ?? `${partnerName}-${index}`)}>
                  <Card mode="shadow">
                    <Div>
                      <Title level="3" weight="2">{partnerName}</Title>
                      {partner.category ? <Text style={{ marginTop: 8 }}>Категория: {partner.category}</Text> : null}
                      {partnerCity ? <Text style={{ marginTop: 8 }}>Город: {partnerCity}</Text> : null}
                      {partner.address ? <Text style={{ marginTop: 8 }}>Адрес: {partner.address}</Text> : null}
                      {partnerDescription ? <Text style={{ marginTop: 8 }}>{partnerDescription}</Text> : null}
                      {partnerBenefit ? <Text style={{ marginTop: 8 }}>Привилегия: {partnerBenefit}</Text> : null}
                      <Spacing size={12} />
                      <Button size="m" onClick={() => onPartnerClick(partner)}>Подробнее</Button>
                    </Div>
                  </Card>
                  <Spacing size={12} />
                </div>
              );
            })}
          </Div>
        )}
        <Div><Button mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
