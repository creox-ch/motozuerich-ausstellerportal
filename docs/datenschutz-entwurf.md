# Datenschutzerklärung — ЧЕРНОВИК на юридическую проверку

**Статус:** написан 2026-08-11, юридической проверки не проходил.
**Живёт на:** `/datenschutz` (страница закрыта от индексации, ниоткуда не связана).
**Кому проверять:** Ксения совместно с юрлицом-контролёром.

Этот файл — тот же текст, что на странице, но в пересылаемом виде. Правки
вносить сюда и в `app/datenschutz/page.jsx` одновременно, иначе они разойдутся.

---

## Что надо подтвердить или исправить перед публикацией

1. **Контролёр данных.** В тексте стоит Vollenweider & Schweizer GmbH, Baden —
   взято из карты обработчиков платформы (`handbook/reference/data-processors.md`).
   Подтвердить, что для портала контролёр именно это юрлицо, и указать полный
   адрес, если он обязателен.
2. **Контактный адрес для запросов по данным** — сейчас `yves@motozuerich.ch`.
3. **Срок хранения.** Сейчас формулировка обтекаемая: «сколько нужно для
   проведения выставки и по закону». Точный срок и порядок удаления
   в платформе не определены ни для одного проекта, механизма удаления
   не существует.
4. **Список обработчиков** — проверить, что ничего не забыто. Сейчас: Supabase
   (Цюрих, Швейцария), Resend (Ирландия), Vercel (США).
5. **Vercel и DPA.** Договор об обработке данных доступен только на платном
   тарифе. Сейчас проект на бесплатном.
6. **Формулировки** — юристом. Текст описывает фактическую обработку честно,
   но написан разработчиком, а не юристом.

## Что портал фактически собирает — сверено с кодом

**Публичная заявка на площадь** (`mz_anfragen`): Firma, Ansprechperson, E-Mail,
Telefon, Nachricht, выбранная площадка, адрес страницы и UTM-метки. Согласие
обязательно — без него запись не сохраняется, это ограничение в самой базе.

**Кабинет экспонента** (`mz_companies`, `mz_allowlist`, `mz_company_members`,
`mz_audit`): адрес почты для входа, данные компании для договора и счёта,
данные для каталога вместе с логотипом, время входов и изменений.

**Пока НЕ собирается, но появится:** списки персонала для пропусков — это
имена и функции сотрудников, самая чувствительная категория в портале.
До проверенного Datenschutz этот раздел не делаем.

---

# Datenschutzerklärung

Für das Ausstellerportal der MOTO-ZÜRICH 2027 und die Standanfrage über den
Hallenplan.

## Verantwortlich

Vollenweider & Schweizer GmbH, Baden.
Kontakt für Datenschutzanliegen: yves@motozuerich.ch

## Welche Daten wir bearbeiten

**Standanfrage:** Firma, Ansprechperson, E-Mail-Adresse, Telefonnummer,
Nachricht, gewählte Fläche sowie Herkunft des Aufrufs (Adresse der Seite und
Kampagnenparameter).

**Ausstellerkonto:** E-Mail-Adresse für die Anmeldung, Firmendaten für Vertrag
und Rechnung, Angaben für den Verzeichniseintrag samt Logo, Zeitpunkte der
Anmeldungen und Änderungen.

## Wozu

Zur Bearbeitung Ihrer Anfrage, zur Durchführung der Messeteilnahme und für den
Eintrag im Ausstellerverzeichnis auf Website, in der App und im Event-Guide.
Für Werbung ohne Bezug zu Ihrer Teilnahme verwenden wir diese Daten nicht.

## Wer die Daten sonst noch sieht

- **Supabase** — Datenbank und Dateiablage, Serverstandort Zürich, Schweiz.
- **Resend** — Versand der E-Mails, Serverstandort Irland.
- **Vercel** — Betrieb des Portals, Serverstandort USA.

## Aufbewahrung

Anfragen und Ausstellerdaten bewahren wir so lange auf, wie es für die
Durchführung der Messe und die gesetzlichen Aufbewahrungsfristen nötig ist.

## Ihre Rechte

Sie können jederzeit Auskunft über Ihre Daten verlangen sowie deren Berichtigung
oder Löschung. Eine Nachricht an die oben genannte Adresse genügt.
