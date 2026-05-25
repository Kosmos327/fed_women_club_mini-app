import { Group, Placeholder } from '@vkontakte/vkui';

type ErrorStateProps = {
  message: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({ message, detail, actionLabel, onAction }: ErrorStateProps) {
  return (
    <Group>
      <Placeholder className="glass-panel">
        <strong>Ошибка входа</strong>
        <br />
        {message}
        {detail ? (
          <>
            <br />
            <br />
            <span style={{ whiteSpace: 'pre-line' }}>{detail}</span>
          </>
        ) : null}
        {actionLabel && onAction ? (
          <>
            <br />
            <br />
            <button type="button" onClick={onAction}>
              {actionLabel}
            </button>
          </>
        ) : null}
      </Placeholder>
    </Group>
  );
}
