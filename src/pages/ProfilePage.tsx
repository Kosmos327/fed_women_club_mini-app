import { Button, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function ProfilePage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Профиль">
      <Group>
        <Div>Здесь будет профиль участницы клуба.</Div>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
