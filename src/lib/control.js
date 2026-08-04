/* ===========================================================
   Modelos de proceso, controlador y analisis de estabilidad.
   Nomenclatura del curso: K ganancia, tau constante de tiempo,
   theta tiempo muerto, K_c ganancia del controlador,
   tau_I tiempo integral, tau_D tiempo derivativo.
   =========================================================== */

import { rk4Step, DeadTime, clamp } from './ode.js';

/* -----------------------------------------------------------
   1. Respuesta de lazo abierto
   ----------------------------------------------------------- */

/**
 * Proceso de primer orden con tiempo muerto (FOPDT):
 *   tau dy/dt + y = K u(t - theta)
 * Respuesta a un escalon de amplitud du aplicado en tStep.
 */
export function fopdtStep({ K, tau, theta, du = 1, y0 = 0, tEnd = 40, dt = 0.02, tStep = 1 }) {
  const out = [];
  for (let t = 0; t <= tEnd + 1e-9; t += dt) {
    const te = t - tStep - theta;
    const y = te <= 0 ? y0 : y0 + K * du * (1 - Math.exp(-te / tau));
    out.push({ t: +t.toFixed(4), pv: y, mv: t >= tStep ? du : 0 });
  }
  return out;
}

/**
 * Proceso de segundo orden:
 *   tau^2 y'' + 2 zeta tau y' + y = K u(t - theta)
 * Se integra numericamente para cubrir los tres regimenes
 * (sobreamortiguado, crítico y subamortiguado) con un solo codigo.
 */
export function socpdtStep({ K, tau, zeta, theta = 0, du = 1, y0 = 0, tEnd = 40, dt = 0.01, tStep = 1 }) {
  const delay = new DeadTime(theta, dt, 0);
  let x = [y0, 0];
  const f = (t, s, u) => {
    const [y, dy] = s;
    return [dy, (K * u - y - 2 * zeta * tau * dy) / (tau * tau)];
  };
  const out = [];
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const uRaw = t >= tStep ? du : 0;
    const u = delay.push(uRaw);
    out.push({ t: +t.toFixed(4), pv: x[0], mv: uRaw });
    x = rk4Step(f, t, x, dt, u);
  }
  return out;
}

/** Raices del polinomio caracteristico tau^2 s^2 + 2 zeta tau s + 1. */
export function socRoots(tau, zeta) {
  const a = tau * tau;
  const b = 2 * zeta * tau;
  const disc = b * b - 4 * a;
  if (disc >= 0) {
    const r = Math.sqrt(disc);
    return { real: true, r1: (-b + r) / (2 * a), r2: (-b - r) / (2 * a) };
  }
  const r = Math.sqrt(-disc);
  return { real: false, re: -b / (2 * a), im: r / (2 * a) };
}

/** Descriptores de la respuesta subamortiguada (Seborg cap. 5). */
export function underdamped(tau, zeta, K = 1, du = 1) {
  if (zeta >= 1) return null;
  const overshoot = Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100;
  const tPeak = (Math.PI * tau) / Math.sqrt(1 - zeta * zeta);
  const period = (2 * Math.PI * tau) / Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp((-2 * Math.PI * zeta) / Math.sqrt(1 - zeta * zeta));
  return { overshoot, tPeak, period, decay, yPeak: K * du * (1 + overshoot / 100) };
}

/* -----------------------------------------------------------
   2. Válvula de control
   ----------------------------------------------------------- */

/** Característica inherente: fraccion de Cv en función de la apertura x en [0,1]. */
export function inherent(x, type, R = 50) {
  const f = clamp(x, 0, 1);
  if (type === 'iso') return Math.pow(R, f - 1);       // isoporcentual
  if (type === 'ra') return Math.sqrt(f);              // apertura rapida
  return f;                                            // lineal
}

/**
 * Característica instalada. El coeficiente de autoridad
 *   psi = dP_valvula(100% abierta) / dP_total
 * mide cuanta de la caida de presión queda en la válvula.
 * q/q_max = f(x) / sqrt(psi + (1 - psi) f(x)^2)
 */
export function installed(x, type, psi, R = 50) {
  const f = inherent(x, type, R);
  return f / Math.sqrt(psi + (1 - psi) * f * f);
}

/** Flujo por la válvula:  q = Cv f(x) sqrt(dP / Gf), unidades US. */
export function valveFlow(Cv, x, type, dP, Gf = 1, R = 50) {
  return Cv * inherent(x, type, R) * Math.sqrt(Math.max(dP, 0) / Gf);
}

/** Ganancia local de la característica instalada, por diferencias centradas. */
export function installedGain(x, type, psi, R = 50, h = 0.01) {
  const a = installed(clamp(x - h, 0, 1), type, psi, R);
  const b = installed(clamp(x + h, 0, 1), type, psi, R);
  return (b - a) / (2 * h);
}

/* -----------------------------------------------------------
   3. Controlador PID
   ----------------------------------------------------------- */

/**
 * PID en forma ideal (ISA), con derivada sobre la medida y anti-windup
 * por integración condicional. Actua sobre error normalizado.
 *   u = ubias + K_c [ e + (1/tau_I) INT e dt - tau_D dPV/dt ]
 */
