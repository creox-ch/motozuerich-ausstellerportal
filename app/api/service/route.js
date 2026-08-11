import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { normalizeOrder } from '../../../lib/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Сохранение заказа техники.
 *
 * Компания — из сессии, позиции сверяются с каталогом. Клиент влияет только
 * на количества: ни идентификатор компании, ни состав каталога он задать
 * не может.
 */
export async function PUT(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { data: katalog, error: katalogError } = await supabaseAdmin
    .from('mz_service_katalog')
    .select('id')
    .eq('aktiv', true);

  if (katalogError) {
    console.error('service PUT: каталог не прочитался', katalogError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const result = normalizeOrder(body.mengen, (katalog || []).map((k) => k.id));
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  const { error: posError } = await supabaseAdmin.from('mz_service_positionen').upsert(
    result.positionen.map((p) => ({ ...p, company_id: auth.companyId })),
    { onConflict: 'company_id,position_id' }
  );

  if (posError) {
    console.error('service PUT: позиции не сохранились', posError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Отправка — отдельное действие, а не побочный эффект сохранения:
  // экспонент собирает заказ в несколько заходов, и «сохранить» не должно
  // означать «отправить».
  const einreichen = body.einreichen === true;
  const auftrag = {
    company_id: auth.companyId,
    bemerkung: typeof body.bemerkung === 'string' ? body.bemerkung.trim().slice(0, 2000) : '',
  };
  if (einreichen) auftrag.eingereicht_am = new Date().toISOString();

  const { error: auftragError } = await supabaseAdmin
    .from('mz_service_auftraege')
    .upsert(auftrag, { onConflict: 'company_id' });

  if (auftragError) {
    console.error('service PUT: конверт заказа не сохранился', auftragError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: einreichen ? 'service_eingereicht' : 'service_gespeichert',
    details: { positionen: result.positionen.filter((p) => p.menge > 0).length },
  });

  return Response.json({ ok: true, eingereicht: einreichen });
}
