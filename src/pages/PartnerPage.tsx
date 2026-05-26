import { Button, Card, Div, Group, Spacing, Text, Title } from '@vkontakte/vkui';
import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import type { ApiOffer, ApiPartner, ApiVerification } from '../api/client';
import { formatDateTime, formatVerificationStatus, getPartnerCategoryDisplayLabel, getPartnerCityDisplayLabel } from '../utils/format';
import { getPartnerImages } from '../utils/partnerImage';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getOfferImages } from '../utils/offerImage';
import { getOfferPricingView } from '../utils/offerPricing';
import { PhotoGalleryModal } from '../components/PhotoGalleryModal';

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

const CUSTOM_PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/i;

function linkifyText(text: string): Array<string | JSX.Element> {
  const result: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = URL_REGEX.exec(text);
  let key = 0;
  while (match) {
    const [url] = match;
    if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index));
    result.push(<a key={`url-${key++}`} href={url} target="_blank" rel="noreferrer" className="partner-rich-link">{url}</a>);
    lastIndex = match.index + url.length;
    match = URL_REGEX.exec(text);
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  URL_REGEX.lastIndex = 0;
  return result;
}

function cleanValue(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeExternalUrl(value?: string | null): string | null {
  const raw = cleanValue(value);
  if (!raw) return null;
  if (CUSTOM_PROTOCOL_REGEX.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  return `https://${raw}`;
}

function buildTelUrl(phone?: string | null): string | null {
  const raw = cleanValue(phone);
  if (!raw) return null;
  const telValue = raw.replace(/[^\d+]/g, '');
  return telValue ? `tel:${telValue}` : null;
}

type PartnerLinkChip = { label: string; href: string; isExternal: boolean };

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
  const [isPartnerGalleryOpen, setIsPartnerGalleryOpen] = useState(false);
  const partnerName = selectedPartner?.name ?? selectedPartner?.title ?? 'Партнёр клуба';
  const partnerDescription = selectedPartner?.description ?? selectedPartner?.short_description;
  const partnerBenefit = selectedPartner?.discount_text ?? selectedPartner?.benefit_text;
  const partnerId = selectedPartner?.id != null ? String(selectedPartner.id) : '';
  const partnerCity = selectedPartner ? getPartnerCityDisplayLabel(selectedPartner) : null;
  const partnerCategory = selectedPartner ? getPartnerCategoryDisplayLabel(selectedPartner) : null;
  const partnerImages = getPartnerImages(selectedPartner);
  const hasPartnerImage = partnerImages.length > 0;
  const descriptionText = cleanValue(partnerDescription);
  const partnerAddress = cleanValue(selectedPartner?.address);
  const mapUrl = normalizeExternalUrl(selectedPartner?.map_url);
  const phoneUrl = buildTelUrl(selectedPartner?.phone);
  const websiteUrl = normalizeExternalUrl(selectedPartner?.website_url);
  const instagramUrl = normalizeExternalUrl(selectedPartner?.instagram_url);
  const vkUrl = normalizeExternalUrl(selectedPartner?.vk_url);
  const telegramUrl = normalizeExternalUrl(selectedPartner?.telegram_url);
  const whatsappUrl = normalizeExternalUrl(selectedPartner?.whatsapp_url);
  const socialUrl = normalizeExternalUrl(selectedPartner?.social_url);
  const uniqueLinks = new Set<string>();
  const contactLinks: PartnerLinkChip[] = [];
  const pushLink = (label: string, href: string | null, isExternal = true) => {
    if (!href || uniqueLinks.has(href)) return;
    uniqueLinks.add(href);
    contactLinks.push({ label, href, isExternal });
  };
  pushLink('Позвонить', phoneUrl, false);
  pushLink('Сайт', websiteUrl);
  pushLink('Instagram', instagramUrl);
  pushLink('VK', vkUrl);
  pushLink('Telegram', telegramUrl);
  pushLink('WhatsApp', whatsappUrl);
  pushLink('Маршрут', mapUrl);
  pushLink('Сайт', socialUrl);

  const normalizedDescription = descriptionText && partnerAddress
    ? descriptionText.trim().toLowerCase().startsWith(partnerAddress.trim().toLowerCase())
      ? cleanValue(descriptionText.slice(partnerAddress.length))
      : descriptionText
    : descriptionText;

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
    <AppShell titleClassName="bloom-panel-header-title-compact" title={partnerName || 'Партнёр'}>
      <Group className="fade-up">
        <Div>
          <Card className={`partner-hero glass-panel ${!hasPartnerImage ? 'partner-hero--compact' : ''}`} mode="shadow">
            <div className="partner-hero__media">
              <ImageWithFallback
                src={hasPartnerImage ? partnerImages[0] : null}
                alt={partnerName}
                className="partner-hero__image"
                placeholderClassName={`partner-hero__placeholder ${!hasPartnerImage ? 'partner-hero__placeholder--compact' : ''}`}
                placeholderLabel="✦"
              />
              {partnerImages.length > 0 ? (
                <Button
                  type="button"
                  className="bloom-button-secondary partner-hero__gallery-button"
                  mode="secondary"
                  size="l"
                  stretched
                  onClick={() => setIsPartnerGalleryOpen(true)}
                  aria-label="Открыть галерею партнёра"
                >
                  {partnerImages.length > 1 ? `Посмотреть галерею · ${partnerImages.length} фото` : 'Посмотреть фото'}
                </Button>
              ) : null}
            </div>
            <Div>
              <Title level="1" weight="1">{partnerName}</Title>
              {(partnerCategory || partnerCity) ? (
                <div className="partner-badges">
                  {partnerCategory ? <span className="bloom-badge">{partnerCategory}</span> : null}
                  {partnerCity ? <span className="bloom-badge">{partnerCity}</span> : null}
                </div>
              ) : null}
              {partnerAddress ? <Text className="partner-hero__address"><strong>Адрес:</strong> {partnerAddress}</Text> : null}
              {normalizedDescription ? (
                <Text className="partner-hero__description" style={{ whiteSpace: 'pre-line' }}>
                  {linkifyText(normalizedDescription)}
                </Text>
              ) : null}
              {partnerBenefit ? <Text className="partner-hero__benefit">Привилегия: {partnerBenefit}</Text> : null}
            </Div>
          </Card>
        </Div>
        {contactLinks.length > 0 ? (
          <Div>
            <Card className="partner-contact-card glass-panel" mode="shadow">
              <Div>
                <Title level="3" weight="2" className="partner-contact-card__title">Контакты</Title>
                <div className="partner-links">
                  {contactLinks.map((link) => (
                    <a
                      key={`${link.label}:${link.href}`}
                      className="partner-link-chip"
                      href={link.href}
                      target={link.isExternal ? '_blank' : undefined}
                      rel={link.isExternal ? 'noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </Div>
            </Card>
          </Div>
        ) : null}

        <Div className="partner-offers-heading-wrap"><Title level="2" weight="2" className="partner-offers-heading">Услуги и привилегии</Title></Div>
        {isOffersLoading ? <Div><Text className="state-note">Загружаем услуги…</Text></Div> : null}
        {!isOffersLoading && offersError ? <Div><Text className="state-note state-note--error">Не удалось загрузить услуги партнёра</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length === 0 ? <Div><Text className="state-note">У партнёра пока нет активных услуг</Text></Div> : null}
        {!isOffersLoading && !offersError && offers.length > 0
          ? offers.map((offer, index) => {
            const offerId = offer?.id != null ? String(offer.id) : '';
            const offerName = offer.name ?? offer.title ?? `Услуга ${index + 1}`;
            const offerDescription = offer.short_benefit ?? offer.description;
            const pricingView = getOfferPricingView(offer);
            const isCurrentOfferLoading = isCreatingVerification && selectedOfferIdForVerification === offerId;
            const offerImages = getOfferImages(offer);
            const hasOfferImages = offerImages.length > 0;

            return (
              <Div key={offerId || `offer-${index}`} className="offer-card-wrap">
                <Card className="offer-card offer-card--compact" mode="shadow">
                  <Div>
                    <Title className="offer-card__title" level="2" weight="2">{offerName}</Title>
                    {offerDescription ? <Text className="offer-card__description">{offerDescription}</Text> : null}
                    {offer.terms ? <Text className="offer-card__terms">Условия: {String(offer.terms)}</Text> : null}

                    <div className="offer-pricing">
                      <div className="offer-pricing__row">
                        <Text className="offer-pricing__label">Обычная цена</Text>
                        <Text className="offer-pricing__value offer-pricing__value--base">{pricingView.basePriceLabel}</Text>
                      </div>
                      <div className="offer-pricing__row">
                        <Text className="offer-pricing__label">Для участниц клуба</Text>
                        <Text className="offer-pricing__value offer-pricing__value--member" weight="2">{pricingView.memberPriceLabel}</Text>
                      </div>
                      {pricingView.hasSaving ? (
                        <div className="offer-pricing__saving">Выгода {pricingView.savingLabel}</div>
                      ) : (
                        <Text className="offer-pricing__fallback">Уточните стоимость у партнёра перед визитом.</Text>
                      )}
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
                          Посмотреть работы
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

        {isPartnerGalleryOpen && partnerImages.length > 0 ? (
          <PhotoGalleryModal title={partnerName} images={partnerImages} initialIndex={0} onClose={() => setIsPartnerGalleryOpen(false)} />
        ) : null}
        {selectedOfferForGallery && selectedOfferImages.length > 0 ? (
          <PhotoGalleryModal
            title={`Работы: ${selectedOfferForGallery.name ?? selectedOfferForGallery.title ?? 'Услуга'}`}
            images={selectedOfferImages}
            initialIndex={0}
            onClose={() => setSelectedOfferForGallery(null)}
          />
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
