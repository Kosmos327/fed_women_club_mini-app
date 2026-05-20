import { Button, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

export function PrivilegesPage({ onBack }: { onBack: () => void }) {
  return (
    <AppShell title="Мои привилегии">
      <Group>
        <Div>Здесь будет список ваших привилегий.</Div>
        <Div><Button onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
