import type { PropsWithChildren } from 'react';
import { AppRoot, Panel, PanelHeader, SplitCol, SplitLayout, View } from '@vkontakte/vkui';

type AppShellProps = PropsWithChildren<{ title: string }>;

export function AppShell({ title, children }: AppShellProps) {
  return (
    <AppRoot>
      <SplitLayout>
        <SplitCol autoSpaced width="100%" maxWidth="560px">
          <View activePanel="main">
            <Panel id="main">
              <PanelHeader>{title}</PanelHeader>
              {children}
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
}
