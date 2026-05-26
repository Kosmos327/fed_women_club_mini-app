import { Button, Card, Div, Group, Text, Title } from '@vkontakte/vkui';
import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getPartnerImageSrc } from '../utils/partnerImage';
import type { ApiCity, ApiPartner } from '../api/client';
import { getPartnerCategoryDisplayLabel, getPartnerCityDisplayLabel } from '../utils/format';
import { buildDedupedCategories } from '../utils/catalogCategories';

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function normalizeCatalogText(value?: string | null): string | null {
  if (!value) return null;
  const withoutLinks = value.replace(URL_REGEX, ' ').replace(/\s+/g, ' ').trim();
  return withoutLinks || null;
}

function trimAddressPrefix(description: string | null, address: string | null): string | null {
  if (!description) return null;
  if (!address) return description;

  const normalizedDescription = description.trim();
  const normalizedAddress = address.trim();
  if (!normalizedDescription || !normalizedAddress) return normalizedDescription || null;

  const escapedAddress = normalizedAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const leadingAddressPattern = new RegExp(`^${escapedAddress}[,.:;\\-\\s]*`, 'i');
  const withoutAddress = normalizedDescription.replace(leadingAddressPattern, '').trim();

  return withoutAddress || null;
}

function truncateCatalogLine(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

type CatalogPageProps = {
  partners: ApiPartner[];
  cities: ApiCity[];
  selectedCityId: string;
  selectedCategorySlug: string | null;
  selectedCityLabel: string;
  isProfileCityFallback: boolean;
  isPartnersLoading: boolean;
  partnersError: string;
  onCityChange: (cityId: string) => void;
  onCategoryChange: (categorySlug: string) => void;
  onResetAllFilters: () => void;
  onBack: () => void;
  onPartnerClick: (partner: ApiPartner) => void;
};

export function CatalogPage({ partners, cities, selectedCityId, selectedCategorySlug, selectedCityLabel, isProfileCityFallback, isPartnersLoading, partnersError, onCityChange, onCategoryChange, onResetAllFilters, onBack, onPartnerClick }: CatalogPageProps) {
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const dedupedCategories = useMemo(() => buildDedupedCategories(partners), [partners]);

  return (
    <AppShell titleClassName="bloom-panel-header-title-compact" title="Партнёры">
      <Group className="fade-up">
                <Div className="catalog-filters-panel glass-panel">
          <Div className="catalog-city-row">
            <Button mode="tertiary" className="catalog-city-picker__trigger" aria-label="Выбор города" title="Выбрать город" onClick={() => setIsCityPickerOpen((prev) => !prev)}>
              {isProfileCityFallback && !selectedCityLabel ? 'Выберите город' : selectedCityLabel || 'Выберите город'} ▾
            </Button>
          </Div>
          {isCityPickerOpen ? (
            <Div className="catalog-city-picker__sheet">
              {cities.map((city) => {
                const cityId = String(city.id);
                const isActive = selectedCityId === cityId;
                return (
                  <button key={cityId} type="button" className={`catalog-city-picker__option ${isActive ? 'catalog-city-picker__option--active' : ''}`} onClick={() => {
                    onCityChange(cityId);
                    setIsCityPickerOpen(false);
                  }}>
                    {city.name}
                  </button>
                );
              })}
              <button type="button" className="catalog-city-picker__close" onClick={() => setIsCityPickerOpen(false)}>Закрыть</button>
            </Div>
          ) : null}
          <Div className="catalog-chips" role="tablist" aria-label="Категории каталога">
            <button type="button" className={`catalog-filter-chip ${!selectedCategorySlug ? 'catalog-filter-chip--active' : ''}`} onClick={() => onCategoryChange('')}>Все</button>
            {dedupedCategories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={`catalog-filter-chip ${selectedCategorySlug === category.slug ? 'catalog-filter-chip--active' : ''}`}
                onClick={() => onCategoryChange(category.slug)}
                title={category.label}
              >
                {category.label}
              </button>
            ))}
          </Div>
          {selectedCityId || selectedCategorySlug ? <Button className="catalog-reset-button" mode="secondary" size="s" onClick={onResetAllFilters}>Сбросить фильтры</Button> : null}
        </Div>

        {partnersError ? <EmptyState header="Не удалось загрузить партнёров" description={partnersError} /> : null}
        {isPartnersLoading ? <Div className="catalog-local-loading">Обновляем каталог…</Div> : null}
        {!isPartnersLoading && !partnersError && partners.length === 0 ? (
          <EmptyState
            header="Партнёры не найдены"
            description="Попробуйте выбрать категорию «Все» или другой город."
          />
        ) : null}
        {!partnersError && partners.length > 0 ? (
          <Div className="partner-catalog-grid">
            {partners.map((partner, index) => {
              const partnerName = partner.name ?? partner.title ?? 'Партнёр клуба';
              const partnerAddress = normalizeCatalogText(partner.address);
              const rawDescription = normalizeCatalogText(partner.description ?? partner.short_description);
              const partnerDescription = truncateCatalogLine(trimAddressPrefix(rawDescription, partnerAddress), 160);
              const partnerBenefit = partner.discount_text ?? partner.benefit_text;
              const partnerImage = getPartnerImageSrc(partner);
              const normalizedCategory = getPartnerCategoryDisplayLabel(partner);
              const partnerCity = getPartnerCityDisplayLabel(partner);
              const noImage = !partnerImage;

              return (
                <Card className={`partner-card ${noImage ? 'partner-card--no-image' : ''}`} mode="shadow" key={String(partner.id ?? `${partnerName}-${index}`)} onClick={() => onPartnerClick(partner)}>
                  <ImageWithFallback src={partnerImage} alt={partnerName} className="partner-card__image" placeholderClassName={`partner-card__placeholder ${noImage ? 'partner-card__placeholder--compact' : ''}`} placeholderLabel={noImage ? partnerName.slice(0, 1).toUpperCase() : partnerName} />
                  <Div>
                    <Title className="partner-card__title" level="2" weight="2">{partnerName}</Title>
                    <div className="partner-badges">
                      {normalizedCategory ? <span className="bloom-badge">{normalizedCategory}</span> : null}
                      {partnerCity ? <span className="bloom-badge">{partnerCity}</span> : null}
                    </div>
                    {partnerAddress ? <Text className="partner-card__address">{truncateCatalogLine(partnerAddress, 80)}</Text> : null}
                    {partnerDescription ? <Text className="partner-card__description">{partnerDescription}</Text> : null}
                    {partnerBenefit ? <Text className="partner-card__benefit">{partnerBenefit}</Text> : null}
                    <Button className="bloom-button-primary partner-card__button" mode="secondary" stretched size="m" onClick={(event) => { event.stopPropagation(); onPartnerClick(partner); }}>Подробнее</Button>
                  </Div>
                </Card>
              );
            })}
          </Div>
        ) : null}
        <Div><Button className="bloom-button-muted" mode="secondary" onClick={onBack}>Назад</Button></Div>
      </Group>
    </AppShell>
  );
}
