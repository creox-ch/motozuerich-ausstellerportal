-- Каталог площадок MOTO-ZÜRICH 2027.
-- Сгенерирован из прототипа (public/prototyp.html) выполнением его же кода
-- разметки залов — числа не переписывались руками.
--
-- Размеры в МЕТРАХ. Ширина взята из определения ряда, глубина — из параметра
-- ряда. Карточка стенда в прототипе делит глубину на масштаб повторно и
-- показывает завышенное значение (для D09 — 10 × 9 м вместо 10 × 8 м);
-- независимая цифра в разделе Übersicht подтверждает верную трактовку.
--
-- Координаты — тоже в метрах, начало отсчёта в левом верхнем углу зала.
--
-- StageOne в прототипе не размечен («Plan folgt») — этих площадок здесь нет.
--
-- Идемпотентно: повторный запуск обновляет геометрию, но НЕ трогает статус
-- и привязку к компании — их ведёт Messeleitung, и перезатирать их нельзя.

insert into public.mz_stands (id, halle, lage, breite_m, tiefe_m, pos_x, pos_y)
values
  ('D13', 'Halle D', 'Nordwand', 6, 4, 62.6, 2.5),
  ('D14', 'Halle D', 'Nordwand', 6, 4, 56.14, 2.5),
  ('D15', 'Halle D', 'Nordwand', 8, 4, 47.67, 2.5),
  ('D16', 'Halle D', 'Nordwand', 8, 4, 39.21, 2.5),
  ('D17', 'Halle D', 'Nordwand', 7, 4, 31.74, 2.5),
  ('D18', 'Halle D', 'Nordwand', 13, 4, 18.28, 2.5),
  ('D01', 'Halle D', 'Mittelblock, beidseitig offen', 10, 8, 58.6, 8),
  ('D02', 'Halle D', 'Mittelblock, beidseitig offen', 10, 8, 48.14, 8),
  ('D03', 'Halle D', 'Mittelblock, Nordgang', 5, 4, 42.67, 8),
  ('D05', 'Halle D', 'Mittelblock, Nordgang', 8, 4, 34.21, 8),
  ('D07', 'Halle D', 'Mittelblock, Nordgang', 5, 4, 28.74, 8),
  ('D04', 'Halle D', 'Mittelblock, Südgang', 5, 4, 42.67, 12),
  ('D06', 'Halle D', 'Mittelblock, Südgang', 8, 4, 34.21, 12),
  ('D08', 'Halle D', 'Mittelblock, Südgang', 5, 4, 28.74, 12),
  ('D09', 'Halle D', 'Mittelblock, beidseitig offen', 10, 8, 18.28, 8),
  ('D10', 'Halle D', 'Mittelblock, beidseitig offen', 5, 8, 12.81, 8),
  ('D11', 'Halle D', 'Mittelblock, beidseitig offen', 5, 8, 7.35, 8),
  ('D12', 'Halle D', 'Mittelblock, beidseitig offen', 5, 8, 1.88, 8),
  ('D19', 'Halle D', 'Südreihe', 10, 5, 58.6, 22),
  ('D20', 'Halle D', 'Südreihe', 10, 5, 48.14, 22),
  ('D21', 'Halle D', 'Südreihe', 10, 5, 37.67, 22),
  ('D22', 'Halle D', 'Südreihe', 10, 5, 27.21, 22),
  ('D23', 'Halle D', 'Südreihe', 15, 5, 11.74, 22),
  ('H01', 'Halle 550', 'Nordreihe', 8, 5, 60.6, 2.5),
  ('H02', 'Halle 550', 'Nordreihe', 6, 5, 54.14, 2.5),
  ('H03', 'Halle 550', 'Nordreihe', 6, 5, 47.67, 2.5),
  ('H04', 'Halle 550', 'Nordreihe', 10, 5, 37.21, 2.5),
  ('H05', 'Halle 550', 'Nordreihe', 6, 5, 30.74, 2.5),
  ('H06', 'Halle 550', 'Nordreihe', 6, 5, 24.28, 2.5),
  ('H07', 'Halle 550', 'Mittelblock', 8, 6, 60.6, 10),
  ('H08', 'Halle 550', 'Mittelblock', 6, 6, 54.14, 10),
  ('H09', 'Halle 550', 'Mittelblock', 10, 6, 43.67, 10),
  ('H10', 'Halle 550', 'Mittelblock', 6, 6, 37.21, 10),
  ('H11', 'Halle 550', 'Mittelblock', 8, 6, 28.74, 10),
  ('H12', 'Halle 550', 'Mittelblock', 6, 5, 62.6, 19),
  ('H13', 'Halle 550', 'Mittelblock', 6, 5, 56.14, 19),
  ('H14', 'Halle 550', 'Mittelblock', 8, 5, 47.67, 19),
  ('H15', 'Halle 550', 'Mittelblock', 6, 5, 41.21, 19),
  ('H16', 'Halle 550', 'Mittelblock', 6, 5, 34.74, 19),
  ('H17', 'Halle 550', 'Südreihe', 10, 4, 58.6, 27),
  ('H18', 'Halle 550', 'Südreihe', 10, 4, 48.14, 27),
  ('H19', 'Halle 550', 'Südreihe', 8, 4, 39.67, 27),
  ('H20', 'Halle 550', 'Südreihe', 8, 4, 31.21, 27)
on conflict (id) do update set
  halle    = excluded.halle,
  lage     = excluded.lage,
  breite_m = excluded.breite_m,
  tiefe_m  = excluded.tiefe_m,
  pos_x    = excluded.pos_x,
  pos_y    = excluded.pos_y;
