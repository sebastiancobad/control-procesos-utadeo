import { createContext, useContext, useId } from 'react';
/* ===========================================================
   Simbologia ISA 5.1 y primitivas de P&ID.
   Portadas del kit de laminas del curso (lib_svg.py) para que
   los diagramas de la web y los de clase sean el mismo dibujo.
   =========================================================== */

export const C = {
  navy: '#00558F',
  ink: '#15242F',
  grey: '#7C8B98',
  pale: '#EAF1F8',
  liq: '#BFD7EC',
  white: '#FFFFFF',
  mv: '#C2711C',
  dist: '#2E7D6F',
  alarm: '#A93226',
};

export const W_PROC = 3.8;   // tuberia de proceso
export const W_INSTR = 1.8;  // linea de instrumento
export const W_THIN = 1.4;   // impulso y conexion a proceso

/* ---------- texto con subindices reales (convencion X_y) ---------- */
export function T({ x, y, children, size = 26, color = C.ink, anchor = 'middle', bold = false, italic = false }) {
  if (children == null || children === '') return null;
  const s = String(children);
  const parts = [];
  const re = /([\p{L}0-9)\]])_\{?([\p{L}0-9,+-]+)\}?/gu;
  let last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push({ t: s.slice(last, m.index) });
    parts.push({ t: m[1] });
    parts.push({ t: m[2], sub: true });
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push({ t: s.slice(last) });

  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={color}
      textAnchor={anchor}
      fontWeight={bold ? 600 : 400}
      fontStyle={italic ? 'italic' : 'normal'}
      fontFamily="'IBM Plex Sans', Arial, sans-serif"
    >
      {parts.map((p, i) =>
        p.sub ? (
          <tspan key={i} fontSize={size * 0.68} dy={size * 0.2}>
            {p.t}
          </tspan>
        ) : (
          <tspan key={i} dy={i && parts[i - 1].sub ? -size * 0.2 : 0}>
            {p.t}
          </tspan>
        )
      )}
    </text>
  );
}

export const L = ({ x1, y1, x2, y2, color = C.ink, w = W_INSTR, dash, cap = 'round' }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap={cap} />
);

export const Poly = ({ pts, color = C.ink, w = W_INSTR, fill = 'none' }) => (
  <polyline points={pts.map((p) => p.join(',')).join(' ')} fill={fill} stroke={color} strokeWidth={w} strokeLinejoin="round" />
);

export const RRect = ({ x, y, w, h, fill = C.white, stroke = C.ink, sw = 2.2, rx = 6 }) => (
  <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={sw} />
);

export const Circ = ({ cx, cy, r, fill = C.white, stroke = C.ink, sw = 2.2 }) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
);

/* ---------- flechas ---------- */
/**
 * Prefijo de ids para los marcadores de flecha. Cada figura genera el suyo con
 * useId, de modo que no se repitan ids en el documento cuando hay varias
 * figuras en la misma pagina. El valor por defecto sirve para los SVG sueltos.
 */
export const MarkerCtx = createContext('isa');
export const useMarkerId = (name) => `${useContext(MarkerCtx)}-${name}`;

export function ArrowDefs() {
  const pfx = useContext(MarkerCtx);
  return (
    <defs>
      <marker id={`${pfx}-ah`} markerWidth="9" markerHeight="9" refX="7.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 z" fill={C.ink} />
      </marker>
      <marker id={`${pfx}-ahn`} markerWidth="9" markerHeight="9" refX="7.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 z" fill={C.navy} />
      </marker>
      <marker id={`${pfx}-ahd`} markerWidth="9" markerHeight="9" refX="7.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 z" fill={C.dist} />
      </marker>
      <marker id={`${pfx}-ahm`} markerWidth="9" markerHeight="9" refX="7.2" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 z" fill={C.mv} />
      </marker>
    </defs>
  );
}

export function Arrow({ x1, y1, x2, y2, color = C.ink, w = W_INSTR, dash, head = 'ah' }) {
  const pfx = useContext(MarkerCtx);
  return (
  <line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={color} strokeWidth={w} strokeDasharray={dash}
    markerEnd={`url(#${pfx}-${head})`}
  />
);
}

