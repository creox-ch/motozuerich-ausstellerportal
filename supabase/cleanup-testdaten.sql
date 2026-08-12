-- Удаление технических тестовых данных ПЕРЕД БОЕВЫМ ЗАПУСКОМ.
--
-- Запускать один раз, когда в портал начнут заходить настоящие компании.
-- До этого технический доступ нужен: без него невозможно проверить ни вход,
-- ни кабинет — а проверять их приходится после каждой правки.
--
-- ⚠️ ВАЖНО: скрипт НЕ трогает таблицу mz_staff. Сотрудники Messeleitung
-- сидят на домене creox.ch (assistant@, main@) — это настоящие рабочие
-- адреса, а не тестовые. Раньше здесь признаком тестовых данных был сам
-- домен creox.ch; после появления персонала это правило стало неверным
-- и заменено явным списком.
--
-- Что удаляется: технический доступ экспонента и его компания.
--   test-aussteller@creox.ch → «Testfirma Creox AG (интеграционная проверка)»
--
-- Как понять, что в портале уже настоящие люди: в mz_allowlist есть хоть
-- один адрес, кроме test-aussteller@creox.ch. Если так — заодно проверьте,
-- что Datenschutz прошёл юридическую вычитку (docs/rechtliches-review.md).

begin;

-- Учётные записи в Supabase Auth удаляются отдельно, из дашборда:
-- Authentication → Users. Из SQL это делать нельзя.

create temporary table _test_firmen on commit drop as
  select company_id as id from public.mz_allowlist
   where email = 'test-aussteller@creox.ch';

delete from public.mz_audit            where company_id in (select id from _test_firmen);
delete from public.mz_service_positionen where company_id in (select id from _test_firmen);
delete from public.mz_service_auftraege  where company_id in (select id from _test_firmen);
delete from public.mz_stand_requests   where company_id in (select id from _test_firmen);
delete from public.mz_company_members  where company_id in (select id from _test_firmen);

update public.mz_stands
   set status = 'frei', company_id = null
 where company_id in (select id from _test_firmen);

delete from public.mz_allowlist where email = 'test-aussteller@creox.ch';
delete from public.mz_companies where id in (select id from _test_firmen);

-- Проверка: должно остаться только настоящее
select
  (select count(*) from public.mz_companies) as companies,
  (select count(*) from public.mz_allowlist) as allowlist,
  (select count(*) from public.mz_anfragen)  as anfragen,
  (select count(*) from public.mz_staff)     as staff_bleibt;

commit;
