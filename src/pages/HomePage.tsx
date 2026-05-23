import { Button, Div, Group, Spacing, Text } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiClient, ApiSubscription, ApiUser } from '../api/client';
import { formatDate, formatSubscriptionStatus } from '../utils/format';

const formatRub = (value: unknown): string => {
  if (value == null) return '—';
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.').replace(/\s+/g, ''));
  if (!Number.isFinite(numeric)) return '—';
  return `${Math.round(numeric).toLocaleString('ru-RU')} ₽`;
};

type HomePageProps = {
  userName?: string;
  user?: ApiUser | null;
  client?: ApiClient | null;
  subscription?: ApiSubscription | null;
  onCatalog: () => void;
  onPrivileges: () => void;
  onSubscription: () => void;
  onProfile: () => void;
  onSavings: () => void;
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
  onSavings,
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
  const totalSavingsRaw = (client as Record<string, unknown> | null)?.total_saving_amount
    ?? (client as Record<string, unknown> | null)?.saving_amount;

  return (
    <AppShell title="Мой клуб" titleClassName="bloom-panel-header-title-glass">
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
        <Div className="home-value-widget glass-panel" role="button" tabIndex={0} onClick={onSavings} onKeyDown={(e) => e.key === 'Enter' ? onSavings() : null}>
          <Text className="home-value-widget__label">Вы уже сэкономили</Text>
          <Text className="home-value-widget__amount" weight="1">{formatRub(totalSavingsRaw)}</Text>
          <Text className="state-note">Сумма экономии по вашим использованным привилегиям.</Text>
        </Div>
        <Div className="bloom-nav-grid">
          <Button className="bloom-button-primary" stretched size="l" onClick={onCatalog}>Партнёры</Button>
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onSavings}>Моя экономия</Button>
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onPrivileges}>Мои привилегии</Button>
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onSubscription}>Подписка</Button>
          <Button stretched size="l" className="bloom-button-secondary" mode="secondary" onClick={onProfile}>Профиль</Button>
        </Div>
      </Group>
    </AppShell>
  );
}
