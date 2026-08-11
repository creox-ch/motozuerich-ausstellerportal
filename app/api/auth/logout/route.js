import { supabaseSession } from '../../../../lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Выход. Только POST: по GET-ссылке браузер или почтовый клиент выкинул бы
 * человека из портала при предпросмотре ссылки.
 */
export async function POST() {
  try {
    await supabaseSession().auth.signOut();
  } catch (e) {
    // Выход должен получаться всегда. Даже если Supabase недоступен, cookie
    // уже помечена на удаление клиентом — оставлять человека внутри нельзя.
    console.error('logout: signOut упал', e);
  }
  return Response.json({ ok: true });
}
