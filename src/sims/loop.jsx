import { useMemo, useState } from 'react';
import Recorder from '../components/Recorder.jsx';
import { SimPanel, Slider, Segmented, Readouts, Ei, Table } from '../components/ui.jsx';
import { closedLoop, tuneZN, tuneCC, tuneIMC, routh, ultimateGainThirdOrder } from '../lib/control.js';
import { metrics, clamp } from '../lib/ode.js';

/* ===========================================================
   Módulo de sintonía · Sintonía
   Mismo proceso, tres reglas. El estudiante ve que las reglas
   no compiten por elegancia sino por criterio de desempeño.
   =========================================================== */

export function SimTuning() {
  const P = { K: 1.6, tau: 8, theta: 2.5 };
  const [Kc, setKc] = useState(2);
  const [tauI, setTauI] = useState(6);
  const [tauD, setTauD] = useState(0);
  const [mode, setMode] = useState('PID');

  const data = useMemo(
    () => closedLoop({
      ...P, Kc, tauI: mode === 'P' ? 0 : tauI, tauD: mode === 'PID' ? tauD : 0,
      sp0: 50, spStep: 10, tSP: 2, u0: 45, tEnd: 90, dt: 0.02,
    }),
    [Kc, tauI, tauD, mode]
  );

  // La banda dibujada, 59.4 a 60.6, corresponde a band = 0.06 del cambio total.
  const m = metrics(data, 50, 60, 0.06);
  const offset = 60 - data[data.length - 1].pv;

  function apply(rule) {
    const t = rule === 'zn' ? tuneZN(P, mode) : rule === 'cc' ? tuneCC(P, mode) : tuneIMC(P);
    setKc(+clamp(t.Kc, 0.1, 12).toFixed(2));
    setTauI(+clamp(t.tauI, 0.5, 40).toFixed(2));
    setTauD(+clamp(mode === 'PID' ? t.tauD : 0, 0, 12).toFixed(2));
  }

  const controls = (
    <>
      <Segmented label="Modos activos" options={[{ v: 'P', t: 'P' }, { v: 'PI', t: 'PI' }, { v: 'PID', t: 'PID' }]} value={mode} onChange={setMode} />
      <Slider label="Ganancia K_c" value={Kc} min={0.1} max={10} step={0.1} onChange={setKc} />
      {mode !== 'P' && <Slider label="Tiempo integral τI" unit="min" value={tauI} min={0.5} max={40} step={0.5} onChange={setTauI}
        help="Elimina el error permanente. Muy corto vuelve el lazo oscilante." />}
      {mode === 'PID' && <Slider label="Tiempo derivativo τD" unit="min" value={tauD} min={0} max={8} step={0.25} onChange={setTauD}
        help="Anticipa por la pendiente de la medida. Amplifica el ruido." />}
      <div style={{ marginTop: 'var(--s5)' }}>
        <span className="eyebrow">Aplicar una regla</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn ghost sm" onClick={() => apply('zn')}>Ziegler-Nichols</button>
          <button className="btn ghost sm" onClick={() => apply('cc')}>Cohen-Coon</button>
          <button className="btn ghost sm" onClick={() => apply('imc')}>IMC</button>
        </div>
        <p className="ctrl-help" style={{ marginTop: 8 }}>
          Proceso fijo: K = {P.K} %/%, τ = {P.tau} min, θ = {P.theta} min.
          TT-104 calibrado de 0 a 150 °C, asi que 50 % equivale a 75 °C y el escalon de 10 % son 15 °C.
          La apertura nominal de la válvula es 45 %.
        </p>
      </div>
    </>
  );

  return (
    <SimPanel
      title="Sintonía del lazo de temperatura TIC-104"
      tag="TIC-104"
      controls={controls}
      note={
        <>
          Ziegler-Nichols persigue una razón de decaimiento de un cuarto, así que entrega respuestas rápidas y oscilantes.
          IMC parte de un modelo del proceso y produce lazos suaves con un solo parámetro de ajuste, <Ei>{'\\lambda'}</Ei>.
          Cohen-Coon compensa mejor cuando <Ei>{'\\theta/\\tau'}</Ei> es grande.
        </>
      }
    >
      <Recorder
        data={data}
        height={310}
        xLabel="Tiempo (min)"
        yLabel="Temperatura (% del rango de TT-104)"
        yRightLabel="Apertura del elemento final (%)"
        series={[
          { key: 'sp', label: 'Punto de control', color: 'var(--sp)', dash: '7,5', width: 1.8 },
          { key: 'pv', label: 'Temperatura medida', color: 'var(--pv)', width: 2.4 },
          { key: 'mv', label: 'Salida al elemento final', color: 'var(--mv)', axis: 'right', width: 1.8 },
        ]}
        bands={[{ lo: 59.4, hi: 60.6 }]}
        markers={[{ t: 2, label: 'cambio en el punto de control', color: 'var(--sp)' }]}
      />
      <Readouts
        items={[
          { k: 'Sobrepaso', v: m ? `${m.overshoot.toFixed(1)} %` : 'n/a', tone: m && m.overshoot > 30 ? 'hi' : m && m.overshoot < 12 ? 'good' : undefined },
          { k: 'Asentamiento', v: m && m.tSettle ? `${m.tSettle.toFixed(1)} min` : '> 90 min' },
          { k: 'IAE', v: m ? m.iae.toFixed(1) : 'n/a' },
          { k: 'Error final', v: `${offset.toFixed(2)} %`, tone: Math.abs(offset) > 0.5 ? 'hi' : 'good' },
          { k: 'τI usado', v: mode === 'P' ? 'sin acción I' : `${tauI} min` },
        ]}
      />
    </SimPanel>
  );
}

