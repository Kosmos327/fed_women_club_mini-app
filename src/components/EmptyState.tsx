import { Group, Placeholder } from '@vkontakte/vkui';

type EmptyStateProps = {
  header: string;
  description: string;
};

export function EmptyState({ header, description }: EmptyStateProps) {
  return (
    <Group className="fade-up">
      <Placeholder className="bloom-card">
        <strong>{header}</strong>
        <br />
        {description}
      </Placeholder>
    </Group>
  );
}
