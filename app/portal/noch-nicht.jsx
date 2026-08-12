/**
 * Плашка «раздел показывает структуру, но ещё не работает».
 *
 * Зачем она отдельным компонентом, а не текстом на месте: формулировка должна
 * быть одна на весь портал. Разными словами в разных разделах человек читает
 * разное — где-то «скоро», где-то «сломалось», — и перестаёт верить обеим.
 *
 * Разделу без такой плашки экспонент вправе верить: раз показано, значит
 * работает. Поэтому ставить её надо честно и снимать вместе с реализацией,
 * а не заранее.
 *
 * Два состояния, и путать их нельзя:
 * — `gesperrt` — ввод не принимается вообще, показан только каркас;
 * — `in-arbeit` — заявка уходит и доходит, но условия не определены,
 *   а обрабатывают её руками.
 * Написать «не принимаем» там, где форма работает, — такая же ложь, как
 * обратное: человек не станет заполнять то, что считает мёртвым.
 */
export default function NochNicht({ children, was = 'Dieser Bereich', variante = 'gesperrt' }) {
  return (
    <p role="note" style={S.box}>
      {variante === 'in-arbeit' ? (
        <>
          <b style={S.titel}>Noch in Arbeit.</b> {was} funktioniert bereits — Ihre Anfrage
          erreicht die Messeleitung. Konditionen, Fristen und Abläufe sind aber noch nicht
          festgelegt, und die Bearbeitung läuft vorerst von Hand.
        </>
      ) : (
        <>
          <b style={S.titel}>Noch nicht freigeschaltet.</b> {was} zeigt bereits den geplanten
          Aufbau, ist aber noch nicht in Betrieb — Eingaben werden hier noch nicht
          entgegen­genommen.
        </>
      )}
      {children ? <span style={S.grund}> {children}</span> : null}
    </p>
  );
}

const S = {
  box: {
    background: '#FBF1D2',
    border: '1px solid #E3CE86',
    borderRadius: 3,
    padding: '12px 14px',
    fontSize: 13,
    lineHeight: 1.5,
    margin: '0 0 20px',
    maxWidth: '72ch',
  },
  titel: { display: 'inline' },
  grund: { color: '#6B5A22' },
};
