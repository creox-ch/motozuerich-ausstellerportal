import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { validateProfile, EDITABLE_FIELDS } from '../../../lib/profile';
import { signedUrl } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Профиль своей компании. Чужой прочитать нельзя — id берётся из сессии. */
export async function GET() {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('mz_companies')
    .select(['id', 'status', 'logo_path', ...EDITABLE_FIELDS].join(', '))
    .eq('id', auth.companyId)
    .maybeSingle();

  if (error) {
    console.error('profile GET: не удалось прочитать компанию', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Путь в хранилище наружу не отдаём — только временную подписанную ссылку.
  return Response.json({
    ok: true,
    profile: data,
    logoUrl: await signedUrl(data?.logo_path),
  });
}

/**
 * Сохранение профиля.
 *
 * Идентификатор компании НИКОГДА не берётся из тела запроса — только из
 * сессии. Иначе достаточно подставить чужой id, чтобы переписать чужой
 * профиль: авторизация есть, а объект чужой. Это самая частая дыра
 * в кабинетах, и лечится она тем, что клиенту просто нечего сказать
 * по этому поводу.
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

  const { ok, errors, value } = validateProfile(body);
  if (!ok) {
    return Response.json(
      { ok: false, error: 'Bitte prüfen Sie die markierten Felder.', errors },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('mz_companies')
    .update(value)
    .eq('id', auth.companyId)
    .select(['id', 'status', 'logo_path', ...EDITABLE_FIELDS].join(', '))
    .maybeSingle();

  if (error) {
    console.error('profile PUT: не удалось сохранить', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const { error: auditError } = await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: 'profile_update',
    // Значения полей в журнал не пишем: он не должен становиться второй
    // копией персональных данных. Достаточно знать, кто и когда менял.
    details: { felder: Object.keys(value) },
  });
  if (auditError) console.error('profile PUT: журнал не записался', auditError);

  return Response.json({ ok: true, profile: data });
}
