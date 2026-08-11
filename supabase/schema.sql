-- Схема портала экспонентов MOTO-ZÜRICH 2027 — этапы 1 и 2.
-- Применяется в ОТДЕЛЬНОМ проекте Supabase под MOTO-ZÜRICH.
--
-- Модель доступа: RLS включён на всех таблицах, политик НЕТ ни одной.
-- Значит из браузера с anon-ключом не читается и не пишется ничего — весь
-- доступ идёт через наши API-роуты с ключом service_role, который RLS обходит.
-- Обоснование выбора — docs/ARCHITEKTUR-PLAN.md, раздел «Аутентификация».
--
-- Язык предметной области немецкий (статусы, роли), потому что с этими
-- значениями работают люди с выставки, а не только код.
--
-- Файл идемпотентен: повторный запуск не ломает уже применённую схему.

-- ---------------------------------------------------------------------------
-- Вспомогательное
-- ---------------------------------------------------------------------------

-- Проставляет updated_at при каждом UPDATE. Иначе поле врёт: его забывают
-- обновить при ручной правке в дашборде, а именно ручная правка тут основная.
-- search_path зафиксирован пустым: иначе функция резолвит имена по search_path
-- вызывающей роли, и подсунутая раньше схема может подменить вызов. Пустой
-- путь безопасен — now(), lower() и btrim() живут в pg_catalog, который
-- просматривается всегда, а к таблицам эти функции не обращаются.
create or replace function public.mz_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Приводит адрес к нижнему регистру и убирает пробелы по краям.
-- Сделано триггером, а не ограничением: список допущенных ведут руками Ив и
-- Ксения через дашборд, и «Firma@Example.CH» должно просто заработать, а не
-- отвалиться с ошибкой про нарушение CHECK.
create or replace function public.mz_normalize_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email = lower(btrim(new.email));
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Компании-экспоненты
-- ---------------------------------------------------------------------------

create table if not exists public.mz_companies (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Stammdaten: для договора и счёта
  name            text not null,
  uid_nummer      text,
  strasse         text,
  ort             text,
  kontakt_name    text,
  kontakt_tel     text,
  rechnungs_email text,

  -- Verzeichniseintrag: то, что видит посетитель на сайте и в Event-Guide
  kategorie       text,
  website         text,
  brands          text[] not null default '{}',
  beschreibung    text,
  public_email    text,
  instagram       text,
  logo_path       text,

  status          text not null default 'interessent'
                  constraint mz_companies_status_check
                  check (status in ('interessent', 'angemeldet', 'bestaetigt', 'abgesagt'))
);

comment on table public.mz_companies is
  'Компании-экспоненты. Заводятся вручную Ивом и Ксенией по мере продажи стендов.';
comment on column public.mz_companies.status is
  'interessent → angemeldet → bestaetigt. abgesagt — отказались или сняты.';
comment on column public.mz_companies.beschreibung is
  'Описание для каталога, до 300 знаков. Длину проверяет приложение, не база: обрезать текст человеку по дороге нельзя, ему нужно сообщение об ошибке.';
comment on column public.mz_companies.logo_path is
  'Ключ файла в Supabase Storage, не публичная ссылка. Отдаём подписанной ссылкой на короткий срок.';

drop trigger if exists mz_companies_touch on public.mz_companies;
create trigger mz_companies_touch
  before update on public.mz_companies
  for each row execute function public.mz_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Кто допущен ко входу
-- ---------------------------------------------------------------------------

create table if not exists public.mz_allowlist (
  email         text primary key,
  company_id    uuid not null references public.mz_companies(id) on delete cascade,
  rolle         text not null default 'mitarbeiter'
                constraint mz_allowlist_rolle_check
                check (rolle in ('inhaber', 'mitarbeiter')),
  aktiv         boolean not null default true,
  eingeladen_am timestamptz not null default now(),
  notiz         text
);

comment on table public.mz_allowlist is
  'Адреса, которым разрешён вход. Ведут Ив и Ксения. Нет адреса в списке — кода на почту не отправляем вообще.';
comment on column public.mz_allowlist.aktiv is
  'false = доступ закрыт, но история сохранена. Для ушедшего сотрудника лучше снять флаг, чем удалять строку.';
comment on column public.mz_allowlist.email is
  'Приводится к нижнему регистру автоматически — вводить можно как удобно.';

create index if not exists mz_allowlist_company_idx on public.mz_allowlist (company_id);

drop trigger if exists mz_allowlist_normalize on public.mz_allowlist;
create trigger mz_allowlist_normalize
  before insert or update on public.mz_allowlist
  for each row execute function public.mz_normalize_email();

-- ---------------------------------------------------------------------------
-- Связь учётной записи с компанией
-- ---------------------------------------------------------------------------

-- Заполняется при первом входе: адрес есть в allowlist → к учётной записи
-- Supabase Auth привязывается компания из списка.
create table if not exists public.mz_company_members (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  company_id   uuid not null references public.mz_companies(id) on delete cascade,
  rolle        text not null default 'mitarbeiter',
  erster_login timestamptz not null default now()
);

