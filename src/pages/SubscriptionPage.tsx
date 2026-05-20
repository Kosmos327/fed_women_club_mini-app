import { Button, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function SubscriptionPage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Подписка">
      <Group>
        <Div>Здесь будет информация о подписке.</Div>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
