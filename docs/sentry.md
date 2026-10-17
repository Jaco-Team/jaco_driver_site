# Ошибки курьерского фронтенда в Sentry

Конфигурация рассчитана на Next 16.4.2 и установленный SDK 11.8.0.
Клиент запускается на верхнем уровне `instrumentation-client.ts`, сервер и edge —
через `register()` в `instrumentation.js`. DSN берётся только из существующего
публичного `NEXT_PUBLIC_SENTRY_DSN` при сборке. При пустом DSN или другом хосте
SDK не запускается. Разрешён только HTTPS `sentry.jacochef.ru`; в CSP добавлен
только этот точный origin в `connect-src`. SDK входит в bundle. Tunnel отсутствует.

Включены ошибки; Performance, Replay, browser/process sessions и Sentry Logs выключены.
Заголовки распределённой трассировки к API не добавляются. Сбор отключён явным SDK 11 `dataCollection`: пользователь, cookies, headers,
HTTP bodies, query params, GraphQL document/variables, genAI inputs/outputs,
DB payload, queue arguments, frame variables и строки исходного контекста.
Логи и метрики отбрасываются реальными SDK 11 callbacks `beforeSendLog` и
`beforeSendMetric`; автоматическая Console integration исключена.
Объект опций проверяется через `satisfies BrowserOptions`, чтобы удалённые
опции SDK не принимались незаметно. Дополнительный allowlist в `beforeSend`
не передаёт пользователя, контексты, extra, заголовки, cookies, тело запроса, параметры URL,
локальные переменные кадров и вложения. Для breadcrumbs остаются только очищенные
URL переходов/HTTP, метод и код ответа. Из текста ошибок удаляются распознаваемые
токены, email и телефоны. Произвольный текст исключения может содержать сведения,
которые шаблонный фильтр не распознает: не включать бизнес-данные в `Error.message`.
Фильтры на сервере Sentry остаются дополнительным уровнем защиты.

## Release и GitHub

Production workflow передаёт `SENTRY_RELEASE=jaco-driver-frontend@<полный commit>`.
SDK Next сам встраивает release в browser/server bundles. `environment` равен
`production` или `development` по NODE_ENV. Release создаётся и завершается во
время сборки, содержит полный commit в имени. Это факт
сборки, а не факт успешного развёртывания: deploy в Sentry автоматически не создаётся.
Debug-id symbolication и загрузка sourcemaps не зависят от GitHub integration:
по умолчанию `setCommits: false`. После подключения GitHub и предоставления доступа
к `Jaco-Team/jaco_driver_site` можно включить публичную переменную GitHub
`SENTRY_SET_COMMITS=1` для ассоциации release с репозиторием. До этого она равна
`0` или отсутствует и не блокирует базовую отправку ошибок. Org и project задаются публичными переменными GitHub `SENTRY_ORG`
и `SENTRY_PROJECT`; текущие значения по умолчанию — `sentry` / `javascript-react`.

`SENTRY_AUTH_TOKEN` — отдельный CI-only secret с правами загрузки артефактов и
создания releases для нужной организации. Он передаётся только BuildKit secret
`id=sentry_auth_token`, монтируется в окружение одного RUN и не является ARG,
Docker ENV или runtime-настройкой. Токен нельзя помещать в публичный snapshot,
OpenBao frontend.env, образ, artifact или вывод команд. Публикация останавливается,
если токен отсутствует или Sentry не принял release/sourcemaps. Телеметрия build
plugin выключена; endpoint жёстко задан на собственный Sentry.

После upload plugin удаляет sourcemaps; Docker дополнительно удаляет все `.map`
из `.next` до копирования standalone/static в runtime image. Локальная сборка
без `SENTRY_UPLOAD_SOURCEMAPS=1` не обращается к release API. При production upload
используется уже зафиксированный public snapshot из восьми ключей; release не
расширяет его схему.

## Проверки перед выпуском

Запускать только после явного согласия владельца согласно AGENTS.md:

```sh
npm test -- tests/monitoring tests/tooling/sentry-build-config.test.mjs
npm run typecheck
npm run lint
npm test
```

Далее — production image build штатным workflow с закрытым upload-токеном;
проверить release, commit и debug-id sourcemaps в собственном Sentry и отсутствие
`.map` в итоговом image. Изолированная синтетическая ошибка в браузере должна дать
issue с environment/release и исходным стеком без PII. Постоянного публичного
тестового API-маршрута нет (старый wizard route удалён). Нельзя считать локальный
unit-тест подтверждением реальной доставки.

Сборку и применение выполнять через действующий production-профиль Новосибирска:
закрытый follower замороженного комплекта не включать поверх публичного Nginx.
Откат — предыдущий проверенный frontend image digest и соответствующий release
manifest штатным механизмом; откат DSN требует новой сборки, а не замены runtime env.

## Состояние подготовки

17 октября 2026 локально прошли 14/14 адресных тестов, полный набор —
634/634 в 87 файлах, TypeScript и ESLint. Реальные browser/Node SDK проверены
с синтетическим transport без сети: IP inference в отправленном browser envelope
равно `never`, session envelopes отсутствуют. Первоначальные ошибки типов
в новых файлах исправлены; повторный typecheck успешен. Production build,
GitHub integration, выдача токена, upload, публикация и живая доставка
подтверждаются отдельно координатором.
