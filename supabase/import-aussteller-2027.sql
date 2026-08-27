-- Экспоненты MOTO-ZÜRICH 2027 из публичного плана — разовый импорт.
--
-- Источник: plan2027-data.js со страницы motozuerich.ch/Standflaechen,
-- снято 27.08.2026. Оттуда же взята геометрия каталога площадок.
--
-- ⚠️ Это НЕ часть обычных сидов. Компании — операционные данные, их ведёт
-- Messeleitung; выполнять этот файл повторно на живой базе незачем. Он лежит
-- в репозитории, чтобы импорт был воспроизводим и видно было, откуда данные.
--
-- Что переносится: название, адрес, сайт, Instagram и короткое описание.
-- Чего НЕ переносится:
--   * почты — их на плане нет вовсе, а без почты доступ в кабинет не выдать;
--   * логотипы — на сайте это файлы вида «S1.png» в его собственном репозитории,
--     а mz_companies.logo_path указывает в наш бакет. Перенос логотипов —
--     отдельная работа, не эта.
--
-- Компаний 44 на 52 площадках: одна компания может занимать
-- несколько мест. Больше одной у 5 компаний — CF Moto, Triumph, OFRAG, BMW Motorrad, Harley-Davidson.
--
-- У 2 компаний на сайте по два адреса (VTR Motorrad & Mira, Honda) —
-- взят первый, второй остался на сайте.
--
-- Статус 'bestaetigt': на публичном плане эти площадки помечены «besetzt (2027)»,
-- то есть участие подтверждено. Тем же источником мы уже пользовались, когда
-- переносили занятость.
--
-- Идемпотентность: 'on conflict do nothing' и обновление только пустых
-- company_id. Повторный запуск ничего не перезапишет — правки Messeleitung
-- в приоритете.

