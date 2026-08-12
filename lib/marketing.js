import { supabaseAdmin } from './supabase';

/**
 * Заявки по маркетингу: цифровой каталог, LED-Wall, дизайн, правка данных.
 *
 * Четыре блока прототипа с одной механикой — экспонент просит, Messeleitung
 * отвечает вручную. Условий, цен и сроков бизнес не назвал, поэтому заявка
 * ничего не резервирует и ничего не стоит: это разговор, начатый в портале,
 * а не заказ.
 */

export const ARTEN = ['online_katalog', 'led_wall', 'design', 'aenderung'];

export const STATUS = ['neu', 'in_bearbeitung', 'erledigt', 'abgelehnt'];

/** Пакеты цифрового каталога из прототипа. Basis входит всегда. */
export const KATALOG_PAKETE = [
  {
    id: 'basis',
    titel: 'Basis',
    beschreibung: 'Logo, Beschreibung, Kontakt, Standnummer',
    inbegriffen: true,
  },
  {
    id: 'plus',
    titel: 'Plus',
    beschreibung: 'Zusätzlich Bildergalerie, Markenliste, Shop-Link und Statistik',
  },
  {
    id: 'premium',
    titel: 'Premium',
    beschreibung: 'Zusätzlich Video, Top-Platzierung in der Kategorie und Banner im Katalog',
  },
];

/** Что можно попросить поправить в каталоге и на сайте. */
export const AENDERUNG_TYPEN = [
  'Logo ersetzen',
  'Beschreibung im Verzeichnis',
  'Marken ergänzen oder streichen',
  'Kontakt oder Link',
  'Kategorie wechseln',
  'Anderes',
];

export const MAX_TEXT = 400;

function str(value, max = 400) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Проверка заявки.
 *
 * У каждого вида свои обязательные поля, и они разные по существу: пакет
 * каталога без выбора пакета бессмыслен, а запрос дизайна без описания
 * задачи не с чего начинать.
 */
export function validateMarketingAnfrage(input = {}, { hatDatei = false } = {}) {
  const art = str(input.art, 30);
  if (!ARTEN.includes(art)) return { ok: false, error: 'Unbekannte Anfrage.' };

  const text = str(input.text, MAX_TEXT + 1);
  if (text.length > MAX_TEXT) {
    return { ok: false, error: `Text ist zu lang (maximal ${MAX_TEXT} Zeichen).` };
  }

  const link = str(input.link, 500);
  if (link && !/^https?:\/\/\S+$/i.test(link)) {
    return { ok: false, error: 'Link bitte vollständig angeben, mit https://' };
  }

  let auswahl = '';

  if (art === 'online_katalog') {
    auswahl = str(input.auswahl, 40);
    const paket = KATALOG_PAKETE.find((p) => p.id === auswahl);
    if (!paket) return { ok: false, error: 'Bitte ein Paket wählen.' };
    // Basis есть у всех по умолчанию — просить его отдельно не о чем.
    if (paket.inbegriffen) {
      return { ok: false, error: 'Basis ist bereits enthalten. Bitte Plus oder Premium wählen.' };
    }
  }

  if (art === 'aenderung') {
    auswahl = str(input.auswahl, 60);
    if (!AENDERUNG_TYPEN.includes(auswahl)) {
      return { ok: false, error: 'Bitte auswählen, was geändert werden soll.' };
    }
    if (!text) return { ok: false, error: 'Bitte beschreiben, was geändert werden soll.' };
  }

  if (art === 'design' && !text) {
    return { ok: false, error: 'Bitte beschreiben, was Sie brauchen.' };
  }

  return {
    ok: true,
    value: { art, auswahl: auswahl || null, text: text || null, link: link || null },
    hatDatei,
  };
}

/** Человеческое название вида заявки — для списков и админки. */
export const ART_TITEL = {
  online_katalog: 'Digitaler Katalog',
  led_wall: 'LED-Wall',
  design: 'Design im MOTO-ZÜRICH-Look',
  aenderung: 'Änderung melden',
};

const FIELDS = 'id, art, auswahl, text, link, datei_pfad, status, created_at';

export async function marketingAnfragenFuerCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_marketing_anfragen')
    .select(FIELDS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('marketingAnfragenFuerCompany: не удалось прочитать', error);
    return [];
  }
  return data || [];
}

export async function alleMarketingAnfragen() {
  const { data, error } = await supabaseAdmin
    .from('mz_marketing_anfragen')
    .select(`${FIELDS}, mz_companies(name)`)
    .order('created_at', { ascending: true })
    .limit(300);

  if (error) {
    console.error('alleMarketingAnfragen: не удалось прочитать', error);
    return [];
  }
  return data || [];
}
