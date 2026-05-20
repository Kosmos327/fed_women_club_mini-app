# Bloom Club — VK Mini App Frontend

Это frontend-часть VK Mini App для проекта Bloom Club (женский клуб), собранная на React + TypeScript + Vite + VKUI + VK Bridge.

## Технологии

- React
- TypeScript
- Vite
- VKUI
- VK Bridge

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` по примеру `.env.example`.

3. Запустить dev-сервер:

```bash
npm run dev
```

## ENV переменные

```env
VITE_API_BASE_URL=https://bloomclub.ru
VITE_VK_APP_ID=54600832
VITE_VK_BOT_URL=https://vk.com/club_or_bot_link_here
```

- `VITE_API_BASE_URL` — базовый URL backend API.
- `VITE_VK_APP_ID` — ID VK Mini App.
- `VITE_VK_BOT_URL` — ссылка для сценария join via bot.

## Безопасность

`VK_APP_SECRET` **запрещено** хранить во frontend (в репозитории, `.env`, клиентском коде, CI variables для frontend-сборки).

Проверка подписи launch params должна выполняться только на backend.

## Backend endpoint

Для авторизации используется endpoint:

- `POST /api/v1/auth/vk-miniapp-login`

## Проверки и команды

```bash
npm run typecheck
npm run build
npm run preview
```

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) запускается на:

- `pull_request`
- `push` в `main`

CI выполняет:

1. Установку зависимостей (`npm ci`, если есть `package-lock.json`, иначе `npm install`).
2. `npm run typecheck`
3. `npm run build`