/** Marca de sentido de flujo sobre una línea de proceso (convencion P&ID). */
export function Flow({ x, y, dir = 'right', s = 6.5, color = C.ink }) {
  // triangulo alargado: largo 2.2s, alto 1.2s. Sobre una linea de proceso de
  // 5 unidades queda apenas por encima del trazo, sin competir con los simbolos.
  const a = s * 1.1;   // medio largo
  const b = s * 0.6;   // medio alto
  const p = {
    right: `${x - a},${y - b} ${x + a},${y} ${x - a},${y + b}`,
    left: `${x + a},${y - b} ${x - a},${y} ${x + a},${y + b}`,
    down: `${x - b},${y - a} ${x},${y + a} ${x + b},${y - a}`,
    up: `${x - b},${y + a} ${x},${y - a} ${x + b},${y + a}`,
  }[dir];
  return <polygon points={p} fill={color} />;
}

/** Boquilla: brida corta que marca la penetracion de una línea en un equipo. */
export function Nozzle({ x, y, dir = 'right', len = 14, stroke = C.ink, sw = 2.6 }) {
  const h = 9;
  if (dir === 'right' || dir === 'left') {
    const k = dir === 'right' ? 1 : -1;
    return <L x1={x + k * len} y1={y - h} x2={x + k * len} y2={y + h} color={stroke} w={sw} />;
  }
  const k = dir === 'down' ? 1 : -1;
  return <L x1={x - h} y1={y + k * len} x2={x + h} y2={y + k * len} color={stroke} w={sw} />;
}

/* ---------- equipos ---------- */
export function Vessel({ cx, top, w, h, level = null, fill = C.pale, stroke = C.ink, sw = 2.6 }) {
  const x = cx - w / 2;
  const ry = w * 0.16;
  const body = `M${x},${top + ry} A${w / 2},${ry} 0 0 1 ${x + w},${top + ry} L${x + w},${top + h - ry} A${w / 2},${ry} 0 0 1 ${x},${top + h - ry} Z`;
  let liquid = null;
  if (level != null) {
    const ly = top + h - level * (h - 2 * ry) - ry;
    liquid = (
      <g>
        <path d={`M${x},${ly} L${x + w},${ly} L${x + w},${top + h - ry} A${w / 2},${ry} 0 0 1 ${x},${top + h - ry} Z`} fill={C.liq} />
        <path d={`M${x},${ly} A${w / 2},${ry} 0 0 0 ${x + w},${ly}`} fill={C.liq} />
        <line x1={x} y1={ly} x2={x + w} y2={ly} stroke={stroke} strokeWidth={1.5} />
      </g>
    );
  }
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} />
      {liquid}
      <path d={`M${x},${top + ry} A${w / 2},${ry} 0 0 1 ${x + w},${top + ry}`} fill="none" stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

export function Pump({ cx, cy, r = 30, stroke = C.ink, sw = 2.6 }) {
  const stub = Math.max(12, r * 0.5);
  return (
    <g>
      <Circ cx={cx} cy={cy} r={r} stroke={stroke} sw={sw} />
      <Poly
        pts={[[cx - r * 0.5, cy + r * 0.42], [cx + r * 0.5, cy + r * 0.42], [cx, cy - r * 0.55], [cx - r * 0.5, cy + r * 0.42]]}
        color={stroke} w={sw * 0.9}
      />
      <L x1={cx - r} y1={cy} x2={cx - r - stub} y2={cy} color={stroke} w={sw} cap="butt" />
      <L x1={cx} y1={cy - r} x2={cx} y2={cy - r - stub} color={stroke} w={sw} cap="butt" />
    </g>
  );
}

export function HeatExchanger({ cx, cy, w = 180, h = 86, stroke = C.ink, sw = 2.6, fill = C.pale, stubs = true }) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  return (
    <g>
      <RRect x={x} y={y} w={w} h={h} rx={12} fill={fill} stroke={stroke} sw={sw} />
      <L x1={x + w * 0.16} y1={y + 6} x2={x + w * 0.16} y2={y + h - 6} color={stroke} w={sw * 0.7} />
      <L x1={x + w * 0.84} y1={y + 6} x2={x + w * 0.84} y2={y + h - 6} color={stroke} w={sw * 0.7} />
      {[0.32, 0.5, 0.68].map((fy) => (
        <L key={fy} x1={x + w * 0.16} y1={y + h * fy} x2={x + w * 0.84} y2={y + h * fy} color={stroke} w={sw * 0.55} />
      ))}
      {stubs && (
        <g>
          <L x1={x + w * 0.3} y1={y} x2={x + w * 0.3} y2={y - 16} color={stroke} w={sw} cap="butt" />
          <L x1={x + w * 0.7} y1={y + h} x2={x + w * 0.7} y2={y + h + 16} color={stroke} w={sw} cap="butt" />
          <L x1={x} y1={cy} x2={x - 16} y2={cy} color={stroke} w={sw} cap="butt" />
          <L x1={x + w} y1={cy} x2={x + w + 16} y2={cy} color={stroke} w={sw} cap="butt" />
        </g>
      )}
    </g>
  );
}

