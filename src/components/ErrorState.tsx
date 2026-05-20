import { Group, Placeholder } from '@vkontakte/vkui';

type ErrorStateProps = { message: string };

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Group>
      <Placeholder>
        <strong>Ошибка входа</strong>
        <br />
        {message}
      </Placeholder>
    </Group>
  );
}
