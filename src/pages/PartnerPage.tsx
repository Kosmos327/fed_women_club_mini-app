import { Button, Card, Div, Group, Header, Spacing, Text, Title } from '@vkontakte/vkui';
import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import type { ApiOffer, ApiPartner, ApiVerification } from '../api/client';
import { formatDateTime, formatVerificationStatus, getPartnerCategoryName } from '../utils/format';
import { getPartnerImages } from '../utils/partnerImage';
import { PartnerPhotoGallery } from '../components/PartnerPhotoGallery';
import { getOfferImages } from '../utils/offerImage';

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
  const [selectedOfferForGallery, setSelectedOfferForGallery] = useState<ApiOffer | null>(null);
  const partnerName = selectedPartner?.name ?? selectedPartner?.title ?? 'Партнёр клуба';
  const partnerDescription = selectedPartner?.description ?? selectedPartner?.short_description;
  const partnerBenefit = selectedPartner?.discount_text ?? selectedPartner?.benefit_text;
  const partnerId = selectedPartner?.id != null ? String(selectedPartner.id) : '';
  const partnerCity = selectedPartner?.city_name ?? selectedPartner?.city;
  const partnerCategory = selectedPartner ? getPartnerCategoryName(selectedPartner) : null;
  const partnerImages = getPartnerImages(selectedPartner);
  const verificationOfferLabel = getVerificationOfferLabel(createdVerification, offers, selectedOfferIdForVerification);
  const selectedOfferImages = getOfferImages(selectedOfferForGallery);
  if (import.meta.env.DEV && selectedPartner) {
    console.debug('Partner page image resolution', {
      partnerId: selectedPartner.id,
      partnerName,
      partnerKeys: Object.keys(selectedPartner),
      resolvedImages: partnerImages,
    });
  }

  return (
    <AppShell titleClassName="bloom-panel-header-title-compact" title="Партнёр">
      <Group className="fade-up">
        <Div className="bloom-page-title-card">Партнёр</Div>
        <Div>
          <Card className="partner-hero glass-panel" mode="shadow">
            <PartnerPhotoGallery
              images={partnerImages}
              alt={partnerName}
              imageClassName="partner-hero__image"
              placeholderClassName="partner-hero__placeholder"
              placeholderLabel={partnerCategory ?? 'Партнёр клуба'}
            />
            <Div>
              <Title level="1" weight="1">{partnerName}</Title>
              {(partnerCategory || partnerCity) ? (
                <div className="partner-badges">
                  {partnerCategory ? <span className="bloom-badge">{partnerCategory}</span> : null}
                  {partnerCity ? <span className="bloom-badge">{partnerCity}</span> : null}
                </div>
              ) : null}
              {selectedPartner?.address ? <Text className="partner-hero__address">{selectedPartner.address}</Text> : null}
              {partnerDescription ? <Text className="partner-hero__description">{partnerDescription}</Text> : null}
              {partnerBenefit ? <Text className="partner-hero__benefit">Привилегия: {partnerBenefit}</Text> : null}
            </Div>
          </Card>
        </Div>

        <Header className="glass-panel">Услуги и привилегии</Header>
        {isOffersLoading ? <Div><Text className="state-note">Загружаем услуги…</Text></Div> : null}
        {!isOffersLoading && offersError ? <Div><Text className="state-note state-note--error">Не удалось загрузить услуги партнёра</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length === 0 ? <Div><Text className="state-note">У партнёра пока нет активных услуг</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length > 0
          ? offers.map((offer, index) => {
            const offerId = offer?.id != null ? String(offer.id) : '';
            const offerName = offer.name ?? offer.title ?? `Услуга ${index + 1}`;
            const offerDescription = offer.short_benefit ?? offer.description;
            const { basePrice, discountPercent, finalPrice } = resolveOfferPricing(offer);
            const isCurrentOfferLoading = isCreatingVerification && selectedOfferIdForVerification === offerId;
            const offerImages = getOfferImages(offer);
            const hasOfferImages = offerImages.length > 0;

            return (
              <Div key={offerId || `offer-${index}`}>
                <Card className="offer-card" mode="shadow">
                  <Div>
                    <Title className="offer-card__title" level="2" weight="2">{offerName}</Title>
                    {discountPercent != null ? <span className="offer-card__badge">Скидка {discountPercent}%</span> : null}
                    {offerDescription ? <Text className="offer-card__description">{offerDescription}</Text> : null}
                    {offer.terms ? <Text className="offer-card__terms">Условия: {String(offer.terms)}</Text> : null}

                    <div className="offer-card__prices">
                      <Text>Цена без скидки: {formatRubles(basePrice)}</Text>
                      <Text>Скидка: {discountPercent != null ? `${discountPercent}%` : '—'}</Text>
                      <Text className="offer-card__member-price" weight="2">Цена для участницы: <strong>{formatRubles(finalPrice)}</strong></Text>
                    </div>

                    <Spacing size={12} />
                    {hasOfferImages ? (
                      <>
                        <Button
                          className="bloom-button-secondary"
                          size="l"
                          stretched
                          mode="secondary"
                          onClick={() => setSelectedOfferForGallery(offer)}
                        >
                          Фото работ
                        </Button>
                        <Spacing size={8} />
                      </>
                    ) : null}
                    <Button
                      className="bloom-button-primary"
                      size="l"
                      stretched
                      onClick={() => onCreateVerification(partnerId, offerId)}
                      disabled={!partnerId || !offerId || isCurrentOfferLoading}
                    >
                      {isCurrentOfferLoading ? 'Получаем код…' : 'Получить код'}
                    </Button>
                  </Div>
                </Card>
              </Div>
            );
          })
          : null}

        {selectedOfferForGallery && selectedOfferImages.length > 0 ? (
          <Div>
            <Card className="offer-card" mode="shadow">
              <Div>
                <Title className="offer-card__title" level="3" weight="2">
                  Фото работ: {selectedOfferForGallery.name ?? selectedOfferForGallery.title ?? 'Услуга'}
                </Title>
                <Spacing size={8} />
                <PartnerPhotoGallery
                  images={selectedOfferImages}
                  alt={String(selectedOfferForGallery.name ?? selectedOfferForGallery.title ?? 'Фото услуги')}
                  imageClassName="partner-hero__image"
                  placeholderClassName="partner-hero__placeholder"
                  placeholderLabel="Фото услуги"
                />
                <Spacing size={12} />
                <Button className="bloom-button-muted" mode="secondary" stretched onClick={() => setSelectedOfferForGallery(null)}>
                  Закрыть фото
                </Button>
              </Div>
            </Card>
          </Div>
        ) : null}

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
            <Card className="verification-success" mode="shadow">
              <Div>
                <Title level="3" weight="2">Ваш код</Title>
                <Spacing size={8} />
                {createdVerification.code ? (
                  <Title className="verification-success__code" level="1" weight="1">{String(createdVerification.code)}</Title>
                ) : (
                  <Text>Код создан, проверьте раздел «Мои привилегии».</Text>
                )}
                {verificationOfferLabel ? (<><Spacing size={8} /><Text>Услуга: {verificationOfferLabel}</Text></>) : null}
                <Spacing size={8} />
                <Text>Партнёр: {partnerName}</Text>
                {createdVerification.status ? (
                  <>
                    <Spacing size={8} />
                    <Text>Статус: <span className="bloom-badge bloom-badge--success">{formatVerificationStatus(createdVerification.status)}</span></Text>
                  </>
                ) : null}
                {createdVerification.expires_at ? (
                  <>
                    <Spacing size={8} />
                    <Text>Действует до: {formatDateTime(createdVerification.expires_at)}</Text>
                  </>
                ) : null}
                <Spacing size={8} />
                <Text>Инструкция: покажите этот код партнёру при получении услуги.</Text>
                <Spacing size={12} />
                <Button className="bloom-button-secondary" stretched onClick={onOpenPrivileges}>Мои привилегии</Button>
              </Div>
            </Card>
          </Div>
        ) : null}

        <Div><Button className="bloom-button-muted" mode="secondary" onClick={onBack}>Назад к партнёрам</Button></Div>
      </Group>
    </AppShell>
  );
}
