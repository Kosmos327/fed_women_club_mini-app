import { Button, CardGrid, ContentCard, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function PartnerPage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Партнёр">
      <Group>
        <CardGrid size="l">
          <ContentCard subtitle="Партнёр клуба" header="Здесь будет карточка партнёра" text="Данные карточки и условий привилегий будут приходить из backend API." />
        </CardGrid>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
