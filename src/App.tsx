import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { clearAccessToken, miniAppLogin, setAccessToken, type MiniAppLoginSuccess } from './api/client';
import { getRawVkLaunchParams } from './auth/vkLaunchParams';
import { HomePage } from './pages/HomePage';
import { JoinViaBotPage } from './pages/JoinViaBotPage';
import { CatalogPage } from './pages/CatalogPage';
import { PartnerPage } from './pages/PartnerPage';
import { PrivilegesPage } from './pages/PrivilegesPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProfilePage } from './pages/ProfilePage';

type AuthState = 'loading' | 'ready' | 'join_required' | 'no_launch_params' | 'error';
type Page = 'home' | 'catalog' | 'partner' | 'privileges' | 'subscription' | 'profile';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [page, setPage] = useState<Page>('home');
  const [userName, setUserName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const noLaunchParamsMessage = 'Откройте приложение внутри VK';

  useEffect(() => {
    const launchParams = getRawVkLaunchParams();

    if (!launchParams) {
      clearAccessToken();
      setAuthState('no_launch_params');
      return;
    }

    miniAppLogin(launchParams)
      .then((response) => {
        if ('status' in response && response.status === 'join_via_bot_required') {
          clearAccessToken();
          setAuthState('join_required');
          return;
        }

        const successResponse = response as MiniAppLoginSuccess;
        setAccessToken(successResponse.access_token);
        setUserName(String(successResponse.user?.first_name ?? successResponse.user?.name ?? ''));
        setAuthState('ready');
      })
      .catch(() => {
        clearAccessToken();
        setErrorMessage('Не удалось авторизоваться. Попробуйте открыть приложение снова из VK.');
        setAuthState('error');
      });
  }, []);

  const content = useMemo(() => {
    if (authState === 'loading') return <LoadingState />;
    if (authState === 'join_required') return <JoinViaBotPage />;
    if (authState === 'no_launch_params') return <ErrorState message={noLaunchParamsMessage} />;
    if (authState === 'error') return <ErrorState message={errorMessage} />;

    if (page === 'catalog') return <CatalogPage onBack={() => setPage('home')} />;
    if (page === 'partner') return <PartnerPage onBack={() => setPage('home')} />;
    if (page === 'privileges') return <PrivilegesPage onBack={() => setPage('home')} />;
    if (page === 'subscription') return <SubscriptionPage onBack={() => setPage('home')} />;
    if (page === 'profile') return <ProfilePage onBack={() => setPage('home')} />;

    return (
      <HomePage
        userName={userName}
        onCatalog={() => setPage('catalog')}
        onPrivileges={() => setPage('privileges')}
        onSubscription={() => setPage('subscription')}
        onProfile={() => setPage('profile')}
      />
    );
  }, [authState, errorMessage, noLaunchParamsMessage, page, userName]);

  return content;
}
