-- Удаление технических тестовых данных ПЕРЕД БОЕВЫМ ЗАПУСКОМ.
--
-- Запускать один раз, когда в портал начнут заходить настоящие компании.
-- До этого технический доступ нужен: без него невозможно проверить ни вход,
-- ни кабинет — а проверять их приходится после каждой правки.
--
-- Что здесь остаётся жить до самого запуска:
--   компания «Testfirma Creox AG (интеграционная проверка)»
--   доступ assistant@creox.ch
--
-- Признак технических записей — домен creox.ch в списке допущенных.
-- Если в mz_allowlist появился хоть один адрес НЕ с этого домена, значит
-- в портале уже настоящие люди, и заодно проверьте, что Datenschutz
-- прошёл юридическую проверку.

begin;

-- Учётная запись в Supabase Auth удаляется отдельно, из дашборда:
-- Authentication → Users → assistant@creox.ch. Из SQL это делать нельзя.

delete from public.mz_audit
 where company_id in (
   select company_id from public.mz_allowlist where email like '%@creox.ch'
 );

delete from public.mz_company_members
 where company_id in (
   select company_id from public.mz_allowlist where email like '%@creox.ch'
 );

update public.mz_stands
   set status = 'frei', company_id = null
 where company_id in (
   select company_id from public.mz_allowlist where email like '%@creox.ch'
 );

delete from public.mz_companies
 where id in (
   select company_id from public.mz_allowlist where email like '%@creox.ch'
 );

delete from public.mz_allowlist where email like '%@creox.ch';

-- Проверка: должно остаться только настоящее
select
  (select count(*) from public.mz_companies) as companies,
  (select count(*) from public.mz_allowlist) as allowlist,
  (select count(*) from public.mz_anfragen)  as anfragen;

commit;
