import { Group, Placeholder, Spinner } from '@vkontakte/vkui';

export function LoadingState() {
  return (
    <Group>
      <Placeholder icon={<Spinner size="large" />}>Загружаем мини-приложение…</Placeholder>
    </Group>
  );
}
