import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import type { ApiVerification } from '../api/client';
import { formatDateTime, formatVerificationStatus } from '../utils/format';

type PrivilegesPageProps = {
  onBack: () => void;
  verifications: ApiVerification[];
};

export function PrivilegesPage({ onBack, verifications }: PrivilegesPageProps) {
  return (
    <AppShell title="Мои привилегии">
      <Group className="fade-up">
        <Header>Мои привилегии</Header>
        {verifications.length === 0 ? (
          <EmptyState header="Пока пусто" description="У вас пока нет активных привилегий" />
        ) : (
          <Div>
            {verifications.map((item, index) => {
              const partnerLabel = typeof item.partner === 'string' ? item.partner : item.partner_name;
              const expiresAt = formatDateTime(item.expires_at);
              const usedAt = formatDateTime(item.used_at);

              return (
                <Card key={String(item.id ?? item.code ?? index)}>
                  <Div>
                    {item.code ? <Title level="3">Код: {item.code}</Title> : null}
                    {partnerLabel ? <Text>Партнёр: {partnerLabel}</Text> : null}
                    <Text>Статус: {formatVerificationStatus(item.status)}</Text>
                    {expiresAt !== '—' ? <Text>Действует до: {expiresAt}</Text> : null}
                    {usedAt !== '—' ? <Text>Использована: {usedAt}</Text> : null}
                  </Div>
                </Card>
              );
            })}
          </Div>
        )}
        <Spacing size={8} />
        <Div><Button onClick={onBack}>На главную</Button></Div>
      </Group>
    </AppShell>
  );
}
