import { randomUUID } from 'node:crypto';
import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { darfEinreichen, ladeKatalog, nachweiseFuerCompany, validateNachweis } from '../../../lib/koop';
import { BUCKET, removeQuietly, storagePath, validateUpload } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT = 'nachweis';

/**
 * Экспонент подаёт подтверждение выполненной меры.
 *
 * Форма приходит как multipart: к ссылке или вместо неё может идти файл.
 */
export async function POST(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const datei = form.get('file');
  const hatDatei = Boolean(datei && typeof datei !== 'string' && datei.size > 0);

  if (hatDatei) {
    const check = validateUpload({ size: datei.size, type: datei.type }, SLOT);
    if (!check.ok) return Response.json({ ok: false, error: check.error }, { status: 400 });
  }

  const { ok, error, value } = validateNachweis(
    {
      massnahme_id: form.get('massnahme_id'),
      link: form.get('link'),
      umgesetzt_am: form.get('umgesetzt_am'),
      bemerkung: form.get('bemerkung'),
    },
    { hatDatei }
  );
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  // Правила «одна мера — одно подтверждение» и «в группе einfach только одна»
  // проверяем до загрузки файла: иначе отклонённая заявка оставит в хранилище
  // сироту, которого никто не найдёт.
  const [katalog, vorhandene] = await Promise.all([
    ladeKatalog(),
    nachweiseFuerCompany(auth.companyId),
  ]);

  const massnahme = katalog.find((m) => m.id === value.massnahme_id);
  const erlaubt = darfEinreichen(massnahme, vorhandene, katalog);
  if (!erlaubt.ok) return Response.json({ ok: false, error: erlaubt.error }, { status: 400 });

  let pfad = null;
  if (hatDatei) {
    pfad = storagePath(auth.companyId, SLOT, datei.name, randomUUID().slice(0, 8));
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(pfad, datei, { contentType: datei.type, upsert: false });

    if (uploadError) {
      console.error('koop POST: загрузка не удалась', uploadError);
      return Response.json({ ok: false, error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
  }

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_koop_nachweise')
    .insert({
      ...value,
      link: value.link || null,
      datei_pfad: pfad,
      company_id: auth.companyId,
      user_id: auth.user.id,
    })
    .select('id, massnahme_id, umgesetzt_am, link, bemerkung, status, punkte, created_at')
    .maybeSingle();

  if (dbError || !row) {
    console.error('koop POST: не удалось записать', dbError);
    await removeQuietly(pfad);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  return Response.json({ ok: true, nachweis: row });
}
