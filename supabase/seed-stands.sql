-- Каталог площадок MOTO-ZÜRICH 2027 — три зала, 109 площадок.
--
-- ---------------------------------------------------------------------------
-- Halle D — 23 площадки, план и список
-- ---------------------------------------------------------------------------
--
-- Размеры, площади и контингенты карт — из `Preise_Leistungen.xlsx`
-- (лист Tabelle1, блок «Flächen HALLE D - ADVENTURE CAMP»).
-- Координаты — из `Plan_H550.pptx`: положение фигур на слайде переведено
-- в метры по масштабу 0.225 см на метр. Масштаб не подобран на глаз, а посчитан
-- как медиана отношения «нарисованная высота ÷ глубина по прайсу» по всем 23
-- площадкам. Обе проверки прошли: площадь каждой сошлась с прайсом,
-- пересечений прямоугольников нет.
--
-- ⚠️ Координаты приблизительные. В PowerPoint это положения текстовых блоков,
-- а не чертёж: у подписи есть внутренний отступ, поэтому позиция плывёт
-- на десятки сантиметров. Для «вот ваш стенд и соседи» этого достаточно,
-- для монтажных расчётов — нет.
--
-- D10 и D11 подписаны в прайсе как «8x5», но на плане нарисованы 5 в ширину
-- и 8 в глубину. Взята ориентация с плана: он внутренне согласован, а порядок
-- чисел в подписях прайса — нет (соседние площадки той же формы подписаны «5x8»).
--
-- `lage` пустая намеренно: в прототипе там стояли «Nordwand» и «Mittelblock»,
-- но нумерация изменилась полностью и подписи стали враньём. В файлах
-- Messeleitung расположения нет — значит нет и у нас.
--
-- ---------------------------------------------------------------------------
-- Halle 550 — 25 площадок, только список
-- ---------------------------------------------------------------------------
--
-- ⚠️ НУМЕРАЦИЯ ЗДЕСЬ — ДОГОВОРНАЯ. Подтверждена Ксенией 26.08.2026: именно эти
-- номера идут в договоры и на стенды. Это нумерация ПЛАНА, а не прайса от
-- 13.08: у H20–H27 они расходились, и выбор сделан в пользу плана.
--
-- Что это значит на практике: если снова придёт прайс со старыми номерами,
-- переносить из него надо размеры и суммы, а НЕ идентификаторы. Иначе H20
-- из площадки 13×5 за 10'925 снова станет 5×3 за 3'050, и разница всплывёт
-- в договоре.
--
-- Данные в этом файле сняты с боевой базы после перенумерации, а не из прайса.
-- Проверка сходимости: 1000 м² по залу, ставка 167–207 CHF/м² — та же кривая,
-- что в Halle D.
--
-- Координат нет: зал не размечен, витрина показывает его списком. У H27
-- нет и сторон — известна только площадь 120 м².
--
-- ---------------------------------------------------------------------------
-- StageOne — 61 площадка, только список
-- ---------------------------------------------------------------------------
--
-- Ни у одной нет ни координат, ни сторон: в прайсе указана только площадь,
-- а плана зала не существует. Идентификаторы взяты как в прайсе — «Kubus 1»,
-- «Galerie 8A», «Fläche E19», «Showroom 3»: именно так их называют между собой
-- Messeleitung и экспонент.
--
-- **Занятость перенесена из прайса как есть**: на 13.08 занято 55 из 61.
-- Названий компаний в базе нет — mz_stands их не хранит, а на витрине они
-- не показываются ни при каких условиях. Связать площадку с компанией —
-- отдельная задача (D3 в бэклоге).
--
-- ---------------------------------------------------------------------------
--
-- Идемпотентно: повторный запуск обновляет геометрию и контингенты, но НЕ
-- трогает статус и привязку к компании — их ведёт Messeleitung, и перезатирать
-- их нельзя. Поэтому оперативные закрытия площадок (на 26.08 это D15, D16
-- и H10) живут только в базе и в этот файл не переносятся.

