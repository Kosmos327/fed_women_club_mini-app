import { Group, Placeholder, Spinner } from '@vkontakte/vkui';

const petals = Array.from({ length: 8 }, (_, index) => index);

export function LoadingState() {
  return (
    <Group className="bloom-loading fade-up">
      <div className="bloom-loading__petals" aria-hidden="true">
        {petals.map((petal) => <span key={petal} className="bloom-loading__petal" />)}
      </div>
      <Placeholder className="glass-panel bloom-loading__placeholder" icon={<Spinner size="l" />}>
        <span className="bloom-loading__text">Загружаем мини-приложение…</span>
      </Placeholder>
    </Group>
  );
}
