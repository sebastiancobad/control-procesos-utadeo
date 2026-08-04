/* ===========================================================
   Motor numérico del aula.
   Integrador Runge-Kutta de cuarto orden a paso fijo, con
   retardo por transporte implementado como buffer circular.
   Todo corre en el navegador del estudiante, sin servidor.
   =========================================================== */

/** Un paso de RK4 para dx/dt = f(t, x, u). x es un arreglo. */
export function rk4Step(f, t, x, dt, u) {
  const n = x.length;
  const k1 = f(t, x, u);
  const x2 = new Array(n);
  for (let i = 0; i < n; i++) x2[i] = x[i] + (dt / 2) * k1[i];
  const k2 = f(t + dt / 2, x2, u);
  const x3 = new Array(n);
  for (let i = 0; i < n; i++) x3[i] = x[i] + (dt / 2) * k2[i];
  const k3 = f(t + dt / 2, x3, u);
  const x4 = new Array(n);
  for (let i = 0; i < n; i++) x4[i] = x[i] + dt * k3[i];
  const k4 = f(t + dt, x4, u);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = x[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  return out;
}

/**
 * Línea de retardo por transporte (dead time).
 * Retiene la señal theta unidades de tiempo antes de entregarla.
 */
export class DeadTime {
  constructor(theta, dt, seed = 0) {
    this.n = Math.max(0, Math.round(theta / dt));
    // El buffer mide exactamente n muestras: con n+1 el retardo efectivo
    // resultaba theta + dt, un paso de mas en cada llamada.
    this.buf = new Array(Math.max(1, this.n)).fill(seed);
    this.i = 0;
  }
  push(v) {
    if (this.n === 0) return v;
    const out = this.buf[this.i];
    this.buf[this.i] = v;
    this.i = (this.i + 1) % this.buf.length;
    return out;
  }
  reset(seed = 0) {
    this.buf.fill(seed);
    this.i = 0;
  }
}

/** Satura un valor dentro de [lo, hi]. */
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Muestreo uniforme de una serie larga para no dibujar mas puntos de los utiles. */
export function decimate(series, maxPoints = 420) {
  if (series.length <= maxPoints) return series;
  const step = Math.ceil(series.length / maxPoints);
  const out = [];
  for (let i = 0; i < series.length; i += step) out.push(series[i]);
  const last = series[series.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Extremos de un conjunto de series para escalar los ejes. */
export function extent(series, keys) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of series) {
    for (const k of keys) {
      const v = p[k];
      if (v == null || Number.isNaN(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  if (!Number.isFinite(lo)) return [0, 1];
  if (hi - lo < 1e-9) return [lo - 0.5, hi + 0.5];
  const pad = (hi - lo) * 0.09;
  return [lo - pad, hi + pad];
}

/* ---------- indices de desempeno de la respuesta ---------- */

/**
 * Métricas clásicas de la respuesta a un cambio en el punto de control.
 * y0 valor inicial, ysp punto de control final, banda de asentamiento en fracción.
 */
export function metrics(series, y0, ysp, band = 0.02) {
  const span = ysp - y0;
  if (Math.abs(span) < 1e-9) return null;
  let peak = y0;
  let tPeak = 0;
  let tRise = null;
  let tSettle = null;
  let iae = 0;
  let prevT = series[0]?.t ?? 0;

  for (const p of series) {
    const dt = p.t - prevT;
    prevT = p.t;
    iae += Math.abs(ysp - p.pv) * dt;
    const frac = (p.pv - y0) / span;
    if (tRise === null && frac >= 0.98) tRise = p.t;
    if ((span > 0 && p.pv > peak) || (span < 0 && p.pv < peak)) {
      peak = p.pv;
      tPeak = p.t;
    }
  }
  for (let i = series.length - 1; i >= 0; i--) {
    if (Math.abs(series[i].pv - ysp) > Math.abs(band * span)) {
      tSettle = series[Math.min(i + 1, series.length - 1)].t;
      break;
    }
  }
  const overshoot = ((peak - ysp) / span) * 100;
  return {
    overshoot: Math.max(0, overshoot),
    tPeak,
    tRise,
    tSettle,
    iae,
    peak,
  };
}
