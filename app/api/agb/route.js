import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { AGB_VERSION } from '../../../lib/agb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Elektronische Zustimmung zu den Ausstellungsbedingungen.
 *
 * Protokolliert gemäss docs/claude_ausstellungsbedingungen-2027.md, Anhang
 * «Technische Anforderungen»: Zeitstempel, Version, Name, Funktion, E-Mail
 * und IP der handelnden Person. Die Firma selbst kommt ausschliesslich aus
 * der Session — nie aus dem Request-Body (siehe Kommentar in profile/route.js).
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

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const funktion = typeof body.funktion === 'string' ? body.funktion.trim() : '';
  const punkte = Array.isArray(body.punkte) ? body.punkte : [];

  if (!name || !funktion) {
    return Response.json(
      { ok: false, error: 'Name und Funktion der handelnden Person fehlen.' },
      { status: 400 }
    );
  }
  // Aktive Zustimmung: alle vier Punkte müssen einzeln angeklickt sein,
  // keine vorangekreuzten Felder (Anforderung 5 im selben Dokument).
  if (punkte.length !== 4 || punkte.some((p) => p !== true)) {
    return Response.json(
      { ok: false, error: 'Bitte alle vier Bestätigungen einzeln anklicken.' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  const { data, error } = await supabaseAdmin
    .from('mz_companies')
    .update({
      agb_akzeptiert_am: new Date().toISOString(),
      agb_version: AGB_VERSION,
      agb_akzeptiert_von_name: name,
      agb_akzeptiert_von_funktion: funktion,
      agb_akzeptiert_von_email: auth.user.email || null,
      agb_akzeptiert_ip: ip,
    })
    .eq('id', auth.companyId)
    .select('id, agb_akzeptiert_am, agb_version')
    .maybeSingle();

  if (error) {
    console.error('agb POST: не удалось сохранить', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const { error: auditError } = await supabaseAdmin.from('mz_audit').insert({
    company_id: auth.companyId,
    user_id: auth.user.id,
    aktion: 'agb_akzeptiert',
    details: { version: AGB_VERSION, name, funktion },
  });
  if (auditError) console.error('agb POST: журнал не записался', auditError);

  return Response.json({ ok: true, akzeptiertAm: data?.agb_akzeptiert_am, version: data?.agb_version });
}
