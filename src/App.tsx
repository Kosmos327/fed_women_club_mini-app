import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import {
  clearAccessToken,
  getMe,
  getVerifications,
  getSubscription,
  miniAppLogin,
  setAccessToken,
  type ApiClient,
  type ApiSubscription,
  type ApiUser,
  type ApiVerification,
  type MiniAppLoginSuccess,
} from './api/client';
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
  const [user, setUser] = useState<ApiUser | null>(null);
  const [client, setClient] = useState<ApiClient | null>(null);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [isVerificationsLoading, setIsVerificationsLoading] = useState<boolean>(false);
  const [verificationsError, setVerificationsError] = useState<string>('');
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
      .then(async (response) => {
        if ('status' in response && response.status === 'join_via_bot_required') {
          clearAccessToken();
          setAuthState('join_required');
          return;
        }

        const successResponse = response as MiniAppLoginSuccess;
        setAccessToken(successResponse.access_token);

        const [meData, subscriptionData] = await Promise.all([
          getMe(),
          getSubscription(),
        ]);

        setUser(meData.user ?? successResponse.user ?? null);
        setClient(meData.client ?? successResponse.client ?? null);
        setSubscription(subscriptionData ?? null);

        setUserName(String(meData.user?.first_name ?? successResponse.user?.first_name ?? meData.user?.name ?? successResponse.user?.name ?? ''));
        setAuthState('ready');
      })
      .catch(() => {
        clearAccessToken();
        setErrorMessage('Не удалось загрузить данные клуба. Попробуйте обновить приложение.');
        setAuthState('error');
      });
  }, []);

  const openPrivilegesPage = async () => {
    setPage('privileges');
    setIsVerificationsLoading(true);
    setVerificationsError('');

    try {
      const data = await getVerifications<ApiVerification[]>();
      setVerifications(Array.isArray(data) ? data : []);
    } catch {
      setVerifications([]);
      setVerificationsError('Не удалось загрузить привилегии. Попробуйте обновить приложение.');
    } finally {
      setIsVerificationsLoading(false);
    }
  };

  const content = useMemo(() => {
    if (authState === 'loading') return <LoadingState />;
    if (authState === 'join_required') return <JoinViaBotPage />;
    if (authState === 'no_launch_params') return <ErrorState message={noLaunchParamsMessage} />;
    if (authState === 'error') return <ErrorState message={errorMessage} />;

    if (page === 'catalog') return <CatalogPage onBack={() => setPage('home')} />;
    if (page === 'partner') return <PartnerPage onBack={() => setPage('home')} />;
    if (page === 'privileges') {
      if (isVerificationsLoading) return <LoadingState />;
      if (verificationsError) return <ErrorState message={verificationsError} />;

      return <PrivilegesPage onBack={() => setPage('home')} verifications={verifications} />;
    }
    if (page === 'subscription') return <SubscriptionPage onBack={() => setPage('home')} />;
    if (page === 'profile') return <ProfilePage onBack={() => setPage('home')} />;

    return (
      <HomePage
        userName={userName}
        user={user}
        client={client}
        subscription={subscription}
        onCatalog={() => setPage('catalog')}
        onPrivileges={openPrivilegesPage}
        onSubscription={() => setPage('subscription')}
        onProfile={() => setPage('profile')}
      />
    );
  }, [
    authState,
    client,
    errorMessage,
    isVerificationsLoading,
    noLaunchParamsMessage,
    page,
    subscription,
    user,
    userName,
    verifications,
    verificationsError,
  ]);

  return content;
}
