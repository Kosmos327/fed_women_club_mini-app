import { Group, Placeholder } from '@vkontakte/vkui';

type EmptyStateProps = {
  header: string;
  description: string;
};

export function EmptyState({ header, description }: EmptyStateProps) {
  return (
    <Group>
      <Placeholder header={header}>{description}</Placeholder>
    </Group>
  );
}
