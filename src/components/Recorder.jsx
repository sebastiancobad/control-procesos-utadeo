import { useMemo, useRef, useState } from 'react';
import { decimate, extent } from '../lib/ode.js';

/* ===========================================================
   Registrador de banda.
   El instrumento característico de una sala de control: papel
   cuadriculado, trazos de PV, SP y salida del controlador.
   Se dibuja a mano en SVG para controlar la semantica de color.
   =========================================================== */

const PAL = {
  pv: 'var(--pv)',
  sp: 'var(--sp)',
  mv: 'var(--mv)',
  d: 'var(--dist)',
  alarm: 'var(--alarm)',
};

function niceTicks(lo, hi, count = 5) {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
  const start = Math.ceil(lo / step) * step;
  const out = [];
  for (let v = start; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

const fmt = (v) => {
  const a = Math.abs(v);
  if (a >= 1000) return v.toFixed(0);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  return v.toFixed(3);
};

/**
 * series: [{ key, label, color, dash, axis:'left'|'right', width }]
 * data:   [{ t, ...valores }]
 */
export default function Recorder({
  data,
  series,
  width = 720,
  height = 300,
  tickSize = 11.5,
  titleSize = 12,
  xLabel = 'Tiempo',
  yLabel = '',
  yRightLabel = '',
  xDomain,
  yDomain,
  yRightDomain,
  bands = [],
  markers = [],
  showCursor = true,
}) {
  const wrapRef = useRef(null);
  const [cur, setCur] = useState(null);

  const W = width;
  const H = height;
  const hasRight = series.some((s) => s.axis === 'right');
  const ancho = W < 620;
  const M = ancho
    ? { t: 12, r: hasRight ? 70 : 18, b: 40, l: 66 }
    : { t: 14, r: hasRight ? 74 : 20, b: 42, l: 72 };
  const pw = W - M.l - M.r;
  const ph = H - M.t - M.b;

  const pts = useMemo(() => decimate(data, 560), [data]);

  // el eje de tiempo puede fijarse para que la traza avance sobre una escala estable
  const xs = xDomain || (pts.length ? [pts[0].t, pts[pts.length - 1].t] : [0, 1]);
  const leftKeys = series.filter((s) => s.axis !== 'right').map((s) => s.key);
  const rightKeys = series.filter((s) => s.axis === 'right').map((s) => s.key);
  const yd = yDomain || extent(pts, leftKeys);
  const yrd = yRightDomain || (rightKeys.length ? extent(pts, rightKeys) : [0, 1]);

  const sx = (t) => M.l + ((t - xs[0]) / (xs[1] - xs[0] || 1)) * pw;
  const syL = (v) => M.t + ph - ((v - yd[0]) / (yd[1] - yd[0] || 1)) * ph;
  const syR = (v) => M.t + ph - ((v - yrd[0]) / (yrd[1] - yrd[0] || 1)) * ph;

  const xt = niceTicks(xs[0], xs[1], ancho ? 5 : 6);
  const yt = niceTicks(yd[0], yd[1], ancho ? 4 : 5);
  const yrt = rightKeys.length ? niceTicks(yrd[0], yrd[1], ancho ? 4 : 5) : [];

  const path = (key, axis) => {
    const sy = axis === 'right' ? syR : syL;
    let d = '';
    let pen = false;
    for (const p of pts) {
      const v = p[key];
      if (v == null || Number.isNaN(v)) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${sx(p.t).toFixed(2)},${sy(v).toFixed(2)}`;
      pen = true;
    }
    return d;
  };

  const onMove = (e) => {
    if (!showCursor || !wrapRef.current || !pts.length) return;
    const r = wrapRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px < M.l || px > W - M.r) { setCur(null); return; }
    const t = xs[0] + ((px - M.l) / pw) * (xs[1] - xs[0]);
    let best = pts[0];
    let bd = Infinity;
    for (const p of pts) {
      const d = Math.abs(p.t - t);
      if (d < bd) { bd = d; best = p; }
    }
    setCur(best);
  };

  return (
    <div>
      <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setCur(null)} style={{ touchAction: 'pan-y' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} role="img" aria-label={`Registro de ${series.map((s) => s.label).join(', ')}`}>
          <rect x={M.l} y={M.t} width={pw} height={ph} fill="#FCFDFE" stroke="var(--grid)" />

          {bands.map((b, i) => (
            <rect
              key={i}
              x={M.l}
              y={syL(Math.max(b.hi, b.lo))}
              width={pw}
              height={Math.abs(syL(b.lo) - syL(b.hi))}
              fill={b.fill || 'rgba(0,85,143,.07)'}
            />
          ))}

          {xt.map((v) => (
            <line key={`gx${v}`} x1={sx(v)} y1={M.t} x2={sx(v)} y2={M.t + ph} stroke="var(--grid-soft)" />
          ))}
          {yt.map((v) => (
            <line key={`gy${v}`} x1={M.l} y1={syL(v)} x2={M.l + pw} y2={syL(v)} stroke="var(--grid-soft)" />
          ))}

          {markers.filter((m) => m.t >= xs[0] && m.t <= xs[1]).map((m, i) => (
            <g key={i}>
              <line x1={sx(m.t)} y1={M.t} x2={sx(m.t)} y2={M.t + ph} stroke={m.color || 'var(--ink-3)'} strokeWidth="1.2" strokeDasharray="4,4" />
              {m.label ? (
                <text x={sx(m.t) + 5} y={M.t + 13} fontSize={tickSize - 0.5} fill={m.color || 'var(--ink-3)'} fontFamily="var(--f-mono)">
                  {m.label}
                </text>
              ) : null}
            </g>
          ))}

          {series.map((s) => (
            <path
              key={s.key}
              d={path(s.key, s.axis)}
              fill="none"
              stroke={s.color || PAL[s.key] || 'var(--ink)'}
              strokeWidth={s.width || 2.2}
              strokeDasharray={s.dash}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {cur && (
            <g>
              <line x1={sx(cur.t)} y1={M.t} x2={sx(cur.t)} y2={M.t + ph} stroke="var(--ink-3)" strokeWidth="1" />
              {series.map((s) =>
                cur[s.key] == null ? null : (
                  <circle
                    key={s.key}
                    cx={sx(cur.t)}
                    cy={(s.axis === 'right' ? syR : syL)(cur[s.key])}
                    r="3.2"
                    fill={s.color || PAL[s.key] || 'var(--ink)'}
                  />
                )
              )}
            </g>
          )}

          {/* ejes */}
          <line x1={M.l} y1={M.t + ph} x2={M.l + pw} y2={M.t + ph} stroke="var(--ink-2)" strokeWidth="1.3" />
          <line x1={M.l} y1={M.t} x2={M.l} y2={M.t + ph} stroke="var(--ink-2)" strokeWidth="1.3" />
          {hasRight && <line x1={M.l + pw} y1={M.t} x2={M.l + pw} y2={M.t + ph} stroke="var(--mv)" strokeWidth="1.1" />}

          {xt.map((v) => (
            <text key={`tx${v}`} x={sx(v)} y={M.t + ph + tickSize + 3} fontSize={tickSize} textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--f-mono)">
              {fmt(v)}
            </text>
          ))}
          {yt.map((v) => (
            <text key={`ty${v}`} x={M.l - 7} y={syL(v) + 4} fontSize={tickSize} textAnchor="end" fill="var(--ink-3)" fontFamily="var(--f-mono)">
              {fmt(v)}
            </text>
          ))}
          {yrt.map((v) => (
            <text key={`tr${v}`} x={M.l + pw + 7} y={syR(v) + 4} fontSize={tickSize} textAnchor="start" fill="var(--mv-ink)" fontFamily="var(--f-mono)">
              {fmt(v)}
            </text>
          ))}

          <text x={M.l + pw / 2} y={H - 6} fontSize={titleSize} textAnchor="middle" fill="var(--ink-2)">{xLabel}</text>
          {yLabel && (
            <text x={12} y={M.t + ph / 2} fontSize={titleSize} textAnchor="middle" fill="var(--ink-2)" transform={`rotate(-90 12 ${M.t + ph / 2})`}>
              {yLabel}
            </text>
          )}
          {yRightLabel && (
            <text x={W - 6} y={M.t + ph / 2} fontSize={titleSize} textAnchor="middle" fill="var(--mv-ink)" transform={`rotate(90 ${W - 6} ${M.t + ph / 2})`}>
              {yRightLabel}
            </text>
          )}
        </svg>
      </div>

      <div className="legend">
        {series.map((s) => (
          <span key={s.key}>
            <i style={{ borderTopColor: s.color || PAL[s.key] || 'var(--ink)', borderTopStyle: s.dash ? 'dashed' : 'solid' }} />
            {s.label}
            {cur && cur[s.key] != null && (
              <b style={{ fontFamily: 'var(--f-mono)', fontWeight: 500, color: 'var(--ink)' }}>{` ${fmt(cur[s.key])}`}</b>
            )}
          </span>
        ))}
        {cur && (
          <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: 'var(--t-xs)' }}>
            t = {fmt(cur.t)}
          </span>
        )}
      </div>
    </div>
  );
}