/* ===========================================================
   Módulo de perturbaciones · Perturbaciones
   Servo frente a regulador, y el efecto de anadir una acción
   anticipativa sobre la misma carga.
   =========================================================== */

export function SimDisturbance() {
  const [Kd, setKd] = useState(1.4);
  const [ff, setFf] = useState('no');
  const [Kc, setKc] = useState(2.4);
  const [tauI, setTauI] = useState(7);
  const [caso, setCaso] = useState('reg');

  const base = { K: 1.6, tau: 8, theta: 2.5, thetaD: 1.5 };

  const data = useMemo(() => {
    const servo = caso === 'servo';
    const sim = closedLoop({
      ...base,
      Kc, tauI, tauD: 0,
      sp0: 50,
      spStep: servo ? 10 : 0,
      tSP: servo ? 2 : 1e9,
      u0: 45,
      Kd: ff === 'si' ? Kd * 0.15 : Kd,
      dStep: servo ? 0 : -10,
      tD: servo ? 1e9 : 5,
      tEnd: 90,
      dt: 0.02,
    });
    return sim;
  }, [Kd, ff, Kc, tauI, caso]);

  const dev = data.reduce((a, p) => Math.max(a, Math.abs(p.pv - p.sp)), 0);
  // metrics exige y0 distinto del punto de control; ante una carga el proceso
  // arranca ya en consigna, asi que se toma como origen el pico de desviación.
  const tras = data.filter((p) => p.t >= 5);
  const pico = tras.reduce((a, p) => (Math.abs(p.pv - p.sp) > Math.abs(a.pv - a.sp) ? p : a), tras[0] || { pv: 50, sp: 50, t: 5 });
  const desde = tras.filter((p) => p.t >= pico.t);
  const m = Math.abs(pico.pv - pico.sp) > 1e-6 ? metrics(desde, pico.pv, pico.sp, 0.05) : null;
  const iae = data.reduce((a, p, i) => (i ? a + Math.abs(p.sp - p.pv) * 0.02 : 0), 0);

  const controls = (
    <>
      <Segmented label="Escenario" options={[{ v: 'reg', t: 'Regulador' }, { v: 'servo', t: 'Servo' }]} value={caso} onChange={setCaso} />
      {caso === 'reg' && (
        <>
          <Slider label="Ganancia de la perturbación K_d" value={Kd} min={0.2} max={4} step={0.1} onChange={setKd} />
          <Segmented label="Acción anticipativa" options={[{ v: 'no', t: 'Solo realimentación' }, { v: 'si', t: 'Con feedforward' }]} value={ff} onChange={setFf} />
        </>
      )}
      <Slider label="Ganancia K_c" value={Kc} min={0.2} max={8} step={0.1} onChange={setKc} />
      <Slider label="Tiempo integral τI" unit="min" value={tauI} min={1} max={30} step={0.5} onChange={setTauI} />
    </>
  );

  return (
    <SimPanel
      title={caso === 'reg' ? 'Rechazo de una carga en el lazo TIC-104' : 'Seguimiento del punto de control en el lazo TIC-104'}
      tag={caso === 'reg' ? 'regulador' : 'servo'}
      controls={controls}
      note={
        caso === 'reg' ? (
          <>La realimentación solo actua después de que la perturbación ya movio la medida. El compensador anticipativo mide la carga y corrige antes, pero nunca cancela del todo: queda la parte del modelo que no conocemos.</>
        ) : (
          <>En modo servo el lazo persigue un punto de control nuevo. El mismo par <Ei>{'(K_c, \\tau_I)'}</Ei> que responde bien aquí puede rechazar cargas con lentitud, y por eso las reglas de sintonía se publican separadas para servo y para regulador.</>
        )
      }
    >
      <Recorder
        data={data}
        height={310}
        xLabel="Tiempo (min)"
        yLabel="Temperatura (% del rango de TT-104)"
        yRightLabel="Apertura del elemento final (%)"
        series={[
          { key: 'sp', label: 'Punto de control', color: 'var(--sp)', dash: '7,5', width: 1.8 },
          { key: 'pv', label: 'Temperatura medida', color: 'var(--pv)', width: 2.4 },
          { key: 'mv', label: 'Salida al elemento final', color: 'var(--mv)', axis: 'right', width: 1.8 },
          { key: 'd', label: 'Perturbación', color: 'var(--dist)', axis: 'right', dash: '3,4', width: 1.6 },
        ]}
        markers={caso === 'reg' ? [{ t: 5, label: 'entra la carga', color: 'var(--dist)' }] : [{ t: 2, label: 'nuevo punto de control', color: 'var(--sp)' }]}
      />
      <Readouts
        items={[
          { k: 'Desviación máxima', v: `${dev.toFixed(2)} %`, tone: dev > 4 ? 'hi' : dev < 1.5 ? 'good' : undefined },
          { k: 'IAE', v: iae.toFixed(1) },
          { k: 'Recuperacion', v: m && m.tSettle ? `${m.tSettle.toFixed(1)} min` : '> 90 min' },
          { k: 'Estrategia', v: caso === 'reg' && ff === 'si' ? 'FF + FB' : 'Solo FB' },
        ]}
      />
    </SimPanel>
  );
}