insert into public.mz_stands
  (id, halle, lage, breite_m, tiefe_m, pos_x, pos_y, gaeste_karten, aussteller_karten)
values
  -- Halle D — Adventure Camp. Настоящие данные.
  ('D01', 'Halle D', null, 10, 8, 74.4, 14.0, 35, 8),
  ('D02', 'Halle D', null, 10, 5, 72.2, 24.2, 20, 6),
  ('D03', 'Halle D', null, 10, 8, 64.2, 14.0, 35, 8),
  ('D04', 'Halle D', null,  6, 4, 68.2,  6.0, 20, 4),
  ('D05', 'Halle D', null,  6, 4, 59.8,  6.0, 20, 4),
  ('D06', 'Halle D', null, 10, 5, 61.1, 24.2, 20, 6),
  ('D07', 'Halle D', null, 10, 5, 50.0, 24.2, 20, 6),
  ('D08', 'Halle D', null,  5, 4, 54.4, 17.1, 20, 3),
  ('D09', 'Halle D', null,  5, 4, 54.4, 12.7, 20, 3),
  ('D10', 'Halle D', null,  5, 8, 49.1,  2.0, 20, 6),
  ('D11', 'Halle D', null,  5, 8, 43.3,  2.0, 20, 6),
  ('D12', 'Halle D', null,  8, 4, 42.4, 13.1, 20, 4),
  ('D13', 'Halle D', null,  8, 4, 42.4, 17.1, 20, 4),
  ('D14', 'Halle D', null, 10, 5, 38.9, 24.2, 20, 6),
  ('D15', 'Halle D', null,  5, 4, 37.1, 17.1, 20, 3),
  ('D16', 'Halle D', null,  5, 4, 37.1, 13.1, 20, 3),
  ('D17', 'Halle D', null,  7, 4, 28.2,  6.0, 20, 4),
  ('D18', 'Halle D', null, 10, 8, 22.9, 14.0, 35, 8),
  ('D19', 'Halle D', null, 15, 5, 21.1, 24.7, 35, 8),
  ('D20', 'Halle D', null,  5, 8, 14.9, 14.0, 20, 6),
  ('D21', 'Halle D', null, 13, 5, 10.4,  6.0, 35, 8),
  ('D22', 'Halle D', null,  5, 8, 10.0, 14.0, 20, 6),
  ('D23', 'Halle D', null,  5, 8,  2.0, 13.6, 20, 6),

  -- Halle 550 — без координат: зал продаётся списком.
  -- Нумерация подтверждена Ксенией 26.08.2026 как договорная.
  ('H01', 'Halle 550', null,  8,  3, null, null, 20,  4),
  ('H02', 'Halle 550', null,  7,  4, null, null, 20,  4),
  ('H03', 'Halle 550', null,  5,  4, null, null, 20,  3),
  ('H04', 'Halle 550', null,  7,  5, null, null, 20,  4),
  ('H05', 'Halle 550', null,  7,  5, null, null, 20,  4),
  ('H06', 'Halle 550', null,  5,  4, null, null, 20,  3),
  ('H07', 'Halle 550', null,  7,  3, null, null, 20,  4),
  ('H10', 'Halle 550', null,  4,  5, null, null, 20,  3),
  ('H11', 'Halle 550', null,  5,  5, null, null, 20,  4),
  ('H12', 'Halle 550', null,  6,  8, null, null, 20,  6),
  ('H13', 'Halle 550', null,  5,  5, null, null, 20,  4),
  ('H14', 'Halle 550', null,  5,  5, null, null, 20,  4),
  ('H15', 'Halle 550', null,  5,  8, null, null, 20,  6),
  ('H16', 'Halle 550', null,  5,  8, null, null, 20,  6),
  ('H17', 'Halle 550', null, 13,  5, null, null, 35,  8),
  ('H18', 'Halle 550', null, 10,  7, null, null, 35,  8),
  ('H19', 'Halle 550', null,  5,  4, null, null, 20,  3),
  ('H20', 'Halle 550', null, 13,  5, null, null, 35,  8),
  ('H21', 'Halle 550', null,  5,  8, null, null, 20,  6),
  ('H22', 'Halle 550', null,  5,  3, null, null, 10,  3),
  ('H23', 'Halle 550', null,  7,  7, null, null, 20,  6),
  ('H24', 'Halle 550', null, 10,  7, null, null, 35,  8),
  ('H25', 'Halle 550', null, 10,  6, null, null, 35,  8),
  ('H26', 'Halle 550', null,  5,  4, null, null, 20,  3)
