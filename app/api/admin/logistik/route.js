import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Messeleitung назначает окна подвоза и вывоза. */
export async function PATCH(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const companyId = typeof body.company_id === 'string' ? body.company_id.trim() : '';
  if (!/^[0-9a-f-]{36}$/i.test(companyId)) {
    return Response.json({ ok: false, error: 'Firma ist nicht ausgewählt.' }, { status: 400 });
  }

  const feld = (v) => (typeof v === 'string' ? v.trim().slice(0, 120) : '');
  const anFenster = feld(body.an_fenster);
  const abFenster = feld(body.ab_fenster);

  const { data, error } = await supabaseAdmin
    .from('mz_logistik')
    .update({
      an_fenster: anFenster || null,
      ab_fenster: abFenster || null,
      // Метка ставится, только когда назначено хоть одно окно: пустая
      // «назначено в 14:12» без самих окон вводит в заблуждение сильнее,
      // чем её отсутствие.
      zugeteilt_am: anFenster || abFenster ? new Date().toISOString() : null,
    })
    .eq('company_id', companyId)
    .select('company_id, an_fenster, ab_fenster, zugeteilt_am')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ ok: false, error: 'Anmeldung nicht gefunden.' }, { status: 400 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: companyId,
    user_id: auth.user.id,
    aktion: 'logistik_zugeteilt',
    details: { an: data.an_fenster, ab: data.ab_fenster },
  });

  return Response.json({ ok: true, logistik: data });
}
