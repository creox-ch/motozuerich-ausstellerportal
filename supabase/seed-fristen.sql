-- Сроки экспонента для чек-листа в Übersicht.
-- Запускать ПОСЛЕ supabase/schema.sql.
--
-- Список взят из прототипа (public/prototyp.html, переменная `fristen`) —
-- он и есть согласованная спецификация раздела.
--
-- ВОСЕМЬ ДАТ ПУСТЫЕ, и это не пробел. Прототип показывает их красным XX
-- и подписывает «Rot markierte Daten sind intern noch nicht festgelegt».
-- Подставить правдоподобное число хуже пустоты: срок читается экспонентом
-- как обязательство, а выдуманный переживёт запуск незамеченным.
--
-- Три даты известны и стоят настоящими: монтаж 17–18.02.2027 и сама
-- выставка 19–21.02.2027.
--
-- Идемпотентно: повторный запуск обновляет тексты и порядок, но НЕ трогает
-- `datum`, `datum_bis` и `aktiv` — их проставляет Messeleitung, и перезатирать
-- назначенный срок файл не вправе. Та же логика, что в seed-stands.sql.

insert into public.mz_fristen (id, sortierung, titel, hinweis, datum, datum_bis, ziel) values
  ('profil',       10, 'Datenblatt und Verzeichniseintrag erfassen', 'Logo und Beschreibung für Website, App und Event-Guide', null, null, '/portal/profil'),
  ('marketing',    20, 'Event-Guide: Buchung und Druckdaten',        'Redaktionsschluss Print',                              null, null, '/portal/marketing'),
  ('anlieferung',  30, 'Anlieferung und Abtransport buchen',         'Ohne Zeitfenster keine Zufahrt',                       null, null, '/portal/anreise'),
  ('parking',      40, 'Parkbedarf anmelden',                        'Anmeldeschluss',                                       null, null, '/portal/anreise'),
  ('technik',      50, 'Technik und Mobiliar bestellen',             'Danach nur nach Verfügbarkeit',                        null, null, '/portal/technik'),
  ('aktivitaeten', 60, 'Aktivitäten am Stand einreichen',            'Für Programm und Event-Guide',                         null, null, '/portal/aktivitaeten'),
  -- Раздела Ausweise ещё нет: он ждёт проверенного Datenschutz, потому что
  -- собирает имена сотрудников. Ссылку не даём, срок в списке оставляем —
  -- задача у экспонента всё равно появится.
  ('ausweise',     70, 'Standpersonal erfassen',                     'Einzeln oder als Liste',                               null, null, null),
  ('koop',         80, 'Nachweise gemeinsame Aktivitäten',           'Danach verfallen die Punkte',                          null, null, '/portal/aktionen'),
  ('aufbau_1',     90, 'Aufbau Tag 1',                               'Anlieferung nur mit Zeitfenster',                      '2027-02-17', null, '/portal/anreise'),
  ('aufbau_2',    100, 'Aufbau Tag 2',                               'Standabnahme am Abend',                                '2027-02-18', null, '/portal/anreise'),
  ('messe',       110, 'MOTO-ZÜRICH 2027',                           'StageOne und Halle 550, Zürich-Oerlikon',              '2027-02-19', '2027-02-21', null)
on conflict (id) do update set
  sortierung = excluded.sortierung,
  titel      = excluded.titel,
  hinweis    = excluded.hinweis,
  ziel       = excluded.ziel;
