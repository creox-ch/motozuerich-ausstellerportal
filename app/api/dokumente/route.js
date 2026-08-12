import { requireCompany } from '../../../lib/auth';
import { dokumentFuerCompany } from '../../../lib/dokumente';
import { signedUrl } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Скачивание документа экспонентом.
 *
 * Отдаём не файл, а перенаправление на подписанную ссылку: файл течёт из
 * хранилища напрямую, мимо нашего сервера. Проверка прав при этом остаётся
 * у нас — ссылка выдаётся только после неё и живёт десять минут.
 *
 * Права решает `dokumentFuerCompany` по строке из базы, а не по тому, что
 * прислал браузер. Идентификатор в запросе можно подобрать; company_id
 * в строке подменить нельзя.
 */
export async function GET(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ ok: false, error: 'Dokument nicht gefunden.' }, { status: 400 });
  }

  const dokument = await dokumentFuerCompany(id, auth.companyId);

  // Чужой документ и несуществующий отвечают одинаково намеренно: иначе
  // по разнице ответов перебором выясняется, какие документы вообще есть.
  if (!dokument) {
    return Response.json({ ok: false, error: 'Dokument nicht gefunden.' }, { status: 404 });
  }

  const url = await signedUrl(dokument.pfad);
  if (!url) {
    console.error('dokumente GET: файл не подписался', dokument.id);
    return Response.json({ ok: false, error: 'Datei nicht verfügbar.' }, { status: 500 });
  }

  return Response.redirect(url, 302);
}
