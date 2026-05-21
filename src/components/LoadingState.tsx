import { Group, Placeholder, Spinner } from '@vkontakte/vkui';

export function LoadingState() {
  return (
    <Group>
      <Placeholder className="glass-panel" icon={<Spinner size="l" />}>Загружаем мини-приложение…</Placeholder>
    </Group>
  );
}