insert into public.mz_companies (name, strasse, ort, website, instagram, beschreibung, status)
select v.name, v.strasse, v.ort, v.website, v.instagram, v.beschreibung, 'bestaetigt'
from (values
  ('Motoshop 46', 'Romanshornstrasse 8', '8583 Sulgen', 'https://www.motoshop46.ch', 'https://www.instagram.com/motoshop46.ch', null),
  ('CF Moto', 'Simon-Frick-Strasse 18', '9466 Sennwald', 'https://cfmotoschweiz.ch', 'https://www.instagram.com/cfmoto_schweiz_official', null),
  ('MRV Group', 'Murgtalstrasse 20', '9542 Münchwilen', 'https://www.bikerfashion.ch', 'https://www.instagram.com/bikerfashion_suisse/', 'MRV Group · BikerFashion – Schweizer Online Premium Marken Store für Motorradbekleidung.'),
  ('Triumph', 'Rue des Bugnons 4', '1217 Meyrin', 'https://de.triumphmotorcycles.ch/', 'https://www.instagram.com/officialtriumphswiss', 'Triumph: alle Neuheiten vor Ort. Am Stand S4/G2/G3 eine Triumph Trident 660 für ein ganzes Jahr gewinnen!'),
  ('Fahrwerk.rock', null, null, null, null, null),
  ('OFRAG', 'Hübelacherstrasse 1', '5242 Lupfig', 'https://www.ofrag-retail.ch/de/', 'https://www.instagram.com/apriliaschweiz', 'OFRAG Retail — Piaggio, Vespa, Aprilia und Moto Guzzi in der Schweiz.'),
  ('MotoBoutique Zimmermann', null, null, 'https://www.m-b-z.ch', 'https://www.instagram.com/motoboutiquezimmermann', null),
  ('Chris Sports', 'Fabrikstrasse 10', '8360 Eschlikon', 'https://www.chrissports.ch/', 'https://www.instagram.com/chrissports.ch', null),
  ('Motorex', 'Bern-Zürichstrasse 31', '4900 Langenthal', 'https://www.motorex.com', 'https://www.instagram.com/motorex_powersports', null),
  ('Gravel Travel', null, null, 'https://www.motorradreisen.de', 'https://www.instagram.com/gravel.travel', null),
  ('TCS', null, null, 'https://tcs.ch', 'https://www.instagram.com/tcs.training/', null),
  ('ZERO', 'Oester 12', '1723 HW Noord-Scharwoude (NL)', 'https://zeromotorcycles.com/de-ch', 'https://www.instagram.com/zeromotorcycleseurope', null),
  ('POLO', 'Polostrasse 1', '41363 Jüchen (DE)', 'https://www.polo-motorrad.com/de-de/', 'https://www.instagram.com/polo_motorrad/', null),
  ('SAM', 'Firststrasse 15', '8835 Feusisberg', 'https://www.s-a-m.ch/', 'https://www.instagram.com/sam_schweiz/', 'SAM – Mitglieder profitieren: Beiträge Verkehrssicherheit, Risikoversicherung, Rabatte. s-a-m.ch/Vorteile'),
  ('PP Passion Parts', 'Gewerbestrasse 1', '4543 Deitingen', 'https://www.passionparts.ch', null, null),
  ('BMW Motorrad', 'Industriestrasse 20', '8157 Dielsdorf', 'https://www.bmw-motorrad.ch/de/home.html', 'https://www.instagram.com/bmwmotorradch/', null),
  ('Harley-Davidson', 'Industriestrasse 47', '6300 Zug', 'https://www.harley-davidson.com/ch/de/index.html', 'https://www.instagram.com/harleydavidson.switzerland/', null),
  ('ASSR', 'Neue Dällikerstrasse 1', '8105 Regensdorf', 'https://www.assr.ch', 'https://www.instagram.com/driving_center_assr_regensdorf/', 'Speed Factory: Rennmotorrad-Simulator & Race-Schräglagemotorrad – Hang-off üben, «Elbow-down»-Foto schiessen.'),
  ('Benda Motor', 'Alpenstraße 55', '5020 Salzburg (AT)', 'https://bendamoto.com', 'https://www.instagram.com/benda_dach', null),
  ('Titan ADV & Rally', null, null, null, null, null),
  ('Tekno Parts', 'Keltenstrasse 19', '2563 Ipsach', 'https://www.teknoparts.ch', 'https://www.instagram.com/tekno_parts_ltd', null),
  ('Helite Lippstark', 'Friedgrabenstrasse 15', '8907 Wettswil', 'https://www.remondo.ch', 'https://www.instagram.com/helite_switzerland', null),
  ('Mithos', null, null, 'https://www.mithos-sport.com/', 'https://www.instagram.com/mithos_sport', null),
  ('Töffreisen', null, null, 'https://www.toeffreisen.ch', 'https://www.instagram.com/toeffreisen.ch', null),
  ('Leder Swiss Design', 'Quellenstrasse 15', '8307 Effretikon', null, null, null),
  ('Rokker', 'Industriestrasse 64', '9443 Widnau', 'https://www.therokkercompany.com', 'https://www.instagram.com/rokkercompany', null),
  ('Peru Moto', null, null, 'https://www.perumoto.com', null, null),
  ('Moto Marketing', null, null, 'https://www.moto-marketing.ch/', 'https://www.instagram.com/motomarketing.ch', null),
  ('Ducati', 'Firststrasse 2', '8835 Feusisberg', 'https://www.ducati.ch', 'https://www.instagram.com/ducatischweizofficial', null),
  ('Carex', null, null, 'https://carex.ch', 'https://www.instagram.com/carex.ch/', null),
  ('2RadSchweiz', null, null, 'https://www.2radschweiz.ch', null, null),
  ('Mototrend', 'Wiesenstrasse 19', '8952 Schlieren', 'https://www.mototrend.ch', 'https://www.instagram.com/mototrend.ch', null),
  ('Suzuki', 'Emil-Frey-Strasse', '5745 Safenwil', 'https://www.suzuki.ch', 'https://www.instagram.com/suzukimotoschweiz/', null),
  ('NL Tuning', 'Lettenweg 118', '4123 Allschwil', 'https://www.nl-tuning.ch', 'https://www.instagram.com/nltuning.ch/', null),
  ('Bridgestone', 'Bodenäckerstrasse 1', '8957 Spreitenbach', 'https://www.bridgestone.ch', 'https://www.instagram.com/bridgestonemoto/', 'Bridgestone – dein Grip-Garant auf Strasse, Offroad und Rennstrecke. Battlax Performance am Stand entdecken.'),
  ('hostettler moto ag', 'Moosstrasse 45', '8134 Adliswil', 'https://www.hostettler-moto.ch/', 'https://www.instagram.com/hostettlermoto', null),
  ('Kontakt SAGL', null, null, null, null, null),
  ('Pileral Tradgin', null, null, 'https://www.vulcanet.ch', 'https://www.instagram.com/Vulcanet_Swiss', null),
  ('VTR Motorrad & Mira', 'St. Gallerstrasse 77', 'Schmerikon', 'https://www.vtr-motorrad.ch', 'https://www.instagram.com/vtrcustoms/', 'VTR Customs: BMW High-End Custom Bikes · Mirage Swiss Spirit: die Helmbrille Nr. 1 mit Korrektursystem.'),
  ('Makzary', 'Erlenweg 2', '5722 Gränichen', 'https://www.makzary.ch', 'https://www.instagram.com/makzary.ch', 'VOGE & ZONTES – dein Partner im Herzen des Kantons Aargau. Das Bike. Der Weg. Du.'),
  ('Mototech', 'Industriestrasse 19', '5036 Oberentfelden', 'https://www.mototech.ch', 'https://www.instagram.com/mototech.ch', null),
  ('Bündner Bike', 'Untere Industrie 7', '7304 Maienfeld', 'https://www.harley-davidson-graubuenden.ch', 'https://www.instagram.com/buendnerbike.harleydavidson', null),
  ('Bikers Life', 'Industriestrasse 14', '8305 Dietlikon', 'https://www.bikers-life.ch/', 'https://www.instagram.com/bikerslife.zh/', null),
  ('Honda', 'Schöneggstrasse 10', '8004 Zürich', 'http://www.boller.group', 'https://www.instagram.com/bollergroup_', 'Honda: Produktpalette entdecken, @hondamoto_ch folgen und das Honda-Geschenk abholen.')
) as v(name, strasse, ort, website, instagram, beschreibung)
on conflict (name) do nothing;

