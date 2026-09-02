/**
 * Ausstellungsbedingungen — aktuelle Fassung und Akzeptanz-Status.
 *
 * Version zentral an einer Stelle: ändert sich der Text (Ziffer 25), reicht
 * es, AGB_VERSION hochzuzählen — bestehende Zustimmungen bleiben unter ihrer
 * alten Version protokolliert, neue Aussteller sehen automatisch die neue.
 */
export const AGB_VERSION = '1.0';

export const AGB_PUNKTE = [
  'Ich habe die Ausstellungsbedingungen MOTO-ZÜRICH 2027 (Fassung ' +
    AGB_VERSION +
    ') gelesen und akzeptiere sie als verbindlichen Bestandteil des Vertrages.',
  'Ich habe die Datenschutzerklärung zur Kenntnis genommen und bin mit der darin beschriebenen Datenbearbeitung einverstanden.',
  'Ich bin berechtigt, die anmeldende Firma rechtsverbindlich zu verpflichten, und melde sie verbindlich zur Teilnahme an der MOTO-ZÜRICH 2027 an.',
  'Mir ist bekannt, dass die MOTO-ZÜRICH bei höherer Gewalt gekürzt, verlängert oder abgesagt werden kann und dass bei einer Absage die nicht abwendbaren Kosten anteilsmässig von der Standmiete abgezogen werden (Ziffer 20).',
];
