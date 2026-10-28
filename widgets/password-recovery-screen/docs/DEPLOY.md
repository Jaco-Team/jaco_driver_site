# 43923 — развёртывание Driver web

## Что выпускается

Страница `/registration` сохраняет оформление Driver и использует этапы: телефон и канал → код → новый пароль. Варианты доставки: SMS, Telegram, звонок. CAPTCHA отображается при запросе и повторной отправке кода; на этапах ввода кода и нового пароля её нет. Результат отправки не раскрывает существование номера или внутреннюю ошибку провайдера.

Нужен backend `laravel-api-driver` с endpoints `/api/v1/auth/password/recovery/request` и `/api/v1/auth/password/recovery/reset`. Сначала выпустить совместимый backend, затем frontend в составе согласованного релиза. Старые `send-code` / `confirm-code` сохраняются для прежних клиентов. Backend и SSO имеют отдельную инструкцию `docs/auth-43923/DEPLOY.md` в репозитории `laravel-api-driver`.

## Публичная конфигурация сборки

- `NEXT_PUBLIC_API_ORIGIN` — адрес Driver API для окружения; origin должен соответствовать CORS/CSP и доступному HTTPS endpoint production. Возможен существующий alias `NEXT_PUBLIC_API_URL`.
- `NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY` — публичный ключ виджета для production. Он должен соответствовать CAPTCHA, проверяемой backend, а все host, где показывается виджет, должны быть разрешены в Yandex и в backend `SMARTCAPTCHA_ALLOWED_HOSTS`.
- `NEXT_PUBLIC_*` встраиваются при `next build`: изменение только runtime env готового образа не обновит браузерный код. Обновить публичную build-конфигурацию OpenBao и выпустить новую сборку по `docs/deployment-openbao.md`. Приватный CAPTCHA server key и токен i-Digital во frontend не передаются.
- `NEXT_PUBLIC_API_PROXY=true` удобен локально: браузер обращается к Next на том же origin, а Next проксирует `/api/v1/*` на `NEXT_PUBLIC_API_ORIGIN`. Он не входит в текущий production public snapshot / Docker build args; не рассчитывать на его наличие в production без отдельного изменения и проверки release-процесса.

## Локальная проверка

В игнорируемом `.env.local` можно задать `NEXT_PUBLIC_API_ORIGIN=http://localhost:8080` и `NEXT_PUBLIC_API_PROXY=true`, затем перезапустить Next dev-сервер. Backend должен действительно использовать локальную БД; адрес фронтенда сам по себе этого не гарантирует. Локальное отсутствие `NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY` скрывает виджет, но сервер при включённой CAPTCHA продолжает требовать валидный токен.

Проверить первый запрос, повторную отправку и смену канала, истёкший/неверный код, совпадение паролей и возврат ко входу. Реальные SMS/Telegram/звонки проверяются только с разрешёнными тестовыми получателями и настроенным backend; нейтральный ответ `st=true` не доказывает доставку. Для проверки production CAPTCHA нужны корректные ключи и разрешённые host.
