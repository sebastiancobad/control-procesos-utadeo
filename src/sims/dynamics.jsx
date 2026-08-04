import { useMemo, useState } from 'react';
import Recorder from '../components/Recorder.jsx';
import { SimPanel, Slider, Segmented, Readouts, Ei } from '../components/ui.jsx';
import { fopdtStep, socpdtStep, socRoots, underdamped } from '../lib/control.js';

/* ===========================================================
   Módulo de dinámica · Primer orden con tiempo muerto
   Tanque de nivel T-101. La construcción de la curva de
   reacción queda a la vista porque de ahí salen K, tau y theta.
   =========================================================== */

export function SimFirstOrder() {
  const [K, setK] = useState(1.8);
  const [tau, setTau] = useState(6);
  const [theta, setTheta] = useState(2);
  const [du, setDu] = useState(10);
  const [showCons, setShowCons] = useState('si');

  const tEnd = 45;
  const tStep = 3;
  const y0 = 40;

  const data = useMemo(
    () => fopdtStep({ K, tau, theta, du, y0, tEnd, dt: 0.05, tStep }).map((p) => ({ ...p, mv: 30 + p.mv })),
    [K, tau, theta, du]
  );

  const yFinal = y0 + K * du;
  const y63 = y0 + 0.632 * K * du;
  // las marcas se rotulan solo si hay separacion suficiente para leerlas
  const sepMin = tEnd * 0.055;
  const markers = showCons === 'si'
    ? [
        { t: tStep, label: 'escalón', color: 'var(--mv)' },
        { t: tStep + theta, label: theta >= sepMin ? 'θ' : '', color: 'var(--alarm)' },
        { t: tStep + theta + tau, label: 'θ+τ', color: 'var(--navy)' },
      ]
    : [{ t: tStep, label: 'escalón', color: 'var(--mv)' }];

  const controls = (
    <>
      <Slider label="Ganancia K" unit="%/%" value={K} min={0.2} max={4} step={0.1} onChange={setK}
        help="Cuanto se mueve el nivel por cada punto de apertura de la válvula." />
      <Slider label="Constante de tiempo τ" unit="min" value={tau} min={1} max={20} step={0.5} onChange={setTau}
        help="Tiempo para alcanzar el 63.2 % del cambio total." />
      <Slider label="Tiempo muerto θ" unit="min" value={theta} min={0} max={10} step={0.25} onChange={setTheta}
        help="Retardo puro de transporte antes de que el nivel reaccione." />
      <Slider label="Escalon en la apertura" unit="%" value={du} min={2} max={25} step={1} onChange={setDu} />
      <Segmented label="Construcción gráfica" options={[{ v: 'si', t: 'Visible' }, { v: 'no', t: 'Oculta' }]} value={showCons} onChange={setShowCons} />
    </>
  );

  return (
    <SimPanel
      title="Curva de reacción del tanque T-101"
      tag="LT-101"
      controls={controls}
      note={<>La relación <Ei>{'\\theta/\\tau'}</Ei> vale <b>{(theta / tau).toFixed(2)}</b>. Por debajo de 0.2 el lazo es fácil de controlar; por encima de 0.6 el tiempo muerto domina y la sintonía se vuelve conservadora.</>}
    >
      <Recorder
        data={data}
        height={300}
        xLabel="Tiempo (min)"
        yLabel="Nivel (%)"
        yRightLabel="Apertura (%)"
        markers={markers}
        series={[
          { key: 'pv', label: 'Nivel h(t)', color: 'var(--pv)' },
          { key: 'mv', label: 'Apertura de la válvula', color: 'var(--mv)', axis: 'right', dash: '6,4' },
        ]}
        bands={showCons === 'si' ? [{ lo: y63 - 0.25, hi: y63 + 0.25, fill: 'rgba(0,85,143,.22)' }] : []}
      />
      <Readouts
        items={[
          { k: 'Valor final', v: `${yFinal.toFixed(1)} %` },
          { k: 'Cambio total', v: `${(K * du).toFixed(1)} %` },
          { k: '63.2 % en', v: `${(theta + tau).toFixed(1)} min` },
          { k: '99 % en', v: `${(theta + 5 * tau).toFixed(1)} min` },
          { k: 'θ/τ', v: (theta / tau).toFixed(2), tone: theta / tau > 0.6 ? 'hi' : theta / tau < 0.2 ? 'good' : undefined },
        ]}
      />
    </SimPanel>
  );
}

/* ===========================================================
   Módulo de segundo orden · Segundo orden
   El intercambiador E-101 en cascada térmica sirve de excusa
   para recorrer los tres regímenes moviendo un solo parámetro.
   =========================================================== */

