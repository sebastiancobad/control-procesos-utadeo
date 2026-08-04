import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MODULES, byId, indexOfId } from '../content/index.js';
import { pick } from '../content/refs.js';
import { Tabs, Cajetin } from '../components/ui.jsx';
import Quiz from '../components/Quiz.jsx';

function Bibliografía({ keys }) {
  const refs = pick(keys);
  return (
    <div className="prose">
      <h2>Lecturas de este módulo</h2>
      <p>
        Las tres primeras entradas cubren el módulo completo. Las siguientes amplian puntos específicos y sirven para el
        proyecto del curso.
      </p>
      <div style={{ marginTop: 'var(--s5)' }}>
        {refs.map((r) => (
          <div className="ref" key={r.id}>
            <span className="key">{r.key}</span>
            <div>
              <p className="cite" dangerouslySetInnerHTML={{ __html: r.cite }} />
              <p className="note">{r.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Module() {
  const { id } = useParams();
  const mod = byId(id);
  const [tab, setTab] = useState('teoría');

  useEffect(() => {
    setTab('teoría');
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!mod) return <Navigate to="/" replace />;

  const { meta, Teoria, Sim, Ejemplo, quiz } = mod;
  const i = indexOfId(id);
  const prev = i > 0 ? MODULES[i - 1].meta : null;
  const next = i < MODULES.length - 1 ? MODULES[i + 1].meta : null;

  const items = [
    { key: 'teoría', label: 'Teoria' },
    ...(Sim ? [{ key: 'sim', label: 'Simulador' }] : []),
    { key: 'ejemplo', label: 'Ejercicio resuelto' },
    { key: 'quiz', label: 'Quiz', badge: quiz?.length },
    { key: 'biblio', label: 'Bibliografía' },
  ];

  return (
    <div className="sheet">
      <header className="mod-head">
        <div className="row">
          <p className="eyebrow">
            Módulo {String(meta.week).padStart(2, '0')} · {meta.unit}
          </p>
          <span className="tag">{meta.code}</span>
        </div>
        <h1>{meta.title}</h1>
        <p className="lede">{meta.lede}</p>
      </header>

      <section className="prose" style={{ marginBottom: 'var(--s5)' }}>
        <p className="eyebrow">Al terminar este módulo deberias poder</p>
        <ul style={{ marginTop: 'var(--s2)' }}>
          {meta.objectives.map((o, k) => <li key={k}>{o}</li>)}
        </ul>
      </section>

      <Tabs items={items} value={tab} onChange={setTab} />

      {tab === 'teoría' && <Teoria />}
      {tab === 'sim' && Sim && <Sim />}
      {tab === 'ejemplo' && <Ejemplo />}
      {tab === 'quiz' && (
        <div>
          <div className="prose">
            <h2>Comprueba lo que entendiste</h2>
            <p>
              Cada pregunta tiene una sola respuesta correcta. Al calificar veras por que la opción correcta lo es
              y por que fallan las demas.
            </p>
          </div>
          <Quiz questions={quiz} moduleId={meta.id} moduleTitle={meta.title} />
        </div>
      )}
      {tab === 'biblio' && <Bibliografía keys={meta.refs} />}

      <nav className="mod-nav">
        {prev ? (
          <Link to={`/m/${prev.id}`}>
            <span className="dir">Anterior</span>
            <span className="ttl">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/m/${next.id}`} style={{ textAlign: 'right' }}>
            <span className="dir">Siguiente</span>
            <span className="ttl">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>

      <Cajetin code={meta.code} sheet={String(meta.week).padStart(2, '0')} total={MODULES.length} unit={meta.unit} />
    </div>
  );
}
