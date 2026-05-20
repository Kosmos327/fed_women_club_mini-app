import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiPartner } from '../api/client';

type PartnerPageProps = {
  selectedPartner: ApiPartner | null;
  onBack: () => void;
};

export function PartnerPage({ selectedPartner, onBack }: PartnerPageProps) {
  const partnerName = selectedPartner?.name ?? selectedPartner?.title ?? 'Партнёр клуба';
  const partnerDescription = selectedPartner?.description ?? selectedPartner?.short_description;
  const partnerBenefit = selectedPartner?.discount_text ?? selectedPartner?.benefit_text;

  return (
    <AppShell title="Партнёр">
      <Group>
        <Header>Партнёр</Header>
        <Div>
          <Card mode="shadow">
            <Div>
              <Title level="2" weight="2">{partnerName}</Title>
              {partnerDescription ? (
                <>
                  <Spacing size={8} />
                  <Text>{partnerDescription}</Text>
                </>
              ) : null}
              {selectedPartner?.address ? (
                <>
                  <Spacing size={8} />
                  <Text>Адрес: {selectedPartner.address}</Text>
                </>
              ) : null}
              {partnerBenefit ? (
                <>
                  <Spacing size={8} />
                  <Text>Привилегия: {partnerBenefit}</Text>
                </>
              ) : null}
            </Div>
          </Card>
        </Div>
        <Div><Button onClick={onBack}>Назад к партнёрам</Button></Div>
      </Group>
    </AppShell>
  );
}