on conflict (id) do update set
  halle             = excluded.halle,
  lage              = excluded.lage,
  breite_m          = excluded.breite_m,
  tiefe_m           = excluded.tiefe_m,
  pos_x             = excluded.pos_x,
  pos_y             = excluded.pos_y,
  gaeste_karten     = excluded.gaeste_karten,
  aussteller_karten = excluded.aussteller_karten;

-- Особая площадка: H27.
--
-- У неё нет сторон — в прайсе указана только площадь 120 м². Триггер
-- mz_stands_flaeche считает площадь из сторон, когда они есть; здесь их нет,
-- поэтому значение задаётся напрямую.
--
-- `status` намеренно НЕ входит в do update: начальное значение ставим мы,
-- дальше им распоряжается Messeleitung, и повторный прогон файла не должен
-- переоткрывать или закрывать площадку заново.
insert into public.mz_stands
  (id, halle, breite_m, tiefe_m, flaeche_m2, gaeste_karten, aussteller_karten, status)
values
  ('H27', 'Halle 550', null, null,  120,  50, 10, 'frei'),

  -- StageOne: ни координат, ни сторон — только площадь. Занятость из прайса.
  ('Kubus 1',               'StageOne', null, null,  54, 50, 15, 'vergeben'),
  ('Kubus 2',               'StageOne', null, null,  54, 50, 15, 'vergeben'),
  ('Kubus 3',               'StageOne', null, null,  54, 50, 15, 'vergeben'),
  ('Kubus 4',               'StageOne', null, null,  54, 50,  6, 'vergeben'),
  ('Galerie 1A',            'StageOne', null, null,  49, 20,  6, 'vergeben'),
  ('Galerie 1B',            'StageOne', null, null, 17.5, 10, 3, 'frei'),
  ('Galerie 2',             'StageOne', null, null,  84, 50,  0, 'vergeben'),
  ('Galerie 3',             'StageOne', null, null,  14, 10,  0, 'vergeben'),
  ('Galerie 4',             'StageOne', null, null,   7, 10,  2, 'vergeben'),
  ('Galerie 5',             'StageOne', null, null,  18, 20,  3, 'vergeben'),
  ('Galerie 6',             'StageOne', null, null, 10.5, 10, 0, 'vergeben'),
  ('Galerie 7',             'StageOne', null, null,   7, 10,  0, 'vergeben'),
  ('Galerie 8A',            'StageOne', null, null,   7, 10,  2, 'vergeben'),
  ('Galerie 8B',            'StageOne', null, null,  21, 20,  4, 'vergeben'),
  ('Galerie 9',             'StageOne', null, null, 10.5, 10, 3, 'frei'),
  ('Galerie 10',            'StageOne', null, null,   7, 20,  2, 'frei'),
  ('Galerie 11',            'StageOne', null, null, 31.5, 20, 4, 'vergeben'),
  ('Galerie 12',            'StageOne', null, null, 10.5, 10, 3, 'frei'),
  ('Galerie 13',            'StageOne', null, null,   7, 10,  2, 'frei'),
  ('Fläche 1',              'StageOne', null, null, 31.5, 20, 4, 'frei'),
  ('Fläche 2',              'StageOne', null, null,   8, 10,  2, 'vergeben'),
  ('Fläche 2B',             'StageOne', null, null,   9, 10,  2, 'vergeben'),
  ('Fläche 2C',             'StageOne', null, null,  45, 20,  6, 'vergeben'),
  ('Fläche 3',              'StageOne', null, null,  30, 20,  4, 'vergeben'),
  ('Fläche 4',              'StageOne', null, null,  20, 20,  3, 'vergeben'),
  ('Fläche 5',              'StageOne', null, null,   9, 10,  2, 'vergeben'),
  ('Fläche E5A',            'StageOne', null, null,  12, 10,  3, 'vergeben'),
  ('Fläche 6',              'StageOne', null, null,  25, 20,  4, 'vergeben'),
  ('Fläche 7',              'StageOne', null, null,  25, 20,  4, 'vergeben'),
  ('Fläche 8',              'StageOne', null, null, 12.5, 10, 3, 'vergeben'),
  ('Fläche 9',              'StageOne', null, null, 17.5, 10, 3, 'vergeben'),
  ('Fläche 10',             'StageOne', null, null, 10.5, 10, 3, 'vergeben'),
  ('Fläche 11',             'StageOne', null, null,  27, 20,  4, 'vergeben'),
  ('Fläche 12',             'StageOne', null, null,  30, 20,  4, 'vergeben'),
  ('Fläche 13',             'StageOne', null, null,  35, 20,  6, 'vergeben'),
  ('Fläche 14A',            'StageOne', null, null,  50, 20,  6, 'vergeben'),
  ('Fläche 14B',            'StageOne', null, null,  55, 35,  6, 'vergeben'),
  ('Fläche 15A',            'StageOne', null, null, 100, 50, 10, 'vergeben'),
  ('Fläche 15B',            'StageOne', null, null, 100, 50, 10, 'vergeben'),
  ('Fläche 16A',            'StageOne', null, null,   9, 10,  2, 'vergeben'),
  ('Fläche 16B',            'StageOne', null, null,   6, 10,  2, 'vergeben'),
  ('Fläche 17',             'StageOne', null, null,  32, 20,  0, 'vergeben'),
  ('Fläche 18',             'StageOne', null, null,  50, 20,  0, 'vergeben'),
  ('Fläche E19',            'StageOne', null, null,  27, 20,  4, 'vergeben'),
  ('Fläche 20',             'StageOne', null, null, 103.5, 50, 10, 'vergeben'),
  ('Fläche 21',             'StageOne', null, null,  50, 20,  6, 'vergeben'),
  ('Fläche 22',             'StageOne', null, null, 130, 50, 12, 'vergeben'),
  ('Fläche 23',             'StageOne', null, null,  50, 20,  0, 'vergeben'),
  ('Fläche 23 Erweiterung', 'StageOne', null, null,  18, 20,  0, 'vergeben'),
  ('Fläche 24',             'StageOne', null, null,  35, 50,  4, 'vergeben'),
  ('Fläche 25',             'StageOne', null, null,  98, 50, 10, 'vergeben'),
  ('Showroom 1',            'StageOne', null, null, 57.75, 35, 10, 'vergeben'),
  ('Showroom 2',            'StageOne', null, null, 49.5, 20, 0, 'vergeben'),
  ('Showroom 3',            'StageOne', null, null,  66, 35,  8, 'vergeben'),
  ('Showroom 4',            'StageOne', null, null, 82.5, 50, 0, 'vergeben'),
  ('Showroom 5',            'StageOne', null, null,  66, 35, 12, 'vergeben'),
  ('Showroom 6',            'StageOne', null, null,  66, 35,  8, 'vergeben'),
  ('Showroom 7',            'StageOne', null, null,  66, 35,  8, 'vergeben'),
  ('Showroom 8',            'StageOne', null, null,  66, 35,  8, 'vergeben'),
  ('Showroom 9',            'StageOne', null, null,  66, 35,  8, 'vergeben'),
  ('Showroom 10',           'StageOne', null, null,  66, 35,  8, 'vergeben')
on conflict (id) do update set
  halle             = excluded.halle,
  breite_m          = excluded.breite_m,
  tiefe_m           = excluded.tiefe_m,
  flaeche_m2        = excluded.flaeche_m2,
  gaeste_karten     = excluded.gaeste_karten,
  aussteller_karten = excluded.aussteller_karten;
