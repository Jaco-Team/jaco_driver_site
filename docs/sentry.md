# Sentry: ошибки фронтенда

Клиент запускается на верхнем уровне `instrumentation-client.ts`; server/edge —
через `instrumentation.js`. Публичный `NEXT_PUBLIC_SENTRY_DSN` встраивается при
сборке. Общий `sentry-dsn.js` проверяет допустимый HTTPS origin и форму DSN.
При отсутствующем или недопустимом DSN runtime SDK не запускается.

Включены только ошибки. SDK11 `dataCollection` явно отключает сбор пользователя,
cookies, заголовков, тел запросов, query parameters и переменных кадров.
Дополнительный выходной фильтр очищает события и вложения. Replay, tracing,
sessions, logs и metrics отключены. Произвольный текст `Error.message` нельзя
наполнять бизнес-данными: эвристический фильтр не распознаёт все возможные случаи.

## Release и исходные строки

Release имеет форму `jaco-driver-frontend@<commit>`. Это идентификатор сборки,
а не подтверждение успешного deployment. Source maps загружаются при
`SENTRY_UPLOAD_SOURCEMAPS=1`; token передаётся только CI/BuildKit secret.
Он не является публичной переменной, Docker ARG или runtime env.
Карты удаляются до копирования runtime image.

Production upload останавливается до API, если отсутствует token/release или
публичный DSN не проходит общий validator. Обычная локальная сборка без upload
может работать с пустым DSN и не обращается к release API.

GitHub association необязательна: `SENTRY_SET_COMMITS=0` по умолчанию. Debug-ID
symbolication и приём ошибок не требуют GitHub integration. `SENTRY_ORG` и
`SENTRY_PROJECT` выбирают место загрузки; дополнительные права GitHub из этого
кода не выдаются.

## Проверка

Запускать команды проверки только после явного согласия согласно AGENTS.md.
Тесты monitoring используют synthetic fixtures и локальный SDK transport:
проверяют очищенный event, `infer_ip=never` и отсутствие session envelopes.
Tooling-тесты проверяют CSP, общий validator и остановку upload с неверным DSN.

Unit/CI проверки не подтверждают живую доставку. При приёмке готового образа
нужно отдельно проверить отсутствие token и публичных `.map`, успешный upload
и synthetic browser issue с ожидаемым release и исходными строками стека.
Постоянного публичного маршрута для генерации ошибок нет.
