import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Div, FormItem, Group, Header, Input, Select, Spacing, Text, Title } from '@vkontakte/vkui';
import type { ApiCity, ApiClient, ApiClientUpdatePayload, ApiUser } from '../api/client';
import { AppShell } from '../components/AppShell';

type ProfilePageProps = {
  onBack: () => void;
  onSave: (payload: ApiClientUpdatePayload) => Promise<void>;
  client: ApiClient | null;
  user: ApiUser | null;
  isSaving: boolean;
  saveError: string;
  saveSuccessMessage: string;
  cities: ApiCity[];
  isCitiesLoading: boolean;
  citiesError: string;
};

export function ProfilePage({
  onBack,
  onSave,
  client,
  user,
  isSaving,
  saveError,
  saveSuccessMessage,
  cities,
  isCitiesLoading,
  citiesError,
}: ProfilePageProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedCitySlug, setSelectedCitySlug] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const normalizedCity = String(client?.city_name ?? client?.custom_city ?? client?.city ?? '').trim().toLowerCase();

  const resolvedCitySlug = useMemo(() => {
    const directSlug = String(client?.city_slug ?? '').trim();
    if (directSlug) return directSlug;

    const selectedCitySlug =
      client?.selected_city && typeof client.selected_city === 'object' && 'slug' in client.selected_city
        ? String(client.selected_city.slug ?? '').trim()
        : '';
    if (selectedCitySlug) return selectedCitySlug;

    if (!normalizedCity) return '';
    const matchedCity = cities.find((city) => city.name.trim().toLowerCase() === normalizedCity);
    return matchedCity?.slug ?? '';
  }, [client, cities, normalizedCity]);

  useEffect(() => {
    if (isDirty) {
      return;
    }

    setFullName(String(client?.full_name ?? ''));
    setPhone(String(client?.phone ?? ''));
    setContactEmail(String(client?.contact_email ?? user?.email ?? ''));
    setSelectedCitySlug(resolvedCitySlug);
  }, [client, user, isDirty, resolvedCitySlug]);

  const handleSubmit = async () => {
    const payload: ApiClientUpdatePayload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      contact_email: contactEmail.trim(),
    };

    if (selectedCitySlug) {
      payload.city_slug = selectedCitySlug;
    }

    await onSave(payload);
    setIsDirty(false);
  };

  return (
    <AppShell title="Профиль">
      <Group className="fade-up">
        <Header className="glass-panel">Данные участницы</Header>
        <Card mode="shadow" className="profile-card glass-panel">
          <Div>
            <Title level="2" weight="2">Редактирование профиля</Title>
            <Spacing size={8} />
            <Text className="state-note">Заполните или обновите контактные данные.</Text>
          </Div>

          <FormItem top="Имя">
            <Input value={fullName} onChange={(event) => { setFullName(event.target.value); setIsDirty(true); }} />
          </FormItem>

          <FormItem top="Телефон">
            <Input value={phone} onChange={(event) => { setPhone(event.target.value); setIsDirty(true); }} />
          </FormItem>

          <FormItem top="Email для связи">
            <Input value={contactEmail} onChange={(event) => { setContactEmail(event.target.value); setIsDirty(true); }} />
          </FormItem>

          <FormItem top="Город">
            {isCitiesLoading ? (
              <Text className="state-note">Загрузка городов...</Text>
            ) : (
              <Select
                placeholder="Выберите город"
                value={selectedCitySlug}
                onChange={(event) => {
                  setSelectedCitySlug(event.target.value);
                  setIsDirty(true);
                }}
                options={cities.map((city) => ({
                  label: city.name,
                  value: city.slug,
                }))}
                disabled={cities.length === 0}
              />
            )}
          </FormItem>

          {!isCitiesLoading && cities.length === 0 && !citiesError && (
            <Div className="glass-panel"><Text className="state-note">Пока нет доступных городов</Text></Div>
          )}
          {!!citiesError && <Div className="glass-panel"><Text className="state-note">{citiesError}</Text></Div>}
          {!!saveError && <Div className="glass-panel"><Text className="state-note">{saveError}</Text></Div>}
          {!!saveSuccessMessage && <Div className="glass-panel"><Text className="state-note">{saveSuccessMessage}</Text></Div>}

          <Div>
            <Button className="bloom-button-primary" size="l" stretched onClick={handleSubmit} loading={isSaving} disabled={isSaving}>
              Сохранить
            </Button>
            <Spacing size={8} />
            <Button className="bloom-button-secondary" size="l" stretched mode="secondary" onClick={onBack} disabled={isSaving}>
              На главную
            </Button>
          </Div>
        </Card>
      </Group>
    </AppShell>
  );
}
