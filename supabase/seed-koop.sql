-- Каталог мер совместного маркетинга.
-- Запускать ПОСЛЕ supabase/schema.sql.
--
-- Семь групп, девятнадцать мер — из прототипа (public/prototyp.html,
-- переменная `gruppen`). Баллы там проставлены и согласованы, поэтому стоят
-- настоящими числами.
--
-- ЧЕГО ЗДЕСЬ НЕТ: сколько процентов скидки дают 100 баллов и каков потолок
-- на счёт. Это бизнес не назвал, в интерфейсе стоит XX. Подставить сюда
-- правдоподобный процент нельзя: экспонент прочитает его как обещание скидки.
--
-- `einfach` у группы означает, что засчитывается только одна мера из неё:
-- нельзя получить баллы и за полностраничный, и за половинный макет в одном
-- и том же каталоге.
--
-- Идемпотентно: обновляет тексты, баллы и порядок, но НЕ трогает `aktiv` —
-- снятую с продажи меру возвращать в каталог файл не вправе.

insert into public.mz_koop_massnahmen (id, gruppe, gruppe_modus, titel, beschreibung, punkte, sortierung) values
  ('ins_ganz',      'Inserate',            'einfach',   'Ganzseitig',                          'Ganzseitiges Inserat über MOTO-ZÜRICH in Ihrem Katalog, Kundenmagazin oder Programmheft. Sujet liefern wir.', 20, 10),
  ('ins_halb_text', 'Inserate',            'einfach',   'Halbseitig mit Text',                 'Halbseitiges Inserat mit redaktionellem Text.',                                                                  20, 20),
  ('ins_halb',      'Inserate',            'einfach',   'Halbseitig',                          'Halbseitiges Inserat ohne Text.',                                                                                10, 30),

  ('flyer',         'Flyer und Plakate',   'mehrfach',  'Flyer auflegen',                      'Flyer in Papierform (A6, A5 oder A4) gut sichtbar in Ihrem Geschäft, Stapel ab 200 Stück.',                      20, 40),
  ('plakat',        'Flyer und Plakate',   'mehrfach',  'Plakat im Schaufenster',              'Plakat A1 oder A2 während mindestens vier Wochen vor der Messe.',                                                20, 50),
  ('banner',        'Flyer und Plakate',   'mehrfach',  'Banner oder Beachflag',               'Material holen Sie bei uns ab und retournieren es nach der Messe. Sie haften für Schäden.',                      10, 60),

  ('medien',        'Redaktionelle Texte', 'mehrfach',  'Medienberichterstattung',             'Bericht eines Medienpartners oder externen Mediums mit namentlicher Erwähnung von MOTO-ZÜRICH.',                 20, 70),
  ('nl_erste',      'Redaktionelle Texte', 'mehrfach',  'Beitrag Newsletter an erster Position','Selbstverfasster Abschnitt an erster Position in Ihrem Newsletter, mit Logo und Link.',                          20, 80),
  ('nl',            'Redaktionelle Texte', 'mehrfach',  'Beitrag Newsletter',                  'Abschnitt über MOTO-ZÜRICH nicht an erster Position, mit Logo.',                                                 10, 90),
  ('medienmit',     'Redaktionelle Texte', 'mehrfach',  'Medienmitteilung',                    'Abschnitt über MOTO-ZÜRICH in Ihrer Medienmitteilung, mit Logo und Nennung.',                                    20, 100),

  ('instagram',     'Social Media',        'mehrfach',  'Instagram',                           'Foto oder Video auf Ihrem offiziellen Kanal, @motozuerich markiert, Bildmaterial in hoher Qualität.',           10, 110),
  ('facebook',      'Social Media',        'mehrfach',  'Facebook',                            'Foto oder Video auf Ihrer offiziellen Seite mit Markierung @motozuerich.',                                       10, 120),
  ('linkedin',      'Social Media',        'mehrfach',  'LinkedIn',                            'Beitrag auf Ihrem Unternehmensprofil mit Markierung.',                                                           10, 130),
  ('reel',          'Social Media',        'mehrfach',  'Reel oder Video',                     'Eigenes Reel oder Video zur Messe, mindestens 20 Sekunden, mit Markierung.',                                     20, 140),

  ('web_start',     'Website',             'einfach',   'Logo auf der Startseite',             'Logo von MOTO-ZÜRICH gut sichtbar auf Ihrer Startseite, verlinkt auf motozuerich.ch.',                           30, 150),
  ('web_unter',     'Website',             'einfach',   'Logo auf einer Unterseite',           'Logo auf einer Unterseite, verlinkt auf motozuerich.ch.',                                                        20, 160),

  ('mailing',       'Ihre Kundenbasis',    'mehrfach',  'Mailing mit Rabattcode',              'Versand an Ihre Kundenbasis mit unserem Rabattcode. QR-Code und Codeliste stellen wir bereit.',                  30, 170),
  ('qr_pos',        'Ihre Kundenbasis',    'mehrfach',  'QR-Code am Verkaufspunkt',            'QR-Code zum Ticketshop an der Kasse oder im Schaufenster.',                                                      10, 180),
  ('gewinnspiel',   'Ihre Kundenbasis',    'mehrfach',  'Gemeinsames Gewinnspiel',             'Gewinnspiel in unserem Design, Preis stellen Sie.',                                                              20, 190),

  ('vorab_event',   'Gemeinsame Anlässe',  'mehrfach',  'Vorab-Event oder Ausfahrt',           'Gemeinsamer Anlass vor der Messe mit Nennung von MOTO-ZÜRICH.',                                                  30, 200),
  ('preis',         'Gemeinsame Anlässe',  'mehrfach',  'Preis für unsere Verlosung',          'Sie stellen einen Preis für die Messe-Verlosung.',                                                               20, 210)
on conflict (id) do update set
  gruppe       = excluded.gruppe,
  gruppe_modus = excluded.gruppe_modus,
  titel        = excluded.titel,
  beschreibung = excluded.beschreibung,
  punkte       = excluded.punkte,
  sortierung   = excluded.sortierung;
