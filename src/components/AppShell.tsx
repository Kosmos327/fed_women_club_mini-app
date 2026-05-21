import type { PropsWithChildren } from 'react';
import { AppRoot, Panel, PanelHeader, SplitCol, SplitLayout, View } from '@vkontakte/vkui';

type AppShellProps = PropsWithChildren<{ title: string; titleClassName?: string }>;

export function AppShell({ title, titleClassName = "bloom-page-title", children }: AppShellProps) {
  return (
    <AppRoot className="bloom-app">
      <SplitLayout>
        <SplitCol autoSpaced width="100%" maxWidth="560px">
          <View activePanel="main">
            <Panel id="main" className="bloom-content">
              <PanelHeader className="bloom-panel-header">
                <span className={titleClassName}>{title}</span>
              </PanelHeader>
              {children}
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
}
