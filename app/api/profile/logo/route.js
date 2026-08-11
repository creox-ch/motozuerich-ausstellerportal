import { randomUUID } from 'node:crypto';
import { requireCompany } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { BUCKET, removeQuietly, signedUrl, storagePath, validateUpload } from '../../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT = 'logo';

/**
 * Загрузка логотипа.
 *
 * Компания берётся из сессии, поэтому положить файл в чужую папку нельзя:
 * путь собирается на сервере из проверенного company_id, а клиент влияет
 * только на имя файла — и то после чистки.
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

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ ok: false, error: 'Keine Datei ausgewählt.' }, { status: 400 });
  }

  const check = validateUpload({ size: file.size, type: file.type }, SLOT);
  if (!check.ok) {
    return Response.json({ ok: false, error: check.error }, { status: 400 });
  }

  // Старый путь узнаём заранее: после успешной замены его надо убрать,
  // иначе хранилище копит брошенные файлы, а его на тарифе один гигабайт.
  const { data: before } = await supabaseAdmin
    .from('mz_companies')
    .select('logo_path')
    .eq('id', auth.companyId)
    .maybeSingle();

  const path = storagePath(auth.companyId, SLOT, file.name, randomUUID().slice(0, 8));

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('logo POST: загрузка не удалась', uploadError);
    return Response.json({ ok: false, error: 'Upload fehlgeschlagen.' }, { status: 500 });
  }

  const { error: saveError } = await supabaseAdmin
    .from('mz_companies')
    .update({ logo_path: path })
    .eq('id', auth.companyId);

  if (saveError) {
    console.error('logo POST: не удалось записать путь', saveError);
    // Файл уже лежит, но профиль о нём не знает — убираем, чтобы не остался
    // сиротой, которого никто никогда не найдёт.
    await removeQuietly(path);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  if (before?.logo_path && before.logo_path !== path) {
    await removeQuietly(before.logo_path);
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: 'logo_upload',
    details: { bytes: file.size, typ: file.type },
  });

  return Response.json({ ok: true, logoUrl: await signedUrl(path) });
}

/** Удаление логотипа — человек должен иметь право убрать то, что загрузил. */
export async function DELETE() {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  const { data: before } = await supabaseAdmin
    .from('mz_companies')
    .select('logo_path')
    .eq('id', auth.companyId)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from('mz_companies')
    .update({ logo_path: null })
    .eq('id', auth.companyId);

  if (error) {
    console.error('logo DELETE: не удалось очистить путь', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await removeQuietly(before?.logo_path);

  await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: 'logo_delete',
  });

  return Response.json({ ok: true });
}