/** Reactor de tanque agitado con chaqueta. */
export function CSTR({ cx, cy, w = 150, h = 170, level = 0.62, jacket = true, stroke = C.ink, sw = 2.6 }) {
  const top = cy - h / 2;
  const jx = w / 2 + 15;
  return (
    <g>
      {jacket && (
        <path
          d={`M${cx - jx},${top + 12} L${cx - jx},${top + h - 6} A${jx},${jx * 0.2} 0 0 0 ${cx + jx},${top + h - 6} L${cx + jx},${top + 12}`}
          fill="none" stroke={stroke} strokeWidth={sw * 0.75}
        />
      )}
      <Vessel cx={cx} top={top} w={w} h={h} level={level} stroke={stroke} sw={sw} />
      <L x1={cx} y1={top - 18} x2={cx} y2={top + h * 0.62} color={stroke} w={sw * 0.9} />
      <L x1={cx - 30} y1={top + h * 0.62} x2={cx + 30} y2={top + h * 0.62} color={stroke} w={sw * 0.9} />
      <L x1={cx - 26} y1={top + h * 0.4} x2={cx + 26} y2={top + h * 0.4} color={stroke} w={sw * 0.9} />
      <Circ cx={cx} cy={top - 26} r={11} stroke={stroke} sw={sw * 0.8} />
    </g>
  );
}

/** Serpentin interno de calentamiento o enfriamiento, dentro de un recipiente. */
export function Coil({ cx, cy, w = 96, h = 70, turns = 4, stroke = C.ink, sw = 2.6 }) {
  const x = cx - w / 2;
  const step = h / turns;
  let d = `M${x},${cy - h / 2}`;
  for (let i = 0; i < turns; i++) {
    const y0 = cy - h / 2 + i * step;
    d += `L${x + w},${y0 + step * 0.32}L${x},${y0 + step * 0.68}`;
  }
  d += `L${x + w},${cy + h / 2}`;
  return <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />;
}

/** Placa de orificio con sus dos tomas de presión, sobre una línea horizontal. */
export function Orifice({ cx, cy, s = 20, stroke = C.ink, sw = 2.6, dir = 'up' }) {
  const k = dir === 'down' ? 1 : -1;
  return (
    <g>
      <L x1={cx} y1={cy - s} x2={cx} y2={cy - s * 0.32} color={stroke} w={sw} />
      <L x1={cx} y1={cy + s * 0.32} x2={cx} y2={cy + s} color={stroke} w={sw} />
      <L x1={cx - s * 1.4} y1={cy + k * s} x2={cx - s * 1.4} y2={cy + k * s * 1.9} color={stroke} w={W_THIN} />
      <L x1={cx + s * 1.4} y1={cy + k * s} x2={cx + s * 1.4} y2={cy + k * s * 1.9} color={stroke} w={W_THIN} />
    </g>
  );
}

/** Termopozo: vaina que aisla el elemento del proceso y le agrega inercia termica. */
export function Thermowell({ cx, cy, len = 30, ancho = 11, stroke = C.ink, sw = 2.2, dir = 'left' }) {
  // Vaina rectangular que cruza la pared y penetra en el fluido (ANSI/ISA-5.1).
  // Sobresale unas pocas unidades hacia afuera para que se vea la penetracion.
  const fuera = 7;
  if (dir === 'up' || dir === 'down') {
    const k = dir === 'down' ? 1 : -1;
    const y0 = k > 0 ? cy - fuera : cy - len;
    return <rect x={cx - ancho / 2} y={y0} width={ancho} height={len + fuera} fill={C.white} stroke={stroke} strokeWidth={sw} />;
  }
  const k = dir === 'left' ? -1 : 1;
  const x0 = k > 0 ? cx - fuera : cx - len;
  return <rect x={x0} y={cy - ancho / 2} width={len + fuera} height={ancho} fill={C.white} stroke={stroke} strokeWidth={sw} />;
}

