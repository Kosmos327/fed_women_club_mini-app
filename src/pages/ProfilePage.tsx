import { useEffect, useState } from 'react';
import { Button, Card, Div, FormItem, Group, Header, Input, Spacing, Text, Title } from '@vkontakte/vkui';
import type { ApiClient, ApiClientUpdatePayload, ApiUser } from '../api/client';
import { AppShell } from '../components/AppShell';

type ProfilePageProps = {
  onBack: () => void;
  onSave: (payload: ApiClientUpdatePayload) => Promise<void>;
  client: ApiClient | null;
  user: ApiUser | null;
  isSaving: boolean;
  saveError: string;
  saveSuccessMessage: string;
};

export function ProfilePage({ onBack, onSave, client, user, isSaving, saveError, saveSuccessMessage }: ProfilePageProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      return;
    }

    setFullName(String(client?.full_name ?? ''));
    setPhone(String(client?.phone ?? ''));
    setContactEmail(String(client?.contact_email ?? user?.email ?? ''));
    setCustomCity(String(client?.custom_city ?? client?.city_name ?? client?.city ?? ''));
  }, [client, user, isDirty]);

  const handleSubmit = async () => {
    await onSave({
      full_name: fullName.trim(),
      phone: phone.trim(),
      contact_email: contactEmail.trim(),
      custom_city: customCity.trim(),
    });
    setIsDirty(false);
  };

  return (
    <AppShell title="Профиль">
      <Group>
        <Header>Данные участницы</Header>
        <Card mode="shadow">
          <Div>
            <Title level="2" weight="2">Редактирование профиля</Title>
            <Spacing size={8} />
            <Text>Заполните или обновите контактные данные.</Text>
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
            <Input value={customCity} onChange={(event) => { setCustomCity(event.target.value); setIsDirty(true); }} />
          </FormItem>

          {!!saveError && <Div><Text>{saveError}</Text></Div>}
          {!!saveSuccessMessage && <Div><Text>{saveSuccessMessage}</Text></Div>}

          <Div>
            <Button size="l" stretched onClick={handleSubmit} loading={isSaving} disabled={isSaving}>
              Сохранить
            </Button>
            <Spacing size={8} />
            <Button size="l" stretched mode="secondary" onClick={onBack} disabled={isSaving}>
              На главную
            </Button>
          </Div>
        </Card>
      </Group>
    </AppShell>
  );
}
