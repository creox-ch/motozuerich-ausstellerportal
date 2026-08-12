import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { validateAktivitaet } from '../../../lib/aktivitaeten';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Экспонент подаёт активность в программу. */
export async function POST(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { ok, error, value } = validateAktivitaet(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_aktivitaeten')
    .insert({ ...value, company_id: auth.companyId, user_id: auth.user.id })
    .select('id, titel, format, beschreibung, tage, zeiten, ort, bedarf, status, created_at')
    .maybeSingle();

  if (dbError || !row) {
    console.error('aktivitaeten POST: не удалось записать', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  return Response.json({ ok: true, aktivitaet: row });
}

/**
 * Отзыв заявки.
 *
 * Удаляем только свою и только пока её не рассмотрели: принятая активность
 * уже стоит в программе и в вёрстке Event-Guide, и убрать её оттуда молча
 * нельзя — для этого есть переписка с Messeleitung.
 */
export async function DELETE(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ ok: false, error: 'Aktivität nicht gefunden.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('mz_aktivitaeten')
    .delete()
    .eq('id', id)
    // Компания из сессии — иначе чужую заявку можно снять, зная её id.
    .eq('company_id', auth.companyId)
    .eq('status', 'eingereicht')
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return Response.json(
      { ok: false, error: 'Nicht gefunden oder bereits bearbeitet.' },
      { status: 400 }
    );
  }

  return Response.json({ ok: true });
}