/** Recipiente horizontal con tapas semielipticas: tambores de gas y acumuladores. */
export function Drum({ cx, cy, w = 200, h = 92, level = null, fill = C.pale, stroke = C.ink, sw = 2.6 }) {
  const y = cy - h / 2;
  const rx = h * 0.30;
  const x = cx - w / 2;
  const body = `M${x + rx},${y} L${x + w - rx},${y} A${rx},${h / 2} 0 0 1 ${x + w - rx},${y + h} L${x + rx},${y + h} A${rx},${h / 2} 0 0 1 ${x + rx},${y} Z`;
  const cid = `dr${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  let liquid = null;
  if (level != null) {
    const ly = y + h * (1 - level);
    liquid = (
      <g>
        <clipPath id={cid}><path d={body} /></clipPath>
        <rect x={x} y={ly} width={w} height={y + h - ly} fill={C.liq} clipPath={`url(#${cid})`} />
        <line x1={x + rx * 0.3} y1={ly} x2={x + w - rx * 0.3} y2={ly} stroke={stroke} strokeWidth={1.5} />
      </g>
    );
  }
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} />
      {liquid}
      <path d={`M${x + rx},${y} A${rx},${h / 2} 0 0 0 ${x + rx},${y + h}`} fill="none" stroke={stroke} strokeWidth={sw} />
      <path d={`M${x + w - rx},${y} A${rx},${h / 2} 0 0 1 ${x + w - rx},${y + h}`} fill="none" stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

/**
 * Conector de continuidad: la línea sigue en otro plano o en otra área.
 * Pentágono orientado en el sentido del flujo, con la referencia de destino.
 */
export function Conector({ x, y, dir = 'right', w = 74, h = 15, label = '', stroke = C.ink, sw = 2, size = 15 }) {
  const p = dir === 'right'
    ? `${x},${y - h} ${x + w - h},${y - h} ${x + w},${y} ${x + w - h},${y + h} ${x},${y + h}`
    : dir === 'left'
      ? `${x},${y - h} ${x - w + h},${y - h} ${x - w},${y} ${x - w + h},${y + h} ${x},${y + h}`
      : dir === 'down'
        ? `${x - h},${y} ${x - h},${y + w - h} ${x},${y + w} ${x + h},${y + w - h} ${x + h},${y}`
        : `${x - h},${y} ${x - h},${y - w + h} ${x},${y - w} ${x + h},${y - w + h} ${x + h},${y}`;
  const tx = dir === 'right' ? x + (w - h) / 2 + 2 : dir === 'left' ? x - (w - h) / 2 - 2 : x;
  const ty = dir === 'down' ? y + w / 2 + size * 0.34 : dir === 'up' ? y - w / 2 + size * 0.34 : y + size * 0.34;
  return (
    <g>
      <polygon points={p} fill={C.white} stroke={stroke} strokeWidth={sw} />
      <T x={tx} y={ty} size={size} color={C.navy} bold>{label}</T>
    </g>
  );
}

/* ---------- válvulas ---------- */
const Bowtie = ({ cx, cy, s, stroke = C.ink, sw = 2.6, fill = C.white }) => (
  <Poly
    pts={[[cx - s, cy - s * 0.62], [cx + s, cy + s * 0.62], [cx + s, cy - s * 0.62], [cx - s, cy + s * 0.62], [cx - s, cy - s * 0.62]]}
    color={stroke} w={sw} fill={fill}
  />
);

export const ManualValve = ({ cx, cy, s = 22, stroke = C.ink, sw = 2.6 }) => (
  <g>
    <Bowtie cx={cx} cy={cy} s={s} stroke={stroke} sw={sw} />
    <L x1={cx} y1={cy} x2={cx} y2={cy - s * 1.55} color={stroke} w={sw} />
    <L x1={cx - s * 0.7} y1={cy - s * 1.55} x2={cx + s * 0.7} y2={cy - s * 1.55} color={stroke} w={sw} />
  </g>
);

