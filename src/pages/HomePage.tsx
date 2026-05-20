import { Button, Div, Group, Spacing } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

type HomePageProps = {
  userName?: string;
  onCatalog: () => void;
  onPrivileges: () => void;
  onSubscription: () => void;
  onProfile: () => void;
};

export function HomePage({ userName, onCatalog, onPrivileges, onSubscription, onProfile }: HomePageProps) {
  return (
    <AppShell title="Мой клуб">
      <Group>
        <Div>Привет{userName ? `, ${userName}` : ''}!</Div>
        <Div>
          <Button stretched size="l" onClick={onCatalog}>Партнёры</Button>
          <Spacing size={12} />
          <Button stretched size="l" mode="secondary" onClick={onPrivileges}>Мои привилегии</Button>
          <Spacing size={12} />
          <Button stretched size="l" mode="secondary" onClick={onSubscription}>Подписка</Button>
          <Spacing size={12} />
          <Button stretched size="l" mode="secondary" onClick={onProfile}>Профиль</Button>
        </Div>
      </Group>
    </AppShell>
  );
}
