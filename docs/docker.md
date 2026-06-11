# Docker

Проект можно запускать в Docker в двух режимах: production-сборка и dev-сервер.

## Production

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

## Development

```bash
docker compose --profile dev up --build app-dev
```

Dev-режим монтирует текущую папку проекта в контейнер и запускает `next dev`.

## Env

Для production используется `.env.production`, для development — `.env.development`.

Если backend работает на хост-машине и frontend должен обращаться к нему из браузера на этой же машине, `http://localhost:8080` обычно подходит.

Если запрос должен выполняться изнутри контейнера, используйте:

```text
http://host.docker.internal:8080
```

или имя backend-сервиса из `docker-compose.yml`, если Laravel будет добавлен в этот же compose.