export class PID {
  constructor({ Kc, tauI, tauD, dt, uMin = 0, uMax = 100, ubias = 0, direct = false, beta = 1 }) {
    Object.assign(this, { Kc, tauI, tauD, dt, uMin, uMax, ubias, direct, beta });
    this.I = 0;
    this.pvPrev = null;
    this.u = ubias;
  }
  reset(pv, u = this.ubias) {
    this.I = 0;
    this.pvPrev = pv;
    this.u = u;
  }
  step(sp, pv) {
    const sign = this.direct ? -1 : 1;
    const e = sign * (sp - pv);
    const prop = this.Kc * (this.beta * sign * sp - sign * pv);
    const dpv = this.pvPrev === null ? 0 : (pv - this.pvPrev) / this.dt;
    this.pvPrev = pv;
    const D = this.tauD > 0 ? -this.Kc * this.tauD * sign * dpv : 0;
    const Inext = this.tauI > 0 ? this.I + (this.Kc / this.tauI) * e * this.dt : 0;
    let u = this.ubias + prop + Inext + D;
    if (u > this.uMax || u < this.uMin) {
      // integración condicional: solo se congela si el error empuja hacia el limite
      const uFree = this.ubias + prop + this.I + D;
      u = clamp(u, this.uMin, this.uMax);
      const pushingOut = (uFree > this.uMax && e > 0) || (uFree < this.uMin && e < 0);
      if (!pushingOut) this.I = Inext;
    } else {
      this.I = Inext;
    }
    this.u = clamp(u, this.uMin, this.uMax);
    return this.u;
  }
}

/**
 * Lazo cerrado: PID + FOPDT + perturbación de carga.
 * El proceso se integra con Euler explicito a paso corto (dt << tau), que para
 * un primer orden con retardo da un error por debajo del 0.5 % frente a la
 * solucion analítica y mantiene el calculo fluido en el navegador.
 * El proceso y la perturbación comparten la salida:
 *   tau dy/dt + y = K u(t-theta) + K_d d(t-theta_d)
 */
export function closedLoop({
  K, tau, theta,
  Kc, tauI, tauD,
  sp0 = 50, spStep = 10, tSP = 2,
  Kd = 0, dStep = 0, tD = 1e9, thetaD = 0,
  noise = 0,
  uMin = 0, uMax = 100,
  u0 = 35,                 // apertura nominal del elemento final en el punto de operación
  tEnd = 60, dt = 0.02,
  direct = false,
}) {
  const pid = new PID({ Kc, tauI, tauD, dt, uMin, uMax, ubias: u0, direct });
  const delayU = new DeadTime(theta, dt, u0);
  const delayD = new DeadTime(thetaD, dt, 0);
  pid.reset(sp0, u0);

  let y = sp0;
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff - 0.5;
  };

  const out = [];
  const n = Math.round(tEnd / dt);
  const yBias = sp0 - K * u0;
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const sp = t >= tSP ? sp0 + spStep : sp0;
    const d = t >= tD ? dStep : 0;
    const meas = y + (noise ? noise * rnd() : 0);
    const u = pid.step(sp, meas);
    out.push({ t: +t.toFixed(4), pv: y, sp, mv: u, d, meas });
    const ud = delayU.push(u);
    const dd = delayD.push(d);
    const dydt = (yBias + K * ud + Kd * dd - y) / tau;
    y += dydt * dt;
  }
  return out;
}

/* -----------------------------------------------------------
   4. Reglas de sintonía
   ----------------------------------------------------------- */

/** Ziegler-Nichols sobre la curva de reaccion (lazo abierto). */
export function tuneZN({ K, tau, theta }, mode = 'PID') {
  const R = K * (theta / tau);
  if (mode === 'P') return { Kc: 1 / R, tauI: 0, tauD: 0 };
  if (mode === 'PI') return { Kc: 0.9 / R, tauI: 3.33 * theta, tauD: 0 };
  return { Kc: 1.2 / R, tauI: 2 * theta, tauD: 0.5 * theta };
}

/** Cohen-Coon (lazo abierto), mejor para theta/tau grande. */
export function tuneCC({ K, tau, theta }, mode = 'PID') {
  const r = theta / tau;
  if (mode === 'P') {
    return { Kc: (1 / K) * (1 / r) * (1 + r / 3), tauI: 0, tauD: 0 };
  }
  if (mode === 'PI') {
    return {
      Kc: (1 / K) * (1 / r) * (0.9 + r / 12),
      tauI: theta * ((30 + 3 * r) / (9 + 20 * r)),
      tauD: 0,
    };
  }
  return {
    Kc: (1 / K) * (1 / r) * (1.33 + r / 4),
    tauI: theta * ((32 + 6 * r) / (13 + 8 * r)),
    tauD: (4 * theta) / (11 + 2 * r),
  };
}

