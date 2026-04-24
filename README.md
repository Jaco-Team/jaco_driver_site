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
pages/        маршруты и page-обёртки
modules/      основные экраны и крупные UI-блоки
components/   store, API, аналитика, общие компоненты
styles/       глобальные и экранные SCSS-стили
ui/           палитра, шрифты и UI-токены
public/       статические файлы и иконки
```

Ключевые файлы:

- [pages/\_app.js](./pages/_app.js) — подключение темы, глобальных стилей, аналитики и Sentry
- [components/store.js](./components/store.js) — Zustand stores и API-экшены
- [components/api.js](./components/api.js) — базовый API-клиент
- [components/analytics.js](./components/analytics.js) — события Метрики и page hit-логика
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
  - legacy form-urlencoded connector
- `shared/api/client.ts` остается публичным compatibility entrypoint для auth/session helper'ов и legacy re-export usage
- `entities/*/api/*.ts` владеют domain-specific запросами
- `pages/*`, `widgets/*`, `features/*` не должны собирать URL руками и не должны знать base URL

Это означает:

- новые или мигрируемые экраны используют `entities/*/api`
- прямые `http.get('/api/v1/...')` и `http.post('/api/v1/...')` вне API слоя считаются техническим долгом
- `components/api.js` сохранен как compatibility re-export, а не как отдельный источник truth

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

Сейчас есть два режима API:

- новый HTTP/session-based API через `shared/api/*`
- legacy module API через `api()` / `api_get()` compatibility слой

Новые HTTP endpoints настраиваются через env:

```text
NEXT_PUBLIC_API_ORIGIN
NEXT_PUBLIC_LEGACY_API_ORIGIN
NEXT_PUBLIC_MEDIA_ORIGIN
```

Env-файлы:

- [.env.example](./.env.example)
- [.env.development](./.env.development)
- [.env.production](./.env.production)

Legacy backend path по-прежнему поддерживается для несовершенных миграций:

```text
https://api.jacochef.ru/driver/public/index.php/
```

Но для нового кода это не целевой путь.
Целевой путь:

- cookie session
- CSRF cookie
- именованные endpoints
- domain API adapters

Legacy `api()` / `api_get()` оставлены только для совместимости со старыми flows.

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

- не плодить новую логику в `pages`, если её можно вынести в `modules`
- не держать переиспользуемые доменные типы в store-файлах или screen-level модулях
- не импортировать бизнесовые типы через deep import из чужого slice
- не дублировать API-вызовы по компонентам, если их можно держать в Zustand store
- не собирать URL и origin вручную вне `shared/api/config.ts` и `shared/api/routes.ts`
- не вызывать backend напрямую из page/screen, если запрос можно вынести в `entities/*/api`

- не добавлять случайные цвета мимо `ui/palette.js` и `styles/settings.scss`
- не расширять таблицы на мобильном без необходимости
- не ломать текущие сценарии логирования событий в Метрику

## Legacy Compatibility

Legacy код пока не удаляется автоматически.
Он остается до тех пор, пока активные entrypoints не будут полностью переведены на новую схему.

Что уже оставлено намеренно:

- [components/api.js](./components/api.js) — compatibility re-export на новый shared client
- [components/store.js](./components/store.js) — legacy Zustand layer для старых modules/screens
- [modules/header.jsx](./modules/header.jsx) и часть `modules/*` — совместимость для старых route entrypoints

Что считается кандидатами на удаление после полной миграции:

- legacy вызовы `api('orders', ...)`
- legacy вызовы `api('price', ...)`
- legacy вызовы `api('graph', ...)`
- legacy вызовы `api('stat_time', ...)`
- leftover legacy auth/settings flows, если им появится Laravel/session replacement
- прямые imports legacy wrappers там, где уже есть `widgets/*` и `entities/*`

## Статус документации

Этот `README.md` описывает проект на уровне входа в репозиторий.

Если нужна более строгая памятка для дальнейшей работы модели или разработчиков, используйте:

- [AGENTS.md](./AGENTS.md)
