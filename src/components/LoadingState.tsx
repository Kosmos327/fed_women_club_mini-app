import { Group, Placeholder, Spinner } from '@vkontakte/vkui';

export function LoadingState() {
  return (
    <Group>
      <Placeholder icon={<Spinner size="l" />}>Загружаем мини-приложение…</Placeholder>
    </Group>
  );
}
