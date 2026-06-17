# Jaco Driver Site

Веб-приложение для водителей и операционного персонала Jaco. Основные сценарии:

- авторизация и восстановление доступа
- просмотр списка заказов
- работа с картой заказов
- расчёт и статистика
- график смен
- настройки интерфейса и отображения

Проект ориентирован в первую очередь на мобильное использование: быстрый доступ, крупные зоны нажатия, минимум лишнего текста и визуального шума.

## Технологии

- Next.js 16, pages router
- React 19
- MUI 7
- Zustand
- SCSS
- Axios
- Yandex Metrika
- Sentry

## Быстрый старт

Установка зависимостей:

```bash
npm install
```

Запуск локальной разработки:

```bash
npm run dev
```

Приложение поднимается на:

```text
http://localhost:3225
```

## Основные команды

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Дополнительно:

```bash
npm run deploy:local
npm run deploy:dev
npm run deploy:prod
```

## Структура проекта

```text
pages/        маршруты и page-обёртки; экранные маршруты держим папками с index.tsx
tests/pages/  page-тесты, сгруппированные по маршрутам; не кладём тесты внутрь pages, чтобы Next не считал их route files
widgets/      экраны и крупная композиция страниц
features/     пользовательские сценарии и действия
entities/     доменное состояние, API и нормализация
components/   совместимые общие компоненты
styles/       глобальные и экранные SCSS-стили
ui/           палитра, шрифты и UI-токены
public/       статические файлы и иконки
```

Ключевые файлы:

- [pages/\_app.tsx](./pages/_app.tsx) — подключение темы, глобальных стилей, аналитики и Sentry
- [components/analytics.ts](./components/analytics.ts) — события Метрики и page hit-логика
- [ui/palette.js](./ui/palette.js) — актуальная JS-палитра
- [styles/settings.scss](./styles/settings.scss) — SCSS-токены и переменные

## Текущая архитектура API

Cookie session auth остается основной моделью.
Фронтенд не должен прокидывать токен как источник авторизации для новых HTTP-запросов.

Новая схема слоев:

```text
pages/widgets/features
  -> entities/<domain>/api
  -> shared/api/client.ts
  -> shared/api/connector.ts
  -> shared/api/routes.ts + shared/api/config.ts
```

Правила:

- `shared/api/config.ts` хранит только origin/base-url конфиг и env resolution
- `shared/api/routes.ts` хранит только именованные endpoint/path builder'ы и URL resolver'ы
- `shared/api/connector.ts` хранит transport:
  - axios instance
  - CSRF/session cookie behavior
- `shared/api/client.ts` остается публичным compatibility entrypoint для auth/session helper'ов и legacy re-export usage
- `entities/*/api/*.ts` владеют domain-specific запросами
- `pages/*`, `widgets/*`, `features/*` не должны собирать URL руками и не должны знать base URL

Это означает:

- новые или мигрируемые экраны используют `entities/*/api`
- прямые `http.get('/api/v1/...')` и `http.post('/api/v1/...')` вне API слоя считаются техническим долгом
- legacy `components/api.js` удален; транспорт живет в `shared/api/*`

## Маршруты

- `/auth` — авторизация
- `/registration` — восстановление пароля
- `/initial` — стартовый экран
- `/list_orders` — список заказов
- `/map_orders` — карта заказов
- `/price` — расчёт
- `/graph` — график работы
- `/statistics` — статистика
- `/settings` — настройки

## API

Сейчас frontend использует новый HTTP/session-based API через `shared/api/*`

Новые HTTP endpoints настраиваются через env:

```text
NEXT_PUBLIC_API_ORIGIN
NEXT_PUBLIC_MEDIA_ORIGIN
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
SENTRY_DSN
SENTRY_TRACES_SAMPLE_RATE
```

### Контракты Auth API

Auth-маршруты описаны в [shared/api/routes.ts](/home/ted/JACO/git/driver/jaco_driver_site/shared/api/routes.ts) и вызываются через [shared/api/client.ts](/home/ted/JACO/git/driver/jaco_driver_site/shared/api/client.ts).

Вход через web использует Laravel session cookies:

- `POST /api/v1/auth/session/login`
- запрос: `{ login: string, password: string, remember: boolean }`
- ответ: payload текущего пользователя; после этого фронт вызывает `GET /api/v1/auth/me`

Восстановление пароля работает через Laravel, не через legacy-модуль `auth`:

- `POST /api/v1/auth/password/recovery/send-code`
- запрос: `{ login: string, password: string }`
- успешный ответ: `{ st: true }`
- ошибка: `{ st: false, text: string, data?: unknown }`

- `POST /api/v1/auth/password/recovery/confirm-code`
- запрос: `{ login: string, code: string }`
- успешный ответ: `{ st: true }`
- ошибка: `{ st: false, text: string }`

Поведение восстановления повторяет legacy-сценарий driver: backend отправляет SMS-код, хранит новый пароль как ожидающий подтверждения, после проверки кода обновляет пароль существующего пользователя, а frontend возвращает пользователя на `/list_orders`.

Env-файлы:

- [.env.example](./.env.example)
- [.env.development](./.env.development)
- [.env.production](./.env.production)

Docker-запуск описан в [docs/docker.md](./docs/docker.md).

### Production Docker с backend/SSO

На боевом сервере этот frontend запускается после проекта `laravel-api-driver`.
Backend-проект создаёт общую Docker-сеть `jaco-prod` и поднимает Nginx, который
принимает HTTPS-трафик для frontend/API/SSO доменов.

Для подключения frontend к этой схеме используй:

