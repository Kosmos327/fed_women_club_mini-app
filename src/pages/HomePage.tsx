import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiClient, ApiSubscription, ApiUser } from '../api/client';

type HomePageProps = {
  user: ApiUser | null;
  client: ApiClient | null;
  subscription: ApiSubscription | null;
  onCatalog: () => void;
  onPrivileges: () => void;
  onSubscription: () => void;
  onProfile: () => void;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function HomePage({ user, client, subscription, onCatalog, onPrivileges, onSubscription, onProfile }: HomePageProps) {
  const userData = asRecord(user);
  const clientData = asRecord(client);
  const subscriptionData = asRecord(subscription);

  const profileName =
    String(clientData.full_name ?? userData.full_name ?? userData.email ?? userData.login ?? '').trim() || 'Участница клуба';
  const city = String(clientData.city ?? clientData.city_name ?? clientData.custom_city ?? '').trim();

  const activeRaw = subscriptionData.is_active ?? subscriptionData.active ?? subscriptionData.status;
  const isActive = activeRaw === true || activeRaw === 'active' || activeRaw === 'paid';
  const endDate = String(
    subscriptionData.ends_at ?? subscriptionData.end_date ?? subscriptionData.expires_at ?? subscriptionData.valid_until ?? '',
  ).trim();

  return (
    <AppShell title="Мой клуб">
      <Group>
        <Header mode="primary">Профиль клуба</Header>
        <Div>
          <Card mode="outline">
            <Div>
              <Title level="3" weight="2">{profileName}</Title>
              <Spacing size={8} />
              <Text>{city ? `Город: ${city}` : 'Город: не указан'}</Text>
              <Text>{`Подписка: ${isActive ? 'активна' : 'не активна'}`}</Text>
              {endDate && <Text>{`Действует до: ${endDate}`}</Text>}
            </Div>
          </Card>
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