export function ControlValve({ cx, cy, s = 22, stroke = C.ink, sw = 2.6, label = null }) {
  const stemTop = cy - s * 1.35;
  const rr = s * 0.95;
  return (
    <g>
      <Bowtie cx={cx} cy={cy} s={s} stroke={stroke} sw={sw} />
      <L x1={cx} y1={cy} x2={cx} y2={stemTop} color={stroke} w={sw} />
      <path d={`M${cx - rr},${stemTop} A${rr},${rr * 0.78} 0 0 1 ${cx + rr},${stemTop} Z`} fill={C.white} stroke={stroke} strokeWidth={sw} />
      <L x1={cx - rr} y1={stemTop} x2={cx + rr} y2={stemTop} color={stroke} w={sw} />
      {label && <T x={cx + s * 1.9} y={cy + 8} size={20} color={C.grey} anchor="start">{label}</T>}
    </g>
  );
}

export const CheckValve = ({ cx, cy, s = 22, stroke = C.ink, sw = 2.6 }) => (
  <g>
    <Bowtie cx={cx} cy={cy} s={s} stroke={stroke} sw={sw} />
    <L x1={cx + s * 0.05} y1={cy - s * 0.5} x2={cx + s * 0.05} y2={cy + s * 0.5} color={stroke} w={sw} />
  </g>
);

/** Punto de conexion del actuador, para trazar la señal desde el controlador. */
export const actuatorTop = (cx, cy, s = 22) => [cx, cy - s * 1.35 - s * 0.95 * 0.78];

/* ---------- burbuja de instrumento ISA 5.1 ---------- */
export function Bubble({
  cx, cy, tag, num, r = 34,
  location = 'field',      // field | room | rear | aux
  system = 'discrete',     // discrete | dcs | computer | plc
  stroke = C.ink, sw = 2.4, tagsize = 24, numsize = 22,
}) {
  const shapes = [];
  if (system === 'discrete') {
    shapes.push(<Circ key="c" cx={cx} cy={cy} r={r} stroke={stroke} sw={sw} />);
  } else if (system === 'dcs') {
    shapes.push(<RRect key="r" x={cx - r} y={cy - r} w={2 * r} h={2 * r} rx={0} stroke={stroke} sw={sw} />);
    shapes.push(<Circ key="c" cx={cx} cy={cy} r={r} fill="none" stroke={stroke} sw={sw} />);
  } else if (system === 'computer') {
    const rr = r * 1.12;
    shapes.push(
      <Poly key="h"
        pts={[[cx - rr * 0.5, cy - rr * 0.86], [cx + rr * 0.5, cy - rr * 0.86], [cx + rr, cy], [cx + rr * 0.5, cy + rr * 0.86], [cx - rr * 0.5, cy + rr * 0.86], [cx - rr, cy], [cx - rr * 0.5, cy - rr * 0.86]]}
        color={stroke} w={sw} fill={C.white}
      />
    );
  } else if (system === 'plc') {
    shapes.push(<RRect key="r" x={cx - r} y={cy - r} w={2 * r} h={2 * r} rx={0} stroke={stroke} sw={sw} />);
    shapes.push(<Poly key="d" pts={[[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy], [cx, cy - r]]} color={stroke} w={sw} />);
  }
  const loc = [];
  if (location === 'room') loc.push(<L key="l" x1={cx - r * 0.92} y1={cy} x2={cx + r * 0.92} y2={cy} color={stroke} w={sw} />);
  if (location === 'rear') loc.push(<L key="l" x1={cx - r * 0.92} y1={cy} x2={cx + r * 0.92} y2={cy} color={stroke} w={sw} dash="6,5" />);
  if (location === 'aux') {
    loc.push(<L key="a" x1={cx - r * 0.92} y1={cy - 3.5} x2={cx + r * 0.92} y2={cy - 3.5} color={stroke} w={sw} />);
    loc.push(<L key="b" x1={cx - r * 0.92} y1={cy + 3.5} x2={cx + r * 0.92} y2={cy + 3.5} color={stroke} w={sw} />);
  }
  return (
    <g>
      {shapes}
      {loc}
      <T x={cx} y={cy - 4} size={tagsize} color={C.navy} bold>{tag}</T>
      <T x={cx} y={cy + numsize - 2} size={numsize} color={C.ink}>{num}</T>
    </g>
  );
}

