import { Group, Placeholder } from '@vkontakte/vkui';

type ErrorStateProps = { message: string };

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Group>
      <Placeholder header="Ошибка входа">{message}</Placeholder>
    </Group>
  );
}
