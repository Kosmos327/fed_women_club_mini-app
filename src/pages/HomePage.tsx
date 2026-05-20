import { Button, Div, Group, Spacing, Text } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

type HomePageProps = {
  userName?: string;
  city?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  onCatalog: () => void;
  onPrivileges: () => void;
  onSubscription: () => void;
  onProfile: () => void;
};

export function HomePage({
  userName,
  city,
  subscriptionStatus,
  subscriptionExpiresAt,
  onCatalog,
  onPrivileges,
  onSubscription,
  onProfile,
}: HomePageProps) {
  return (
    <AppShell title="Мой клуб">
      <Group>
        <Div>Привет{userName ? `, ${userName}` : ''}!</Div>
        <Div>
          <Text weight="2">Имя: {userName || '—'}</Text>
          <Spacing size={8} />
          <Text>Город: {city || '—'}</Text>
          <Spacing size={8} />
          <Text>Статус подписки: {subscriptionStatus || '—'}</Text>
          <Spacing size={8} />
          <Text>Подписка до: {subscriptionExpiresAt || '—'}</Text>
        </Div>
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
