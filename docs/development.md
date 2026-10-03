# Локальная разработка

## Запуск

Нужен Node.js версии, указанной в [`package.json`](../package.json) (`>=24.15.0`).

```bash
npm install
npm run dev
```

Dev-сайт доступен на `http://localhost:3225`. Основные команды:

| Команда                                             | Назначение                                                 |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                                       | Next.js с HMR                                              |
| `npm run build` / `npm run start`                   | Production-сборка и сервер                                 |
| `npm run preview:offline`                           | Сборка и локальный standalone-preview для проверки офлайна |
| `npm run lint` / `npm run typecheck` / `npm test`   | Статические проверки и unit-тесты                          |
| `npm run format:check`                              | Проверка форматирования                                    |
| `npm run deploy:local`, `deploy:dev`, `deploy:prod` | Существующие PM2-сценарии развёртывания                    |

Service worker отключён в `next dev`: кэширование изменяемых HMR-ресурсов приводило к устаревшему коду и перезагрузкам. Офлайн-поведение проверяйте через `npm run preview:offline`; команда собирает приложение и запускает standalone-сервер на том же порту.
Preview собирается отдельно в `.next-preview`, поэтому не перезаписывает dev-сборку. Если dev уже занимает порт 3225, запустите preview на другом: `PORT=3325 npm run preview:offline`. При наличии сети онлайн-карта заказов в preview использует API 2.1; при её отключении — сохранённую офлайн-подложку.

## API и переменные окружения

Публичные параметры перечислены в [`.env.example`](../.env.example), [`.env.development`](../.env.development) и [`.env.production`](../.env.production). Основные: `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_API_PROXY`, `NEXT_PUBLIC_MEDIA_ORIGIN`, `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` и параметры Sentry. Серверный `YANDEX_TILES_API_KEY` не должен попадать в `NEXT_PUBLIC_*`; подробности — в [документе о карте](./maps.md).

Обычный `npm run dev` использует адрес API из env. Для отдельного запуска с локальным backend, например на порту 8080:

```bash
NEXT_PUBLIC_API_ORIGIN=http://localhost:8080 NEXT_PUBLIC_MEDIA_ORIGIN=http://localhost:8080 NEXT_PUBLIC_API_PROXY=true npm run dev
```

Если backend не разрешает CORS для dev-сайта, установите `NEXT_PUBLIC_API_PROXY=true`: браузер обращается к `/api/v1/*` на том же origin, а Next.js перенаправляет запросы на `NEXT_PUBLIC_API_ORIGIN`. Другой вариант — настроить CORS на backend. После изменения env перезапустите dev-сервер. `NEXT_PUBLIC_*` встраиваются при сборке: смена их значений только при запуске уже готового standalone-сервера не изменит клиентский код.

Настройка Docker и серверных секретов — в [Docker-инструкции](./docker.md).
