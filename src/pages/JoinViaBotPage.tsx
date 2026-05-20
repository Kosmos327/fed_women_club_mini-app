import { Button, Div, Group } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';

const BOT_URL = import.meta.env.VITE_VK_BOT_URL;

export function JoinViaBotPage() {
  return (
    <AppShell title="Доступ к клубу">
      <Group>
        <Div>Сначала присоединитесь к клубу через VK-бота.</Div>
        <Div>
          <Button
            stretched
            size="l"
            href={BOT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Открыть VK-бота
          </Button>
        </Div>
      </Group>
    </AppShell>
  );
}
