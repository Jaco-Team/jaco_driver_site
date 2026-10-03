# Архитектура и API

## Слои

```text
pages/widgets/features
  -> entities/<domain>/api
  -> shared/api/client.ts / shared/api/connector.ts
  -> shared/api/routes.ts + shared/api/config.ts
```

[`pages/`](../pages) отвечают за маршруты, защиту и подключение экранов; экранная композиция живёт в [`widgets/`](../widgets), сценарии — в [`features/`](../features), доменное состояние и нормализация ответов — в [`entities/`](../entities). Общие элементы находятся в [`shared/ui/`](../shared/ui). Старый `modules/` удалён из активного кода.

Новые запросы размещайте в `entities/<domain>/api`: экран не должен собирать URL или origin вручную. [`shared/api/config.ts`](../shared/api/config.ts) определяет адреса, [`routes.ts`](../shared/api/routes.ts) — именованные пути, [`connector.ts`](../shared/api/connector.ts) — Axios-транспорт, [`client.ts`](../shared/api/client.ts) — совместимый публичный вход. Прямые вызовы `/api/v1/*` вне API-слоя считаются техническим долгом. Ответы backend могут содержать строковые флаги (`"0"`/`"1"`) и пустую строку вместо `null`; нормализуйте их на границе API.

## Авторизация

Текущая web-реализация использует Bearer-токен, а не cookie session: [`auth.api.ts`](../features/auth/api/auth.api.ts) получает токен через `POST /api/v1/auth/token/login`, [`token.ts`](../shared/api/token.ts) хранит его в `localStorage`, [`connector.ts`](../shared/api/connector.ts) добавляет заголовок `Authorization: Bearer …`, затем вызывается `GET /api/v1/auth/me`. После выхода токен и локальные офлайн-данные очищаются.

Восстановление пароля идёт через Laravel:

- `POST /api/v1/auth/password/recovery/send-code` с `login`, `password` и при необходимости `captcha_token`;
- `POST /api/v1/auth/password/recovery/confirm-code` с `login` и `code`.

SSO-код обменивается на токен через `POST /api/v1/auth/sso/exchange`. Актуальные адреса сверяйте с [`routes.ts`](../shared/api/routes.ts), а форму данных — с соответствующим API-адаптером; не копируйте строки endpoint в UI.

## Размещение типов

- Переиспользуемые бизнес-модели (`Point`, `City`, `Employee`, `SettingsData`) принадлежат `entities/<domain>/model/types.ts` и экспортируются через публичный `index.ts` слайса.
- DTO ответа backend (`PointDto`, `SettingsResponseDto`) живут рядом с API и преобразуются в доменную модель на границе.
- Типы пропсов находятся рядом с компонентом; тип состояния, который не импортируется извне, может оставаться в файле store.
- Не импортируйте бизнес-тип из чужого store или screen, не создавайте общий каталог `shared/types` для несвязанных сущностей.

Пример публичного импорта:

```ts
import type { Point } from '@/entities/point';
import type { SettingsData, TypeShowDel } from '@/entities/settings';
```

Перед добавлением типа определите, является ли он бизнес-сущностью, формой транспорта или локальным состоянием компонента. Это определяет его место и имя.

## Изменение экранов

Не раздувайте `pages/`, не дублируйте API-вызовы по компонентам и не добавляйте новый обходящий слой для уже существующих адаптеров. Сохраняйте сценарии аналитики из [`components/analytics.ts`](../components/analytics.ts). Подробные проектные правила — в [`AGENTS.md`](../AGENTS.md).
