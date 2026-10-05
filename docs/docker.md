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
или в секретах окружения CI/сервера.

В GitHub Actions workflow [build.yml](../.github/workflows/build.yml) требует
`NEXT_PUBLIC_YANDEX_MAPS_API_KEY` на этапе сборки. Задайте браузерный ключ в
репозитории `Jaco-Team/jaco_driver_site`: `Settings → Secrets and variables → Actions`
как repository secret или variable с этим именем. Secret имеет приоритет.
Job не привязан к GitHub Environment, поэтому ключ, сохранённый только в
environment secrets, ему недоступен. Локальный `.env.production.local` в CI
не загружается. После настройки ключа повторите упавший запуск workflow.

Для офлайн-карты ключ продукта Tiles API передаётся серверному контейнеру при запуске:

```dotenv
YANDEX_TILES_API_KEY=ключ_продукта_Tiles_API
```

Он не заменяет `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`: первый используется серверным
прокси для загрузки офлайн-тайлов и передаётся контейнеру во время запуска,
второй — браузерным JavaScript API обычной онлайн-карты и встраивается во время
сборки.

Для production-сборки образа, чтобы ключи попали в `NEXT_PUBLIC_*` на этапе `next build`:

```bash
docker compose --env-file .env.production --env-file .env.production.local up --build app
```

На сервере с `compose.prod.yaml`:

```bash
docker compose --env-file .env.production --env-file .env.production.local -f compose.prod.yaml up -d --build
```

Если образ уже собран в CI, публичные `NEXT_PUBLIC_*` значения уже находятся в
сборке. Серверный `YANDEX_TILES_API_KEY` в образ не встраивается: его всё равно
нужно передать запущенному production-контейнеру через `.env.production.local`
или секрет окружения.

### Деплой через GitHub Actions

Workflow запускает на сервере сервис `driver-frontend-new` из
`/home/deploy/deploy/driver-frontend/docker-compose.yml` с дополнительным файлом
`docker-compose.security.yml`. Ручное создание серверного env-файла для Tiles API
не требуется.

В репозитории `Jaco-Team/jaco_driver_site` откройте
`Settings → Secrets and variables → Actions → New repository secret` и добавьте
`YANDEX_TILES_API_KEY` с ключом, имеющим доступ к продукту Tiles API.
`NEXT_PUBLIC_YANDEX_MAPS_API_KEY` настраивает онлайн-карту при сборке.
Значения ключей не коммитятся.

При `AUTO_DEPLOY_FRONTEND=true` workflow проверяет наличие Tiles-ключа до сборки,
передаёт secret в SSH-шаг через `envs`, а дополнительный compose-файл подставляет
его в окружение `driver-frontend-new`. Ключ не передаётся в `docker build` и не
встраивается в образ. SSH-скрипт останавливается при ошибке любой deploy-команды.

После публикации обновлённого workflow и настройки secret запустите workflow
заново. Docker Compose пересоздаст контейнер при изменении значения ключа.
При ручном запуске серверного Compose `YANDEX_TILES_API_KEY` должен быть доступен
в окружении запуска: дополнительный compose-файл завершается ошибкой, если
переменная пуста.

Ответ `503` от `POST /api/offline-map/session` с сообщением
«На сервере не настроен ключ Yandex Tiles API.» означает, что сервер не получил
`YANDEX_TILES_API_KEY` или значение после удаления пробелов короче 20 символов.
Он возвращается до проверки авторизации и до обращения к Яндексу. Фоновое
сохранение карты запускается после обновления заказов, поэтому запрос повторяется,
пока ключ не настроен. Онлайн-карта при этом продолжает работать.

Если backend работает на хост-машине и frontend должен обращаться к нему из браузера на этой же машине, `http://localhost:8080` обычно подходит.

Если запрос должен выполняться изнутри контейнера, используйте:

```text
http://host.docker.internal:8080
```

или имя backend-сервиса из `docker-compose.yml`, если Laravel будет добавлен в этот же compose.
