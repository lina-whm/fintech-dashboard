# FinTech Dashboard

Личный финансовый кабинет с AI-аналитикой, тёмной темой и полной адаптивностью.

## Стек

- **Next.js 15.5** (App Router)
- **React 19** + **TypeScript**
- **Prisma 6** + **PostgreSQL**
- **NextAuth** (GitHub / Google / demo-вход по email)
- **OpenRouter** (inclusionai/ling-2.6-1t:free) — AI-чат
- **Ollama** (qwen3.5:0.8b) — fallback для AI
- **shadcn/ui** + **Tailwind CSS** — UI-кит
- **Docker** — контейнеризация

## Быстрый старт (Docker)

```bash
# 1. Запустить PostgreSQL + приложение
docker-compose up -d

# 2. Применить миграции и заполнить БД
docker-compose exec app sh -c "npx prisma migrate deploy && npx tsx scripts/seed.ts"

# 3. Открыть http://localhost:3000
```

## Запуск без Docker

### 1. PostgreSQL

Убедитесь, что PostgreSQL запущен на `localhost:5432`:

```bash
docker run -d --name fintech-pg \
  -e POSTGRES_USER=fintech \
  -e POSTGRES_PASSWORD=FinTech2024 \
  -e POSTGRES_DB=fintech_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Миграция и seed

```bash
npx prisma migrate dev --name init
npx tsx scripts/seed.ts
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

## Переменные окружения (.env.local)

```
DATABASE_URL="postgresql://fintech:FinTech2024@localhost:5432/fintech_db?schema=public"
NEXTAUTH_SECRET="super-secret-key-change-in-production-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="inclusionai/ling-2.6-1t:free"
OLLAMA_API_URL="http://localhost:11434"
```

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production сборка |
| `npm run test` | Unit-тесты (Vitest) |
| `npm run test:e2e` | E2E-тесты (Playwright) |
| `npm run lint` | Линтинг |
| `npm run db:migrate` | Создать миграцию |
| `npm run db:seed` | Заполнить БД данными |
| `npm run db:studio` | Prisma Studio (GUI для БД) |

## Авторизация

- Кнопка «Войти» в шапке → страница `/auth/signin`
- **GitHub** / **Google** — OAuth (настроить в NextAuth)
- **Demo-вход** — любой email, пользователь создаётся автоматически

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
- Линтинг, тесты и сборка на каждый push/PR в main
- PostgreSQL поднимается как service-контейнер