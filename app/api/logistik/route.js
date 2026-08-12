import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { validateLogistik } from '../../../lib/logistik';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Экспонент оставляет заявку на подвоз, вывоз и парковку.
 *
 * Одна строка на компанию: заявка не история, а текущее состояние. Повторная
 * отправка переписывает её — так же, как заказ техники.
 */
export async function POST(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { ok, error, value } = validateLogistik(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data, error: dbError } = await supabaseAdmin
    .from('mz_logistik')
    .upsert(
      {
        ...value,
        company_id: auth.companyId,
        eingereicht_am: new Date().toISOString(),
      },
      { onConflict: 'company_id' }
    )
    .select('eingereicht_am')
    .maybeSingle();

  if (dbError) {
    console.error('logistik POST: не удалось записать', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: 'logistik_eingereicht',
  });

  return Response.json({ ok: true, eingereichtAm: data?.eingereicht_am || null });
}
