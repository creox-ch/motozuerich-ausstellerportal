-- Цены на площади. Запускать ПОСЛЕ supabase/schema.sql.
--
-- Источник: `Preise_Leistungen.xlsx` от Messeleitung, 13.08.2026.
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
-- Чего здесь пока нет
-- ---------------------------------------------------------------------------
--
-- Halle 550 и StageOne. Цены на них в прайсе есть, но каталог площадок для них
-- ещё не настоящий (см. supabase/seed-stands.sql), а привязывать цену к
-- выдуманной площадке бессмысленно. Правило `alle` с пустой суммой оставлено
-- запасным: для площадок без своей цены интерфейс покажет красное XX.
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
  ('stand', 'D01', 'pauschal', 1340000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D02', 'pauschal',  845000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D03', 'pauschal', 1340000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D04', 'pauschal',  428000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D05', 'pauschal',  428000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D06', 'pauschal',  845000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D07', 'pauschal',  845000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D08', 'pauschal',  400000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D09', 'pauschal',  400000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D10', 'pauschal',  680000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D11', 'pauschal',  680000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D12', 'pauschal',  564000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D13', 'pauschal',  564000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D14', 'pauschal',  845000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D15', 'pauschal',  400000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D16', 'pauschal',  400000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D17', 'pauschal',  496000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D18', 'pauschal', 1340000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D19', 'pauschal', 1257500, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D20', 'pauschal',  680000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D21', 'pauschal', 1092500, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D22', 'pauschal',  680000, 'CHF', 'Preisliste 13.08.2026, netto'),
  ('stand', 'D23', 'pauschal',  680000, 'CHF', 'Preisliste 13.08.2026, netto')
on conflict (gilt_fuer, coalesce(schluessel, '')) do update set
  modell        = excluded.modell,
  betrag_rappen = excluded.betrag_rappen,
  waehrung      = excluded.waehrung,
  notiz         = excluded.notiz;
