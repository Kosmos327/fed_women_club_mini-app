import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import type { ApiOffer, ApiPartner, ApiVerification } from '../api/client';
import { formatDateTime, formatVerificationStatus } from '../utils/format';

type PartnerPageProps = {
  selectedPartner: ApiPartner | null;
  onBack: () => void;
  onCreateVerification: (partnerId: string, offerId?: string) => Promise<void>;
  isCreatingVerification: boolean;
  selectedOfferIdForVerification: string;
  offers: ApiOffer[];
  isOffersLoading: boolean;
  offersError: string;
  createdVerification: ApiVerification | null;
  createVerificationError: string;
  onOpenPrivileges: () => void;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.').replace(/\s+/g, ''));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return null;
};

const formatRubles = (value: number | null): string => (value == null ? '—' : `${Math.round(value).toLocaleString('ru-RU')} ₽`);

const resolveOfferPricing = (offer: ApiOffer) => {
  const basePrice = toNumber(offer.base_price ?? offer.price);
  const discountPercent = toNumber(offer.discount_percent ?? offer.discount);
  const explicitFinalPrice = toNumber(offer.final_price ?? offer.price_with_discount);
  const computedFinalPrice =
    explicitFinalPrice ?? (basePrice != null && discountPercent != null ? basePrice * (1 - discountPercent / 100) : null);

  return { basePrice, discountPercent, finalPrice: computedFinalPrice };
};

const getVerificationOfferLabel = (verification: ApiVerification | null, offers: ApiOffer[], selectedOfferId: string): string => {
  if (!verification) return '';
  const verificationOfferSource = [verification.offer_name, verification.offer_title, verification.service_name, verification.service_title]
    .find((value) => typeof value === 'string' && value.trim().length > 0);
  if (verificationOfferSource) return verificationOfferSource;
  const selectedOffer = offers.find((offer) => String(offer.id ?? '') === selectedOfferId);
  return String(selectedOffer?.name ?? selectedOffer?.title ?? '');
};

export function PartnerPage({
  selectedPartner,
  onBack,
  onCreateVerification,
  isCreatingVerification,
  selectedOfferIdForVerification,
  offers,
  isOffersLoading,
  offersError,
  createdVerification,
  createVerificationError,
  onOpenPrivileges,
}: PartnerPageProps) {
  const partnerName = selectedPartner?.name ?? selectedPartner?.title ?? 'Партнёр клуба';
  const partnerDescription = selectedPartner?.description ?? selectedPartner?.short_description;
  const partnerBenefit = selectedPartner?.discount_text ?? selectedPartner?.benefit_text;
  const partnerId = selectedPartner?.id != null ? String(selectedPartner.id) : '';
  const verificationOfferLabel = getVerificationOfferLabel(createdVerification, offers, selectedOfferIdForVerification);

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
        <Header>Услуги и привилегии</Header>
        {isOffersLoading ? <Div><Text>Загружаем услуги…</Text></Div> : null}
        {!isOffersLoading && offersError ? <Div><Text>{offersError}</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length === 0 ? <Div><Text>У партнёра пока нет активных услуг.</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length > 0
          ? offers.map((offer, index) => {
            const offerId = offer?.id != null ? String(offer.id) : '';
            const offerName = offer.name ?? offer.title ?? `Услуга ${index + 1}`;
            const offerDescription = offer.short_benefit ?? offer.description;
            const { basePrice, discountPercent, finalPrice } = resolveOfferPricing(offer);
            const isCurrentOfferLoading = isCreatingVerification && selectedOfferIdForVerification === offerId;

            return (
              <Div key={offerId || `offer-${index}`}>
                <Card mode="shadow">
                  <Div>
                    <Title level="3" weight="2">{offerName}</Title>
                    {offerDescription ? (<><Spacing size={8} /><Text>{offerDescription}</Text></>) : null}
                    {offer.terms ? (<><Spacing size={8} /><Text>Условия: {String(offer.terms)}</Text></>) : null}
                    <Spacing size={8} />
                    <Text>Базовая цена: {formatRubles(basePrice)}</Text>
                    <Text>Скидка: {discountPercent != null ? `${discountPercent}%` : '—'}</Text>
                    <Text>Цена со скидкой: {formatRubles(finalPrice)}</Text>
                    <Spacing size={12} />
                    <Button onClick={() => onCreateVerification(partnerId, offerId)} disabled={!partnerId || !offerId || isCurrentOfferLoading}>
                      {isCurrentOfferLoading ? 'Получаем код…' : 'Получить код'}
                    </Button>
                  </Div>
                </Card>
              </Div>
            );
          })
          : null}

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
                  <Title level="1" weight="1">{String(createdVerification.code)}</Title>
                ) : (
                  <Text>Код создан, проверьте раздел «Мои привилегии».</Text>
                )}
                {verificationOfferLabel ? (<><Spacing size={8} /><Text>Услуга: {verificationOfferLabel}</Text></>) : null}
                {createdVerification.status ? (
                  <>
                    <Spacing size={8} />
                    <Text>Статус: {formatVerificationStatus(createdVerification.status)}</Text>
                  </>
                ) : null}
                {createdVerification.expires_at ? (
                  <>
                    <Spacing size={8} />
                    <Text>Действует до: {formatDateTime(createdVerification.expires_at)}</Text>
                  </>
                ) : null}
                <Spacing size={8} />
                <Text>Покажите этот код партнёру для подтверждения привилегии.</Text>
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
