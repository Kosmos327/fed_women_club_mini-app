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
  createPaymentRequest,
  markPaymentRequestPaid,
  miniAppLogin,
  updateMe,
  setAccessToken,
  type ApiClient,
  type ApiPaymentRequest,
  type ApiSubscription,
  type ApiPartner,
  type ApiUser,
  type ApiVerification,
  type ApiClientUpdatePayload,
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
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');
  const [paymentRequest, setPaymentRequest] = useState<ApiPaymentRequest | null>(null);
  const [isCreatingPaymentRequest, setIsCreatingPaymentRequest] = useState<boolean>(false);
  const [createPaymentRequestError, setCreatePaymentRequestError] = useState<string>('');
  const [isMarkingPaymentPaid, setIsMarkingPaymentPaid] = useState<boolean>(false);
  const [markPaymentPaidError, setMarkPaymentPaidError] = useState<string>('');
  const [markPaymentPaidSuccessMessage, setMarkPaymentPaidSuccessMessage] = useState<string>('');
  const [isProfileUpdating, setIsProfileUpdating] = useState<boolean>(false);
  const [profileUpdateError, setProfileUpdateError] = useState<string>('');
  const [profileUpdateSuccessMessage, setProfileUpdateSuccessMessage] = useState<string>('');

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

  const openSubscriptionPage = async () => {
    setPage('subscription');
    setIsSubscriptionLoading(true);
    setSubscriptionError('');
    setPaymentRequest(null);
    setCreatePaymentRequestError('');
    setMarkPaymentPaidError('');
    setMarkPaymentPaidSuccessMessage('');

    try {
      const data = await getSubscription<ApiSubscription>();
      setSubscription(data ?? null);
    } catch {
      setSubscriptionError('Не удалось загрузить подписку. Попробуйте обновить приложение.');
      setSubscription(null);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const handleCreatePaymentRequest = async () => {
    setIsCreatingPaymentRequest(true);
    setCreatePaymentRequestError('');
    setMarkPaymentPaidError('');
    setMarkPaymentPaidSuccessMessage('');

    try {
      const data = await createPaymentRequest<ApiPaymentRequest>();
      setPaymentRequest(data ?? null);
    } catch {
      setCreatePaymentRequestError('Не удалось создать заявку на оплату. Попробуйте ещё раз.');
    } finally {
      setIsCreatingPaymentRequest(false);
    }
  };

  const handleMarkPaymentPaid = async (paymentRequestId: string | number) => {
    setIsMarkingPaymentPaid(true);
    setMarkPaymentPaidError('');
    setMarkPaymentPaidSuccessMessage('');

    try {
      const data = await markPaymentRequestPaid<ApiPaymentRequest>(paymentRequestId);
      setPaymentRequest(data ?? paymentRequest);
      setMarkPaymentPaidSuccessMessage(
        String(data?.message ?? 'Заявка отправлена на проверку. После подтверждения администратором подписка станет активной.'),
      );
    } catch {
      setMarkPaymentPaidError('Не удалось отметить оплату. Попробуйте ещё раз.');
    } finally {
      setIsMarkingPaymentPaid(false);
    }
  };


  const openProfilePage = () => {
    setProfileUpdateError('');
    setProfileUpdateSuccessMessage('');
    setPage('profile');
  };

  const handleUpdateProfile = async (payload: ApiClientUpdatePayload) => {
    setIsProfileUpdating(true);
    setProfileUpdateError('');
    setProfileUpdateSuccessMessage('');

    try {
      const data = await updateMe(payload);

      if (data?.client) {
        setClient(data.client);
      }

      if (data?.user) {
        setUser(data.user);
      }

      setProfileUpdateSuccessMessage('Профиль сохранён');
    } catch {
      setProfileUpdateError('Не удалось сохранить профиль. Попробуйте ещё раз.');
    } finally {
      setIsProfileUpdating(false);
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
    if (page === 'subscription') {
      if (isSubscriptionLoading) return <LoadingState />;
      if (subscriptionError) return <ErrorState message={subscriptionError} />;

      return (
        <SubscriptionPage
          onBack={() => setPage('home')}
          subscription={subscription}
          paymentRequest={paymentRequest}
          isCreatingPaymentRequest={isCreatingPaymentRequest}
          createPaymentRequestError={createPaymentRequestError}
          onCreatePaymentRequest={handleCreatePaymentRequest}
          isMarkingPaymentPaid={isMarkingPaymentPaid}
          markPaymentPaidError={markPaymentPaidError}
          markPaymentPaidSuccessMessage={markPaymentPaidSuccessMessage}
          onMarkPaymentPaid={handleMarkPaymentPaid}
        />
      );
    }
    if (page === 'profile') {
      return (
        <ProfilePage
          onBack={() => setPage('home')}
          client={client}
          user={user}
          onSave={handleUpdateProfile}
          isSaving={isProfileUpdating}
          saveError={profileUpdateError}
          saveSuccessMessage={profileUpdateSuccessMessage}
        />
      );
    }

    return (
      <HomePage
        userName={userName}
        user={user}
        client={client}
        subscription={subscription}
        onCatalog={openCatalogPage}
        onPrivileges={openPrivilegesPage}
        onSubscription={openSubscriptionPage}
        onProfile={openProfilePage}
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
    isSubscriptionLoading,
    subscriptionError,
    paymentRequest,
    isCreatingPaymentRequest,
    createPaymentRequestError,
    isMarkingPaymentPaid,
    markPaymentPaidError,
    markPaymentPaidSuccessMessage,
    isProfileUpdating,
    profileUpdateError,
    profileUpdateSuccessMessage,
  ]);

  return content;
}
