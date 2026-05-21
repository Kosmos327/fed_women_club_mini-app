import { Button, Div, Group, Spacing, Text } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiClient, ApiSubscription, ApiUser } from '../api/client';
import { formatDate, formatSubscriptionStatus } from '../utils/format';

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
  const pickFirstText = (values: unknown[], fallback: string) => {
    const found = values.find((value) => typeof value === 'string' && value.trim().length > 0);
    return typeof found === 'string' ? found : fallback;
  };

  const selectedCityName =
    client?.selected_city && typeof client.selected_city === 'object' && 'name' in client.selected_city
      ? String(client.selected_city.name ?? '')
      : '';

  const displayName = pickFirstText([
    client?.full_name,
    client?.name,
    user?.full_name,
    user?.name,
    user?.email,
    user?.login,
    userName,
  ], 'Участница клуба');

  const displayCity = pickFirstText([
    client?.city_name,
    client?.custom_city,
    client?.city,
    client?.selected_city_name,
    selectedCityName,
  ], 'Город не выбран');

  const isSubscriptionActive = Boolean(subscription?.is_active ?? subscription?.active);
  const subscriptionStatus = formatSubscriptionStatus(subscription?.status as string | undefined, isSubscriptionActive);
  const subscriptionExpiresAt = subscription?.expires_at ?? subscription?.end_date;

  return (
    <AppShell title="Мой клуб" titleClassName="page-title-readable">
      <Group className="fade-up">
        <Div className="glass-panel"><Text weight="2">Привет, {displayName}!</Text></Div>
        <Div className="bloom-card glass-panel">
          <Text weight="2">Имя: {displayName}</Text>
          <Spacing size={8} />
          <Text>Город: {displayCity}</Text>
          <Spacing size={8} />
          <Text>Статус подписки: <span className={isSubscriptionActive ? "bloom-badge bloom-badge--success" : "bloom-badge"}>{subscriptionStatus}</span></Text>
          {subscriptionExpiresAt ? (
            <>
              <Spacing size={8} />
              <Text>Подписка до: {formatDate(subscriptionExpiresAt)}</Text>
            </>
          ) : null}
        </Div>
        <Div className="bloom-nav-grid">
          <Button className="bloom-button-primary" stretched size="l" onClick={onCatalog}>Партнёры</Button>
          <Spacing size={12} />
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onPrivileges}>Мои привилегии</Button>
          <Spacing size={12} />
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onSubscription}>Подписка</Button>
          <Spacing size={12} />
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onProfile}>Профиль</Button>
        </Div>
      </Group>
    </AppShell>
  );
}
