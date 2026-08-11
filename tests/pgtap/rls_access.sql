-- ============================================================
-- pgTAP: модель доступа портала экспонентов
--
-- Инвариант (см. supabase/schema.sql):
--   RLS включён на всех таблицах mz_*, политик НЕТ ни одной → из браузера
--   с anon-ключом не читается и не пишется ничего. Весь доступ идёт через
--   наши API-роуты ключом service_role, который RLS обходит.
--
-- Что ловят эти тесты: появление permissive policy «чтобы быстро посмотреть
-- из фронта», забытый RLS на новой таблице, возврат TRUNCATE публичным ролям.
-- Любое из этих изменений — утечка данных одной компании другой.
--
-- Проверки структурные, то есть идут по ВСЕМ таблицам с префиксом mz_.
-- Новая таблица покрывается автоматически: забыли включить на ней RLS —
-- тест краснеет, дописывать его не нужно.
--
-- ЗАПУСК (всё внутри BEGIN/ROLLBACK — боевые данные не меняются):
--   psql:                psql "$DATABASE_URL" -f tests/pgtap/rls_access.sql
--   pg_prove:            pg_prove -d "$DATABASE_URL" tests/pgtap/rls_access.sql
--   Supabase SQL Editor: вставить и Run, TAP-строки видно построчно
-- ============================================================

begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

-- 0: защита от пустой проверки.
-- Без этого теста все структурные проверки ниже прошли бы «успешно» на пустом
-- множестве — например если схему не применили или переименовали префикс.
select cmp_ok(
  (select count(*)::int from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'mz\_%'),
  '>=', 6,
  'схема применена: таблиц mz_* не меньше шести');

-- 1: RLS включён везде
select is(
  (select count(*)::int from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and c.relname like 'mz\_%' and not c.relrowsecurity),
  0,
  'нет ни одной таблицы mz_* без RLS');

-- 2: ни одной policy
select is(
  (select count(*)::int from pg_policies
    where schemaname = 'public' and tablename like 'mz\_%'),
  0,
  'нет ни одной RLS-policy на mz_* (deny-all)');

-- 3-7: поведенчески от лица anon
set local role anon;

-- Контроль: убеждаемся, что смена роли действительно произошла.
-- Без него проверки «anon не читает» проходят и от лица владельца базы —
-- таблицы пустые, читать нечего, и тест зелёный при полностью открытом доступе.
select is(current_user::text, 'anon',
  'проверка идёт действительно от лица anon');

select is_empty('select 1 from public.mz_companies',
  'anon НЕ читает mz_companies');

-- Список допущенных — самая чувствительная таблица: это перечень рабочих
-- адресов компаний, готовый материал для фишинга по экспонентам.
select is_empty('select 1 from public.mz_allowlist',
  'anon НЕ читает mz_allowlist');

select throws_ok(
  $$insert into public.mz_allowlist(email, company_id)
    values ('pgtap-probe@example.ch', gen_random_uuid())$$,
  '42501', null,
  'anon НЕ пишет в mz_allowlist (RLS)');

select throws_ok(
  $$insert into public.mz_stand_requests(company_id) values (gen_random_uuid())$$,
  '42501', null,
  'anon НЕ пишет в mz_stand_requests (RLS)');

reset role;

-- 7-8: TRUNCATE снят у публичных ролей — RLS его не фильтрует
select ok(
  not exists (
    select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'mz\_%'
       and has_table_privilege('anon', c.oid, 'TRUNCATE')),
  'anon: нет TRUNCATE ни на одной mz_*');

select ok(
  not exists (
    select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'mz\_%'
       and has_table_privilege('authenticated', c.oid, 'TRUNCATE')),
  'authenticated: нет TRUNCATE ни на одной mz_*');

select * from finish();

rollback;
