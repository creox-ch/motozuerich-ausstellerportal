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
-- Сотрудники Messeleitung
-- ---------------------------------------------------------------------------

-- Отдельная таблица, а не роль в mz_allowlist: сотрудник не привязан
-- к компании и видит все. Смешать эти два понятия в одной таблице —
-- значит однажды выдать экспоненту права персонала одной опечаткой в роли.
create table if not exists public.mz_staff (
  email      text primary key,
  name       text,
  aktiv      boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.mz_staff is
  'Доступ к админке. Вход тем же кодом на почту, что у экспонентов, но ведёт в другое место.';
comment on column public.mz_staff.aktiv is
  'false = доступ закрыт, строка сохранена. Для ушедшего сотрудника снять флаг, а не удалять.';

drop trigger if exists mz_staff_normalize on public.mz_staff;
create trigger mz_staff_normalize
  before insert or update on public.mz_staff
  for each row execute function public.mz_normalize_email();

-- ---------------------------------------------------------------------------
-- Кто допущен ко входу
-- ---------------------------------------------------------------------------

create table if not exists public.mz_allowlist (
  email         text primary key,
  company_id    uuid not null references public.mz_companies(id) on delete cascade,
  rolle         text not null default 'mitarbeiter'
                constraint mz_allowlist_rolle_check
                check (rolle in ('inhaber', 'mitarbeiter')),
  aktiv           boolean not null default true,
  eingeladen_am   timestamptz not null default now(),
  letzter_code_am timestamptz,
  einladung_gesendet_am timestamptz,
  notiz           text
);

-- Файл рассчитан на повторный прогон, а таблицы создаются с if not exists —
-- значит на уже существующей базе новая колонка из create не появится.
-- Поэтому колонки, добавленные после первого применения схемы, дублируются
-- идемпотентным alter. Без него база и этот файл разъезжаются молча.
alter table public.mz_allowlist
  add column if not exists einladung_gesendet_am timestamptz;

comment on table public.mz_allowlist is
  'Адреса, которым разрешён вход. Ведут Ив и Ксения. Нет адреса в списке — кода на почту не отправляем вообще.';
comment on column public.mz_allowlist.aktiv is
  'false = доступ закрыт, но история сохранена. Для ушедшего сотрудника лучше снять флаг, чем удалять строку.';
comment on column public.mz_allowlist.email is
  'Приводится к нижнему регистру автоматически — вводить можно как удобно.';
comment on column public.mz_allowlist.letzter_code_am is
  'Время последней отправки кода. Ставит приложение; между кодами на один адрес выдерживается минута.';
comment on column public.mz_allowlist.einladung_gesendet_am is
  'Когда ушло письмо-приглашение. Доступ выдаётся уже оплатившему, поэтому выдача доступа и есть повод для письма.';

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
-- Цены на площадки
-- ---------------------------------------------------------------------------

-- Цена живёт данными, а не разметкой: появление настоящих сумм должно быть
-- заполнением этой таблицы, а не задачей на разработку и деплой.
--
-- Правило выбирается от частного к общему: конкретная площадка → расположение
-- → зал → все. Побеждает самое частное из подходящих (см. lib/pricing.js).
create table if not exists public.mz_preise (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  gilt_fuer     text not null
                constraint mz_preise_gilt_fuer_check
                check (gilt_fuer in ('stand', 'lage', 'halle', 'alle')),
  schluessel    text,
  modell        text
                constraint mz_preise_modell_check
                check (modell is null or modell in ('pro_m2', 'pauschal')),

  -- NULL разрешён намеренно: «цена ещё не назначена» — рабочее состояние,
  -- а не пробел в данных. Ноль означал бы «бесплатно», и это другое.
  betrag_rappen bigint
                constraint mz_preise_betrag_check
                check (betrag_rappen is null or betrag_rappen >= 0),
  waehrung      text not null default 'CHF',
  notiz         text
);

comment on table public.mz_preise is
  'Правила цен на площади. Пока модель и суммы бизнесом не заданы, таблица держит заглушку с пустой суммой — интерфейс показывает XX.';
comment on column public.mz_preise.schluessel is
  'Для gilt_fuer=stand это id площадки (D09), для lage — расположение, для halle — название зала, для alle — пусто.';
comment on column public.mz_preise.modell is
  'pro_m2 — за квадратный метр площади · pauschal — за место целиком. NULL, пока не решили.';
comment on column public.mz_preise.betrag_rappen is
  'NULL = цена ещё не определена (интерфейс покажет XX). Ноль означал бы «бесплатно».';

-- Одно правило на область действия. coalesce, а не просто (gilt_fuer,
-- schluessel): NULL в уникальном индексе не равен другому NULL, и без него
-- строк с gilt_fuer='alle' можно было бы завести сколько угодно — а какая
-- из них применится, стало бы делом случая.
create unique index if not exists mz_preise_scope_idx
  on public.mz_preise (gilt_fuer, coalesce(schluessel, ''));

drop trigger if exists mz_preise_touch on public.mz_preise;
create trigger mz_preise_touch
  before update on public.mz_preise
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
-- Заявки с публичного плана залов
-- ---------------------------------------------------------------------------

-- Не дубликат mz_stand_requests, хотя выглядит похоже. Разница в том, кто
-- пишет: сюда — посторонний человек с витрины, у которого нет ни учётной
-- записи, ни компании в базе; в mz_stand_requests — уже вошедший экспонент
-- из кабинета. Отсюда и company_id, который заполняется задним числом, когда
-- по заявке завели компанию.
--
-- Свести их в одну таблицу значило бы либо разрешить строки без компании
-- в кабинете, либо требовать компанию от того, кто её ещё не имеет.
create table if not exists public.mz_anfragen (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  stand_id     text references public.mz_stands(id) on delete set null,

  firma        text,
  name         text,
  email        text not null,
  telefon      text,
  nachricht    text,

  consent      boolean not null default false
               constraint mz_anfragen_consent_check check (consent = true),

  status       text not null default 'neu'
               constraint mz_anfragen_status_check
               check (status in ('neu', 'in_bearbeitung', 'offeriert',
                                 'gewonnen', 'verloren', 'spam')),

  company_id   uuid references public.mz_companies(id) on delete set null,
  notiz_intern text,
  quelle       jsonb
);

comment on table public.mz_anfragen is
  'Заявки на площадь с публичной страницы плана залов. Автор ещё не экспонент: ни учётной записи, ни компании в базе у него нет.';
comment on column public.mz_anfragen.consent is
  'Ограничение допускает только true: заявка без согласия не сохраняется в принципе.';
comment on column public.mz_anfragen.company_id is
  'Заполняется, когда по заявке завели компанию — связь лида с результатом.';
comment on column public.mz_anfragen.notiz_intern is
  'Внутренняя пометка. Заявителю не показывается ни при каких условиях.';
comment on column public.mz_anfragen.quelle is
  'UTM и адрес страницы. Разбирает сервер, клиенту не доверяем.';

-- По lower(email), а не по email: адрес нормализует триггер, но искать
-- «все заявки от этого человека» приходится и по тому, что ввели руками.
create index if not exists mz_anfragen_email_idx on public.mz_anfragen (lower(email));
create index if not exists mz_anfragen_stand_idx on public.mz_anfragen (stand_id);
create index if not exists mz_anfragen_status_idx
  on public.mz_anfragen (status, created_at desc);

drop trigger if exists mz_anfragen_normalize on public.mz_anfragen;
create trigger mz_anfragen_normalize
  before insert or update on public.mz_anfragen
  for each row execute function public.mz_normalize_email();

drop trigger if exists mz_anfragen_touch on public.mz_anfragen;
create trigger mz_anfragen_touch
  before update on public.mz_anfragen
  for each row execute function public.mz_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Техника и услуги к стенду
-- ---------------------------------------------------------------------------

-- Три таблицы на один сценарий: что можно заказать (каталог), сколько чего
-- заказали (позиции) и сам заказ целиком (примечание и факт отправки).
--
-- Разделы Technik и Marketing устроены одинаково — набор позиций, черновик,
-- отправка, условия с подтверждением, — поэтому механика одна, а раздел
-- различается колонкой bereich. Две параллельные механики разошлись бы
-- на первой же правке.

create table if not exists public.mz_service_katalog (
  id           text primary key,
  bezeichnung  text not null,
  beschreibung text,
  einheit      text not null default 'Stück',

  preis_rappen bigint
               constraint mz_service_preis_check
               check (preis_rappen is null or preis_rappen >= 0),

  sortierung   integer not null default 100,
  aktiv        boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  bereich      text not null default 'technik'
               constraint mz_service_bereich_check
               check (bereich in ('technik', 'marketing'))
);

-- Раздел Marketing появился позже техники, а таблица создаётся с if not
-- exists — на уже применённой базе колонка из create не появилась бы.
-- Тот же приём, что у mz_allowlist.einladung_gesendet_am.
alter table public.mz_service_katalog
  add column if not exists bereich text not null default 'technik';

comment on table public.mz_service_katalog is
  'Что экспонент может заказать: техника и рекламные форматы. Ведёт Messeleitung.';
comment on column public.mz_service_katalog.preis_rappen is
  'NULL = цена не определена, интерфейс покажет XX. Условия приходят с подтверждением заказа.';
comment on column public.mz_service_katalog.aktiv is
  'false — позиция больше не предлагается, но остаётся в уже собранных заказах.';
comment on column public.mz_service_katalog.bereich is
  'Раздел портала, в котором показывается позиция.';

drop trigger if exists mz_service_katalog_touch on public.mz_service_katalog;
create trigger mz_service_katalog_touch
  before update on public.mz_service_katalog
  for each row execute function public.mz_touch_updated_at();

-- Заказ компании по разделу. Ключ составной: у одной компании свой заказ
-- в технике и свой в рекламе, и отправляются они независимо.
create table if not exists public.mz_service_auftraege (
  company_id     uuid not null references public.mz_companies(id) on delete cascade,
  bemerkung      text,
  eingereicht_am timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  bereich        text not null default 'technik'
                 constraint mz_service_auftraege_bereich_check
                 check (bereich in ('technik', 'marketing')),

  primary key (company_id, bereich)
);

alter table public.mz_service_auftraege
  add column if not exists bereich text not null default 'technik';

comment on table public.mz_service_auftraege is
  'Заказ компании по разделу: примечание и факт отправки. Сами позиции — в mz_service_positionen.';
comment on column public.mz_service_auftraege.eingereicht_am is
  'NULL — черновик, экспонент ещё правит. Заполнено — заказ отправлен Messeleitung.';

drop trigger if exists mz_service_auftraege_touch on public.mz_service_auftraege;
create trigger mz_service_auftraege_touch
  before update on public.mz_service_auftraege
  for each row execute function public.mz_touch_updated_at();

-- Количества по позициям каталога.
create table if not exists public.mz_service_positionen (
  company_id  uuid not null references public.mz_companies(id) on delete cascade,

  -- Без on delete: позицию, которую уже кто-то заказал, удалять нельзя.
  -- Чтобы убрать её из предложения, есть mz_service_katalog.aktiv = false —
  -- тогда собранные заказы остаются читаемыми.
  position_id text not null references public.mz_service_katalog(id),

  menge       integer not null default 0
              constraint mz_service_menge_check check (menge >= 0),
  updated_at  timestamptz not null default now(),

  primary key (company_id, position_id)
);

comment on table public.mz_service_positionen is
  'Сколько чего заказано. Строка с menge = 0 означает «позицию видели и не взяли» — это не то же самое, что её отсутствие.';

drop trigger if exists mz_service_positionen_touch on public.mz_service_positionen;
create trigger mz_service_positionen_touch
  before update on public.mz_service_positionen
  for each row execute function public.mz_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Документы и счета
-- ---------------------------------------------------------------------------

-- Файлы идут ОТ нас экспоненту: AGB, Merkblatt, план монтажа — и счета.
--
-- Счёт за площадь сюда попадает уже оплаченным: доступ в портал выдают после
-- оплаты. А вот за дополнительные заказы — технику, рекламу, парковку —
-- счета выставляются уже здесь, поэтому раздел рабочий, а не архивный.
create table if not exists public.mz_dokumente (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  company_id    uuid references public.mz_companies(id) on delete cascade,
  art           text not null default 'dokument'
                constraint mz_dokumente_art_check
                check (art in ('dokument', 'rechnung')),

  titel         text not null,
  pfad          text not null,
  dateiname     text not null,
  groesse_bytes bigint,

  -- Только для счетов
  betrag_rappen bigint,
  faellig_am    date,
  bezahlt_am    timestamptz,

  hochgeladen_von text,

  -- Счёт всегда адресный: «счёт всем экспонентам» — бессмыслица, а строка
  -- без компании раздала бы его каждому, кто откроет раздел.
  constraint mz_dokumente_rechnung_hat_firma
    check (art <> 'rechnung' or company_id is not null),

  -- Поля счёта у обычного документа означают, что кто-то выбрал не тот тип.
  -- Лучше отказ при вставке, чем сумма, которую в разделе никто не покажет.
  constraint mz_dokumente_nur_rechnung_hat_betrag
    check (art = 'rechnung'
           or (betrag_rappen is null and faellig_am is null and bezahlt_am is null))
);

comment on table public.mz_dokumente is
  'Файлы от Messeleitung экспоненту. company_id пустой = документ для всех участников.';
comment on column public.mz_dokumente.company_id is
  'Пусто — документ общий (AGB, Merkblatt). Заполнено — адресный документ или счёт, виден только этой компании.';
comment on column public.mz_dokumente.pfad is
  'Ключ в приватном бакете. Наружу файл уходит только подписанной ссылкой после проверки прав.';
comment on column public.mz_dokumente.betrag_rappen is
  'Сумма в раппенах, как на платформе (100 = 1.00 CHF). Целые числа, чтобы не копить ошибку округления.';
comment on column public.mz_dokumente.bezahlt_am is
  'Ставит Messeleitung вручную: приёма платежей в портале нет и по текущему сценарию не требуется.';

create index if not exists mz_dokumente_company_idx
  on public.mz_dokumente (company_id, created_at desc);
create index if not exists mz_dokumente_art_idx on public.mz_dokumente (art);

-- ---------------------------------------------------------------------------
-- Переписка с Messeleitung
-- ---------------------------------------------------------------------------

-- Одна лента на компанию, без тем и веток. У выставки десятки экспонентов
-- и один адресат с нашей стороны — ветки здесь были бы формой без содержания.
create table if not exists public.mz_nachrichten (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  company_id  uuid not null references public.mz_companies(id) on delete cascade,
  von         text not null
              constraint mz_nachrichten_von_check
              check (von in ('aussteller', 'messeleitung')),

  autor_email text,
  user_id     uuid references auth.users(id) on delete set null,
  text        text not null
);

comment on table public.mz_nachrichten is
  'Переписка компании с Messeleitung. Отметки «прочитано» намеренно нет: непрочитанным считается то, на что мы ещё не ответили, и это видно по последнему сообщению.';
comment on column public.mz_nachrichten.autor_email is
  'Кто написал. За компанию работают несколько человек, и «кто-то из фирмы» — недостаточный ответ.';

create index if not exists mz_nachrichten_company_idx
  on public.mz_nachrichten (company_id, created_at desc);

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

-- Список обязан покрывать ВСЕ таблицы mz_*. Забытая строка означает таблицу,
-- открытую наружу с anon-ключом; тест tests/pgtap/rls_access.sql идёт по всем
-- mz_* и краснеет на любой пропущенной.
alter table public.mz_companies           enable row level security;
alter table public.mz_staff               enable row level security;
alter table public.mz_allowlist           enable row level security;
alter table public.mz_company_members     enable row level security;
alter table public.mz_stands              enable row level security;
alter table public.mz_preise              enable row level security;
alter table public.mz_stand_requests      enable row level security;
alter table public.mz_anfragen            enable row level security;
alter table public.mz_service_katalog     enable row level security;
alter table public.mz_service_auftraege   enable row level security;
alter table public.mz_service_positionen  enable row level security;
alter table public.mz_dokumente           enable row level security;
alter table public.mz_nachrichten         enable row level security;
alter table public.mz_audit               enable row level security;

-- Ни одной policy создавать НЕ НАДО. Отсутствие политик при включённом RLS
-- означает «никому ничего», и это здесь целевое состояние: читает и пишет
-- только сервер ключом service_role, который RLS не касается.
-- Появившаяся policy = дыра, поэтому инвариант закреплён тестом
-- tests/pgtap/rls_access.sql.

-- RLS не фильтрует TRUNCATE — забираем право отдельно.
revoke truncate on
  public.mz_companies,
  public.mz_staff,
  public.mz_allowlist,
  public.mz_company_members,
  public.mz_stands,
  public.mz_preise,
  public.mz_stand_requests,
  public.mz_anfragen,
  public.mz_service_katalog,
  public.mz_service_auftraege,
  public.mz_service_positionen,
  public.mz_dokumente,
  public.mz_nachrichten,
  public.mz_audit
from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Хранилище файлов
-- ---------------------------------------------------------------------------

-- Один приватный бакет на всё: логотипы компаний (mz_companies.logo_path) и
-- документы со счетами (mz_dokumente.pfad). Раскладка путей по слотам описана
-- в docs/ARCHITEKTUR-PLAN.md.
--
-- Заводится здесь, а не руками в дашборде. Раньше шага не было вовсе, и на
-- чистом проекте таблицы поднимались все, а первая же загрузка логотипа
-- падала: имя бакета лежит в lib/storage.js и по коду выглядит существующим.
--
-- public = false — принципиально. Наружу файл уходит только подписанной
-- ссылкой на короткий срок и только после проверки прав в нашем роуте;
-- публичный бакет раздавал бы счета по прямой ссылке кому угодно.
--
-- do nothing, а не do update: лимит и настройки бакета ведёт эксплуатация,
-- и перезатирать их прогоном схемы файл не вправе.
insert into storage.buckets (id, name, public, file_size_limit)
values ('ausstellerportal', 'ausstellerportal', false, 20971520)  -- 20 МБ
on conflict (id) do nothing;

-- Политик на storage.objects тоже НЕ создаём: модель та же, что у таблиц —
-- браузер в хранилище не ходит, читает и пишет сервер ключом service_role.
