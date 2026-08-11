import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Клиент Supabase, работающий от лица вошедшего человека.
 *
 * Используется ТОЛЬКО для аутентификации: проверить код, узнать, кто пришёл,
 * выйти. Данные им не читаем — на всех таблицах RLS без политик, этот клиент
 * не увидит ни строки. Данные читает supabaseAdmin в lib/supabase.js, уже
 * после того, как личность установлена.
 *
 * Сессия живёт в cookie, а не в localStorage: cookie уходит на сервер с каждым
 * запросом, поэтому серверный роут может проверить, кто его дёргает. Токен
 * в localStorage сервер не увидит вовсе.
 *
 * Ленивая инициализация здесь не нужна: функция вызывается в рантайме,
 * при сборке её никто не выполняет.
 */
export function supabaseSession() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase Auth не сконфигурирован: задай SUPABASE_URL и SUPABASE_ANON_KEY.');
  }

  const store = cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return store.get(name)?.value;
      },
      set(name, value, options) {
        // В серверных компонентах запись в cookie запрещена и бросает
        // исключение. Это нормально: там мы только читаем сессию, а обновляет
        // её роут, который отработает следующим запросом.
        try {
          store.set({ name, value, ...options });
        } catch {}
      },
      remove(name, options) {
        try {
          store.set({ name, value: '', ...options, maxAge: 0 });
        } catch {}
      },
    },
  });
}
