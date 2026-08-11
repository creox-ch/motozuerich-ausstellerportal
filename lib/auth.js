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
