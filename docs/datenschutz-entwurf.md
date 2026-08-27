# Datenschutzerklärung — ЧЕРНОВИК на юридическую проверку

**Статус:** написан 2026-08-11, контролёр подтверждён и адрес дополнен
2026-08-27, юридической проверки не проходил.
**Живёт на:** `/datenschutz` (страница закрыта от индексации, ниоткуда не связана).
**Кому проверять:** Ксения совместно с юрлицом-контролёром.

Этот файл — тот же текст, что на странице, но в пересылаемом виде. Правки
вносить сюда и в `app/datenschutz/page.jsx` одновременно, иначе они разойдутся.

---

## Что надо подтвердить или исправить перед публикацией

1. ~~**Контролёр данных.**~~ Подтверждён 27.08 первоисточником. Datenschutz
   сайта motozuerich.ch: «Verantwortlich für die Datenbearbeitung im Rahmen
   des Online-Geschäfts **und der Durchführung der MOTO-ZÜRICH** ist:
   **Vollenweider & Schweizer GmbH, Bäderstrasse 28 · 5400 Baden (AG)**».
   Портал — часть проведения выставки, значит контролёр тот же. Адрес дополнен
   до полного, юрлицо не менялось.
2. **Контактный адрес для запросов по данным** — в портале
   `yves@motozuerich.ch`, в Datenschutz сайта `help@motozuerich.ch`.
   Уточнить, который правильный.
2a. ⚠️ **У выставки два юрлица.** Impressum сайта называет Betreiberin сайта
   и мероприятия **Creox GmbH**, Baar (ZG); Datenschutz и AGB называют
   **V&S**, Baden. Разбор — в [`rechtliches-review.md`](rechtliches-review.md).
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

## Сверено с Datenschutz билетника Bookinea (2026-08-12)

Взят как чек-лист разделов: `https://bookinea.app/datenschutz`.

**Добавлено по итогам сверки:** Cookies, Server-Logfiles, Links auf andere
Websites, Änderungen dieser Erklärung. Самым существенным пробелом были
cookies — портал ставит cookie сессии при входе, а в тексте об этом не было
ни слова.

**Сознательно НЕ взято:** у Bookinea описан Google Analytics. У нас его нет
и не планируется — стоит Vercel Web Analytics именно потому, что она не ставит
cookies и не требует баннера согласия. Описывать обработку, которой
не происходит, хуже, чем не описывать вовсе.

**Что там не лучше нашего:** срок хранения у них такой же обтекаемый
(«сколько нужно для цели») — то есть наш пробел не особенность, а общая
практика, но от вопроса юриста это не спасёт. Обработчики у них названы
общо («хостинг-провайдер»), у нас поимённо и с местом хранения. Раздела
о правах человека в их структуре нет.

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

Vollenweider & Schweizer GmbH, Bäderstrasse 28, 5400 Baden (AG), Schweiz.
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

## Cookies

Nach der Anmeldung setzen wir ein Cookie, das Ihre Sitzung offen hält. Ohne
dieses Cookie funktioniert der Login nicht — es ist technisch notwendig und
dient keiner Auswertung. Beim Abmelden wird es gelöscht.

Für die Reichweitenmessung nutzen wir Vercel Web Analytics. Der Dienst zählt
Seitenaufrufe, setzt dafür **keine Cookies** und erstellt keine Profile
einzelner Personen.

## Server-Logfiles

Beim Aufruf des Portals fallen technische Protokolldaten an: IP-Adresse,
Zeitpunkt, aufgerufene Adresse und Browserangaben. Sie dienen dem sicheren
Betrieb und der Fehlersuche und werden nicht mit anderen Daten zusammengeführt.

## Aufbewahrung

Anfragen und Ausstellerdaten bewahren wir so lange auf, wie es für die
Durchführung der Messe und die gesetzlichen Aufbewahrungsfristen nötig ist.

## Ihre Rechte

Sie können jederzeit Auskunft über Ihre Daten verlangen sowie deren Berichtigung
oder Löschung. Eine Nachricht an die oben genannte Adresse genügt.

## Links auf andere Websites

Das Portal verweist auf externe Angebote, etwa auf Ablagen mit Marken- und
Bildmaterial. Für deren Inhalte und deren Umgang mit Daten sind die jeweiligen
Anbieter verantwortlich. Auf diese Seiten haben wir keinen Einfluss.

## Änderungen dieser Erklärung

Wir passen diese Erklärung an, wenn sich das Portal oder die eingesetzten
Dienste ändern. Massgebend ist die jeweils hier veröffentlichte Fassung.
