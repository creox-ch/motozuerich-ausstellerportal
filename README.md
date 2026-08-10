# Ausstellerportal · MOTO-ZÜRICH 2027

Прототип портала для экспонентов выставки MOTO-ZÜRICH (19–21.02.2027).

**Прод:** https://motozuerich-ausstellerportal.vercel.app
**Vercel:** проект `motozuerich-ausstellerportal`, team `creox`

## Что это сейчас

Один самодостаточный статический файл — `index.html` (~87 КБ): вся вёрстка, стили и
JS внутри него. Внешних ассетов нет, сборки нет, бэкенда нет.

Статус в интерфейсе помечен явно — бейдж **Prototyp** в шапке. Данные внутри
демонстрационные, зашиты в JS. Аутентификации нет.

Разделы: Übersicht · Hallenplan & Stand · Anreise, Aufbau und Parking ·
Technik & Service · Marketing & Sichtbarkeit · Gemeinsame Aktivitäten ·
Aktivitäten am Stand · Ausweise & Tickets · Firmenprofil ·
Dokumente & Rechnungen · Nachrichten.

## Деплой

Первые деплои (июль–август 2026) были прямой загрузкой из Vercel, без Git.
Этот репозиторий заведён 10.08.2026, чтобы у портала появилась история изменений.

Чтобы `git push` в `main` начал деплоить автоматически, репозиторий нужно
привязать в Vercel: проект → Settings → Git → Connect Git Repository.

## Разработка

Сборки нет — открываешь `index.html` в браузере, правишь, коммитишь.

## Перед реальным запуском

Портал в текущем виде публичен и не имеет входа. Если внутрь пойдут настоящие
данные экспонентов (счета, документы, сообщения, контакты), сначала нужны
аутентификация и хранилище — по текущим соглашениям платформы это Supabase.
