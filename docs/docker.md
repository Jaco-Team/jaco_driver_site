# Docker

Проект можно запускать в Docker в двух режимах: production-сборка и dev-сервер.

## Production

Локальный production-запуск с публикацией порта на хост:

```bash
docker compose up --build app
```

Приложение будет доступно на:

```text
http://localhost:3225
```

Порт можно переопределить:

```bash
APP_PORT=3000 docker compose up --build app
```

## Production вместе с backend/SSO

На сервере frontend не должен открывать порт наружу. Входной точкой является Nginx
из проекта `laravel-api-driver`, а frontend подключается к общей Docker-сети
`jaco-prod` с алиасом `frontend`.

Сначала в проекте `laravel-api-driver` поднимаются backend, SSO и Nginx:

```bash
docker compose --env-file .env.production -f compose.prod.yaml up -d --build
```

После этого в этом проекте запускается frontend:

```bash
docker compose --env-file .env.production -f compose.prod.yaml up -d --build
```

Production compose не публикует `3225` наружу. Nginx из backend-проекта будет
проксировать домен frontend на контейнер:

```text
https://driver.example.ru -> frontend:3225
```

В `.env.production` для такой схемы укажи публичный API-домен:

```dotenv
NEXT_PUBLIC_API_ORIGIN=https://api-driver.example.ru
NEXT_PUBLIC_LEGACY_API_ORIGIN=https://api-driver.example.ru
NEXT_PUBLIC_MEDIA_ORIGIN=https://api-driver.example.ru
```

## Development

```bash
docker compose --profile dev up --build app-dev
```

Dev-режим монтирует текущую папку проекта в контейнер и запускает `next dev`.

## Env

В git лежат только публичные URL: `.env.production` и `.env.development`.
Ключи Карт и Sentry — в `.env.production.local` / `.env.development.local` (не коммитятся)
и в GitHub Actions secrets для CI.

Для production-сборки образа, чтобы ключи попали в `NEXT_PUBLIC_*` на этапе `next build`:

```bash
docker compose --env-file .env.production --env-file .env.production.local up --build app
```

На сервере с `compose.prod.yaml`:

```bash
docker compose --env-file .env.production --env-file .env.production.local -f compose.prod.yaml up -d --build
```

Если образ уже собран в CI с секретами, на сервере достаточно `docker compose pull` — ключи уже внутри образа.

Если backend работает на хост-машине и frontend должен обращаться к нему из браузера на этой же машине, `http://localhost:8080` обычно подходит.

Если запрос должен выполняться изнутри контейнера, используйте:

```text
http://host.docker.internal:8080
```

или имя backend-сервиса из `docker-compose.yml`, если Laravel будет добавлен в этот же compose.