/* ===========================================================
   Módulo de estabilidad · Estabilidad
   Proceso de tercer orden con controlador proporcional. El
   arreglo de Routh y la simulación cuentan la misma historia.
   =========================================================== */

function simThirdOrder({ K, t1, t2, t3, Kc, tEnd = 120, dt = 0.01, sp0 = 50, spStep = 5, tSP = 2 }) {
  let x = [0, 0, 0];
  const out = [];
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const sp = t >= tSP ? sp0 + spStep : sp0;
    const pv = sp0 + x[2];
    const e = sp - pv;
    const u = Kc * e;
    out.push({ t: +t.toFixed(3), pv, sp, mv: 50 + u });
    const d1 = (K * u - x[0]) / t1;
    const d2 = (x[0] - x[1]) / t2;
    const d3 = (x[1] - x[2]) / t3;
    x = [x[0] + d1 * dt, x[1] + d2 * dt, x[2] + d3 * dt];
    if (!Number.isFinite(x[2]) || Math.abs(x[2]) > 1e6) break;
  }
  return out;
}

export function SimStability() {
  const K = 1;
  const [t1, setT1] = useState(5);
  const [t2, setT2] = useState(2.5);
  const [t3, setT3] = useState(1);
  const [Kc, setKc] = useState(6);

  const { Ku, Pu } = ultimateGainThirdOrder(K, t1, t2, t3);
  const data = useMemo(() => simThirdOrder({ K, t1, t2, t3, Kc }), [t1, t2, t3, Kc]);

  // polinomio característico: t1 t2 t3 s^3 + (...) s^2 + (...) s + (1 + Kc K)
  const a = [t1 * t2 * t3, t1 * t2 + t1 * t3 + t2 * t3, t1 + t2 + t3, 1 + Kc * K];
  const R = routh(a);

  const estado = Kc < Ku - 1e-6 ? 'Estable' : Math.abs(Kc - Ku) < 0.05 * Ku ? 'Oscilación sostenida' : 'Inestable';
  const tone = estado === 'Estable' ? 'good' : 'hi';

  const controls = (
    <>
      <Slider label="Ganancia del controlador K_c" value={Kc} min={0.5} max={Math.max(40, Ku * 1.6)} step={0.25} onChange={setKc}
        help="Sube la ganancia hasta cruzar la ganancia última y observa el cambio de signo en la primera columna de Routh." />
      <Slider label="τ₁" unit="min" value={t1} min={1} max={12} step={0.5} onChange={setT1} />
      <Slider label="τ₂" unit="min" value={t2} min={0.5} max={12} step={0.5} onChange={setT2} />
      <Slider label="τ₃" unit="min" value={t3} min={0.2} max={12} step={0.2} onChange={setT3} />
      <div style={{ marginTop: 'var(--s4)' }}>
        <button className="btn ghost sm" onClick={() => setKc(+Ku.toFixed(2))}>Llevar a la ganancia última</button>
      </div>
    </>
  );

  return (
    <SimPanel
      title="Límite de estabilidad de un lazo de tercer orden"
      tag="criterio de Routh"
      controls={controls}
      note={
        <>
          El polinomio característico es{' '}
          <Ei>{`${(t1 * t2 * t3).toFixed(2)}s^3 + ${(t1 * t2 + t1 * t3 + t2 * t3).toFixed(2)}s^2 + ${(t1 + t2 + t3).toFixed(2)}s + ${(1 + Kc * K).toFixed(2)} = 0`}</Ei>.
          Routh reporta <b>{R.changes}</b> cambio(s) de signo en la primera columna, es decir {R.changes} raiz(ces) con parte real positiva.
        </>
      }
    >
      <Recorder
        data={data}
        height={280}
        xLabel="Tiempo (min)"
        yLabel="Variable controlada (%)"
        series={[
          { key: 'sp', label: 'Punto de control', color: 'var(--sp)', dash: '7,5', width: 1.8 },
          { key: 'pv', label: 'Medida', color: estado === 'Estable' ? 'var(--pv)' : 'var(--alarm)', width: 2.4 },
        ]}
      />
      <Readouts
        items={[
          { k: 'Estado', v: estado, tone },
          { k: 'Ganancia última', v: Ku.toFixed(2) },
          { k: 'P_u (periodo último)', v: `${Pu.toFixed(2)} min` },
          { k: 'Cambios de signo', v: String(R.changes), tone: R.changes ? 'hi' : 'good' },
        ]}
      />
      <div style={{ marginTop: 'var(--s5)' }}>
        <Table
          caption="Arreglo de Routh"
          head={['Fila', 'Col. 1', 'Col. 2']}
          numeric={[1, 2]}
          rows={R.rows.map((row, i) => [
            `s^${R.order - i}`,
            row[0] === undefined ? '' : row[0].toFixed(4),
            row[1] === undefined ? '' : row[1].toFixed(4),
          ])}
        />
      </div>
    </SimPanel>
  );
}

