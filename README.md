# Ausstellerportal · MOTO-ZÜRICH 2027

Портал для экспонентов выставки MOTO-ZÜRICH (19–21.02.2027, StageOne и Halle 550,
Zürich-Oerlikon).

**Прод:** https://motozuerich-ausstellerportal.vercel.app
**Vercel:** проект `motozuerich-ausstellerportal`, team `creox`
**План разработки:** [docs/ARCHITEKTUR-PLAN.md](docs/ARCHITEKTUR-PLAN.md)

## Состояние

Идёт перевод с прототипа на рабочее приложение.

- `app/` — Next.js 14 (app router), экран входа. Вход пока не подключён — этап 1.
- `public/prototyp.html` — исходный прототип портала, доступен по `/prototyp`.
  Все 11 разделов, демо-данные, бейдж «Prototyp». Это функциональная
  спецификация, по которой строится настоящий портал.
- Красные даты `XX.XX.2027` в прототипе — не недоделка, а честная пометка:
  бизнес ещё не назначил сроки.

## Разработка

Нужен Node 20+ (проверено на 24.19.0).

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Playwright: unit + integration + e2e
npm run build   # ловит ошибки сборки до пуша
```

Тесты не требуют ни Supabase, ни Resend: e2e мокают наши API, integration
проверяют ветки до обращения к базе, заглушки env заданы в `playwright.config.js`.

`/api/health` показывает, каких переменных окружения не хватает — только имена,
никогда значения.

## Структура

```
app/            страницы и API-роуты
  api/health/   служебная проверка конфигурации
lib/            серверные модули (env, supabase)
tests/          unit · integration · e2e (один раннер Playwright)
public/         статика, включая прототип
docs/           план архитектуры
supabase/       схема БД (появится на этапе 1)
```

## Деплой

Push в `main` → продакшен. Ветка → preview-деплой со своим адресом.

Переменные окружения — в Vercel (Project → Settings → Environment Variables),
список и назначение в [.env.example](.env.example). Vercel применяет их только
на следующем деплое: после правки нужен Redeploy.

## Перед реальным запуском

Портал будет хранить данные компаний и личные данные сотрудников (списки для
пропусков). До первого настоящего экспонента нужны: аутентификация, страница
Datenschutz со списком обработчиков, согласия и срок хранения. Подробности —
в плане, раздел «Юридический минимум».
