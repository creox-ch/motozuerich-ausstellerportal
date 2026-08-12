import { randomUUID } from 'node:crypto';
import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { validateMarketingAnfrage } from '../../../lib/marketing';
import { BUCKET, removeQuietly, storagePath, validateUpload } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT = 'nachweis';

/**
 * Заявка по маркетингу: каталог, LED-Wall, дизайн, правка данных.
 *
 * Форма multipart: к тексту может идти файл — оригиналы логотипа для дизайна
 * или приложение к заявке на правку.
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

  const { ok, error, value } = validateMarketingAnfrage(
    {
      art: form.get('art'),
      auswahl: form.get('auswahl'),
      text: form.get('text'),
      link: form.get('link'),
    },
    { hatDatei }
  );
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  let pfad = null;
  if (hatDatei) {
    pfad = storagePath(auth.companyId, SLOT, datei.name, randomUUID().slice(0, 8));
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(pfad, datei, { contentType: datei.type, upsert: false });

    if (uploadError) {
      console.error('marketing-anfrage POST: загрузка не удалась', uploadError);
      return Response.json({ ok: false, error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
  }

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_marketing_anfragen')
    .insert({ ...value, datei_pfad: pfad, company_id: auth.companyId, user_id: auth.user.id })
    .select('id, art, auswahl, text, link, status, created_at')
    .maybeSingle();

  if (dbError || !row) {
    console.error('marketing-anfrage POST: не удалось записать', dbError);
    await removeQuietly(pfad);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  return Response.json({ ok: true, anfrage: row });
}