-- Привязка площадок к компаниям — по номеру публичного плана (mz_stands.plan_id).
update public.mz_stands s
   set company_id = c.id
  from (values
  ('G1A', 'Motoshop 46'),
  ('S1', 'CF Moto'),
  ('S2', 'CF Moto'),
  ('S3', 'MRV Group'),
  ('G2', 'Triumph'),
  ('S4', 'Triumph'),
  ('G3', 'Triumph'),
  ('G4', 'Fahrwerk.rock'),
  ('S5', 'OFRAG'),
  ('G5', 'MotoBoutique Zimmermann'),
  ('S6', 'Chris Sports'),
  ('G6', 'OFRAG'),
  ('G7', 'OFRAG'),
  ('S7', 'Motorex'),
  ('G8A', 'Gravel Travel'),
  ('G8B', 'TCS'),
  ('S8', 'ZERO'),
  ('S9', 'POLO'),
  ('G11', 'SAM'),
  ('S10', 'PP Passion Parts'),
  ('K1', 'BMW Motorrad'),
  ('K2', 'OFRAG'),
  ('K3', 'Harley-Davidson'),
  ('K4', 'ASSR'),
  ('E2C', 'Benda Motor'),
  ('E2B', 'Titan ADV & Rally'),
  ('E3', 'Tekno Parts'),
  ('E4', 'Helite Lippstark'),
  ('E5A', 'Mithos'),
  ('E5B', 'Töffreisen'),
  ('E6', 'Leder Swiss Design'),
  ('E7', 'Rokker'),
  ('E8', 'Peru Moto'),
  ('E9', 'Moto Marketing'),
  ('E15A', 'Ducati'),
  ('E2', 'Carex'),
  ('E10', '2RadSchweiz'),
  ('E11', 'Mototrend'),
  ('E15B', 'Suzuki'),
  ('E17', 'BMW Motorrad'),
  ('E19', 'NL Tuning'),
  ('E12', 'Bridgestone'),
  ('E20', 'hostettler moto ag'),
  ('E16A', 'Kontakt SAGL'),
  ('E16B', 'Pileral Tradgin'),
  ('E13', 'VTR Motorrad & Mira'),
  ('E21', 'Makzary'),
  ('E22', 'Mototech'),
  ('E23', 'Harley-Davidson'),
  ('E14B', 'Bündner Bike'),
  ('E14A', 'Bikers Life'),
  ('E25', 'Honda')
) as v(plan_id, firma)
  join public.mz_companies c on c.name = v.firma
 where s.plan_id = v.plan_id
   and s.company_id is null;
