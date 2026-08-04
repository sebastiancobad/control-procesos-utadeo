import { REFS } from '../content/refs.js';
import { MODULES } from '../content/index.js';
import { Cajetin } from '../components/ui.jsx';

const GROUPS = [
  { title: 'Textos del curso', keys: ['smith', 'bequette', 'seborg', 'marlin', 'steph', 'luyben', 'cough', 'ogun', 'shinskey', 'perry'] },
  { title: 'Normas técnicas', keys: ['isa51', 'isa75', 'isa88', 'isa84', 'iec61508'] },
  { title: 'Articulos y guías', keys: ['zn', 'rivera', 'skoge', 'bristol', 'astrom', 'ccps'] },
];

export default function Biblio() {
  const usedIn = (key) =>
    MODULES.filter((m) => m.meta.refs.includes(key)).map((m) => m.meta.week);

  return (
    <div className="sheet">
      <header className="mod-head">
        <div className="row">
          <p className="eyebrow">Referencias del curso</p>
          <span className="tag">CP26II-B00</span>
        </div>
        <h1>Bibliografía</h1>
        <p className="lede">
          Cada entrada indica para que sirve el texto y en que módulos se usa. Un listado sin ese criterio obliga al
          estudiante a adivinar por donde empezar.
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} style={{ marginBottom: 'var(--s7)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--s3)' }}>{g.title}</h2>
          {g.keys.map((k) => {
            const r = REFS[k];
            if (!r) return null;
            const weeks = usedIn(k);
            return (
              <div className="ref" key={k}>
                <span className="key">{r.key}</span>
                <div>
                  <p className="cite" dangerouslySetInnerHTML={{ __html: r.cite }} />
                  <p className="note">{r.note}</p>
                  {weeks.length > 0 && (
                    <span className="where">
                      Se usa en {weeks.length === 1 ? 'el módulo' : 'los módulos'} {weeks.map((w) => String(w).padStart(2, '0')).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <section className="prose">
        <h2>Como citar este sitio</h2>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.88rem', background: 'var(--pale)', padding: 'var(--s4)', borderRadius: 'var(--radius)' }}>
          Coba, S. (2026). <em>Sala de Control: aula interactiva de Control de Procesos Industriales</em> [software educativo].
          Universidad Jorge Tadeo Lozano, Programa de Ingeniería Química.
        </p>
      </section>

      <Cajetin code="CP26II-B00" sheet="B" total={null} />
    </div>
  );
}