/* ===========================================================
   Módulos de estrategias · Control en cascada
   Una perturbación que entra por el lazo secundario se corrige
   antes de contaminar la variable primaria.
   =========================================================== */

function simCascade({ cascade, K1 = 1.4, tau1 = 20, K2 = 1.2, tau2 = 2.2, Kc1, tauI1, Kc2, tauI2, dStep = 12, tD = 10, tEnd = 140, dt = 0.01 }) {
  let y1 = 50;
  let y2 = 50;
  let I1 = 0;
  let I2 = 0;
  const sp1 = 50;
  const y2bias = 50;
  const y1bias = 50;
  const out = [];
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const d = t >= tD ? dStep : 0;
    const e1 = sp1 - y1;
    I1 += (Kc1 / tauI1) * e1 * dt;
    I1 = clamp(I1, -60, 60);
    const out1 = clamp(Kc1 * e1 + I1, -50, 50);

    let u;
    let sp2 = null;
    if (cascade) {
      sp2 = clamp(50 + out1, 0, 100);
      const e2 = sp2 - y2;
      I2 += (Kc2 / tauI2) * e2 * dt;
      I2 = clamp(I2, -80, 80);
      u = clamp(50 + Kc2 * e2 + I2, 0, 100);
    } else {
      u = clamp(50 + out1, 0, 100);
    }

    out.push({ t: +t.toFixed(3), pv: y1, sp: sp1, sec: y2, sp2, mv: u, d });

    const dy2 = (y2bias + K2 * (u - 50) + d - y2) / tau2;
    y2 += dy2 * dt;
    const dy1 = (y1bias + K1 * (y2 - 50) - y1) / tau1;
    y1 += dy1 * dt;
  }
  return out;
}

