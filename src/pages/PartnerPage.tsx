import { Button, Card, CardGrid, Div, Group, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function PartnerPage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Партнёр">
      <Group>
        <CardGrid size="l">
          <Card mode="shadow">
            <Div>
              <Title level="2" weight="2" style={{ marginBottom: 8 }}>
                Карточка партнёра
              </Title>
              <Text>Данные партнёра будут загружаться из backend API.</Text>
            </Div>
          </Card>
        </CardGrid>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
