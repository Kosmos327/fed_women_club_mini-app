import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import {
  clearAccessToken,
  getMe,
  getCities,
  getPartners,
  getVerifications,
  getPartnerOffers,
  getSubscription,
  getSavings,
  createVerification,
  createPaymentRequest,
  markPaymentRequestPaid,
  miniAppLogin,
  updateMe,
  setAccessToken,
  type ApiFetchError,
  type ApiClient,
  type ApiCity,
  type ApiPaymentRequest,
  type ApiSubscription,
  type ApiPartner,
  type ApiOffer,
  type ApiUser,
  type ApiVerification,
  type ApiSavingsResponse,
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
import { SavingsPage } from './pages/SavingsPage';

type AuthState = 'loading' | 'ready' | 'join_required' | 'no_launch_params' | 'error';
type Page = 'home' | 'catalog' | 'partner' | 'privileges' | 'subscription' | 'profile' | 'savings';

type ProfileApiState = {
  user: ApiUser | null;
  client: ApiClient | null;
};

type BootstrapStep =
  | 'vk-init'
  | 'auth'
  | 'me'
  | 'cities'
  | 'subscription'
  | 'savings'
  | 'partners/catalog'
  | 'verifications'
  | 'activity'
  | 'unknown';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractProfileApiState = (data: unknown): ProfileApiState => {
  if (!isRecord(data)) {
    return { user: null, client: null };
  }

  const nestedData = isRecord(data.data) ? data.data : null;
  const source = nestedData ?? data;
  const profile = isRecord(source.profile) ? source.profile : null;
  const user = isRecord(source.user)
    ? source.user
    : isRecord(profile?.user)
      ? profile.user
      : null;

  const clientSource = isRecord(source.client)
    ? source.client
    : isRecord(profile?.client)
      ? profile.client
      : (profile ?? source);
  const client = isRecord(clientSource)
    ? (clientSource as ApiClient)
    : null;

  if (import.meta.env.DEV) {
    console.debug('getMe response shape', {
      hasData: Boolean(nestedData),
      hasProfile: Boolean(profile),
      hasUser: Boolean(user),
      hasClient: Boolean(client),
    });
  }

  return {
    user: user as ApiUser | null,
    client,
  };
};

const parseApiErrorDetail = (error: unknown): string => {
  const rawMessage = error instanceof Error ? error.message : String(error ?? '');
  if (!rawMessage) return '';
  try {
    const parsed = JSON.parse(rawMessage) as { detail?: unknown; message?: unknown };
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (typeof parsed.message === 'string') return parsed.message;
  } catch {
    // noop
  }
  return rawMessage;
};

const getBootstrapErrorCode = (error: unknown): string => {
  const apiError = error as ApiFetchError;
  if (typeof apiError?.status === 'number') return String(apiError.status);
  if (apiError?.kind === 'network') return 'network';
  return 'unknown';
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [page, setPage] = useState<Page>('home');
  const [userName, setUserName] = useState<string>('');
  const [user, setUser] = useState<ApiUser | null>(null);
  const [client, setClient] = useState<ApiClient | null>(null);
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null);
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [selectedCatalogCityId, setSelectedCatalogCityId] = useState<string>('');
  const [selectedCatalogCategorySlug, setSelectedCatalogCategorySlug] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<ApiPartner | null>(null);
  const [isPartnersLoading, setIsPartnersLoading] = useState<boolean>(false);
  const [partnersError, setPartnersError] = useState<string>('');
  const [isVerificationsLoading, setIsVerificationsLoading] = useState<boolean>(false);
  const [verificationsError, setVerificationsError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bootstrapErrorStep, setBootstrapErrorStep] = useState<BootstrapStep>('unknown');
  const [bootstrapErrorCode, setBootstrapErrorCode] = useState<string>('unknown');
  const [isCreatingVerification, setIsCreatingVerification] = useState<boolean>(false);
  const [createdVerification, setCreatedVerification] = useState<ApiVerification | null>(null);
  const [createVerificationError, setCreateVerificationError] = useState<string>('');
  const [partnerOffers, setPartnerOffers] = useState<ApiOffer[]>([]);
  const [isPartnerOffersLoading, setIsPartnerOffersLoading] = useState<boolean>(false);
  const [partnerOffersError, setPartnerOffersError] = useState<string>('');
  const [selectedOfferIdForVerification, setSelectedOfferIdForVerification] = useState<string>('');
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
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState<boolean>(false);
  const [citiesError, setCitiesError] = useState<string>('');
  const [savingsData, setSavingsData] = useState<ApiSavingsResponse | null>(null);
  const [isSavingsLoading, setIsSavingsLoading] = useState<boolean>(false);
  const [savingsError, setSavingsError] = useState<string>('');
  const [savingsFilterMode, setSavingsFilterMode] = useState<'all' | 'period'>('all');
  const [savingsFromDate, setSavingsFromDate] = useState<string>('');
  const [savingsToDate, setSavingsToDate] = useState<string>('');

  const noLaunchParamsMessage = 'Откройте приложение внутри VK';

  const refreshProfile = async (fallback?: { user?: ApiUser | null; client?: ApiClient | null }) => {
    const meResponse = await getMe();
    const profileState = extractProfileApiState(meResponse);
    const nextUser = profileState.user ?? fallback?.user ?? null;
    const nextClient = profileState.client ?? fallback?.client ?? null;

    setUser(nextUser);
    setClient(nextClient);
    setUserName(String(nextUser?.first_name ?? nextUser?.name ?? nextClient?.full_name ?? nextClient?.name ?? ''));

    return profileState;
  };

  const runBootstrap = async () => {
    const launchParams = getRawVkLaunchParams();
    let currentStep: BootstrapStep = 'vk-init';
    setBootstrapErrorStep('unknown');
    setBootstrapErrorCode('unknown');
    setErrorMessage('');

    if (!launchParams) {
      clearAccessToken();
      setAuthState('no_launch_params');
      return;
    }
    setAuthState('loading');
    try {
      currentStep = 'auth';
      const response = await miniAppLogin(launchParams);
      if ('status' in response && response.status === 'join_via_bot_required') {
        clearAccessToken();
        setAuthState('join_required');
        return;
      }
      const successResponse = response as MiniAppLoginSuccess;
      setAccessToken(successResponse.access_token);
      currentStep = 'me';
      await refreshProfile({ user: successResponse.user, client: successResponse.client });
      currentStep = 'subscription';
      const subscriptionData = await getSubscription();
      setSubscription(subscriptionData ?? null);
      setAuthState('ready');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Bootstrap auth error', {
          apiBase: import.meta.env.VITE_API_BASE_URL,
          step: currentStep,
          code: getBootstrapErrorCode(error),
          detail: parseApiErrorDetail(error),
        });
      }
      clearAccessToken();
      setBootstrapErrorStep(currentStep);
      setBootstrapErrorCode(getBootstrapErrorCode(error));
      setErrorMessage('Не удалось загрузить данные клуба. Попробуйте обновить приложение.');
      setAuthState('error');
    }
  };

  useEffect(() => {
    void runBootstrap();
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

  const openCatalogPage = async (params?: { cityId?: string; categorySlug?: string }) => {
    setPage('catalog');
    setIsPartnersLoading(true);
    setPartnersError('');

    try {
      const cityId = params?.cityId ?? selectedCatalogCityId;
      const categorySlug = params?.categorySlug ?? selectedCatalogCategorySlug;
      const requestParams = {
        ...(cityId ? { city_id: cityId } : {}),
        ...(categorySlug ? { category_slug: categorySlug } : {}),
      };
      if (import.meta.env.DEV) {
        console.debug('Catalog request diagnostics', {
          apiBase: import.meta.env.VITE_API_BASE_URL,
          endpoint: '/clients/catalog/partners',
          requestParams,
          selectedCityId: cityId,
          selectedCategorySlug: categorySlug,
        });
      }
      const data = await getPartners<ApiPartner[]>(requestParams);
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      setPartners([]);
      const errorText = error instanceof Error ? error.message : '';
      if (errorText.includes('401')) {
        setPartnersError('Сессия истекла. Нужно войти в клуб заново.');
      } else {
        setPartnersError('Не удалось загрузить партнёров. Попробуйте обновить приложение.');
      }
    } finally {
      setIsPartnersLoading(false);
    }
  };

  const handleCreateVerification = async (partnerId: string, offerId?: string) => {
    setIsCreatingVerification(true);
    setCreatedVerification(null);
    setCreateVerificationError('');
    setSelectedOfferIdForVerification(offerId ?? '');

    try {
      const data = await createVerification<ApiVerification>(
        partnerId,
        offerId ? { offer_id: offerId } : undefined,
      );
      setCreatedVerification(data ?? null);
    } catch (error) {
      const detail = parseApiErrorDetail(error).toLowerCase();
      if (detail.includes('одну привилегию в месяц') || detail.includes('уже получили привилегию') || detail.includes('в этом месяце')) {
        setCreateVerificationError('Вы уже получили привилегию у этого партнёра в этом месяце. Новую можно будет получить в следующем месяце.');
      } else {
        setCreateVerificationError('Не удалось получить код. Попробуйте ещё раз.');
      }
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


  const openProfilePage = async () => {
    setProfileUpdateError('');
    setProfileUpdateSuccessMessage('');
    setIsCitiesLoading(true);
    setCitiesError('');
    setPage('profile');

    try {
      const data = await getCities<ApiCity[]>();
      setCities(Array.isArray(data) ? data : []);
    } catch {
      setCities([]);
      setCitiesError('Не удалось загрузить список городов. Попробуйте обновить приложение.');
    } finally {
      setIsCitiesLoading(false);
    }
  };

  const handleUpdateProfile = async (payload: ApiClientUpdatePayload) => {
    setIsProfileUpdating(true);
    setProfileUpdateError('');
    setProfileUpdateSuccessMessage('');

    try {
      const updateResponse = await updateMe(payload);
      const updateProfileState = extractProfileApiState(updateResponse);
      await refreshProfile({ user: updateProfileState.user, client: updateProfileState.client });

      setProfileUpdateSuccessMessage('Профиль сохранён');
    } catch {
      setProfileUpdateError('Не удалось сохранить профиль. Попробуйте ещё раз.');
    } finally {
      setIsProfileUpdating(false);
    }
  };


  const loadSavings = async (params?: { from_date?: string; to_date?: string }) => {
    setIsSavingsLoading(true);
    setSavingsError('');

    try {
      const data = await getSavings<ApiSavingsResponse>(params);
      setSavingsData(data ?? null);
    } catch {
      setSavingsData(null);
      setSavingsError('Не удалось загрузить экономию. Попробуйте позже.');
    } finally {
      setIsSavingsLoading(false);
    }
  };

  const openSavingsPage = async () => {
    setPage('savings');
    setSavingsFilterMode('all');
    setSavingsFromDate('');
    setSavingsToDate('');
    await loadSavings();
  };

  const handleSavingsSelectAll = async () => {
    setSavingsFilterMode('all');
    setSavingsFromDate('');
    setSavingsToDate('');
    await loadSavings();
  };

  const handleSavingsApplyPeriod = async () => {
    if (!savingsFromDate && !savingsToDate) {
      setSavingsFilterMode('all');
      await loadSavings();
      return;
    }

    if (savingsFromDate && savingsToDate && savingsFromDate > savingsToDate) {
      setSavingsError('Дата начала не может быть позже даты окончания');
      return;
    }

    setSavingsFilterMode('period');
    await loadSavings({
      ...(savingsFromDate ? { from_date: savingsFromDate } : {}),
      ...(savingsToDate ? { to_date: savingsToDate } : {}),
    });
  };

  const handleSavingsResetPeriod = async () => {
    setSavingsFromDate('');
    setSavingsToDate('');
    setSavingsFilterMode('all');
    await loadSavings();
  };

  const handleProfileBack = async () => {
    try {
      await refreshProfile();
    } catch {
      // noop: if refresh fails, user still can return to home with previous state
    } finally {
      setPage('home');
    }
  };

  const content = useMemo(() => {
    if (authState === 'loading') return <LoadingState />;
    if (authState === 'join_required') return <JoinViaBotPage />;
    if (authState === 'no_launch_params') return <ErrorState message={noLaunchParamsMessage} />;
    if (authState === 'error') {
      return (
        <ErrorState
          message={errorMessage}
          detail={`Шаг: ${bootstrapErrorStep}\nКод ошибки: ${bootstrapErrorCode}`}
          actionLabel="Повторить загрузку"
          onAction={() => void runBootstrap()}
        />
      );
    }

    if (page === 'catalog') {
      if (isPartnersLoading) return <LoadingState />;
      if (partnersError) return <ErrorState message={partnersError} />;

      return (
        <CatalogPage
          partners={partners}
          cities={cities}
          selectedCityId={selectedCatalogCityId}
          selectedCategorySlug={selectedCatalogCategorySlug}
          selectedCityLabel={selectedCatalogCityId
            ? (cities.find((city) => String(city.id) === selectedCatalogCityId)?.name ?? 'Выбранный город')
            : (client?.city_name ?? client?.city ?? 'город профиля')}
          isProfileCityFallback={!selectedCatalogCityId}
          onCityChange={(cityId) => {
            setSelectedCatalogCityId(cityId);
            void openCatalogPage({ cityId, categorySlug: selectedCatalogCategorySlug });
          }}
          onCategoryChange={(categorySlug) => {
            setSelectedCatalogCategorySlug(categorySlug);
            void openCatalogPage({ cityId: selectedCatalogCityId, categorySlug });
          }}
          onResetAllFilters={() => {
            setSelectedCatalogCityId('');
            setSelectedCatalogCategorySlug('');
            void openCatalogPage({ cityId: '', categorySlug: '' });
          }}
          onBack={() => setPage('home')}
          onPartnerClick={(partner) => {
            setSelectedPartner(partner);
            setPartnerOffers([]);
            setIsPartnerOffersLoading(true);
            setPartnerOffersError('');
            setCreatedVerification(null);
            setCreateVerificationError('');
            setSelectedOfferIdForVerification('');
            setPage('partner');
            const partnerId = partner?.id != null ? String(partner.id) : '';
            if (!partnerId) {
              setIsPartnerOffersLoading(false);
              return;
            }

            getPartnerOffers<ApiOffer[]>(partnerId)
              .then((offers) => setPartnerOffers(Array.isArray(offers) ? offers : []))
              .catch(() => {
                setPartnerOffers([]);
                setPartnerOffersError('Не удалось загрузить услуги партнёра. Попробуйте обновить страницу.');
              })
              .finally(() => setIsPartnerOffersLoading(false));
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
          selectedOfferIdForVerification={selectedOfferIdForVerification}
          offers={partnerOffers}
          isOffersLoading={isPartnerOffersLoading}
          offersError={partnerOffersError}
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

    if (page === 'savings') {
      return (
        <SavingsPage
          onBack={() => setPage('home')}
          data={savingsData}
          isLoading={isSavingsLoading}
          error={savingsError}
          filterMode={savingsFilterMode}
          fromDate={savingsFromDate}
          toDate={savingsToDate}
          onSelectAll={handleSavingsSelectAll}
          onSelectPeriod={() => {
            setSavingsFilterMode('period');
            setSavingsError('');
          }}
          onFromDateChange={setSavingsFromDate}
          onToDateChange={setSavingsToDate}
          onApplyPeriod={handleSavingsApplyPeriod}
          onResetPeriod={handleSavingsResetPeriod}
        />
      );
    }

    if (page === 'profile') {
      return (
        <ProfilePage
          onBack={handleProfileBack}
          client={client}
          user={user}
          onSave={handleUpdateProfile}
          isSaving={isProfileUpdating}
          saveError={profileUpdateError}
          saveSuccessMessage={profileUpdateSuccessMessage}
          cities={cities}
          isCitiesLoading={isCitiesLoading}
          citiesError={citiesError}
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
        onSavings={openSavingsPage}
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
    partnerOffers,
    isPartnerOffersLoading,
    partnerOffersError,
    selectedOfferIdForVerification,
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
    cities,
    isCitiesLoading,
    citiesError,
    savingsData,
    isSavingsLoading,
    savingsError,
    savingsFilterMode,
    savingsFromDate,
    savingsToDate,
  ]);

  return content;
}