```bash
docker compose --env-file .env.production -f compose.prod.yaml up -d --build
```

В `.env.production` должны быть публичные URL backend:

```dotenv
NEXT_PUBLIC_API_ORIGIN=https://api-driver.example.ru
NEXT_PUBLIC_LEGACY_API_ORIGIN=https://api-driver.example.ru
NEXT_PUBLIC_MEDIA_ORIGIN=https://api-driver.example.ru
```

Порт `3225` наружу не открывается: Nginx из `laravel-api-driver` проксирует
домен frontend на контейнер `frontend:3225` внутри сети `jaco-prod`.

Целевой путь:

- cookie session
- CSRF cookie
- именованные endpoints
- domain API adapters

Важно:

- ответы backend не всегда нормализованы
- флаги часто приходят строками `"0"` / `"1"`
- часть полей может быть пустой строкой вместо `null`
- при работе с данными нужно закладывать fallback-логику

## Type Design Guide

Типы в проекте должны принадлежать своему домену, а не случайному месту, где они впервые понадобились.

Базовые правила:

- бизнесовые типы живут в своих сущностях: `entities/<domain>/model/types.ts`
- DTO транспортного слоя живут рядом с API: `entities/<domain>/api/types.ts` или feature-local `api/types.ts`
- типы пропсов компонента живут рядом с компонентом
- store-private типы можно держать внутри store-файла только если они не импортируются снаружи
- внешние импорты должны идти через public API слайса: `entities/<domain>/index.ts`

Что считается правильным:

- `Point`, `City`, `Employee` — глобические доменные типы, их нельзя держать в `settings.store.ts`, `GraphScreen`, `SettingsForm` или других экранных файлах
- `TypeShowDel`, `ThemeType`, `SettingsData` — типы домена настроек, им место в `entities/settings/model/types.ts`
- если backend-форма отличается от UI-модели, нужно держать отдельные типы:
  - `PointDto`
  - `SettingsResponseDto`
  - `GraphPointPayload`

Чего не делать:

- не импортировать доменные типы из store-файлов
- не импортировать типы графика из настроек или наоборот
- не создавать общий мусорный бак вида `shared/types` для всего подряд
- не использовать названия вроде `PointsState`, `CityState`, `EmployeeState` для переиспользуемых моделей

Предпочтительные имена:

- доменные модели: `Point`, `City`, `Employee`
- DTO: `PointDto`, `EmployeeDto`
- узкоспециализированные формы: `EmployeeScheduleCell`, `PointPhonesPayload`

Предпочтительные импорт-пути:

```ts
import type { Point } from '@/entities/point';
import type { SettingsData, TypeShowDel } from '@/entities/settings';
```

Неправильно:

```ts
import type { PointsState } from '@/entities/settings/model/settings.store';
import type { TypeShowDel } from '@/widgets/settings-form/model/types';
```

Порядок принятия решений:

1. Это бизнес-сущность, которая может понадобиться в других местах проекта?
2. Если да, тип должен жить в `entities/<domain>`.
3. Это форма backend-ответа, а не реальная модель приложения?
4. Если да, тип должен жить рядом с API и нормализоваться на границе.
5. Это локальная форма состояния одного компонента или store?
6. Если да, тип можно оставить локально, пока он не стал частью внешнего контракта.

## Дизайн и UI

Текущая базовая палитра проекта:

- основной брендовый цвет: `#CC0033`
- вторичная палитра: `Graphite Steel`

Принципы интерфейса:

- mobile-first
- чистые светлые карточки
- красный используется как брендовый и CTA-акцент
- сине-графитовые оттенки используются для навигации, вторичных состояний и спокойных акцентов
- минимум лишних подсказок и длинных объяснений

Подробные проектные правила вынесены в:

- [AGENTS.md](./AGENTS.md)

Именно этот файл стоит считать главным источником договорённостей по:

- дизайну
- архитектуре
- работе с данными
- таблицам и мобильному UX
- аналитике
- правилам внесения изменений

## Проверка изменений

Минимум после правок:

```bash
npm run lint
```

После изменений, связанных с:

- auth
- роутингом
- `next.config.js`
- темой
- сборкой

нужно дополнительно запускать:

```bash
npm run build
```

## Что важно помнить при доработках

- не плодить новую логику в `pages`, если её можно вынести в `widgets`, `features` или `entities`
- новые и мигрированные экраны держать в `widgets/*-screen`; `modules/` больше не используется активным кодом
- не держать переиспользуемые доменные типы в store-файлах или screen-level модулях
- не импортировать бизнесовые типы через deep import из чужого slice
- не дублировать API-вызовы по компонентам, если их можно держать в Zustand store
- не собирать URL и origin вручную вне `shared/api/config.ts` и `shared/api/routes.ts`
- не вызывать backend напрямую из page/screen, если запрос можно вынести в `entities/*/api`

- не добавлять случайные цвета мимо `ui/palette.js` и `styles/settings.scss`
- не расширять таблицы на мобильном без необходимости
- не ломать текущие сценарии логирования событий в Метрику

## Legacy Compatibility

Legacy слой `modules/` удален из активного frontend-кода.

Что считается кандидатами на удаление после следующих миграций:

- прямые legacy-адаптеры, если снова появятся при переносе старого функционала
- прямые imports legacy wrappers там, где уже есть `widgets/*` и `entities/*`

## Статус документации

Этот `README.md` описывает проект на уровне входа в репозиторий.

Если нужна более строгая памятка для дальнейшей работы модели или разработчиков, используйте:

- [AGENTS.md](./AGENTS.md)
