import { requirePageStaff } from '../../../lib/auth';
import { threadsFuerAdmin } from '../../../lib/nachrichten';
import AdminNachrichtenClient from './nachrichten-client';

export const dynamic = 'force-dynamic';

export default async function AdminNachrichtenPage() {
  await requirePageStaff();

  const threads = await threadsFuerAdmin();
  const offen = threads.filter((t) => t.offen).length;

  return (
    <>
      <h1 style={S.h1}>Nachrichten</h1>
      <p style={S.lead}>
        {offen === 0
          ? 'Alles beantwortet.'
          : `${offen} ${offen === 1 ? 'Firma wartet' : 'Firmen warten'} auf Antwort.`}{' '}
        Ihre Antwort erscheint sofort im Portal, der Aussteller bekommt eine E-Mail.
      </p>

      <AdminNachrichtenClient threads={threads} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
