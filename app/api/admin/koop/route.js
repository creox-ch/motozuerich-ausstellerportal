import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { STATUS } from '../../../../lib/koop';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Messeleitung проверяет подтверждение.
 *
 * При подтверждении баллы записываются снимком из каталога. Хранить ссылку
 * на каталог мало: правка меры задним числом изменила бы уже начисленное,
 * и экспонент увидел бы, что скидка усохла сама собой.
 */
export async function PATCH(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ ok: false, error: 'Nachweis nicht gefunden.' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!STATUS.includes(status)) {
    return Response.json({ ok: false, error: 'Unbekannter Status.' }, { status: 400 });
  }

  const notiz = typeof body.notiz_intern === 'string' ? body.notiz_intern.trim().slice(0, 2000) : '';

  const { data: nachweis } = await supabaseAdmin
    .from('mz_koop_nachweise')
    .select('id, company_id, massnahme_id')
    .eq('id', id)
    .maybeSingle();

  if (!nachweis) {
    return Response.json({ ok: false, error: 'Nachweis nicht gefunden.' }, { status: 400 });
  }

  let punkte = null;
  if (status === 'bestaetigt') {
    const { data: massnahme } = await supabaseAdmin
      .from('mz_koop_massnahmen')
      .select('punkte')
      .eq('id', nachweis.massnahme_id)
      .maybeSingle();
    punkte = massnahme?.punkte ?? 0;
  }

  const { data, error } = await supabaseAdmin
    .from('mz_koop_nachweise')
    .update({
      status,
      // Снятое подтверждение обнуляет баллы: иначе отклонённая мера
      // продолжала бы давать скидку.
      punkte,
      geprueft_von: auth.email,
      geprueft_am: new Date().toISOString(),
      ...(notiz ? { notiz_intern: notiz } : {}),
    })
    .eq('id', id)
    .select('id, status, punkte')
    .maybeSingle();

  if (error || !data) {
    console.error('admin koop PATCH: не удалось записать', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: nachweis.company_id,
    user_id: auth.user.id,
    aktion: 'koop_geprueft',
    details: { id, status, punkte },
  });

  return Response.json({ ok: true, nachweis: data });
}
