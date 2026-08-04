import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Recorder from '../components/Recorder.jsx';
import { closedLoop } from '../lib/control.js';
import { MODULES, COURSE_INFO } from '../content/index.js';
import { getProgress } from '../lib/firebase.js';
import {
  C, T, L, HeatExchanger, ControlValve, Bubble, Sig, Flow, Conector, Arrow,
} from '../lib/isa.jsx';
import { ArrowDefs } from '../lib/isa.jsx';

/* ===========================================================
   El encabezado no describe el curso: lo pone a funcionar.
   Un lazo real corre en pantalla mientras se lee, con una carga
   que entra cada cierto tiempo y un PID que la rechaza.
   =========================================================== */

function PIDVivo() {
  return (
    <svg viewBox="0 0 520 292" width="100%" style={{ display: 'block' }} role="img"
         aria-label="P&ID del lazo de temperatura TIC-104 sobre el intercambiador E-101">
      <ArrowDefs />

      {/* lado tubos: alimentación fría entra por la izquierda, sale caliente por la derecha */}
      <Sig x1={0} y1={150} x2={125} y2={150} kind="process" color={C.ink} />
      <Flow x={70} y={150} dir="right" s={6.5} />
      <T x={14} y={132} size={16} color={C.grey} anchor="start">alimentación</T>
      <HeatExchanger cx={200} cy={150} w={150} h={76} stubs={false} />
      <T x={215} y={214} size={18} color={C.navy} bold>E-101</T>
      <Sig x1={275} y1={150} x2={462} y2={150} kind="process" color={C.ink} />
      <Conector x={438} y={150} dir="right" w={62} h={13} size={14} label="R-201" />
      <Flow x={300} y={150} dir="right" s={6.5} />

      {/* lado coraza: vapor entra por una boquilla y el condensado sale por la opuesta */}
      <Conector x={0} y={54} dir="right" w={62} h={13} size={14} label="V-201" />
      <Sig x1={62} y1={54} x2={230} y2={54} kind="process" color={C.ink} />
      <Flow x={202} y={54} dir="right" s={6.5} />
      <T x={100} y={32} size={16} color={C.grey}>vapor</T>
      <ControlValve cx={150} cy={54} s={14} />
      <T x={150} y={92} size={15} color={C.navy} bold>TV-104</T>
      <L x1={230} y1={54} x2={230} y2={112} color={C.ink} w={3.8} />
      <Flow x={230} y={92} dir="down" s={6.5} />
      <L x1={170} y1={188} x2={170} y2={238} color={C.ink} w={3.8} />
      <Flow x={170} y={218} dir="down" s={6.5} />
      <Sig x1={170} y1={238} x2={0} y2={238} kind="process" color={C.ink} />
      <Flow x={100} y={238} dir="left" s={6.5} />
      <T x={14} y={262} size={16} color={C.grey} anchor="start">condensado</T>

      {/* lazo: medida, controlador y orden al elemento final */}
      <L x1={330} y1={153} x2={330} y2={192} color={C.ink} w={1.6} />
      <Bubble cx={330} cy={214} tag="TT" num="104" r={22} tagsize={16} numsize={15} />
      <Sig x1={352} y1={214} x2={392} y2={214} kind="electric" color={C.ink} arrow />
      <Bubble cx={418} cy={214} tag="TIC" num="104" r={24} tagsize={16} numsize={15}
              location="room" system="dcs" />
      <Sig x1={442} y1={214} x2={500} y2={214} kind="pneumatic" color={C.ink} />
      <Sig x1={500} y1={214} x2={500} y2={8} kind="pneumatic" color={C.ink} />
      <Sig x1={500} y1={8} x2={150} y2={8} kind="pneumatic" color={C.ink} />
      <Sig x1={150} y1={8} x2={150} y2={22} kind="pneumatic" color={C.ink} arrow />
    </svg>
  );
}

/* ===========================================================
   Lazo de temperatura de E-101, con unidades de ingeniería.
   Alimentación fría a 25 °C, vapor en la coraza, salida a 85 °C.
   Transmitter TT-104 calibrado de 0 a 150 °C.
   El proceso es K = 1.2 °C por punto de apertura, τ = 6 min,
   θ = 1.5 min; con apertura nominal de 50 % la salida queda en
   25 + 1.2·50 = 85 °C, que es el balance de energía del equipo.
   El PID va sintonizado por IMC con λ = θ.
   =========================================================== */

