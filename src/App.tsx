import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import {
  clearAccessToken,
  getMe,
  getPartners,
  getVerifications,
  getSubscription,
  createVerification,
  miniAppLogin,
  setAccessToken,
  type ApiClient,
  type ApiSubscription,
  type ApiPartner,
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
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ApiPartner | null>(null);
  const [isPartnersLoading, setIsPartnersLoading] = useState<boolean>(false);
  const [partnersError, setPartnersError] = useState<string>('');
  const [isVerificationsLoading, setIsVerificationsLoading] = useState<boolean>(false);
  const [verificationsError, setVerificationsError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCreatingVerification, setIsCreatingVerification] = useState<boolean>(false);
  const [createdVerification, setCreatedVerification] = useState<ApiVerification | null>(null);
  const [createVerificationError, setCreateVerificationError] = useState<string>('');

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

  const openCatalogPage = async () => {
    setPage('catalog');
    setIsPartnersLoading(true);
    setPartnersError('');

    try {
      const data = await getPartners<ApiPartner[]>();
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
      setPartnersError('Не удалось загрузить партнёров. Попробуйте обновить приложение.');
    } finally {
      setIsPartnersLoading(false);
    }
  };

  const handleCreateVerification = async (partnerId: string) => {
    setIsCreatingVerification(true);
    setCreatedVerification(null);
    setCreateVerificationError('');

    try {
      const data = await createVerification<ApiVerification>(partnerId);
      setCreatedVerification(data ?? null);
    } catch {
      setCreateVerificationError('Не удалось получить код. Попробуйте ещё раз.');
    } finally {
      setIsCreatingVerification(false);
    }
  };

  const content = useMemo(() => {
    if (authState === 'loading') return <LoadingState />;
    if (authState === 'join_required') return <JoinViaBotPage />;
    if (authState === 'no_launch_params') return <ErrorState message={noLaunchParamsMessage} />;
    if (authState === 'error') return <ErrorState message={errorMessage} />;

    if (page === 'catalog') {
      if (isPartnersLoading) return <LoadingState />;
      if (partnersError) return <ErrorState message={partnersError} />;

      return (
        <CatalogPage
          partners={partners}
          onBack={() => setPage('home')}
          onPartnerClick={(partner) => {
            setSelectedPartner(partner);
            setCreatedVerification(null);
            setCreateVerificationError('');
            setPage('partner');
          }}
        />
      );
    }
    if (page === 'partner') {
      return (
        <PartnerPage
          selectedPartner={selectedPartner}
          onBack={() => setPage('catalog')}
          onCreateVerification={handleCreateVerification}
          isCreatingVerification={isCreatingVerification}
          createdVerification={createdVerification}
          createVerificationError={createVerificationError}
          onOpenPrivileges={openPrivilegesPage}
        />
      );
    }
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
        onCatalog={openCatalogPage}
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
    isPartnersLoading,
    partners,
    partnersError,
    selectedPartner,
    createVerificationError,
    createdVerification,
    isCreatingVerification,
    subscription,
    user,
    userName,
    verifications,
    verificationsError,
  ]);

  return content;
}
