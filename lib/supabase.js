import { createClient } from '@supabase/supabase-js';

/**
 * Server-only клиент Supabase с ключом service_role.
 * НИКОГДА не импортировать в клиентский компонент — этот ключ обходит RLS.
 * Только в API-роутах, они выполняются на сервере.
 *
 * ВАЖНО: клиент создаётся ЛЕНИВО — при первом обращении в рантайме, а не при
 * импорте модуля. Иначе сборка на Vercel падает («Failed to collect page data»):
 * во время build переменных окружения может не быть, а createClient требует
 * URL и ключ. Тот же приём применяется к Resend.
 *
 * Модель доступа портала: RLS включён на всех таблицах, политик ноль —
 * читает и пишет только сервер этим клиентом. Браузер в базу не ходит,
 * см. docs/ARCHITEKTUR-PLAN.md, раздел «Аутентификация».
 */

let _client = null;

function client() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase не сконфигурирован: задай SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в env.'
      );
    }
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

// Ленивый прокси: call-site'ы пишут supabaseAdmin.from(...), но настоящий
// клиент создаётся только при первом вызове — уже в рантайме.
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const c = client();
      const value = c[prop];
      return typeof value === 'function' ? value.bind(c) : value;
    },
  }
);
