import { Button, Div, Group, Spacing, Text } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiClient, ApiSubscription, ApiUser } from '../api/client';

type HomePageProps = {
  userName?: string;
  user?: ApiUser | null;
  client?: ApiClient | null;
  subscription?: ApiSubscription | null;
  onCatalog: () => void;
  onPrivileges: () => void;
  onSubscription: () => void;
  onProfile: () => void;
};

export function HomePage({
  userName,
  user,
  client,
  subscription,
  onCatalog,
  onPrivileges,
  onSubscription,
  onProfile,
}: HomePageProps) {
  const displayName = [
    client?.full_name,
    user?.full_name,
    user?.email,
    user?.login,
    userName,
  ].find((value) => typeof value === 'string' && value.trim().length > 0) || 'Участница клуба';

  const displayCity = [
    client?.city,
    client?.city_name,
    client?.custom_city,
  ].find((value) => typeof value === 'string' && value.trim().length > 0) || 'Город не выбран';

  const isSubscriptionActive = Boolean(subscription?.is_active ?? subscription?.active);
  const subscriptionStatus = isSubscriptionActive ? 'активна' : 'не активна';
  const subscriptionExpiresAt = subscription?.expires_at ?? subscription?.end_date;

  return (
    <AppShell title="Мой клуб">
      <Group>
        <Div>Привет, {displayName}!</Div>
        <Div>
          <Text weight="2">Имя: {displayName}</Text>
          <Spacing size={8} />
          <Text>Город: {displayCity}</Text>
          <Spacing size={8} />
          <Text>Статус подписки: {subscriptionStatus}</Text>
          {subscriptionExpiresAt ? (
            <>
              <Spacing size={8} />
              <Text>Подписка до: {subscriptionExpiresAt}</Text>
            </>
          ) : null}
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
