import { useState, useEffect } from 'react';
import { Ei, Rich as RichText } from './ui.jsx';
import { saveAttempt, isConfigured, getStudent, setStudent, markDone } from '../lib/firebase.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * questions: [{ q, tex, options:[...], answer:index, why }]
 * El texto admite fragmentos LaTeX entre signos $...$.
 */
const Rich = ({ text }) => <RichText>{String(text)}</RichText>;

function Question({ item, index, picked, onPick, revealed }) {
  return (
    <div className="q">
      <div className="q-stem">
        <span className="n">{String(index + 1).padStart(2, '0')}</span>
        <div className="txt">
          <p><Rich text={item.q} /></p>
          {item.tex && <div style={{ margin: '10px 0' }}><Ei>{item.tex}</Ei></div>}
        </div>
      </div>

      {item.options.map((o, i) => {
        let cls = 'opt';
        if (revealed) {
          if (i === item.answer) cls += ' right';
          else if (i === picked) cls += ' wrong';
        } else if (i === picked) cls += ' picked';
        return (
          <button key={i} className={cls} onClick={() => onPick(i)} disabled={revealed} type="button">
            <span className="letter">{LETTERS[i]}</span>
            <span><Rich text={o} /></span>
          </button>
        );
      })}

      {revealed && (
        <div className={`q-fb ${picked === item.answer ? 'ok' : 'no'}`}>
          <span className="kicker">{picked === item.answer ? 'Correcto' : `Respuesta correcta: ${LETTERS[item.answer]}`}</span>
          <Rich text={item.why} />
        </div>
      )}
    </div>
  );
}

export default function Quiz({ questions, moduleId, moduleTitle }) {
  const [picks, setPicks] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [me, setMe] = useState(() => getStudent() || { nombre: '', codigo: '' });
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    setPicks({});
    setRevealed(false);
    setSaved(null);
  }, [moduleId]);

  const answered = Object.keys(picks).length;
  const correct = questions.reduce((a, q, i) => a + (picks[i] === q.answer ? 1 : 0), 0);
  const nota = questions.length ? (correct / questions.length) * 5 : 0;

  async function grade() {
    setRevealed(true);
    markDone(moduleId, +(correct / questions.length).toFixed(3));
    if (isConfigured() && me.nombre.trim()) {
      setStudent(me);
      const ok = await saveAttempt({
        moduleId,
        moduleTitle,
        nombre: me.nombre.trim(),
        codigo: me.codigo.trim(),
        correctas: correct,
        total: questions.length,
        nota: +nota.toFixed(2),
        respuestas: questions.map((q, i) => ({ i, pick: picks[i] ?? null, ok: picks[i] === q.answer })),
      });
      setSaved(ok);
    }
  }

  function retry() {
    setPicks({});
    setRevealed(false);
    setSaved(null);
  }

  return (
    <div>
      {isConfigured() && (
        <div className="id-form">
          <div className="field">
            <label htmlFor="q-nombre">Nombre completo</label>
            <input
              id="q-nombre"
              value={me.nombre}
              onChange={(e) => setMe({ ...me, nombre: e.target.value })}
              placeholder="Nombre y apellido"
              disabled={revealed}
            />
          </div>
          <div className="field">
            <label htmlFor="q-codigo">Código</label>
            <input
              id="q-codigo"
              value={me.codigo}
              onChange={(e) => setMe({ ...me, codigo: e.target.value })}
              placeholder="000000000"
              disabled={revealed}
            />
          </div>
        </div>
      )}

      {questions.map((item, i) => (
        <Question
          key={i}
          item={item}
          index={i}
          picked={picks[i]}
          revealed={revealed}
          onPick={(v) => setPicks({ ...picks, [i]: v })}
        />
      ))}

      {!revealed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', marginTop: 'var(--s5)', flexWrap: 'wrap' }}>
          <button className="btn" onClick={grade} disabled={answered < questions.length}>
            Calificar
          </button>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--t-sm)', color: 'var(--ink-3)' }}>
            {answered} de {questions.length} respondidas
          </span>
        </div>
      ) : (
        <div className="score">
          <div>
            <span className="eyebrow">Resultado</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="big">{nota.toFixed(1)}</span>
              <span style={{ color: 'var(--ink-2)' }}>
                / 5.0 &nbsp;·&nbsp; {correct} de {questions.length} correctas
              </span>
            </div>
            {saved === true && (
              <p style={{ margin: '8px 0 0', fontSize: 'var(--t-sm)', color: 'var(--ok)' }}>Intento registrado.</p>
            )}
            {saved === false && (
              <p style={{ margin: '8px 0 0', fontSize: 'var(--t-sm)', color: 'var(--alarm)' }}>
                El intento no se registro. Revisa tu conexión y vuelve a calificar.
              </p>
            )}
          </div>
          <button className="btn ghost" onClick={retry}>Intentar de nuevo</button>
        </div>
      )}
    </div>
  );
}