export function SimCascade() {
  const [cascade, setCascade] = useState('si');
  const [dStep, setDStep] = useState(12);
  const [Kc1, setKc1] = useState(1.6);
  const [Kc2, setKc2] = useState(3.2);

  const data = useMemo(
    () => simCascade({ cascade: cascade === 'si', Kc1, tauI1: 18, Kc2, tauI2: 2.2, dStep }),
    [cascade, dStep, Kc1, Kc2]
  );

  const dev = data.reduce((a, p) => Math.max(a, Math.abs(p.pv - 50)), 0);
  const devSec = data.reduce((a, p) => Math.max(a, Math.abs(p.sec - 50)), 0);
  const iae = data.reduce((a, p) => a + Math.abs(50 - p.pv) * 0.01, 0);

  const controls = (
    <>
      <Segmented label="Arquitectura" options={[{ v: 'no', t: 'Lazo simple' }, { v: 'si', t: 'Cascada' }]} value={cascade} onChange={setCascade} />
      <Slider label="Magnitud de la perturbación" unit="%" value={dStep} min={2} max={25} step={1} onChange={setDStep}
        help="Entra en el lazo secundario, por ejemplo una caida de presión en el cabezal de vapor." />
      <Slider label="K_c primario" value={Kc1} min={0.2} max={5} step={0.1} onChange={setKc1} />
      {cascade === 'si' && <Slider label="K_c secundario" value={Kc2} min={0.5} max={10} step={0.1} onChange={setKc2}
        help="El lazo interno se sintoniza primero y mucho mas agresivo que el externo." />}
    </>
  );

  return (
    <SimPanel
      title="Cascada temperatura-flujo en el reactor R-201"
      tag={cascade === 'si' ? 'TIC-201 / FIC-202' : 'TIC-201'}
      controls={controls}
      note={
        <>
          El lazo secundario debe ser al menos cinco veces mas rápido que el primario para que la cascada tenga sentido.
          Aquí la relación es <Ei>{'\\tau_1/\\tau_2 \\approx 9'}</Ei>, así que el lazo interno alcanza a absorber la carga antes de que la temperatura la sienta.
        </>
      }
    >
      <Recorder
        data={data}
        height={310}
        xLabel="Tiempo (min)"
        yLabel="Variables medidas (%)"
        yRightLabel="Salida a la válvula (%)"
        series={[
          { key: 'sp', label: 'Punto de control primario', color: 'var(--sp)', dash: '7,5', width: 1.7 },
          { key: 'pv', label: 'Temperatura del reactor', color: 'var(--pv)', width: 2.6 },
          { key: 'sec', label: 'Variable secundaria', color: 'var(--dist)', width: 1.8 },
          { key: 'mv', label: 'Salida a la válvula', color: 'var(--mv)', axis: 'right', width: 1.6 },
        ]}
        markers={[{ t: 10, label: 'entra la carga', color: 'var(--dist)' }]}
      />
      <Readouts
        items={[
          { k: 'Desviación primaria', v: `${dev.toFixed(2)} %`, tone: dev > 2 ? 'hi' : 'good' },
          { k: 'Desviación secundaria', v: `${devSec.toFixed(2)} %` },
          { k: 'IAE primario', v: iae.toFixed(1) },
          { k: 'Arquitectura', v: cascade === 'si' ? 'Cascada' : 'Lazo simple' },
        ]}
      />
    </SimPanel>
  );
}
