# GeoLogger

Додаток для логування геолокації з підтримкою офлайн режиму та автоматичної синхронізації.

## Функціонал

- ✅ Логування геолокації (широта, довгота, висота)
- ✅ Авторизація користувачів (JWT токени)
- ✅ Офлайн зберігання (IndexedDB)
- ✅ Автоматична синхронізація при появі інтернету
- ✅ PWA підтримка
- ✅ Tauri desktop додаток (macOS/Windows/Linux)

## Структура проєкту

```
GeoLogger/
├── apps/
│   ├── frontend/          # Next.js + React + TypeScript
│   └── backend/          # Express + TypeScript
├── libs/
│   └── types/            # Спільні TypeScript типи
└── tauri/                # Tauri desktop wrapper
```

## Встановлення

```bash
# Встановити залежності
pnpm install
```

## Запуск

### Розробка (браузер)

```bash
# Запустити frontend та backend одночасно
pnpm dev
```

- Frontend: http://localhost:1420
- Backend: http://localhost:4000

### Tauri Desktop додаток

```bash
# Запустити Tauri додаток
pnpm dev:tauri
```

## Використання

1. **Реєстрація/Вхід**: Створіть акаунт або увійдіть
2. **Логування локації**: Після входу додаток автоматично починає логувати вашу локацію
3. **Офлайн режим**: Якщо немає інтернету, локації зберігаються локально
4. **Синхронізація**: При появі інтернету всі несинхронізовані локації автоматично відправляються на сервер

## API Endpoints

### Авторизація
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Вхід

### Локації
- `POST /api/location` - Логування локації (публічний)
- `GET /api/location` - Отримати всі локації користувача (захищений)
- `POST /api/location/sync` - Синхронізація офлайн локацій (захищений)

## Технології

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Express 5, TypeScript, JWT, bcryptjs
- **Storage**: IndexedDB (офлайн), In-memory (бекенд MVP)
- **Desktop**: Tauri 2
- **PWA**: Service Worker, Web App Manifest

## Наступні кроки

- [ ] Додати базу даних (PostgreSQL/MongoDB)
- [ ] Додати тести
- [ ] Покращити UI/UX
- [ ] Додати карту для відображення локацій
- [ ] Додати експорт даних
- [ ] Додати налаштування частоти логування

