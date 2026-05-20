# Bloom Club — VK Mini App Frontend (MVP Skeleton)

Это frontend-репозиторий VK Mini App для проекта Bloom Club / Женский клуб.

- VK App: https://vk.com/app54600832
- VK_APP_ID: `54600832`
- Backend (отдельный репозиторий): `Kosmos327/fed_women_club_WEB`

## Назначение проекта

Репозиторий содержит минимальный frontend skeleton для VK Mini App на:
- React
- TypeScript
- Vite
- VKUI
- VK Bridge

Frontend выполняет запуск Mini App, читает launch params, передает их на backend для авторизации и показывает базовые страницы/состояния.

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

## ENV

```env
VITE_API_BASE_URL=https://bloomclub.ru
VITE_VK_APP_ID=54600832
VITE_VK_BOT_URL=https://vk.com/club_or_bot_link_here
```

- `VITE_API_BASE_URL` используется для запросов к backend API.
- `VITE_VK_APP_ID` — идентификатор VK Mini App.
- `VITE_VK_BOT_URL` используется на странице JoinViaBot.

## Безопасность

`VK_APP_SECRET` **запрещено** добавлять во frontend (в `.env`, исходники, CI secrets и т.п.).
Проверка подписи launch params должна выполняться только на backend.

## Backend endpoint

Для логина используется endpoint:

- `POST /api/v1/auth/vk-miniapp-login`

## CI

Workflow: `.github/workflows/ci.yml`

Триггеры:
- `pull_request`
- `push` в `main`

Проверки в CI:
- установка зависимостей (`npm ci`, если есть `package-lock.json`, иначе `npm install`)
- `npm run typecheck`
- `npm run build`

## Команды проверки

```bash
npm install
npm run typecheck
npm run build
```

Дополнительно:

```bash
npm run preview
```