/** IMC / lambda tuning para FOPDT con aproximación de Pade (Rivera-Morari). */
export function tuneIMC({ K, tau, theta }, lambda, mode = 'PID') {
  const lam = lambda ?? Math.max(0.8 * theta, 0.1 * tau);
  if (mode === 'P') {
    return { Kc: tau / (K * (lam + theta)), tauI: 0, tauD: 0, lambda: lam };
  }
  if (mode === 'PI') {
    // Aproximacion de primer orden: sin accion derivativa el modelo interno
    // no compensa el retardo, asi que tauI recupera la constante del proceso.
    return { Kc: tau / (K * (lam + theta)), tauI: tau, tauD: 0, lambda: lam };
  }
  return {
    Kc: (1 / K) * ((tau + theta / 2) / (lam + theta / 2)),
    tauI: tau + theta / 2,
    tauD: (tau * theta) / (2 * tau + theta),
    lambda: lam,
  };
}

/** Ziegler-Nichols de lazo cerrado, a partir de la ganancia última. */
export function tuneZNClosed(Ku, Pu, mode = 'PID') {
  if (mode === 'P') return { Kc: 0.5 * Ku, tauI: 0, tauD: 0 };
  if (mode === 'PI') return { Kc: 0.45 * Ku, tauI: Pu / 1.2, tauD: 0 };
  return { Kc: 0.6 * Ku, tauI: Pu / 2, tauD: Pu / 8 };
}

/* -----------------------------------------------------------
   5. Estabilidad en el dominio del tiempo
   ----------------------------------------------------------- */

/**
 * Arreglo de Routh para a[0] s^n + a[1] s^(n-1) + ... + a[n].
 * Devuelve las filas y el numero de cambios de signo en la
 * primera columna, que equivale a raices en el semiplano derecho.
 */
export function routh(coeffs) {
  const a = coeffs.slice();
  const n = a.length - 1;
  const rows = [];
  const cols = Math.ceil((n + 1) / 2);
  const r0 = [];
  const r1 = [];
  for (let i = 0; i <= n; i += 2) r0.push(a[i]);
  for (let i = 1; i <= n; i += 2) r1.push(a[i]);
  while (r0.length < cols) r0.push(0);
  while (r1.length < cols) r1.push(0);
  rows.push(r0, r1);

  for (let k = 2; k <= n; k++) {
    const prev = rows[k - 1];
    const prev2 = rows[k - 2];
    let pivot = prev[0];
    let epsilon = false;
    if (Math.abs(pivot) < 1e-12) {
      pivot = 1e-9;
      epsilon = true;
    }
    const row = [];
    for (let j = 0; j < cols - 1; j++) {
      row.push((pivot * prev2[j + 1] - prev2[0] * prev[j + 1]) / pivot);
    }
    row.push(0);
    row.epsilon = epsilon;
    rows.push(row);
  }
  let changes = 0;
  let prevSign = Math.sign(rows[0][0]) || 1;
  for (let k = 1; k <= n; k++) {
    const v = rows[k][0];
    const s = Math.sign(v) || prevSign;
    if (s !== prevSign) changes++;
    prevSign = s;
  }
  return { rows, changes, stable: changes === 0, order: n };
}

/** Formatea el arreglo de Routh con las etiquetas s^n. */
export function routhLabels(order) {
  return Array.from({ length: order + 1 }, (_, i) => order - i);
}

/**
 * Ganancia última de un lazo con proceso de tercer orden
 *   G = K / [(tau1 s + 1)(tau2 s + 1)(tau3 s + 1)]
 * y controlador proporcional. Se obtiene del criterio de Routh.
 */
export function ultimateGainThirdOrder(K, t1, t2, t3) {
  const a0 = t1 * t2 * t3;
  const a1 = t1 * t2 + t1 * t3 + t2 * t3;
  const a2 = t1 + t2 + t3;
  // Routh sobre a0 s^3 + a1 s^2 + a2 s + (1 + Kc K):
  //   b1 = 0  =>  a1 a2 = a0 (1 + Kc K)  =>  Kcu = (a1 a2 / a0 - 1) / K
  const Ku = (a1 * a2 - a0) / (a0 * K);
  const wu = Math.sqrt(a2 / a0);
  return { Ku, wu, Pu: (2 * Math.PI) / wu };
}

/**
 * Ganancia última de un lazo FOPDT con controlador proporcional.
 * No usa aproximación de Pade: resuelve el cruce de fase exacto
 *   arctan(w tau) + w theta = pi
 * por biseccion, y evalua la amplitud en esa frecuencia.
 * Sin tiempo muerto la fase nunca alcanza -180 grados, asi que no existe
 * ganancia última finita y se devuelve infinito.
 */
export function ultimateGainFOPDT(K, tau, theta) {
  if (!(theta > 0)) return { Ku: Infinity, wu: Infinity, Pu: 0 };
  const f = (w) => Math.atan(w * tau) + w * theta - Math.PI;
  let lo = 1e-6;
  let hi = 50 / Math.max(theta, 1e-6);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid;
    else lo = mid;
  }
  const wu = (lo + hi) / 2;
  const amp = K / Math.sqrt(1 + (wu * tau) ** 2);
  return { Ku: 1 / amp, wu, Pu: (2 * Math.PI) / wu };
}
