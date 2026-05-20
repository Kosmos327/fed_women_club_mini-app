# Bloom Club — VK Mini App Frontend

Frontend-часть VK Mini App для проекта Bloom Club / Женский клуб. Приложение запускается внутри VK, получает launch params и авторизует пользователя через backend.

## Что делает проект

- Отображает интерфейс мини-приложения на React + TypeScript + VKUI.
- Передаёт launch params на backend для входа.
- Работает с backend login endpoint:
  - `POST /api/v1/auth/vk-miniapp-login`

## Локальный запуск

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## ENV переменные

Создайте `.env` (например, на основе `.env.example`) и укажите:

```env
VITE_API_BASE_URL=https://bloomclub.ru
VITE_VK_APP_ID=54600832
VITE_VK_BOT_URL=https://vk.com/club_or_bot_link_here
```

- `VITE_API_BASE_URL` — базовый URL backend API.
- `VITE_VK_APP_ID` — ID VK Mini App.
- `VITE_VK_BOT_URL` — ссылка на бота/сообщество для сценария join via bot.

## Deployment / VK settings (кратко)

- Build command: `npm run build`.
- Перед деплоем заполните ENV: `VITE_API_BASE_URL`, `VITE_VK_APP_ID`, `VITE_VK_BOT_URL`.
- Разместите собранный frontend (`dist`) на публичном HTTPS URL (пример: `https://app.example.com/fed-women-club/`).
- В VK Developer (Mini App) вставьте этот frontend URL в поле URL запуска приложения.

## Безопасность

`VK_APP_SECRET` запрещён во frontend и не должен храниться в этом репозитории или в клиентских env.
Проверка подписи launch params должна выполняться только на backend.
