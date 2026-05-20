# Bloom Club — VK Mini App Frontend (MVP Skeleton)

Это frontend-репозиторий VK Mini App для проекта Bloom Club / Женский клуб.

- VK App: https://vk.com/app54600832
- VK_APP_ID: `54600832`
- Backend (отдельный репозиторий): `Kosmos327/fed_women_club_WEB`

## Что реализовано

- React + TypeScript + Vite skeleton для VK Mini App.
- Базовая интеграция с backend login endpoint:
  - `POST /api/v1/auth/vk-miniapp-login`
- Получение raw launch params из `window.location.search`.
- Состояния приложения:
  - загрузка,
  - успешный вход,
  - `join_via_bot_required`,
  - отсутствие launch params,
  - ошибка авторизации.
- Базовые страницы-заглушки в VKUI-стиле.

## Локальный запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` на основе `.env.example`.

3. Запустите dev сервер:

```bash
npm run dev
```

## ENV переменные

```env
VITE_API_BASE_URL=https://bloomclub.ru
VITE_VK_APP_ID=54600832
VITE_VK_BOT_URL=https://vk.com/club_or_bot_link_here
```

- `VITE_API_BASE_URL` используется для запросов к backend API.
- `VITE_VK_BOT_URL` используется в JoinViaBotPage.

## Безопасность

`VK_APP_SECRET` **не должен** попадать во frontend и не используется в этом репозитории.
Проверка подписи launch params должна происходить только на backend.

## Build

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Type checking:

```bash
npm run typecheck
```

## CI

В репозитории настроен GitHub Actions workflow: `.github/workflows/ci.yml`.

Pipeline запускается на:
- `pull_request`;
- `push` в `main`.

Проверки в CI:
- установка зависимостей (`npm ci`, если есть `package-lock.json`, иначе `npm install`);
- `npm run typecheck`;
- `npm run build`.

`npm run lint` намеренно не включён в CI, пока в репозитории не добавлена рабочая конфигурация ESLint.

## Критерий готовности PR

PR считается готовым к merge только после успешных проверок:
- `npm run typecheck`;
- `npm run build`;
- GitHub Actions CI (workflow `CI`).

