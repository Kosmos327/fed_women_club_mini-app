import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiPaymentRequest, ApiSubscription } from '../api/client';
import { formatDate, formatDateTime, formatSubscriptionStatus } from '../utils/format';

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
  const isSubscriptionActive = Boolean(subscription?.is_active ?? subscription?.active);
  const subscriptionStatus = formatSubscriptionStatus(subscription?.status as string | undefined, isSubscriptionActive);
  const subscriptionPrice = subscription?.price ?? subscription?.amount ?? '349 ₽';
  const paymentId = paymentRequest?.id;

  return (
    <AppShell title="Подписка">
      <Group className="fade-up">
        <Header>Подписка</Header>
        <Div>
          <Card mode="shadow" className="subscription-card">
            <Div>
              <Title level="2" weight="2">Подписка <span className={isSubscriptionActive ? "bloom-badge bloom-badge--success" : "bloom-badge"}>{subscriptionStatus}</span></Title>
              <Spacing size={12} />
              <Text>Дата окончания: {formatDate(expiresAt)}</Text>
              <Spacing size={8} />
              <Text className="subscription-card__price">{String(subscriptionPrice)}</Text>
              <Spacing size={16} />
              <Button className="bloom-button-primary" size="l" stretched onClick={onCreatePaymentRequest} loading={isCreatingPaymentRequest}>
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
                <Text>Статус: {formatSubscriptionStatus(paymentRequest.status)}</Text>
                <Spacing size={8} />
                <Text>Создана: {formatDateTime(paymentRequest.created_at)}</Text>
                {paymentRequest.payment_url ? (
                  <>
                    <Spacing size={12} />
                    <Button className="bloom-button-primary" size="m" stretched href={String(paymentRequest.payment_url)} target="_blank">
                      Оплатить
                    </Button>
                  </>
                ) : null}
                {paymentId ? (
                  <>
                    <Spacing size={12} />
                    <Button
                      className="bloom-button-secondary" size="m"
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

        <Div><Button className="bloom-button-secondary" mode="secondary" onClick={onBack}>На главную</Button></Div>
      </Group>
    </AppShell>
  );
}