const PROC = { K: 1.2, tau: 6, theta: 1.5 };
const U0 = 50;          // apertura nominal de TV-104, %
const T0 = 85;          // temperatura de salida en el punto de operación, °C
const TSP2 = 91;        // punto de control nuevo, °C
const DT_ALIM = -10;    // caída de la temperatura de alimentación, °C

function LiveLoop() {
  const full = useMemo(() => {
    // IMC con lambda igual al tiempo muerto
    const lam = PROC.theta;
    const Kc = (1 / PROC.K) * ((PROC.tau + PROC.theta / 2) / (lam + PROC.theta / 2));
    const tauI = PROC.tau + PROC.theta / 2;
    const tauD = (PROC.tau * PROC.theta) / (2 * PROC.tau + PROC.theta);
    return closedLoop({
      ...PROC,
      Kc, tauI, tauD,
      sp0: T0, spStep: TSP2 - T0, tSP: 5,
      u0: U0,
      Kd: 1.0, dStep: DT_ALIM, tD: 45, thetaD: 0.8,
      tEnd: 90, dt: 0.05,
      uMin: 0, uMax: 100,
    });
  }, []);

  const reduce = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const [n, setN] = useState(reduce ? full.length : 40);

  useEffect(() => {
    if (reduce) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      if (now - last > 26) {
        last = now;
        setN((v) => (v >= full.length ? 40 : v + 12));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [full.length, reduce]);

  const shown = full.slice(0, n);
  const now = shown[shown.length - 1] || full[0];
  const err = now.sp - now.pv;

  return (
    <div className="live-grid">
      {/* caja izquierda: el equipo y su lazo */}
      <section className="sim live-card">
        <div className="sim-head">
          <h4>Proceso y lazo de control</h4>
          <span className="tag">P&amp;ID</span>
        </div>
        <div className="live-card-body">
          <PIDVivo />
        </div>
      </section>

      {/* caja derecha: el registro del mismo lazo */}
      <section className="sim live-card">
        <div className="sim-head">
          <h4>Registro en vivo</h4>
          <span className="tag">TIC-104 · AUTO</span>
        </div>
        <div className="live-card-body">
          <Recorder
            data={shown}
            width={520}
            height={292}
            tickSize={13}
            titleSize={14}
            xLabel="Tiempo (min)"
            yLabel="Temperatura de salida (°C)"
            yRightLabel="Apertura de TV-104 (%)"
            xDomain={[0, 90]}
            yDomain={[83, 93]}
            yRightDomain={[46, 72]}
            showCursor={false}
            markers={[
              { t: 5, label: 'nuevo punto de control', color: 'var(--sp)' },
              { t: 45, label: 'cae la alimentación', color: 'var(--dist)' },
            ]}
            series={[
              { key: 'pv', label: 'Temperatura medida, TT-104', color: 'var(--pv)', width: 2.4 },
              { key: 'sp', label: 'Punto de control', color: 'var(--sp)', dash: '9,5', width: 2.2 },
              { key: 'mv', label: 'Apertura de TV-104', color: 'var(--mv)', axis: 'right', width: 1.8 },
            ]}
          />
        </div>
      </section>

      {/* franja de lecturas, bajo las dos cajas */}
      <div className="readouts live-read">
        <div className="readout"><span className="k">Punto de control</span><span className="v">{now.sp.toFixed(1)} °C</span></div>
        <div className="readout"><span className="k">Medida</span><span className="v">{now.pv.toFixed(1)} °C</span></div>
        <div className="readout"><span className="k">Error</span><span className={`v${Math.abs(err) > 1.5 ? ' hi' : ''}`}>{err.toFixed(2)} °C</span></div>
        <div className="readout"><span className="k">Apertura</span><span className="v">{now.mv.toFixed(1)} %</span></div>
        <div className="readout"><span className="k">Modo</span><span className="v good">AUTO</span></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [prog, setProg] = useState(getProgress());
  useEffect(() => {
    const h = () => setProg(getProgress());
    window.addEventListener('cpi:progress', h);
    return () => window.removeEventListener('cpi:progress', h);
  }, []);

  const done = Object.keys(prog).length;

  return (
    <div className="sheet">
      <header className="hero">
        <p className="eyebrow">
          {COURSE_INFO.code} · {COURSE_INFO.program} · {COURSE_INFO.school}
        </p>
        <h1>Sala de Control</h1>
        <p className="lede">
          Sala de Control es la aplicación interactiva del curso de Control de Procesos Industriales 2026-2S
          en la Universidad Jorge Tadeo Lozano. Sirve para estudiar antes de clase, experimentar durante la clase y
          repasar después: cada tema trae su teoría, un simulador que integra las ecuaciones en tu propio navegador,
          un ejercicio resuelto paso a paso y una evaluación que se califica sola.
        </p>
      </header>

      <LiveLoop />

      <p style={{ color: 'var(--ink-2)', marginTop: 'var(--s4)', maxWidth: '74ch' }}>
        El intercambiador E-101 recibe alimentación a 25 °C y la lleva a 85 °C con vapor que condensa en la coraza.
        Con la válvula TV-104 al 50 % de apertura ese es el balance de energía del equipo. TT-104 mide la temperatura de
        salida, TIC-104 la compara con su punto de control y corrige la apertura. Al minuto 5 el punto de control sube a
        91 °C y al minuto 45 la alimentación se enfría 10 °C: la válvula abre para compensar y la temperatura vuelve a
        su valor. Al terminar el curso vas a poder explicar cada tramo de esa curva y decidir si la sintonía es aceptable.
      </p>

      <div className="cards">
        <Link className="card" to="/m/w01">
          <p className="eyebrow">Empezar</p>
          <h3>Módulo de introducción</h3>
          <p>Que significa controlar un proceso, y por que la realimentación siempre llega tarde.</p>
        </Link>
        <Link className="card" to="/m/w07">
          <p className="eyebrow">Ir al simulador clave</p>
          <h3>Sintonía PID</h3>
          <p>Ziegler-Nichols, Cohen-Coon e IMC sobre el mismo proceso, con las métricas al lado.</p>
        </Link>
        <Link className="card" to="/biblio">
          <p className="eyebrow">Consultar</p>
          <h3>Bibliografía</h3>
          <p>Los textos del curso y las normas ISA e IEC, con una nota sobre para que sirve cada uno.</p>
        </Link>
        <Link className="card" to="/docente">
          <p className="eyebrow">Para el docente</p>
          <h3>Panel de resultados</h3>
          <p>Intentos registrados por módulo y exportación a Excel.</p>
        </Link>
      </div>

      <section>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 'var(--s2)' }}>Mapa del curso</h2>
        <p style={{ color: 'var(--ink-2)', maxWidth: '68ch', marginTop: 0 }}>
          Diecisiete módulos ordenados de menor a mayor complejidad. Arrancan con el lenguaje del plano y con las herramientas matemáticas del modelado, siguen con equipos simples, un
          tanque y un intercambiador, para construir el modelo dinámico y sintonizar un lazo. Los siguientes agregan
          reactor, torre de enfriamiento y columna de destilación, junto con las estrategias que esos equipos exigen.
          La tabla indica el tema, el equipo sobre el que se trabaja y si el módulo trae simulador.
          {done > 0 && <> Llevas <strong>{done}</strong> de {MODULES.length} módulos con quiz resuelto.</>}
        </p>

        <div className="tbl-wrap">
        <table className="plan">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Tema</th>
              <th>Unidad de proceso</th>
              <th>Simulador</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.meta.id} className={m.meta.code.includes('-R') ? 'milestone' : undefined}>
                <td className="wk">{String(m.meta.week).padStart(2, '0')}</td>
                <td><Link to={`/m/${m.meta.id}`}>{m.meta.title}</Link></td>
                <td style={{ color: 'var(--ink-2)' }}>{m.meta.unit}</td>
                <td style={{ color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', fontSize: '.78rem' }}>
                  {m.Sim ? 'si' : 'n/a'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <section className="prose" style={{ marginTop: 'var(--s7)' }}>
        <h2>Como usar este sitio</h2>
        <ol>
          <li><strong>Teoria</strong> antes de clase. Trae las dudas marcadas.</li>
          <li><strong>Simulador</strong> durante la clase. Los experimentos sugeridos están pensados para hacerse en dos minutos.</li>
          <li><strong>Ejercicio resuelto</strong> después, con lapiz y papel, tapando la solución.</li>
          <li><strong>Quiz</strong> al final. Si sacas menos de 4.0, vuelve a la sección de teoría correspondiente antes de seguir.</li>
        </ol>
        <p style={{ color: 'var(--ink-3)', fontSize: '.93rem' }}>
          Los simuladores integran las ecuaciones en tu propio navegador. No hay servidor, no se envia nada, y funcionan
          sin conexión una vez cargada la pagina.
        </p>
      </section>
    </div>
  );
}
