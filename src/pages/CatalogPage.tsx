import { Button, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function CatalogPage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Партнёры">
      <Group>
        <Div>Каталог будет загружаться из backend API.</Div>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