function SPlane({ tau, zeta }) {
  const r = socRoots(tau, zeta);
  const W = 240;
  const H = 170;
  const cx = W * 0.72;
  const cy = H / 2;
  const pts = r.real
    ? [[r.r1, 0], [r.r2, 0]]
    : [[r.re, r.im], [r.re, -r.im]];
  // Autoescala: el polo mas alejado debe caber dentro del lienzo, incluido el
  // rapido del caso sobreamortiguado, que crece sin limite al bajar zeta.
  const maxAbs = Math.max(...pts.map(([re, im]) => Math.max(Math.abs(re), Math.abs(im))), 1e-6);
  const scale = Math.min(95, (0.9 * (cx - 8)) / maxAbs);
  const px = (re) => cx + re * scale;
  const py = (im) => cy - im * scale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260 }} role="img" aria-label="Ubicación de los polos en el plano s">
      <rect x="0" y="0" width={W} height={H} fill="#FCFDFE" stroke="var(--grid)" />
      <rect x="0" y="0" width={cx} height={H} fill="rgba(46,125,111,.07)" />
      <rect x={cx} y="0" width={W - cx} height={H} fill="rgba(169,50,38,.06)" />
      <line x1="8" y1={cy} x2={W - 8} y2={cy} stroke="var(--ink-3)" strokeWidth="1.1" />
      <line x1={cx} y1="8" x2={cx} y2={H - 8} stroke="var(--ink-3)" strokeWidth="1.1" />
      <text x={W - 10} y={cy - 6} fontSize="10.5" textAnchor="end" fill="var(--ink-3)" fontFamily="var(--f-mono)">Re</text>
      <text x={cx + 6} y="16" fontSize="10.5" fill="var(--ink-3)" fontFamily="var(--f-mono)">Im</text>
      <text x="8" y={H - 8} fontSize="10" fill="var(--dist)" fontFamily="var(--f-mono)">estable</text>
      <text x={W - 8} y={H - 8} fontSize="10" textAnchor="end" fill="var(--alarm)" fontFamily="var(--f-mono)">inestable</text>
      {pts.map(([re, im], i) => (
        <g key={i}>
          <line x1={px(re) - 6} y1={py(im) - 6} x2={px(re) + 6} y2={py(im) + 6} stroke="var(--navy)" strokeWidth="2.4" />
          <line x1={px(re) - 6} y1={py(im) + 6} x2={px(re) + 6} y2={py(im) - 6} stroke="var(--navy)" strokeWidth="2.4" />
        </g>
      ))}
    </svg>
  );
}

export function SimSecondOrder() {
  const [K, setK] = useState(2);
  const [tau, setTau] = useState(4);
  const [zeta, setZeta] = useState(0.4);
  const [theta, setTheta] = useState(0);

  const tEnd = 60;
  const du = 10;
  const y0 = 0;

  const data = useMemo(
    () => socpdtStep({ K, tau, zeta, theta, du, y0, tEnd, dt: 0.02, tStep: 2 }),
    [K, tau, zeta, theta]
  );

  const r = socRoots(tau, zeta);
  const u = underdamped(tau, zeta, K, du);
  const regimen = zeta < 1 ? 'Subamortiguado' : zeta === 1 ? 'Criticamente amortiguado' : 'Sobreamortiguado';

  const controls = (
    <>
      <Slider label="Ganancia K" unit="°C/%" value={K} min={0.5} max={5} step={0.1} onChange={setK} />
      <Slider label="Constante de tiempo τ" unit="min" value={tau} min={1} max={10} step={0.5} onChange={setTau} />
      <Slider label="Razón de amortiguamiento ζ" value={zeta} min={0.05} max={2.5} step={0.05} onChange={setZeta}
        help="Debajo de 1 la respuesta oscila. Encima de 1 se vuelve lenta sin sobrepaso." />
      <Slider label="Tiempo muerto θ" unit="min" value={theta} min={0} max={6} step={0.25} onChange={setTheta} />
      <div style={{ marginTop: 'var(--s5)' }}>
        <span className="eyebrow">Polos en el plano s</span>
        <SPlane tau={tau} zeta={zeta} />
      </div>
    </>
  );

  return (
    <SimPanel
      title="Respuesta de segundo orden del intercambiador E-101"
      tag="TT-104"
      controls={controls}
      note={
        r.real ? (
          <>Los dos polos son reales y negativos: <Ei>{`s_1 = ${r.r1.toFixed(3)}`}</Ei>, <Ei>{`s_2 = ${r.r2.toFixed(3)}`}</Ei>. La respuesta es la suma de dos exponenciales, sin oscilación.</>
        ) : (
          <>Los polos forman un par conjugado <Ei>{`s = ${r.re.toFixed(3)} \\pm ${r.im.toFixed(3)}j`}</Ei>. La parte imaginaria fija la frecuencia de la oscilación y la parte real, su decaimiento.</>
        )
      }
    >
      <Recorder
        data={data}
        height={300}
        xLabel="Tiempo (min)"
        yLabel="Temperatura (°C sobre el estado inicial)"
        series={[{ key: 'pv', label: 'Temperatura T(t)', color: 'var(--pv)' }]}
        bands={[{ lo: K * du * 0.98, hi: K * du * 1.02, fill: 'rgba(0,85,143,.08)' }]}
        markers={u ? [{ t: 2 + theta + u.tPeak, label: 't_p', color: 'var(--sp)' }] : []}
      />
      <Readouts
        items={[
          { k: 'Régimen', v: regimen },
          { k: 'Sobrepaso', v: u ? `${u.overshoot.toFixed(1)} %` : '0 %', tone: u && u.overshoot > 25 ? 'hi' : undefined },
          { k: 'Razón de decaimiento', v: u ? u.decay.toFixed(3) : 'n/a' },
          { k: 'Periodo', v: u ? `${u.period.toFixed(2)} min` : 'n/a' },
          { k: 'Tiempo de pico', v: u ? `${u.tPeak.toFixed(2)} min` : 'n/a' },
        ]}
      />
    </SimPanel>
  );
}
