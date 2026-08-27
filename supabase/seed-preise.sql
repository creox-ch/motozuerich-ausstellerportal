-- Цены на площади. Запускать ПОСЛЕ supabase/schema.sql.
--
-- Источник: `Preise_Leistungen.xlsx` от Messeleitung, файл от 13.08.2026.
-- **Цены за сезон 2027** — подтверждено Ксенией 13.08. В файле встречается
-- подпись «2026», она относится к прошлогодней справке, а не к этим суммам.
--
-- Суммы НЕТТО, без НДС — так они и стоят в прайсе («Preis exkl. MwSt.»).
-- Хранятся в раппенах, как везде на платформе: 100 = 1.00 CHF.
--
-- ---------------------------------------------------------------------------
-- Модель цены — ответ на вопрос, который держал витрину
-- ---------------------------------------------------------------------------
--
-- Цена задаётся на КАЖДУЮ площадку отдельно, а не формулой за квадратный метр.
-- Поэтому здесь по строке на площадку, `modell = 'pauschal'`.
--
-- За числами при этом видна закономерность, и её стоит знать, читая прайс:
-- в Halle D и Halle 550 одинаковая площадь стоит одинаково (20 м² → 4000,
-- 28 м² → 4960, 65 м² → 10925, 80 м² → 13400), а ставка за метр падает
-- с размером — с 200 CHF/м² на двадцати метрах до 167 на ста двадцати.
-- В StageOne Galerie и Fläche идут по той же кривой, а Kubus (225 CHF/м²)
-- и Showroom (192) — с наценкой за место.
--
-- Закономерность НЕ зашита в код намеренно: она описывает прайс, но не
-- управляет им. Появится площадка с особой ценой — достаточно строки здесь,
-- и никакая формула не будет с ней спорить.
--
-- ---------------------------------------------------------------------------
-- Полнота
-- ---------------------------------------------------------------------------
--
-- Здесь цены на ВСЕ 108 площадок трёх залов. Правило `alle` с пустой суммой
-- оставлено запасным: если завтра появится площадка без своей цены,
-- интерфейс покажет красное XX, а не чужую сумму.
--
-- Идемпотентно: повторный запуск переписывает суммы. Здесь это правильно —
-- в отличие от статуса площадки, цену никто не правит мимо этого файла,
-- и он единственный её источник. Уникальность обеспечивает индекс
-- mz_preise_scope_idx по (gilt_fuer, schluessel).

-- Запасное правило: цена неизвестна → XX. Должно существовать всегда.
insert into public.mz_preise (gilt_fuer, schluessel, modell, betrag_rappen, waehrung, notiz)
values ('alle', null, 'pauschal', null, 'CHF', 'Запасное правило: цена не задана, интерфейс показывает XX')
on conflict (gilt_fuer, coalesce(schluessel, '')) do nothing;

insert into public.mz_preise (gilt_fuer, schluessel, modell, betrag_rappen, waehrung, notiz) values
  ('stand', 'D01', 'pauschal', 1340000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D02', 'pauschal',  845000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D03', 'pauschal', 1340000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D04', 'pauschal',  428000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D05', 'pauschal',  428000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D06', 'pauschal',  845000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D07', 'pauschal',  845000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D08', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D09', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D10', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D11', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D12', 'pauschal',  564000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D13', 'pauschal',  564000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D14', 'pauschal',  845000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D15', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D16', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D17', 'pauschal',  496000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D18', 'pauschal', 1340000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D19', 'pauschal', 1257500, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D20', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D21', 'pauschal', 1092500, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D22', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'D23', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),

  -- Halle 550. Ключ — номер, подтверждённый Ксенией 26.08.2026 как договорный.
  ('stand', 'H01', 'pauschal',  428000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H02', 'pauschal',  496000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H03', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H04', 'pauschal',  615000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H05', 'pauschal',  615000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H06', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H07', 'pauschal',  377000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H10', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H11', 'pauschal',  445000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H12', 'pauschal',  812000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H13', 'pauschal',  445000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H14', 'pauschal',  445000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H15', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H16', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H17', 'pauschal', 1092500, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H18', 'pauschal', 1175000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H19', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H20', 'pauschal', 1092500, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H21', 'pauschal',  680000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H22', 'pauschal',  310000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H23', 'pauschal',  833000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H24', 'pauschal', 1173000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H25', 'pauschal', 1010000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H26', 'pauschal',  400000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),
  ('stand', 'H27', 'pauschal', 2000000, 'CHF', 'Preisliste 2027, netto · Nummerierung 26.08.2026'),

  -- StageOne. Kubus по 225 CHF/м², Showroom по 192 — наценка за место.
  ('stand', 'Kubus 1', 'pauschal', 1215000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Kubus 2', 'pauschal', 1215000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Kubus 3', 'pauschal', 1215000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Kubus 4', 'pauschal', 1215000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 1A', 'pauschal',  828000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 1B', 'pauschal',  362000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 2',  'pauschal', 1406000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 3',  'pauschal',  293000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 4',  'pauschal',  157000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 5',  'pauschal',  371000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 6',  'pauschal',  224000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 7',  'pauschal',  156500, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 8A', 'pauschal',  157000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 8B', 'pauschal',  389000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 9',  'pauschal',  225000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 10', 'pauschal',  157000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 11', 'pauschal',  572000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 12', 'pauschal',  225000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Galerie 13', 'pauschal',  157000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 1',   'pauschal',  572000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 2',   'pauschal',  176000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 2B',  'pauschal',  195000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 2C',  'pauschal',  897000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 3',   'pauschal',  545000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 4',   'pauschal',  410000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 5',   'pauschal',  197000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche E5A', 'pauschal',  254000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 6',   'pauschal',  458000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 7',   'pauschal',  457000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 8',   'pauschal',  264000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 9',   'pauschal',  361000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 10',  'pauschal',  225000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 11',  'pauschal',  490000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 12',  'pauschal',  545000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 13',  'pauschal',  632000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 14A', 'pauschal',  825000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 14B', 'pauschal',  920000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 15A', 'pauschal', 1640000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 15B', 'pauschal', 1690000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 16A', 'pauschal',  198000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 16B', 'pauschal',  137000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 17',  'pauschal',  570000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 18',  'pauschal',  835000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche E19', 'pauschal',  492000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 20',  'pauschal', 1690000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 21',  'pauschal',  835000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 22',  'pauschal', 2120000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 23',  'pauschal',  835000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 23 Erweiterung', 'pauschal', 371000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 24',  'pauschal',  633000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Fläche 25',  'pauschal', 1620000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 1',  'pauschal', 1109000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 2',  'pauschal',  960000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 3',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 4',  'pauschal', 1584000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 5',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 6',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 7',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 8',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 9',  'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)'),
  ('stand', 'Showroom 10', 'pauschal', 1267000, 'CHF', 'Preisliste 2027, netto (Datei vom 13.08.2026)')
on conflict (gilt_fuer, coalesce(schluessel, '')) do update set
  modell        = excluded.modell,
  betrag_rappen = excluded.betrag_rappen,
  waehrung      = excluded.waehrung,
  notiz         = excluded.notiz;
