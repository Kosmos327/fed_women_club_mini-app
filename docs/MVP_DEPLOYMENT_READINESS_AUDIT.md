# MVP Deployment Readiness Audit (VK Mini App)

Дата аудита: 2026-05-20
Репозиторий: `Kosmos327/fed_women_club_mini-app`

## 1) Текущий статус MVP

Статус: **MVP frontend функционально готов к тестовому деплою** при условии корректных ENV и валидного backend URL.

Покрытые клиентские сценарии подтверждены:
- VK Mini App login через `POST /api/v1/auth/vk-miniapp-login`.
- HomePage (`getMe`, `getSubscription`).
- CatalogPage (`getPartners`).
- PartnerPage (`createVerification(partnerId)`).
- PrivilegesPage (`getVerifications`).
- SubscriptionPage (`getSubscription`, `createPaymentRequest`, `markPaymentRequestPaid`).
- ProfilePage (`getMe`, `updateMe(payload)`).

## 2) Готовность страниц

Готовы к использованию в MVP:
- `home`
- `catalog`
- `partner`
- `privileges`
- `subscription`
- `profile`

Навигация реализована на state-based подходе без `react-router` (ожидаемо для MVP).

## 3) Используемые backend endpoints (проверено)

Frontend использует следующие endpoint'ы:
- `POST /api/v1/auth/vk-miniapp-login`
- `GET /api/v1/clients/me`
- `PATCH /api/v1/clients/me`
- `GET /api/v1/clients/me/subscription`
- `POST /api/v1/clients/me/payment-requests`
- `POST /api/v1/clients/me/payment-requests/{id}/mark-paid`
- `GET /api/v1/clients/catalog/partners`
- `GET /api/v1/clients/me/verifications`
- `POST /api/v1/clients/partners/{id}/verify`

Несостыковок по путям в коде frontend не обнаружено.

## 4) ENV readiness

Необходимые переменные:
- `VITE_API_BASE_URL`
- `VITE_VK_APP_ID`
- `VITE_VK_BOT_URL`

Проверка секьюрности:
- `VK_APP_SECRET` во frontend-коде не используется.
- `VK_APP_SECRET` должен храниться только на backend.

## 5) Auth-flow readiness

Проверено:
- `getRawVkLaunchParams()` корректно читает `window.location.search` и возвращает пустую строку, если launch params отсутствуют.
- При отсутствии launch params приложение переводится в `no_launch_params` и показывает сообщение «Откройте приложение внутри VK».
- `miniAppLogin()` отправляет `launch_params` на backend.
- `setAccessToken()` вызывается только после успешного login.
- Ответ `join_via_bot_required` обрабатывается отдельно: токен очищается, пользователь переводится в экран Join via bot.

## 6) UI / VKUI compatibility audit

Проверено:
- Не используются проблемные legacy-props из списка риска:
  - `Header mode` — не найдено.
  - `ContentCard` — не найдено.
  - `Placeholder header` — не найдено.
  - `Spinner size="large"` — не найдено (используется `size="l"`).

## 7) Что указать в VK Developer settings

Для Mini App в VK Developer нужно заполнить:
- **App ID**: значение `VITE_VK_APP_ID`.
- **URL запуска Mini App (Frontend URL)**: публичный HTTPS URL, где развернут `dist` данного frontend.
- **Разрешённый домен/URL** (если поле присутствует в текущем интерфейсе VK): тот же домен, что и у frontend URL.

Рекомендуемый формат production URL:
- `https://<your-domain>/<mini-app-path>/`

Важно:
- URL должен быть доступен по HTTPS.
- URL должен обслуживать `index.html` и статику из `dist`.

## 8) Какой URL нужен для размещения Mini App

Нужен **публичный frontend URL** (не backend):
- Пример: `https://app.example.com/fed-women-club/`

Этот URL указывается в настройках VK Mini App как адрес запуска клиента.

## 9) Что нельзя добавлять во frontend

Перед деплоем и в следующих итерациях:
- Нельзя добавлять `VK_APP_SECRET` в frontend env, код или репозиторий.
- Нельзя переносить backend-валидацию подписи launch params во frontend.
- Нельзя добавлять секреты в `localStorage`, клиентские константы и сборку.

## 10) Checklist перед деплоем

- [ ] Заполнены production ENV: `VITE_API_BASE_URL`, `VITE_VK_APP_ID`, `VITE_VK_BOT_URL`.
- [ ] `VITE_API_BASE_URL` указывает на доступный production backend с корректным CORS для frontend домена.
- [ ] Frontend размещён на публичном HTTPS URL.
- [ ] Этот URL добавлен в VK Developer settings Mini App.
- [ ] Проверен вход из VK-клиента (не из обычного браузера без launch params).
- [ ] Проверены основные пользовательские сценарии MVP на production backend.
- [ ] Выполнены проверки: `npm run typecheck`, `npm run build`.

## 11) Known limitations / отложено на следующий этап

- Навигация state-based без URL-маршрутов и deep-linking (осознанно для MVP).
- Ошибки API отображаются общими сообщениями без granular error mapping.
- Нет отдельного observability слоя (Sentry/метрики) в текущем MVP.
- Логика подтверждения оплаты зависит от последующей проверки администратором backend.
