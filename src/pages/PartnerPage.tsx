import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiPartner, ApiVerification } from '../api/client';

type PartnerPageProps = {
  selectedPartner: ApiPartner | null;
  onBack: () => void;
  onCreateVerification: (partnerId: string) => Promise<void>;
  isCreatingVerification: boolean;
  createdVerification: ApiVerification | null;
  createVerificationError: string;
  onOpenPrivileges: () => void;
};

export function PartnerPage({
  selectedPartner,
  onBack,
  onCreateVerification,
  isCreatingVerification,
  createdVerification,
  createVerificationError,
  onOpenPrivileges,
}: PartnerPageProps) {
  const partnerName = selectedPartner?.name ?? selectedPartner?.title ?? 'Партнёр клуба';
  const partnerDescription = selectedPartner?.description ?? selectedPartner?.short_description;
  const partnerBenefit = selectedPartner?.discount_text ?? selectedPartner?.benefit_text;
  const partnerId = selectedPartner?.id != null ? String(selectedPartner.id) : '';

  return (
    <AppShell title="Партнёр">
      <Group>
        <Header>Партнёр</Header>
        <Div>
          <Card mode="shadow">
            <Div>
              <Title level="2" weight="2">{partnerName}</Title>
              {partnerDescription ? (
                <>
                  <Spacing size={8} />
                  <Text>{partnerDescription}</Text>
                </>
              ) : null}
              {selectedPartner?.address ? (
                <>
                  <Spacing size={8} />
                  <Text>Адрес: {selectedPartner.address}</Text>
                </>
              ) : null}
              {partnerBenefit ? (
                <>
                  <Spacing size={8} />
                  <Text>Привилегия: {partnerBenefit}</Text>
                </>
              ) : null}
            </Div>
          </Card>
        </Div>
        <Div>
          <Button
            onClick={() => onCreateVerification(partnerId)}
            disabled={!partnerId || isCreatingVerification}
          >
            {isCreatingVerification ? 'Получаем код…' : 'Получить код'}
          </Button>
        </Div>

        {createVerificationError ? (
          <Div>
            <Card mode="shadow">
              <Div>
                <Text>{createVerificationError}</Text>
              </Div>
            </Card>
          </Div>
        ) : null}

        {createdVerification ? (
          <Div>
            <Card mode="shadow">
              <Div>
                <Title level="3" weight="2">Ваш код</Title>
                <Spacing size={8} />
                {createdVerification.code ? (
                  <Text>Код: {String(createdVerification.code)}</Text>
                ) : (
                  <Text>Код создан, проверьте раздел «Мои привилегии».</Text>
                )}
                {createdVerification.status ? (
                  <>
                    <Spacing size={8} />
                    <Text>Статус: {String(createdVerification.status)}</Text>
                  </>
                ) : null}
                {createdVerification.expires_at ? (
                  <>
                    <Spacing size={8} />
                    <Text>Действует до: {String(createdVerification.expires_at)}</Text>
                  </>
                ) : null}
              </Div>
            </Card>
          </Div>
        ) : null}

        <Div><Button onClick={onOpenPrivileges}>Мои привилегии</Button></Div>
        <Div><Button onClick={onBack}>Назад к партнёрам</Button></Div>
      </Group>
    </AppShell>
  );
}
