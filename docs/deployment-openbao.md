# Production: публичная сборка и приватный runtime

Production-ветка — `api-laravel`. Все реальные настройки хранятся в OpenBao,
включая публичные адреса и браузерные ключи. В Git остаются имена параметров,
код, схемы и синтетические примеры. `.env.development` и `.env.production`
удалены; приватные локальные env-файлы исключены из Git и Docker-контекста.

Workflow `production-image.yml` запускает существующие lint, typecheck и тесты
при push в production-ветку и pull request к ней. Общий `test.yml` сохраняет
те же проверки для остальных push и pull request. На обычном push образ
frontend ещё не публикуется: контроллер проверяет текущий commit и получает
конкретную версию `projects/driver/prod/frontend-build` из OpenBao.

Затем контроллер запускает workflow dispatch для того же commit. Он передаёт
ровно восемь уже публичных браузерных параметров, их fingerprint, версию KV и
идентификатор запроса. Workflow проверяет источник и повторяет проверки перед
публикацией. Если ветка успела измениться, dispatch останавливается; новый
релиз должен выбрать новый commit.

В snapshot разрешены только `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_LEGACY_API_ORIGIN`, `NEXT_PUBLIC_MEDIA_ORIGIN`,
`NEXT_PUBLIC_YANDEX_METRIKA_ID`, `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`,
`NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY`.
Браузерные ключи требуют ограничения доменов у поставщика. Значения dispatch
являются обычными данными GitHub Actions и не защищённым каналом для секретов.
Нельзя отправлять туда полный env, пароли, токены, `YANDEX_TILES_API_KEY`, ключ
TLS, данные OpenBao или серверные CAPTCHA-ключи.

CI использует временный `github.token` для публикации GHCR. Настройки
приложения не берутся из GitHub secrets/variables. Отдельное исключение —
CI-only `SENTRY_AUTH_TOKEN` для upload sourcemaps через BuildKit secret;
публичные `SENTRY_ORG`/`SENTRY_PROJECT` задают назначение release. Они не являются
runtime env приложения и не расширяют public snapshot; контракт — [Sentry](./sentry.md). Старый `build.yml` с прямым
SSH-деплоем удалён из production-ветки; другие ветки этим не меняются.

`NEXT_PUBLIC_*` встраиваются в клиент при `next build`. Изменить их только
при запуске уже собранного образа недостаточно: требуется новая сборка.
Серверный `YANDEX_TILES_API_KEY` и остальные приватные параметры контроллер
получает из `projects/driver/prod/frontend-runtime` и передаёт контейнеру на
сервере. Они не передаются в Docker build и не входят в артефакт метаданных CI.

После проверки metadata/run/commit/digest контроллер объединяет backend и
frontend в один релиз с фиксированными версиями env. Nginx на хосте принимает
HTTPS с купленным wildcard `*.jacochef.ru`; контейнеры публикуют порты только
на loopback. TLS хранится и доставляется отдельно от env приложения.
Сохранение env в OpenBao без нового релиза не меняет работающую версию.

GitHub требует, чтобы dispatch-workflow был зарегистрирован в default-ветке
`main`. В ней должна быть та же проверенная версия `production-image.yml`.
Фактический dispatch разрешён только на `api-laravel`; запуск на `main`
останавливается до checkout приложения.

Первое включение выполняется после проверки CI, контроллера, wildcard,
внешней базы и пользовательских сценариев. Старый стек отключается после
переключения обоих доменов и полного обновления DNS. Восстановление из Git
истории не очищает ранее закоммиченные env; это отдельная задача проверки
истории и замены скомпрометированных значений при обнаружении.