comment on table public.mz_company_members is
  'Одна учётная запись — одна компания (user_id это первичный ключ). Если человек представляет две компании, ему нужны два адреса: так проще и безопаснее, чем переключатель компании в интерфейсе.';

create index if not exists mz_company_members_company_idx
  on public.mz_company_members (company_id);

-- ---------------------------------------------------------------------------
-- Площадки
-- ---------------------------------------------------------------------------

create table if not exists public.mz_stands (
  id         text primary key,
  halle      text not null
             constraint mz_stands_halle_check
             check (halle in ('Halle D', 'Halle 550', 'StageOne')),
  lage       text,
  breite_m   numeric(5,2) not null,
  tiefe_m    numeric(5,2) not null,
  flaeche_m2 numeric(7,2) generated always as (breite_m * tiefe_m) stored,
  pos_x      numeric(6,2) not null,
  pos_y      numeric(6,2) not null,
  status     text not null default 'frei'
             constraint mz_stands_status_check
             check (status in ('frei', 'reserviert', 'vergeben', 'gesperrt')),
  company_id uuid references public.mz_companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.mz_stands is
  'Каталог площадок с геометрией для плана залов. Идентификаторы как на плане: D09, H14.';
comment on column public.mz_stands.status is
  'frei — свободна · reserviert — забронирована по заявке · vergeben — продана · gesperrt — не продаётся (проход, склад).';
comment on column public.mz_stands.flaeche_m2 is
  'Считается базой из ширины и глубины. Вручную не заполнять — рассинхрон с планом залов был бы незаметен.';
comment on column public.mz_stands.pos_x is
  'Координата на плане в метрах, начало отсчёта — левый верхний угол зала.';

create index if not exists mz_stands_status_idx on public.mz_stands (status);
create index if not exists mz_stands_company_idx on public.mz_stands (company_id);

drop trigger if exists mz_stands_touch on public.mz_stands;
create trigger mz_stands_touch
  before update on public.mz_stands
  for each row execute function public.mz_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Заявки на площадку
-- ---------------------------------------------------------------------------

create table if not exists public.mz_stand_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  company_id    uuid not null references public.mz_companies(id) on delete cascade,
  stand_id      text references public.mz_stands(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,

  wunsch_text   text,
  status        text not null default 'neu'
                constraint mz_stand_requests_status_check
                check (status in ('neu', 'in_pruefung', 'offeriert', 'angenommen', 'abgelehnt')),
  notiz_intern  text
);

comment on table public.mz_stand_requests is
  'Заявка «Stand anfragen». Необязывающая: оферта и договор идут отдельно от Messeleitung.';
comment on column public.mz_stand_requests.stand_id is
  'Может опустеть, если площадку убрали из плана. Заявку при этом теряем не мы, а только привязку к конкретному месту.';
comment on column public.mz_stand_requests.notiz_intern is
  'Внутренняя пометка. Экспоненту не показывается ни при каких условиях.';

create index if not exists mz_stand_requests_company_idx on public.mz_stand_requests (company_id);
create index if not exists mz_stand_requests_status_idx on public.mz_stand_requests (status);

drop trigger if exists mz_stand_requests_touch on public.mz_stand_requests;
create trigger mz_stand_requests_touch
  before update on public.mz_stand_requests
  for each row execute function public.mz_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Журнал действий
-- ---------------------------------------------------------------------------

-- За компанию работают несколько человек. Без журнала на вопрос «кто удалил
-- заявку» ответа не существует, а спросят его обязательно.
create table if not exists public.mz_audit (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  company_id uuid references public.mz_companies(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  aktion     text not null,
  details    jsonb
);

comment on table public.mz_audit is
  'Кто что менял. Пишет приложение, не триггеры: смысл действия знает код, а не строка таблицы.';

create index if not exists mz_audit_company_idx on public.mz_audit (company_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Доступ: RLS без политик
-- ---------------------------------------------------------------------------

alter table public.mz_companies       enable row level security;
alter table public.mz_allowlist       enable row level security;
alter table public.mz_company_members enable row level security;
alter table public.mz_stands          enable row level security;
alter table public.mz_stand_requests  enable row level security;
alter table public.mz_audit           enable row level security;

-- Ни одной policy создавать НЕ НАДО. Отсутствие политик при включённом RLS
-- означает «никому ничего», и это здесь целевое состояние: читает и пишет
-- только сервер ключом service_role, который RLS не касается.
-- Появившаяся policy = дыра, поэтому инвариант закреплён тестом
-- tests/pgtap/rls_access.sql.

-- RLS не фильтрует TRUNCATE — забираем право отдельно.
revoke truncate on
  public.mz_companies,
  public.mz_allowlist,
  public.mz_company_members,
  public.mz_stands,
  public.mz_stand_requests,
  public.mz_audit
from anon, authenticated;
