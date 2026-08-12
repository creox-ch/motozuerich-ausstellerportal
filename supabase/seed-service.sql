-- Справочные данные портала: каталог услуг и заглушка прайса.
-- Запускать ПОСЛЕ supabase/schema.sql — данные ложатся в готовые таблицы.
--
-- Позиции взяты из прототипа (public/prototyp.html), разделы Technik & Service
-- и Marketing. Формулировки немецкие: их читают экспоненты, а не код.
--
-- ЦЕН ЗДЕСЬ НЕТ, и это не пробел. preis_rappen остаётся пустым, интерфейс
-- показывает XX. Прототип прямо пишет «Konditionen erhalten Sie mit der
-- Auftragsbestätigung» — экспонент собирает заказ, условия приходят с
-- подтверждением. Подставить правдоподобные суммы было бы хуже пустоты:
-- цена, показанная экспоненту, читается как предложение, а выдуманное число
-- переживает запуск незамеченным.
--
-- Идемпотентно: повторный запуск обновляет тексты и порядок, но НЕ трогает
-- preis_rappen и aktiv. Их ведёт Messeleitung: перезатирать проставленную
-- цену или возвращать в продажу снятую позицию файл не вправе. Та же логика,
-- что в seed-stands.sql со статусом и привязкой к компании.

-- ---------------------------------------------------------------------------
-- Technik & Service
-- ---------------------------------------------------------------------------

insert into public.mz_service_katalog
  (id, bereich, bezeichnung, beschreibung, einheit, sortierung)
values
  ('strom_3_5kw',  'technik', 'Stromanschluss 3.5 kW, 230 V', 'Standardanschluss für Beleuchtung und Kleingeräte', 'Stück', 10),
  ('strom_10kw',   'technik', 'Stromanschluss 10 kW, 400 V',  'für Maschinen, Kompressoren, grössere Verbraucher', 'Stück', 20),
  ('wasser',       'technik', 'Wasser- und Abwasseranschluss', 'nur an bestimmten Standorten möglich',            'Stück', 30),
  ('wlan',         'technik', 'Dediziertes WLAN',              'eigener Zugang unabhängig vom Besuchernetz',      'Stück', 40),
  ('reinigung',    'technik', 'Standreinigung, alle Messetage', 'täglich vor Öffnung',                            'Stand', 50),
  ('theke',        'technik', 'Theke abschliessbar, 1 m',      'Mietmobiliar',                                    'Stück', 60),
  ('bartisch',     'technik', 'Bartisch',                      'Mietmobiliar',                                    'Stück', 70),
  ('barhocker',    'technik', 'Barhocker',                     'Mietmobiliar',                                    'Stück', 80),
  ('kuehlschrank', 'technik', 'Kühlschrank',                   'Mietgerät, Strom separat bestellen',              'Stück', 90),
  ('stapler',      'technik', 'Staplereinsatz',                'pro angefangene halbe Stunde, mit Bediener', 'halbe Stunde', 100),
  ('rigging',      'technik', 'Rigging-Punkt',                 'Abhängung ab Hallendach, Statik vorab prüfen',    'Punkt', 110),
  ('teppich',      'technik', 'Teppich oder Bodenbelag',       'pro m², Farbe nach Auswahl',                      'm²',    120),

-- ---------------------------------------------------------------------------
-- Marketing: реклама в печатном Event-Guide
-- ---------------------------------------------------------------------------

  ('eg_extra',    'marketing', 'Extra (A5), 148 × 210 mm', 'Ganze Seite. Eigenes Design oder Gestaltung durch uns. Headline, Fliesstext, Bild und Call-to-Action.', 'Platzierung', 10),
  ('eg_premium',  'marketing', 'Premium, 140 × 90 mm',     'Logo 80 × 45 mm, 1–2 kurze Sätze (rund 160 Zeichen) plus eine Angebotszeile bis 80 Zeichen.',          'Platzierung', 20),
  ('eg_midi',     'marketing', 'Midi, 90 × 70 mm',         'Logo und 1–2 Zeilen Beschreibung, bis rund 120 Zeichen.',                                             'Platzierung', 30),
  ('eg_standard', 'marketing', 'Standard, 70 × 44.5 mm',   'Logo und eine kurze Zeile bis 80 Zeichen: Fokusprodukt, Markenliste oder Standnummer.',               'Platzierung', 40)
on conflict (id) do update set
  bereich      = excluded.bereich,
  bezeichnung  = excluded.bezeichnung,
  beschreibung = excluded.beschreibung,
  einheit      = excluded.einheit,
  sortierung   = excluded.sortierung;

-- ---------------------------------------------------------------------------
-- Заглушка прайса на площади
-- ---------------------------------------------------------------------------

-- Строка без суммы. На поведение не влияет — без неё priceFor() вернёт ровно
-- то же «цена неизвестна», и витрина покажет XX. Нужна как след решения:
-- пустая таблица читается как «прайс забыли завести», а строка с notiz —
-- как «модель ещё не выбрана», и это разные вещи для того, кто откроет базу.
--
-- Когда цены появятся: сюда же строки поконкретнее (gilt_fuer = 'halle' или
-- 'stand'), они перекроют общую — правило выбирается от частного к общему.
insert into public.mz_preise (gilt_fuer, schluessel, modell, betrag_rappen, notiz)
values ('alle', null, null, null, 'Заглушка: модель и суммы бизнесом не определены.')
on conflict do nothing;