/* ---------- líneas de señal ISA ---------- */
export function Sig({ x1, y1, x2, y2, kind = 'electric', color = C.ink, w = W_INSTR, arrow = false }) {
  const pfx = useContext(MarkerCtx);
  const head = arrow ? (color === C.navy ? 'ahn' : color === C.dist ? 'ahd' : color === C.mv ? 'ahm' : 'ah') : undefined;
  const base = (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={kind === 'process' ? W_PROC : kind === 'impulse' ? W_THIN : w}
      strokeDasharray={kind === 'electric' ? '10,6' : undefined}
      strokeLinecap={kind === 'process' ? 'butt' : 'round'}
      markerEnd={head ? `url(#${pfx}-${head})` : undefined}
    />
  );
  if (kind === 'process' || kind === 'impulse' || kind === 'electric') return base;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const Lm = Math.hypot(dx, dy) || 1;
  const ux = dx / Lm;
  const uy = dy / Lm;
  const px = -uy;
  const py = ux;
  const n = Math.max(2, Math.floor(Lm / 55));
  const marks = [];
  for (let i = 1; i <= n; i++) {
    const t = (Lm * i) / (n + 1);
    const mx = x1 + ux * t;
    const my = y1 + uy * t;
    if (kind === 'pneumatic') {
      const ax = (px + ux) / 1.41;
      const ay = (py + uy) / 1.41;
      [-5, 5].forEach((off, j) => {
        const ox = mx + ux * off;
        const oy = my + uy * off;
        marks.push(<L key={`${i}-${j}`} x1={ox - ax * 9} y1={oy - ay * 9} x2={ox + ax * 9} y2={oy + ay * 9} color={color} w={w} />);
      });
    } else if (kind === 'software') {
      marks.push(<Circ key={i} cx={mx} cy={my} r={4.5} stroke={color} sw={w} />);
    } else if (kind === 'capillary') {
      marks.push(<L key={`${i}a`} x1={mx - px * 7 - ux * 5} y1={my - py * 7 - uy * 5} x2={mx + px * 7 + ux * 5} y2={my + py * 7 + uy * 5} color={color} w={w} />);
      marks.push(<L key={`${i}b`} x1={mx - px * 7 + ux * 5} y1={my - py * 7 + uy * 5} x2={mx + px * 7 - ux * 5} y2={my + py * 7 - uy * 5} color={color} w={w} />);
    }
  }
  return <g>{base}{marks}</g>;
}

/* ---------- diagrama de bloques ---------- */
export function Block({ cx, cy, w, h, label, sub, fill = C.pale, stroke = C.navy, sw = 2.6, size = 26, color = C.ink }) {
  return (
    <g>
      <RRect x={cx - w / 2} y={cy - h / 2} w={w} h={h} rx={8} fill={fill} stroke={stroke} sw={sw} />
      {sub ? (
        <>
          <T x={cx} y={cy - 2} size={size} color={color} bold>{label}</T>
          <T x={cx} y={cy + size - 2} size={size - 6} color={C.grey}>{sub}</T>
        </>
      ) : (
        <T x={cx} y={cy + size * 0.33} size={size} color={color} bold>{label}</T>
      )}
    </g>
  );
}

export function SumPoint({ cx, cy, r = 26, stroke = C.navy, sw = 2.6, signs = [['+', 'l'], ['-', 'b']] }) {
  const pos = {
    l: [cx - r - 14, cy - 8], r: [cx + r + 14, cy - 8],
    t: [cx + 14, cy - r - 8], b: [cx + 14, cy + r + 22],
    tl: [cx - r + 2, cy - r - 6], tr: [cx + r - 2, cy - r - 6],
    bl: [cx - r + 2, cy + r + 20], br: [cx + r - 2, cy + r + 20],
  };
  return (
    <g>
      <Circ cx={cx} cy={cy} r={r} stroke={stroke} sw={sw} />
      <L x1={cx - r * 0.6} y1={cy} x2={cx + r * 0.6} y2={cy} color={stroke} w={1.6} />
      <L x1={cx} y1={cy - r * 0.6} x2={cx} y2={cy + r * 0.6} color={stroke} w={1.6} />
      {signs.map(([s, p], i) => (
        <T key={i} x={pos[p][0]} y={pos[p][1]} size={28} color={stroke} bold>{s}</T>
      ))}
    </g>
  );
}
