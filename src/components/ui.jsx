import { useMemo, useState, useId } from 'react';
import katex from 'katex';
import { ArrowDefs, MarkerCtx } from '../lib/isa.jsx';

/* ---------------- ecuaciones ---------------- */

export function Eq({ children, n }) {
  const html = useMemo(
    () => katex.renderToString(String(children), { displayMode: true, throwOnError: false, output: 'html' }),
    [children]
  );
  const body = <div className="eq" dangerouslySetInnerHTML={{ __html: html }} />;
  if (!n) return body;
  return (
    <div className="eq-num">
      {body}
      <span className="n">({n})</span>
    </div>
  );
}

export function Ei({ children }) {
  const html = useMemo(
    () => katex.renderToString(String(children), { displayMode: false, throwOnError: false, output: 'html' }),
    [children]
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------------- figuras ---------------- */

export function Figure({ vw, vh, caption, num, children, maxWidth = 860 }) {
  // Prefijo propio de esta figura para los ids de marcador y de recorte,
  // de modo que no se repitan ids cuando hay varias figuras en la pagina.
  const pfx = `f${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <figure className="figure">
      <div className="frame">
        <svg
          viewBox={`0 0 ${vw} ${vh}`}
          width="100%"
          style={{ maxWidth, minWidth: Math.min(vw, 580) }}
          role="img"
          aria-label={caption}
        >
          <MarkerCtx.Provider value={pfx}>
            <ArrowDefs />
            {children}
          </MarkerCtx.Provider>
        </svg>
      </div>
      {caption && (
        <figcaption>
          {num && <b>Figura {num}. </b>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ---------------- llamados ---------------- */

export function Callout({ kind = 'note', title, children }) {
  const cls = kind === 'note' ? 'callout' : `callout ${kind}`;
  const label =
    title ||
    { note: 'Concepto clave', warn: 'Error frecuente', risk: 'Riesgo de operación', plant: 'En planta' }[kind] ||
    'Nota';
  return (
    <aside className={cls}>
      <span className="kicker">{label}</span>
      {children}
    </aside>
  );
}

/* ---------------- texto con matemática intercalada ---------------- */

/**
 * Renderiza una cadena que puede llevar fragmentos LaTeX entre signos $...$.
 * Se usa en tablas, listas y retroalimentación de los quices, de modo que la
 * matemática se vea igual en todo el sitio.
 */
export function Rich({ children }) {
  if (children == null || typeof children !== 'string') return children ?? null;
  const parts = children.split(/\$([^$]+)\$/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <Ei key={i}>{p}</Ei> : <span key={i}>{p}</span>))}
    </>
  );
}

/* ---------------- tabla ---------------- */

export function Table({ caption, head, rows, numeric = [] }) {
  return (
    <div className="tbl-wrap">
      <table className="data">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>{head.map((h, i) => <th key={i}><Rich>{h}</Rich></th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={numeric.includes(j) ? 'num' : undefined}><Rich>{c}</Rich></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- cajetin (bloque de título del plano) ---------------- */

export function Cajetin({ code, sheet, total, rev = 'A', unit = 'Curso' }) {
  return (
    <div className="cajetin" aria-label="Bloque de título">
      <div>
        <span className="k">Plano</span>
        <span className="v code">{code}</span>
      </div>
      <div>
        <span className="k">Lámina</span>
        <span className="v">{total == null ? sheet : `${sheet} de ${total}`}</span>
      </div>
      <div>
        <span className="k">Revisión</span>
        <span className="v">{rev}</span>
      </div>
      <div>
        <span className="k">Unidad</span>
        <span className="v">{unit}</span>
      </div>
    </div>
  );
}

/* ---------------- pestanas ---------------- */

export function Tabs({ items, value, onChange }) {
  const id = useId();
  return (
    <div className="tabs" role="tablist" aria-label="Secciones del módulo">
      {items.map((it) => (
        <button
          key={it.key}
          role="tab"
          id={`${id}-${it.key}`}
          className="tab"
          aria-selected={value === it.key}
          onClick={() => onChange(it.key)}
        >
          {it.label}
          {it.badge != null && <span className="badge">{it.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------------- controles de simulador ---------------- */

export function Slider({ label, unit, value, min, max, step, onChange, help, format }) {
  const shown = format ? format(value) : value;
  return (
    <div className="ctrl">
      <div className="ctrl-top">
        <label className="ctrl-lab">{label}</label>
        <span className="ctrl-val">
          {shown}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
      {help && <p className="ctrl-help">{help}</p>}
    </div>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="ctrl">
      {label && <div className="ctrl-top"><label className="ctrl-lab">{label}</label></div>}
      <div className="seg" style={{ marginTop: label ? 7 : 0 }} role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.v} className={value === o.v ? 'on' : undefined} onClick={() => onChange(o.v)} type="button">
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readouts({ items }) {
  return (
    <div className="readouts">
      {items.map((it) => (
        <div className="readout" key={it.k}>
          <span className="k">{it.k}</span>
          <span className={`v${it.tone ? ` ${it.tone}` : ''}`}>{it.v}</span>
        </div>
      ))}
    </div>
  );
}

export function SimPanel({ title, tag, controls, children, note }) {
  return (
    <section className="sim">
      <div className="sim-head">
        <h4>{title}</h4>
        {tag && <span className="tag">{tag}</span>}
      </div>
      <div className="sim-body">
        <div className="sim-controls">{controls}</div>
        <div className="sim-view">{children}</div>
      </div>
      {note && (
        <div style={{ padding: '11px 16px', borderTop: '1px solid var(--grid)', fontSize: '.9rem', color: 'var(--ink-2)' }}>
          {note}
        </div>
      )}
    </section>
  );
}

/* ---------------- ejercicio resuelto ---------------- */

/**
 * Enunciado del ejercicio: la situacion de planta y lo que se pide.
 * Sin esta pieza un ejercicio resuelto es solo una derivacion.
 */
export function Enunciado({ children, pide }) {
  return (
    <div className="enunciado">
      <span className="kicker">Enunciado</span>
      {children}
      {pide && (
        <>
          <span className="kicker pide-t">Se pide</span>
          <ol className="pide">
            {pide.map((p, i) => <li key={i}><Rich>{p}</Rich></li>)}
          </ol>
        </>
      )}
    </div>
  );
}

export function Given({ title = 'Datos', children }) {
  return (
    <div className="given">
      <span className="kicker" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        {title}
      </span>
      {children}
    </div>
  );
}

export function Step({ n, title, children }) {
  return (
    <div className="step" data-n={n}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export function Answer({ children }) {
  return (
    <div className="answer">
      <span className="kicker">Respuesta</span>
      {children}
    </div>
  );
}

/* ---------------- desplegable ---------------- */

export function Reveal({ label = 'Ver desarrollo', children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: 'var(--s4) 0' }}>
      <button className="btn ghost sm" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Ocultar' : label}
      </button>
      {open && <div style={{ marginTop: 'var(--s3)' }}>{children}</div>}
    </div>
  );
}
