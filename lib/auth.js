import { redirect } from 'next/navigation';
import { supabaseSession } from './supabase-server';
import { supabaseAdmin } from './supabase';

/**
 * Единственная точка, где решается «кто это и что ему можно».
 *
 * Правило проекта: ни один роут не обращается к данным компании, не пройдя
 * через requireCompany. Разложенная по роутам проверка прав — это способ
 * однажды её забыть в одном месте из двадцати и не заметить.
 */

/**
 * Кто пришёл. Возвращает пользователя Supabase Auth или null.
 * Проверяет подпись токена на стороне Supabase, а не верит cookie на слово.
 */
export async function currentUser() {
  const supabase = supabaseSession();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Кто пришёл и от какой компании.
 *
 * @returns {Promise<{user: object, companyId: string, rolle: string}|null>}
 */
export async function currentCompany() {
  const user = await currentUser();
  if (!user) return null;

  const { data, error } = await supabaseAdmin
    .from('mz_company_members')
    .select('company_id, rolle')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return { user, companyId: data.company_id, rolle: data.rolle };
}

/**
 * Сотрудник Messeleitung или null.
 *
 * Персонал живёт в отдельной таблице, а не ролью в списке допущенных:
 * сотрудник не привязан к компании и видит все. Смешать эти два понятия
 * в одной таблице — значит однажды выдать экспоненту права персонала
 * одной опечаткой в поле роли.
 */
export async function currentStaff() {
  const user = await currentUser();
  if (!user?.email) return null;

  const { data, error } = await supabaseAdmin
    .from('mz_staff')
    .select('email, name, aktiv')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (error || !data || !data.aktiv) return null;
  return { user, email: data.email, name: data.name };
}

/**
 * Гард для роутов админки.
 *
 * Экспонент, вошедший в свой кабинет, здесь получает 403: он аутентифицирован,
 * но это не его дверь. Различие с 401 важно — иначе в логах не отличить
 * «сессия истекла» от «ломится не туда».
 */
export async function requireStaff() {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json({ ok: false, error: 'nicht angemeldet' }, { status: 401 }),
    };
  }

  const staff = await currentStaff();
  if (!staff) {
    return {
      ok: false,
      response: Response.json({ ok: false, error: 'kein Zugang' }, { status: 403 }),
    };
  }

  return { ok: true, user, email: staff.email, name: staff.name };
}

/** Гард для страниц админки. Не сотрудник — уводим на вход, а не показываем. */
export async function requirePageStaff() {
  const staff = await currentStaff();
  if (!staff) redirect('/');
  return staff;
}

/**
 * Гард для страниц кабинета. Возвращает контекст компании или уводит на вход.
 *
 * Вызывать в КАЖДОЙ странице кабинета, а не только в layout. В Next 14 layout
 * и page рендерятся параллельно: решение layout перенаправить не мешает
 * странице выполниться и упасть на пустой сессии. Проверено — именно так
 * и произошло.
 */
export async function requirePageCompany() {
  const session = await currentCompany();
  if (!session) redirect('/');
  return session;
}

/**
 * Гард для роутов. Возвращает либо контекст компании, либо готовый ответ,
 * который роут должен вернуть немедленно.
 *
 * Различаем 401 и 403 намеренно: «ты не вошёл» и «ты вошёл, но это не твоё» —
 * разные ситуации и для человека, и для отладки.
 *
 * @returns {Promise<{ok: true, user: object, companyId: string, rolle: string}
 *                  |{ok: false, response: Response}>}
 */
export async function requireCompany() {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { ok: false, error: 'nicht angemeldet' },
        { status: 401 }
      ),
    };
  }

  const { data, error } = await supabaseAdmin
    .from('mz_company_members')
    .select('company_id, rolle')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('requireCompany: не удалось прочитать членство', error);
    return {
      ok: false,
      response: Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 }),
    };
  }

  // Вошёл, но компания не привязана: адрес убрали из списка допущенных уже
  // после входа, либо привязка не создалась. Данных показывать нельзя.
  if (!data) {
    return {
      ok: false,
      response: Response.json(
        { ok: false, error: 'kein Zugang zu einem Ausstellerkonto' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user, companyId: data.company_id, rolle: data.rolle };
}
