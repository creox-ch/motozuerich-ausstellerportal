import { randomUUID } from 'node:crypto';
import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { validateDokument } from '../../../../lib/dokumente';
import { BUCKET, removeQuietly, storagePath, validateUpload } from '../../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT = 'dokument';

/**
 * Messeleitung кладёт документ или счёт.
 *
 * Порядок как во всех роутах проекта: права → разбор тела → валидация → база.
 * Права раньше разбора намеренно: иначе по кодам ответа можно нащупать формат
 * запроса, не имея доступа.
 */
export async function POST(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ ok: false, error: 'Keine Datei ausgewählt.' }, { status: 400 });
  }

  const check = validateUpload({ size: file.size, type: file.type }, SLOT);
  if (!check.ok) return Response.json({ ok: false, error: check.error }, { status: 400 });

  const { ok, error, value } = validateDokument({
    titel: form.get('titel'),
    art: form.get('art'),
    company_id: form.get('company_id'),
    betrag: form.get('betrag'),
    faellig_am: form.get('faellig_am'),
  });
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  // Компанию проверяем до загрузки файла: с несуществующим идентификатором
  // строка отвалилась бы по внешнему ключу уже после того, как файл лёг
  // в хранилище, и он остался бы сиротой.
  if (value.company_id) {
    const { data: company } = await supabaseAdmin
      .from('mz_companies')
      .select('id')
      .eq('id', value.company_id)
      .maybeSingle();
    if (!company) {
      return Response.json({ ok: false, error: 'Firma nicht gefunden.' }, { status: 400 });
    }
  }

  // Общие документы лежат под своим префиксом, а не под чужой компанией:
  // по пути должно быть видно, кому файл принадлежит.
  const prefix = value.company_id || 'allgemein';
  const pfad = storagePath(prefix, SLOT, file.name, randomUUID().slice(0, 8));

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(pfad, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('admin dokumente POST: загрузка не удалась', uploadError);
    return Response.json({ ok: false, error: 'Upload fehlgeschlagen.' }, { status: 500 });
  }

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_dokumente')
    .insert({
      ...value,
      pfad,
      dateiname: file.name,
      groesse_bytes: file.size,
      hochgeladen_von: auth.email,
    })
    .select('id')
    .maybeSingle();

  if (dbError || !row) {
    console.error('admin dokumente POST: не удалось записать строку', dbError);
    // Файл уже лежит, но о нём никто не знает — убираем.
    await removeQuietly(pfad);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: value.company_id,
    user_id: auth.user.id,
    aktion: value.art === 'rechnung' ? 'dokument_rechnung_hochgeladen' : 'dokument_hochgeladen',
    details: { id: row.id, titel: value.titel, bytes: file.size },
  });

  return Response.json({ ok: true, id: row.id });
}

/** Отметка об оплате. Приёма платежей в портале нет — ставит человек. */
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
    return Response.json({ ok: false, error: 'Dokument nicht gefunden.' }, { status: 400 });
  }

  const bezahlt = body.bezahlt === true;

  const { data, error } = await supabaseAdmin
    .from('mz_dokumente')
    .update({ bezahlt_am: bezahlt ? new Date().toISOString() : null })
    .eq('id', id)
    // Отметка об оплате имеет смысл только у счёта; у документа её и поставить
    // нельзя — база не даст. Отсекаем здесь, чтобы человек увидел причину.
    .eq('art', 'rechnung')
    .select('id, company_id, bezahlt_am')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ ok: false, error: 'Rechnung nicht gefunden.' }, { status: 400 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: data.company_id,
    user_id: auth.user.id,
    aktion: bezahlt ? 'rechnung_bezahlt' : 'rechnung_offen',
    details: { id },
  });

  return Response.json({ ok: true, bezahltAm: data.bezahlt_am });
}

/** Удаление: не тот файл заливают чаще, чем хотелось бы. */
export async function DELETE(request) {
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
    return Response.json({ ok: false, error: 'Dokument nicht gefunden.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('mz_dokumente')
    .delete()
    .eq('id', id)
    .select('id, company_id, titel, pfad')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ ok: false, error: 'Dokument nicht gefunden.' }, { status: 400 });
  }

  // Строку убрали — файл больше не найти ничем, кроме дашборда хранилища.
  await removeQuietly(data.pfad);

  await supabaseAdmin.from('mz_audit').insert({
    company_id: data.company_id,
    user_id: auth.user.id,
    aktion: 'dokument_geloescht',
    details: { id, titel: data.titel },
  });

  return Response.json({ ok: true });
}
