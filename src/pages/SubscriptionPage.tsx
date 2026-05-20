import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiPaymentRequest, ApiSubscription } from '../api/client';

type Props = {
  onBack: () => void;
  subscription: ApiSubscription | null;
  paymentRequest: ApiPaymentRequest | null;
  isCreatingPaymentRequest: boolean;
  createPaymentRequestError: string;
  onCreatePaymentRequest: () => void;
  isMarkingPaymentPaid: boolean;
  markPaymentPaidError: string;
  markPaymentPaidSuccessMessage: string;
  onMarkPaymentPaid: (paymentRequestId: string | number) => void;
};

function formatStatus(subscription: ApiSubscription | null): string {
  const isActive = Boolean(subscription?.is_active ?? subscription?.active);
  return isActive ? 'Активна' : 'Не активна';
}

export function SubscriptionPage({
  onBack,
  subscription,
  paymentRequest,
  isCreatingPaymentRequest,
  createPaymentRequestError,
  onCreatePaymentRequest,
  isMarkingPaymentPaid,
  markPaymentPaidError,
  markPaymentPaidSuccessMessage,
  onMarkPaymentPaid,
}: Props) {
  const expiresAt = subscription?.expires_at ?? subscription?.end_date ?? null;
  const subscriptionPrice = subscription?.price ?? subscription?.amount ?? '349 ₽';
  const paymentId = paymentRequest?.id;

  return (
    <AppShell title="Подписка">
      <Group>
        <Header>Подписка</Header>
        <Div>
          <Card mode="shadow">
            <Div>
              <Title level="2" weight="2">Статус: {formatStatus(subscription)}</Title>
              <Spacing size={12} />
              <Text>Дата окончания: {expiresAt ?? '—'}</Text>
              <Spacing size={8} />
              <Text>Стоимость: {String(subscriptionPrice)}</Text>
              <Spacing size={16} />
              <Button size="l" stretched onClick={onCreatePaymentRequest} loading={isCreatingPaymentRequest}>
                Оформить / Продлить
              </Button>
            </Div>
          </Card>
        </Div>

        {createPaymentRequestError ? <Div><Text>{createPaymentRequestError}</Text></Div> : null}

        {paymentRequest ? (
          <Div>
            <Card mode="shadow">
              <Div>
                <Title level="3" weight="2">Заявка на оплату создана</Title>
                <Spacing size={12} />
                <Text>Сумма: {String(paymentRequest.amount ?? paymentRequest.price ?? '—')}</Text>
                <Spacing size={8} />
                <Text>Статус: {String(paymentRequest.status ?? '—')}</Text>
                {paymentRequest.payment_url ? (
                  <>
                    <Spacing size={12} />
                    <Button size="m" stretched href={String(paymentRequest.payment_url)} target="_blank">
                      Оплатить
                    </Button>
                  </>
                ) : null}
                {paymentId ? (
                  <>
                    <Spacing size={12} />
                    <Button
                      size="m"
                      stretched
                      mode="secondary"
                      onClick={() => onMarkPaymentPaid(paymentId)}
                      loading={isMarkingPaymentPaid}
                    >
                      Я оплатил
                    </Button>
                  </>
                ) : null}
              </Div>
            </Card>
          </Div>
        ) : null}

        {markPaymentPaidError ? <Div><Text>{markPaymentPaidError}</Text></Div> : null}
        {markPaymentPaidSuccessMessage ? <Div><Text>{markPaymentPaidSuccessMessage}</Text></Div> : null}

        <Div><Button onClick={onBack}>На главную</Button></Div>
      </Group>
    </AppShell>
  );
}
