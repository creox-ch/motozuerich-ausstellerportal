import { describeEnv } from '../../../lib/env';

export const runtime = 'nodejs';
// Проверка конфигурации бессмысленна из кэша — она про состояние здесь и сейчас.
export const dynamic = 'force-dynamic';

/**
 * Служебная проверка: приложение живо и знает, чего ему не хватает.
 *
 * Отдаём только ИМЕНА отсутствующих переменных, никогда значения имеющихся —
 * иначе эндпоинт становится способом вычитать ключи с продакшена.
 *
 * 200 — всё обязательное на месте; 503 — чего-то нет. Тот же код, что отдают
 * роуты платформы при неподключённой базе, чтобы поведение не расходилось.
 */
export async function GET() {
  const env = describeEnv(process.env);

  return Response.json(
    {
      ok: env.ok,
      service: 'ausstellerportal',
      missingRequired: env.missingRequired,
      missingOptional: env.missingOptional,
    },
    { status: env.ok ? 200 : 503 }
  );
}
