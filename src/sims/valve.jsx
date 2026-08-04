import { useMemo, useState } from 'react';
import Recorder from '../components/Recorder.jsx';
import { SimPanel, Slider, Segmented, Readouts, Ei } from '../components/ui.jsx';
import { inherent, installed, installedGain } from '../lib/control.js';

/* ===========================================================
   Módulo de válvulas · Válvula de control
   El punto pedagogico: la característica que el fabricante
   entrega no es la que ve el lazo. La autoridad de la válvula
   deforma la curva y con ella la ganancia del elemento final.
   =========================================================== */

export function SimValve() {
  const [type, setType] = useState('iso');
  const [psi, setPsi] = useState(0.35);
  const [R, setR] = useState(50);

  const data = useMemo(() => {
    const out = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      out.push({
        t: i,
        inh: inherent(x, type, R) * 100,
        inst: installed(x, type, psi, R) * 100,
        gain: installedGain(x, type, psi, R),
      });
    }
    return out;
  }, [type, psi, R]);

  const gains = data.map((d) => d.gain).filter((g) => Number.isFinite(g));
  const gMin = Math.min(...gains.slice(5, 96));
  const gMax = Math.max(...gains.slice(5, 96));
  const ratio = gMax / Math.max(gMin, 1e-6);

  const controls = (
    <>
      <Segmented
        label="Característica inherente"
        options={[{ v: 'lin', t: 'Lineal' }, { v: 'iso', t: 'Isoporc.' }, { v: 'ra', t: 'Apert. rápida' }]}
        value={type}
        onChange={setType}
      />
      <Slider
        label="Autoridad de la válvula ψ"
        value={psi}
        min={0.05}
        max={1}
        step={0.05}
        onChange={setPsi}
        help="Fracción de la caida de presión total que queda en la válvula abierta. Por debajo de 0.25 la curva instalada se aplana."
      />
      {type === 'iso' && (
        <Slider label="Rangeabilidad R" value={R} min={10} max={100} step={5} onChange={setR}
          help="Relación entre el máximo y el mínimo flujo controlable." />
      )}
    </>
  );

  return (
    <SimPanel
      title="Característica instalada de la válvula FV-102"
      tag="FV-102"
      controls={controls}
      note={
        <>
          La ganancia del elemento final varia un factor <b>{ratio.toFixed(1)}</b> entre el 5 % y el 95 % de apertura.
          Un lazo sintonizado al 30 % de carga queda mal sintonizado al 80 % cuando esa relación pasa de 2.
          Con característica isoporcentual y <Ei>{'\\psi \\approx 0.3'}</Ei> la curva instalada se acerca a una recta, que es justo lo que busca el diseñador.
        </>
      }
    >
      <Recorder
        data={data}
        height={300}
        xLabel="Apertura de la válvula x (%)"
        yLabel="Flujo q / q_max (%)"
        yRightLabel="Ganancia local dq/dx"
        yDomain={[0, 105]}
        series={[
          { key: 'inh', label: 'Inherente (catalogo)', color: 'var(--sp)', dash: '7,5' },
          { key: 'inst', label: 'Instalada (en el lazo)', color: 'var(--pv)', width: 2.6 },
          { key: 'gain', label: 'Ganancia local', color: 'var(--mv)', axis: 'right', width: 1.8 },
        ]}
      />
      <Readouts
        items={[
          { k: 'Autoridad ψ', v: psi.toFixed(2), tone: psi < 0.25 ? 'hi' : psi > 0.5 ? 'good' : undefined },
          { k: 'q al 50 %', v: `${(installed(0.5, type, psi, R) * 100).toFixed(1)} %` },
          { k: 'Ganancia mínima', v: gMin.toFixed(2) },
          { k: 'Ganancia máxima', v: gMax.toFixed(2) },
          { k: 'Relación max/min', v: ratio.toFixed(1), tone: ratio > 3 ? 'hi' : ratio < 2 ? 'good' : undefined },
        ]}
      />
    </SimPanel>
  );
}
