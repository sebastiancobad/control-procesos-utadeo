import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Block, Arrow, Vessel, ControlValve, ManualValve, Sig, Bubble, Coil, Orifice, Thermowell, Drum, CSTR, Pump, Flow, Conector,
} from '../lib/isa.jsx';
import { SimFirstOrder } from '../sims/dynamics.jsx';

export const meta = {
  id: 'w03',
  week: 4,
  code: 'CP26II-M04',
  title: 'Dinámica de primer orden y tiempo muerto',
  unit: 'T-101, T-102, R-201 y V-301',
  lede: 'Cuatro equipos distintos, un mismo modelo de tres parámetros. Aquí se construye desde el balance hasta la función de transferencia, y se aprende a medir esos tres números en planta.',
  objectives: [
    'Obtener el modelo dinámico de nivel, temperatura, composición y presión a partir del balance correspondiente.',
    'Distinguir un proceso autorregulado de uno integrante y explicar la diferencia en el P&ID.',
    'Linealizar términos no lineales frecuentes: raiz, producto de variables y ley de Arrhenius.',
    'Transformar el balance linealizado a Laplace, obtener la función de transferencia y ubicar su polo.',
    'Deducir la respuesta al escalón por fracciones parciales y justificar el 63.2 % y la pendiente inicial.',
    'Identificar K, tau y theta desde una curva de reacción, con el método adecuado a la calidad del dato.',
    'Reconocer cuando un proceso de orden alto se puede reducir a un modelo de primer orden con tiempo muerto.',
  ],
  refs: ['bequette', 'smith', 'seborg', 'cough', 'steph', 'luyben', 'skoge'],
};

/* =========================================================
   Figuras
   ========================================================= */

function FigCapacidad() {
  return (
    <Figure vw={880} vh={250} num="3.1" caption="Toda dinámica de primer orden es lo mismo: algo que se acumula frente a algo que se opone a salir. Cambia la magnitud almacenada, no la estructura del modelo.">
      <Block cx={130} cy={70} w={190} h={62} label="Entrada" sub="lo que llega" />
      <Arrow x1={226} y1={70} x2={296} y2={70} color={C.navy} head="ahn" />
      <Block cx={400} cy={70} w={198} h={62} label="Capacitancia" sub="C: acumula" />
      <Arrow x1={500} y1={70} x2={570} y2={70} color={C.navy} head="ahn" />
      <Block cx={676} cy={70} w={190} h={62} label="Resistencia" sub="R: se opone" />
      <Arrow x1={772} y1={70} x2={840} y2={70} color={C.navy} head="ahn" />
      <T x={440} y={140} size={24} color={C.ink} bold>τ = R · C</T>
      <L x1={100} y1={168} x2={840} y2={168} color={C.grid} w={1} />
      <T x={60} y={196} size={20} color={C.ink} anchor="start" bold>Nivel</T>
      <T x={230} y={196} size={20} color={C.grey} anchor="start">C = área</T>
      <T x={430} y={196} size={20} color={C.grey} anchor="start">R = resistencia de la válvula</T>
      <T x={60} y={224} size={20} color={C.ink} anchor="start" bold>Temperatura</T>
      <T x={230} y={224} size={20} color={C.grey} anchor="start">C = m·Cp</T>
      <T x={430} y={224} size={20} color={C.grey} anchor="start">R = 1/(flujo·Cp) o 1/(U·A)</T>
    </Figure>
  );
}

function FigTanquePID() {
  return (
    <Figure vw={880} vh={370} num="3.2" caption="T-101, control de nivel. Proceso autorregulado: la descarga por gravedad crece con el nivel y el sistema encuentra un estado estacionario nuevo por sí solo.">
      <Sig x1={0} y1={70} x2={250} y2={70} kind="process" color={C.ink} />
      <Flow x={205} y={70} dir="right" s={7} />
      <T x={44} y={52} size={21} color={C.grey} anchor="start">F_e</T>
      <ManualValve cx={140} cy={70} s={17} />
      <L x1={250} y1={70} x2={250} y2={90} color={C.ink} w={3.8} />
      <Vessel cx={250} top={88} w={150} h={170} level={0.55} />
      <T x={320} y={300} size={21} color={C.navy} bold anchor="start">T-101</T>
      <L x1={250} y1={258} x2={250} y2={320} color={C.ink} w={3.8} />
      <Flow x={250} y={300} dir="down" s={7} />
      <Sig x1={250} y1={320} x2={880} y2={320} kind="process" color={C.ink} />
      <Flow x={330} y={320} dir="right" s={7} /><Flow x={720} y={320} dir="right" s={7} />
      <ControlValve cx={430} cy={320} s={19} />
      <T x={770} y={302} size={21} color={C.grey} anchor="start">F_s</T>

      <Bubble cx={400} cy={170} tag="LT" num="101" r={29} tagsize={21} numsize={19} />
      <L x1={371} y1={170} x2={325} y2={170} color={C.ink} w={1.6} />
      <Sig x1={431} y1={170} x2={509} y2={170} kind="electric" color={C.ink} arrow />
      <Bubble cx={540} cy={170} tag="LC" num="101" r={30} tagsize={21} numsize={19} location="room" system="dcs" />
      <Sig x1={540} y1={200} x2={540} y2={280} kind="pneumatic" color={C.ink} />
      <Sig x1={540} y1={280} x2={452} y2={280} kind="pneumatic" color={C.ink} arrow />
      <T x={600} y={240} size={19} color={C.grey} anchor="start">autorregulado</T>
      <T x={600} y={264} size={19} color={C.grey} anchor="start">τ = A·R</T>
    </Figure>
  );
}

function FigSerpentinPID() {
  return (
    <Figure vw={980} vh={430} num="3.3" caption="T-102, tanque agitado con serpentin de vapor. La energía se agrega por superficie, así que aparecen dos vías de salida en paralelo: el arrastre por la corriente y el intercambio con el serpentin.">
      {/* alimentación, con la boquilla desplazada del eje del agitador */}
      <Sig x1={0} y1={70} x2={200} y2={70} kind="process" color={C.ink} />
      <Flow x={165} y={70} dir="right" s={7} />
      <T x={44} y={52} size={21} color={C.grey} anchor="start">F, T_e</T>
      <L x1={200} y1={70} x2={200} y2={102} color={C.ink} w={3.8} />

      {/* recipiente y agitador */}
      <Vessel cx={250} top={100} w={170} h={190} level={0.72} />
      <T x={352} y={318} size={21} color={C.navy} bold anchor="start">T-102</T>
      <circle cx={250} cy={52} r={10} fill={C.white} stroke={C.ink} strokeWidth={2.2} />
      <L x1={250} y1={62} x2={250} y2={205} color={C.ink} w={2.4} />
      <L x1={222} y1={205} x2={278} y2={205} color={C.ink} w={2.4} />

      {/* serpentin de vapor */}
      <Coil cx={250} cy={248} w={112} h={54} turns={4} />
      <Sig x1={0} y1={221} x2={168} y2={221} kind="process" color={C.ink} />
      <Flow x={148} y={221} dir="right" s={7} />
      <L x1={168} y1={221} x2={194} y2={221} color={C.ink} w={3.8} />
      <T x={30} y={186} size={21} color={C.grey} anchor="start">vapor</T>
      <ControlValve cx={110} cy={221} s={18} />
      <L x1={306} y1={275} x2={340} y2={275} color={C.ink} w={3.8} />
      <Sig x1={340} y1={275} x2={620} y2={275} kind="process" color={C.ink} />
      <Conector x={622} y={275} dir="right" label="a TQ-105" />
      <Flow x={500} y={275} dir="right" s={7} />
      <T x={470} y={302} size={19} color={C.grey}>condensado</T>

      {/* salida de producto */}
      <L x1={250} y1={290} x2={250} y2={355} color={C.ink} w={3.8} />
      <Flow x={250} y={335} dir="down" s={7} />
      <Sig x1={250} y1={355} x2={980} y2={355} kind="process" color={C.ink} />
      <Flow x={400} y={355} dir="right" s={7} /><Flow x={810} y={355} dir="right" s={7} />
      <T x={860} y={337} size={21} color={C.grey} anchor="start">F, T</T>

      {/* lazo de temperatura, con termopozo */}
      <L x1={300} y1={160} x2={344} y2={160} color={C.ink} w={1.4} />
      <Thermowell cx={335} cy={160} len={38} dir="left" />
      <Bubble cx={430} cy={160} tag="TT" num="102" r={29} tagsize={21} numsize={19} />
      <L x1={401} y1={160} x2={344} y2={160} color={C.ink} w={1.6} />
      <Sig x1={461} y1={160} x2={539} y2={160} kind="electric" color={C.ink} arrow />
      <Bubble cx={570} cy={160} tag="TIC" num="102" r={30} tagsize={21} numsize={19} location="room" system="dcs" />
      <Sig x1={570} y1={130} x2={570} y2={28} kind="pneumatic" color={C.ink} />
      <Sig x1={570} y1={28} x2={110} y2={28} kind="pneumatic" color={C.ink} />
      <Sig x1={110} y1={28} x2={110} y2={182} kind="pneumatic" color={C.ink} arrow />
      <T x={640} y={200} size={19} color={C.grey} anchor="start">τ = ρVC_p / (ρFC_p + UA)</T>
      <T x={640} y={226} size={19} color={C.grey} anchor="start">dos vías de salida de energía</T>
    </Figure>
  );
}

function FigReactorPID() {
  return (
    <Figure vw={940} vh={430} num="3.4" caption="R-201, reactor continuo de tanque agitado con chaqueta. El balance de componente entrega la dinámica de la concentración, y la reacción actua como una vía de escape adicional que acelera la respuesta.">
      {/* alimentación medida con placa de orificio */}
      <Sig x1={0} y1={70} x2={250} y2={70} kind="process" color={C.ink} />
      <Flow x={125} y={70} dir="right" s={7} />
      <T x={40} y={52} size={21} color={C.grey} anchor="start">F, C_A0</T>
      <Orifice cx={150} cy={70} s={17} dir="down" />
      <Bubble cx={150} cy={150} tag="FT" num="201" r={27} tagsize={20} numsize={18} />
      <L x1={126} y1={102} x2={131} y2={125} color={C.ink} w={1.6} />
      <L x1={174} y1={102} x2={169} y2={125} color={C.ink} w={1.6} />
      <L x1={250} y1={70} x2={250} y2={70} color={C.ink} w={3.8} />
      <Sig x1={250} y1={70} x2={300} y2={70} kind="process" color={C.ink} />
      <L x1={300} y1={70} x2={300} y2={121} color={C.ink} w={3.8} />
      <Flow x={300} y={104} dir="down" s={7} />
      <Flow x={275} y={70} dir="right" s={7} />

      {/* reactor con chaqueta */}
      <CSTR cx={300} cy={210} w={150} h={180} level={0.62} jacket />
      <T x={396} y={318} size={21} color={C.navy} bold anchor="start">R-201</T>

      {/* servicio de enfriamiento por la chaqueta */}
      <Sig x1={0} y1={250} x2={205} y2={250} kind="process" color={C.ink} />
      <Flow x={175} y={250} dir="right" s={7} />
      <T x={30} y={218} size={20} color={C.grey} anchor="start">refrigerante</T>
      <ControlValve cx={120} cy={250} s={17} />
      <Sig x1={395} y1={126} x2={470} y2={126} kind="process" color={C.ink} />
      <Flow x={432} y={126} dir="right" s={7} />
      <Conector x={472} y={126} dir="right" label="a CT-301" />
      
      

      {/* salida de producto */}
      <L x1={300} y1={300} x2={300} y2={370} color={C.ink} w={3.8} />
      <Flow x={300} y={348} dir="down" s={7} />
      <Sig x1={300} y1={370} x2={940} y2={370} kind="process" color={C.ink} />
      <Flow x={400} y={370} dir="right" s={7} /><Flow x={790} y={370} dir="right" s={7} />
      <T x={800} y={352} size={21} color={C.grey} anchor="start">F, C_A</T>

      {/* lazo de composición */}
      <Bubble cx={560} cy={280} tag="AT" num="201" r={29} tagsize={21} numsize={19} />
      <L x1={560} y1={309} x2={560} y2={368} color={C.ink} w={1.6} />
      <Sig x1={560} y1={251} x2={560} y2={202} kind="electric" color={C.ink} arrow />
      <Bubble cx={560} cy={170} tag="AIC" num="201" r={30} tagsize={21} numsize={19} location="room" system="dcs" />
      <T x={620} y={252} size={19} color={C.grey} anchor="start">τ = V / (F + Vk)</T>
      <T x={620} y={278} size={19} color={C.grey} anchor="start">la reacción acorta τ</T>
      <T x={620} y={304} size={19} color={C.grey} anchor="start">y baja la ganancia</T>
    </Figure>
  );
}

function FigIntegrante() {
  return (
    <Figure vw={940} vh={340} num="3.5" caption="Izquierda: V-301, tambor de gas con compresor de desplazamiento positivo aguas abajo. Nada frena la acumulación, así que el proceso es integrante. Derecha: la respuesta de los dos tipos ante el mismo escalon.">
      <Drum cx={190} cy={120} w={230} h={96} />
      <T x={190} y={200} size={21} color={C.navy} bold>V-301</T>
      <Sig x1={0} y1={120} x2={78} y2={120} kind="process" color={C.ink} />
      <Flow x={58} y={120} dir="right" s={7} />
      <T x={34} y={102} size={20} color={C.grey} anchor="start">gas</T>
      <Sig x1={302} y1={120} x2={366} y2={120} kind="process" color={C.ink} />
      <Conector x={368} y={120} dir="right" w={70} h={14} label="a K-301" />
      <Flow x={344} y={120} dir="right" s={7} />
      <Bubble cx={190} cy={32} tag="PT" num="301" r={25} tagsize={19} numsize={17} />
      <L x1={190} y1={57} x2={190} y2={72} color={C.ink} w={1.6} />
      <T x={190} y={252} size={19} color={C.grey}>flujo impuesto por el compresor</T>
      
      <T x={190} y={278} size={18} color={C.grey}>sin resistencia a la salida</T>
      

      <L x1={500} y1={40} x2={500} y2={310} color={C.grid} w={1} />
      <L x1={556} y1={280} x2={920} y2={280} color={C.ink} w={2} />
      <L x1={556} y1={40} x2={556} y2={280} color={C.ink} w={2} />
      <path d="M556,280 C596,280 636,158 736,140 C816,128 876,126 920,126" fill="none" stroke={C.navy} strokeWidth="2.8" />
      <path d="M556,280 L920,58" fill="none" stroke={C.alarm} strokeWidth="2.8" />
      <L x1={556} y1={126} x2={920} y2={126} color={C.grey} w={1.3} dash="7,5" />
      <T x={720} y={168} size={20} color={C.navy} anchor="start">autorregulado</T>
      <T x={660} y={72} size={20} color={C.alarm} anchor="start">integrante</T>
      <T x={738} y={306} size={21} color={C.ink}>tiempo</T>
    </Figure>
  );
}

function FigTau() {
  return (
    <Figure vw={840} vh={330} num="3.6" caption="Significado geométrico de tau. La tangente en el origen alcanza el valor final justo al cabo de una constante de tiempo, y en ese mismo instante la curva real lleva el 63.2 % del recorrido.">
      <L x1={80} y1={270} x2={790} y2={270} color={C.ink} w={2} />
      <L x1={80} y1={40} x2={80} y2={270} color={C.ink} w={2} />
      <L x1={80} y1={70} x2={790} y2={70} color={C.grey} w={1.4} dash="7,5" />
      <T x={786} y={62} size={20} color={C.grey} anchor="end">valor final</T>
      <L x1={80} y1={143} x2={430} y2={143} color={C.navy} w={1.3} dash="5,4" />
      <T x={92} y={135} size={20} color={C.navy} anchor="start">63.2 %</T>
      <path d="M80,270 C160,270 200,150 290,110 C380,72 560,70 790,70" fill="none" stroke={C.navy} strokeWidth="3" />
      <path d="M80,270 L300,70" fill="none" stroke={C.mv} strokeWidth="2" strokeDasharray="8,5" />
      <L x1={300} y1={70} x2={300} y2={270} color={C.mv} w={1.3} dash="5,4" />
      <T x={300} y={296} size={22} color={C.mv}>τ</T>
      <L x1={430} y1={143} x2={430} y2={270} color={C.navy} w={1.3} dash="5,4" />
      <T x={80} y={296} size={22} color={C.ink}>0</T>
      <T x={620} y={296} size={22} color={C.ink}>tiempo</T>
      <T x={446} y={252} size={20} color={C.mv} anchor="start">tangente inicial</T>
    </Figure>
  );
}

function FigEntradas() {
  // Cuatro respuestas del mismo primer orden, integradas analiticamente.
  const TAU = 1, TM = 6, W = 940, H = 430;
  const paneles = [
    { t: 'Escalón', x: 40, y: 46, u: () => 1, y_: (x) => 1 - Math.exp(-x), esc: 1.25 },
    { t: 'Rampa', x: 510, y: 46, u: (x) => x / TM, y_: (x) => (x - (1 - Math.exp(-x))) / TM, esc: 1.05 },
    { t: 'Impulso', x: 40, y: 246, u: () => 0, y_: (x) => Math.exp(-x), esc: 1.25 },
    { t: 'Senoidal', x: 510, y: 246, u: (x) => 0.9 * Math.sin(2 * x), y_: (x) => (0.9 / Math.sqrt(1 + 4)) * Math.sin(2 * x - Math.atan(2)), esc: 1.15 },
  ];
  const PW = 390, PH = 150;
  const traza = (p, fn) => {
    let d = '';
    for (let i = 0; i <= 160; i++) {
      const x = (TM * i) / 160;
      const px = p.x + (PW * x) / TM;
      const py = p.y + PH - (PH * (fn(x) / p.esc + (p.t === 'Senoidal' ? 0.5 : 0)));
      d += `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    }
    return d;
  };
  return (
    <Figure vw={W} vh={H} num="3.7" caption="El mismo proceso de primer orden ante las cuatro entradas de prueba. El trazo gris es la entrada y el azul la salida. Ante la rampa, la salida no pierde amplitud sino tiempo: se queda atrás exactamente una constante de tiempo.">
      {paneles.map((p) => (
        <g key={p.t}>
          <rect x={p.x} y={p.y} width={PW} height={PH} fill="#FCFDFE" stroke={C.grid} />
          <T x={p.x + 6} y={p.y - 10} size={19} color={C.ink} anchor="start" bold>{p.t}</T>
          <L x1={p.x} y1={p.y + PH} x2={p.x + PW} y2={p.y + PH} color={C.ink} w={1.4} />
          {p.t !== 'Impulso' && (
            <path d={traza(p, p.u)} fill="none" stroke={C.grey} strokeWidth="2" strokeDasharray="7,5" />
          )}
          <path d={traza(p, p.y_)} fill="none" stroke={C.navy} strokeWidth="2.6" />
          <T x={p.x + 4} y={p.y + PH + 20} size={16} color={C.grey} anchor="start">t / τ</T>
        </g>
      ))}
      <T x={426} y={222} size={16} color={C.grey} anchor="end">63.2 % en t = τ</T>
      <T x={896} y={222} size={16} color={C.grey} anchor="end">se retrasa τ</T>
      <T x={426} y={422} size={16} color={C.grey} anchor="end">decae con τ</T>
      <T x={896} y={422} size={16} color={C.grey} anchor="end">atenúa y desfasa</T>
    </Figure>
  );
}

function FigDelay() {
  return (
    <Figure vw={900} vh={330} num="3.8" caption="Tres origenes distintos del mismo efecto. El tiempo muerto no deforma la respuesta, la desplaza, y esa demora es la que limita la ganancia que el controlador puede usar.">
      <Sig x1={0} y1={70} x2={330} y2={70} kind="process" color={C.ink} />
      <Conector x={332} y={70} dir="right" w={70} h={13} size={14} label="a proceso" />
      <Flow x={150} y={70} dir="right" s={7} />
      <ControlValve cx={110} cy={70} s={17} />
      <Bubble cx={300} cy={130} tag="AT" num="401" r={27} tagsize={20} numsize={18} />
      <L x1={300} y1={103} x2={300} y2={73} color={C.ink} w={1.6} />
      <T x={420} y={62} size={20} color={C.ink} anchor="start" bold>Transporte</T>
      <T x={420} y={88} size={19} color={C.grey} anchor="start">θ = L / v, entre válvula y medida</T>

      <L x1={40} y1={160} x2={860} y2={160} color={C.grid} w={1} />

      <L x1={60} y1={216} x2={280} y2={216} color={C.ink} w={2.4} />
      {[80, 130, 180, 230].map((x) => (
        <g key={x}>
          <L x1={x} y1={216} x2={x} y2={196} color={C.mv} w={2.4} />
          <circle cx={x} cy={196} r={4} fill={C.mv} />
        </g>
      ))}
      <T x={340} y={200} size={20} color={C.ink} anchor="start" bold>Muestreo</T>
      <T x={340} y={226} size={19} color={C.grey} anchor="start">θ = T_m / 2 en promedio, para un ciclo de muestreo T_m</T>

      <T x={340} y={266} size={20} color={C.ink} anchor="start" bold>Análisis</T>
      <T x={340} y={292} size={19} color={C.grey} anchor="start">θ = acondicionamiento mas ciclo del cromatografo</T>
      <T x={60} y={306} size={18} color={C.grey} anchor="start">toma · acondicionador · columna</T>
    </Figure>
  );
}

function FigIdent() {
  return (
    <Figure vw={880} vh={340} num="3.9" caption="Método de los dos puntos de Smith. Se leen dos instantes sobre la curva, no una pendiente, y por eso el resultado no se desmorona cuando el dato tiene ruido.">
      <L x1={90} y1={280} x2={820} y2={280} color={C.ink} w={2} />
      <L x1={90} y1={40} x2={90} y2={280} color={C.ink} w={2} />
      <L x1={90} y1={70} x2={820} y2={70} color={C.grey} w={1.3} dash="7,5" />
      <T x={816} y={62} size={20} color={C.grey} anchor="end">Δy∞</T>
      <path d="M90,250 L210,250 C260,250 300,180 380,150 C470,118 640,102 820,100" fill="none" stroke={C.navy} strokeWidth="3" />
      <L x1={210} y1={40} x2={210} y2={280} color={C.mv} w={1.3} dash="6,4" />
      <T x={210} y={306} size={20} color={C.mv}>escalon</T>
      <L x1={90} y1={199} x2={330} y2={199} color={C.dist} w={1.3} dash="5,4" />
      <L x1={330} y1={199} x2={330} y2={280} color={C.dist} w={1.3} dash="5,4" />
      <T x={100} y={191} size={19} color={C.dist} anchor="start">28.3 %</T>
      <T x={330} y={306} size={20} color={C.dist}>t₁</T>
      <L x1={90} y1={136} x2={455} y2={136} color={C.navy} w={1.3} dash="5,4" />
      <L x1={455} y1={136} x2={455} y2={280} color={C.navy} w={1.3} dash="5,4" />
      <T x={100} y={128} size={19} color={C.navy} anchor="start">63.2 %</T>
      <T x={455} y={306} size={20} color={C.navy}>t₂</T>
      <T x={560} y={200} size={21} color={C.ink} anchor="start">τ = 1.5 (t₂ − t₁)</T>
      <T x={560} y={230} size={21} color={C.ink} anchor="start">θ = t₂ − τ</T>
      <T x={560} y={260} size={21} color={C.ink} anchor="start">K = Δy∞ / Δu</T>
    </Figure>
  );
}

/* =========================================================
   Teoria
   ========================================================= */

export function Teoria() {
  return (
    <div className="prose">
      <p className="eyebrow">Modelar · transformar · interpretar · excitar · retardar · reducir · medir</p>
      <p>
        Este módulo recorre siete preguntas en ese orden. Qué ecuación describe al equipo, cómo esa ecuación se
        convierte en función de transferencia, qué significan sus parámetros, cómo responde a cada tipo de entrada, de
        dónde sale el retardo, cuándo un proceso complicado se puede tratar como simple, y cómo se miden los tres
        números en planta.
      </p>

      {/* ============ 1. MODELAR ============ */}
      <h2>1. Una sola estructura para cuatro equipos</h2>
      <p>
        La dinámica de primer orden aparece siempre que hay <strong>una capacidad que acumula</strong> y{' '}
        <strong>una resistencia que se opone a la salida</strong>. Cambia lo que se almacena, cambia lo que resiste, y el
        modelo es el mismo.
      </p>
      <FigCapacidad />
      <Eq n="3.1">{'\\tau\\,\\frac{dy}{dt} + y = K\\,u \\qquad\\Longleftrightarrow\\qquad G(s) = \\frac{K}{\\tau s + 1}'}</Eq>
      <p>
        Reconocer esa estructura es lo que permite modelar un equipo nuevo sin memorizar fórmulas. Lo que sigue son
        cuatro casos, del más simple al más cargado de física.
      </p>

      <h3>Caso 1. Nivel: balance de materia</h3>
      <FigTanquePID />
      <p>Con densidad constante, el balance sobre el líquido retenido es</p>
      <Eq n="3.2">{'A\\,\\frac{dh}{dt} = F_e(t) - F_s(t), \\qquad F_s = C_v\\,x\\,\\sqrt{h}'}</Eq>
      <p>
        El término de acumulación <Ei>{'A\\,dh/dt'}</Ei> es la <strong>capacitancia</strong>. La raíz vuelve el modelo no
        lineal, así que se linealiza alrededor del punto de operación:
      </p>
      <Eq n="3.3">{'\\left.\\frac{\\partial F_s}{\\partial h}\\right|_{\\bar{h}} = \\frac{C_v\\,\\bar{x}}{2\\sqrt{\\bar{h}}} \\equiv\\frac{1}{R}'}</Eq>
      <p>
        La cantidad <Ei>{'R'}</Ei> es la <strong>resistencia hidráulica</strong>. Restando el estado estacionario y
        definiendo <Ei>{"h' = h - \\bar{h}"}</Ei>:
      </p>
      <Eq n="3.4">{"A R\\,\\frac{dh'}{dt} + h' = R\\,F_e' \\qquad\\Longrightarrow\\qquad\\tau = A R, \\quad K = R"}</Eq>

      {/* ============ 2. INTERPRETAR ============ */}
      <h3>Caso 2. Temperatura con energía agregada: balance de energía</h3>
      <FigSerpentinPID />
      <p>
        El tanque T-102 recibe una corriente fría y se calienta con vapor que condensa en un serpentín sumergido. El
        volumen es constante porque el nivel está controlado aparte.
      </p>
      <Eq n="3.5">{'\\underbrace{\\rho V C_p \\frac{dT}{dt}}_{\\text{acumulación}} = \\underbrace{\\rho F C_p (T_e - T)}_{\\text{arrastre por la corriente}} + \\underbrace{U A (T_v - T)}_{\\text{intercambio en el serpentín}}'}</Eq>
      <p>Agrupando los términos en <Ei>{'T'}</Ei> aparecen <strong>dos vías de salida de energía en paralelo</strong>:</p>
      <Eq n="3.6">{'\\tau = \\frac{\\rho V C_p}{\\rho F C_p + U A}, \\qquad K_{T_v} = \\frac{U A}{\\rho F C_p + U A}, \\qquad K_{T_e} = \\frac{\\rho F C_p}{\\rho F C_p + U A}'}</Eq>
      <Table
        caption="Lo que dice cada término"
        head={['Observación', 'Consecuencia de operación']}
        rows={[
          ['$\\text{Las} \\text{dos} \\text{ganancias} \\text{suman} \\text{uno}$', 'Si el serpentín domina, la temperatura de entrada casi no perturba, y viceversa'],
          ['$UA$ aparece en el denominador de $\\tau$', 'Un serpentín mayor vuelve el proceso más rápido, no solo más potente'],
          ['$F$ aparece en el denominador de $\\tau$', 'Al subir la carga el proceso se acelera y la ganancia baja: la sintonía se desajusta'],
          ['El ensuciamiento reduce $U$', 'Con el tiempo el lazo se vuelve lento y de mayor ganancia, sin que nadie toque nada'],
        ]}
      />
      <Callout kind="warn" title="El error frecuente en este balance">
        <p>
          Escribir la acumulación con la masa que entra en lugar de la retenida. El término de acumulación usa{' '}
          <Ei>{'\\rho V'}</Ei>, la masa que hay <em>dentro</em> del equipo; el arrastre usa <Ei>{'\\rho F'}</Ei>, el flujo
          másico. Confundirlos deja una constante de tiempo con unidades equivocadas, y esa es la señal para revisar.
        </p>
      </Callout>

      <h4>El sensor también tiene dinámica</h4>
      <p>
        El termopozo de la figura no es un adorno. La vaina separa el elemento del proceso y agrega su propia capacidad
        térmica, con lo que el conjunto se comporta como otro primer orden en serie:
      </p>
      <Eq n="3.7">{'\\tau_{sensor} = \\frac{m_{pozo}\\,C_{p,pozo}}{h\\,A_{pozo}}'}</Eq>
      <p>
        En un termopozo de acero inoxidable sin relleno esa constante va de 20 a 60 s. Si el proceso responde en minutos
        se puede ignorar; si responde en segundos, el sensor pasa a ser el elemento lento del lazo y ninguna sintonía lo
        arregla. La solución es de ingeniería: pozo más delgado, relleno conductor o montaje directo.
      </p>

      <h3>Caso 3. Composición en un reactor: balance de componente</h3>
      <FigReactorPID />
      <p>
        En el reactor R-201 ocurre una reacción de primer orden <Ei>{'A \\to B'}</Ei> con velocidad{' '}
        <Ei>{'r = k\\,C_A'}</Ei>. El balance del componente A sobre el volumen de reacción es
      </p>
      <Eq n="3.8">{'V\\,\\frac{dC_A}{dt} = F\\,C_{A0} - F\\,C_A - V\\,k\\,C_A'}</Eq>
      <Eq n="3.9">{'\\tau = \\frac{V}{F + Vk} = \\frac{\\tau_{res}}{1 + \\tau_{res}\\,k}, \\qquad K = \\frac{1}{1 + \\tau_{res}\\,k}'}</Eq>
      <p>
        La reacción actúa como <strong>una vía de escape adicional</strong> para el componente A. Cuanto más rápida es la
        cinética, más corta es la constante de tiempo y menor la ganancia. Sin reacción, <Ei>{'k = 0'}</Ei>, se recupera
        el tanque de mezcla puro con <Ei>{'\\tau = V/F'}</Ei> y <Ei>{'K = 1'}</Ei>.
      </p>
      <Callout kind="plant" title="Por qué esto importa en un reactor real">
        <p>
          La constante <Ei>{'k'}</Ei> depende de la temperatura por Arrhenius, así que <Ei>{'\\tau'}</Ei> y{' '}
          <Ei>{'K'}</Ei> cambian con el punto de operación térmico. Un lazo de composición sintonizado en arranque, con el
          reactor frío, queda mal sintonizado en marcha normal.
        </p>
      </Callout>

      <h3>Caso 4. Presión sin resistencia: procesos integrantes</h3>
      <FigIntegrante />
      <p>
        El tambor V-301 recibe gas y lo entrega a un compresor de desplazamiento positivo, que succiona un flujo fijo sin
        importar la presión. Con gas ideal a volumen y temperatura constantes:
      </p>
      <Eq n="3.10">{'\\frac{V}{R_g T}\\,\\frac{dP}{dt} = \\dot{n}_e - \\dot{n}_s'}</Eq>
      <p>
        Aquí <strong>la salida no depende de la presión</strong>, así que no hay resistencia ni término en{' '}
        <Ei>{'P'}</Ei> al lado izquierdo. Integrando:
      </p>
      <Eq n="3.11">{'P(t) = \\bar{P} + \\frac{R_g T}{V}\\int_0^t (\\dot{n}_e - \\dot{n}_s)\\,dt^{*} \\qquad\\Longrightarrow\\qquad G(s) = \\frac{K_i}{s}'}</Eq>
      <Table
        caption="Autorregulado frente a integrante"
        head={['Rasgo', 'Autorregulado', 'Integrante']}
        rows={[
          ['Función de transferencia', '$K/(\\tau s + 1)$', '$K_i/s$'],
          ['Ante un escalón en lazo abierto', 'Llega a un valor nuevo', 'Crece sin límite'],
          ['Estado estacionario propio', 'Sí', 'No'],
          ['Parámetros que se identifican', '$K$, $\\tau$, $\\theta$', '$K_i$, $\\theta$'],
          ['Efecto de la acción integral', 'Elimina el error permanente', 'Puede desestabilizar: suele bastar P o PI muy suave'],
          ['Ejemplos', 'Nivel con descarga por gravedad, temperatura, composición', 'Nivel con bomba de desplazamiento positivo, presión en tambor cerrado'],
        ]}
      />
      <Callout kind="risk" title="El error de sintonía más caro">
        <p>
          Aplicar a un proceso integrante una regla pensada para autorregulados. Como el modelo carece de{' '}
          <Ei>{'\\tau'}</Ei>, las fórmulas de Ziegler-Nichols o de Cohen-Coon devuelven valores sin sentido y el lazo
          termina ciclando. Para un integrante con tiempo muerto la referencia es{' '}
          <Ei>{'K_c \\approx 1/(K_i\\,\\theta)'}</Ei> con acción integral muy lenta o nula.
        </p>
      </Callout>

      {/* ============ 2. TRANSFORMAR ============ */}
      <h2>2. Del balance a la función de transferencia</h2>
      <p>
        Hasta aquí el modelo es una ecuación diferencial. Ni las reglas de sintonía, ni el álgebra de bloques, ni el
        criterio de estabilidad trabajan con ecuaciones diferenciales: todos trabajan con funciones de transferencia. El
        puente es la transformada de Laplace, con las propiedades vistas en el módulo de herramientas matemáticas.
      </p>

      <h3>Transformar el balance, término a término</h3>
      <p>Se parte del modelo linealizado del tanque, en variables de desviación:</p>
      <Eq n="3.12">{"A R\\,\\frac{dh'}{dt} + h' = R\\,F_e'"}</Eq>
      <p>
        Cada término se transforma por separado. La derivada da <Ei>{"s\\,H'(s) - h'(0)"}</Ei>, y aquí está la ventaja de
        haber trabajado en desviación: en el instante inicial el proceso está en su punto de operación, así que{' '}
        <Ei>{"h'(0) = 0"}</Ei> y el término desaparece.
      </p>
      <Eq n="3.13">{"A R\\,s\\,H'(s) + H'(s) = R\\,F_e'(s) \\;\\Longrightarrow\\; (A R\\,s + 1)\\,H'(s) = R\\,F_e'(s)"}</Eq>
      <Eq n="3.14">{"G(s) = \\frac{H'(s)}{F_e'(s)} = \\frac{R}{A R\\,s + 1} = \\frac{K}{\\tau s + 1}"}</Eq>
      <p>
        La función de transferencia no es una definición que haya que memorizar: <strong>sale del balance</strong>, y sus
        dos parámetros son los que ya se obtuvieron de la física del equipo.
      </p>
      <Callout kind="note" title="Por qué la condición inicial se anula">
        <p>
          Si se trabajara con la variable absoluta, la transformada arrastraría <Ei>{'\\bar{h}'}</Ei> en cada término y la
          expresión dejaría de ser un cociente limpio entre salida y entrada. Trabajar en desviación no es una
          convención estética: es lo que hace existir la función de transferencia.
        </p>
      </Callout>

      <h3>El polo y lo que dice</h3>
      <Eq n="3.15">{'\\tau s + 1 = 0 \\;\\Longrightarrow\\; s = -\\frac{1}{\\tau}'}</Eq>
      <p>
        Un solo polo, real y negativo. De ahí se leen tres cosas de golpe. Es <strong>estable</strong>, porque la parte
        real es negativa. <strong>No puede oscilar</strong>, porque no hay parte imaginaria. Y es tanto{' '}
        <strong>más rápido</strong> cuanto más a la izquierda esté, es decir cuanto menor sea{' '}
        <Ei>{'\\tau'}</Ei>.
      </p>
      <Callout kind="plant" title="Consecuencia de diagnóstico">
        <p>
          Un proceso de primer orden en lazo abierto <strong>no puede oscilar</strong>, por grande que sea la
          perturbación. Si el registro de planta oscila, la causa está en el controlador, en el elemento final o en una
          segunda capacidad que el modelo no recogió. Descartar el proceso como origen de la oscilación es lo primero que
          permite este polo.
        </p>
      </Callout>

      <h3>La respuesta al escalón, deducida</h3>
      <p>
        La curva que se usa en todo el módulo no es un postulado: se obtiene multiplicando la función de transferencia por
        la transformada del escalón y volviendo al tiempo con fracciones parciales.
      </p>
      <Eq n="3.16">{"H'(s) = \\frac{K}{\\tau s + 1}\\cdot\\frac{\\Delta u}{s} = K\\,\\Delta u\\left[\\frac{1}{s} - \\frac{\\tau}{\\tau s + 1}\\right]"}</Eq>
      <Eq n="3.17">{"h'(t) = K\\,\\Delta u\\left(1 - e^{-t/\\tau}\\right)"}</Eq>
      <p>
        Evaluando en <Ei>{'t = \\tau'}</Ei> resulta <Ei>{'1 - e^{-1} = 0.632'}</Ei>. El 63.2 % de la tabla anterior es esa
        exponencial, no una regla empírica.
      </p>

      <h3>Los dos teoremas que entregan los dos números clave</h3>
      <p>El del valor final da la ganancia sin necesidad de antitransformar:</p>
      <Eq n="3.18">{"h'(\\infty) = \\lim_{s \\to 0} s\\,H'(s) = \\lim_{s \\to 0}\\frac{K\\,\\Delta u}{\\tau s + 1} = K\\,\\Delta u"}</Eq>
      <p>El del valor inicial, aplicado a la derivada, da la pendiente con que arranca la respuesta:</p>
      <Eq n="3.19">{"\\left.\\frac{dh'}{dt}\\right|_{0^{+}} = \\lim_{s \\to \\infty} s\\left[s\\,H'(s)\\right] = \\frac{K\\,\\Delta u}{\\tau}"}</Eq>
      <p>
        Esa pendiente es la que justifica el método de la tangente: una recta que sale del origen con pendiente{' '}
        <Ei>{'K\\Delta u/\\tau'}</Ei> corta el valor final <Ei>{'K\\Delta u'}</Ei> exactamente en{' '}
        <Ei>{'t = \\tau'}</Ei>. También explica por qué ese método es frágil, ya que estimar una pendiente sobre datos
        con ruido es estimar una derivada, la operación menos robusta que existe.
      </p>

      <h3>El tiempo muerto en el dominio s</h3>
      <p>
        Un retardo puro desplaza la señal sin deformarla. Por la propiedad de traslación real,{' '}
        <Ei>{'\\mathcal{L}\\{f(t-\\theta)\\} = e^{-\\theta s}F(s)'}</Ei>, y el modelo completo queda
      </p>
      <Eq n="3.20">{'G(s) = \\frac{K\\,e^{-\\theta s}}{\\tau s + 1}'}</Eq>
      <p>
        El retardo <strong>no agrega polos: multiplica</strong>. Por eso no se puede tratar con el álgebra de polinomios,
        y por eso hace falta la aproximación de Padé que se ve más adelante.
      </p>

      <h3>Los cuatro casos, ya en el dominio s</h3>
      <Table
        caption="El mismo procedimiento aplicado a los cuatro equipos"
        head={['Equipo', 'Modelo linealizado', 'Función de transferencia', 'Polo']}
        rows={[
          ['T-101, nivel', "$A R\\,dh'/dt + h' = R\\,F_e'$", '$R/(A R s + 1)$', '$s = -1/A R$'],
          ['T-102, temperatura', "$\\tau\\,dT'/dt + T' = K_{T_v} T_v'$", '$K_{T_v}/(\\tau s + 1)$', '$s = -1/\\tau$'],
          ['R-201, composición', "$\\tau\\,dC_A'/dt + C_A' = K\\,C_{A0}'$", '$K/(\\tau s + 1)$', '$s = -1/\\tau$'],
          ['V-301, presión', "$(V/R_g T)\\,dP'/dt = \\dot{n}_e' - \\dot{n}_s'$", '$K_i/s$', '$s = 0$'],
        ]}
      />
      <p>
        Los tres primeros comparten estructura y solo cambia lo que significa cada parámetro. El cuarto es distinto en un
        punto decisivo: su polo está <strong>en el origen</strong>. Esa es la firma del proceso integrante, un polo que ni
        decae ni crece, sino que acumula, y de ahí que no tenga estado estacionario propio.
      </p>

      <h2>3. Qué significan la ganancia, la constante de tiempo y el retardo</h2>
      <FigTau />
      <Table
        caption="Los tres números que describen el lazo"
        head={['Parámetro', 'Definición física', 'Cómo se lee', 'Efecto sobre el control']}
        rows={[
          ['Ganancia $K$', 'Cambio en la salida por unidad de cambio en la entrada, en estado estacionario', 'Capacidad de la manipulada para mover la controlada', '$K$ grande obliga a bajar $K_c$'],
          ['Constante de tiempo $\\tau$', 'Producto de capacitancia por resistencia', 'Velocidad con que el proceso responde', '$\\tau$ grande vuelve el lazo lento pero tolerante'],
          ['Tiempo muerto $\\theta$', 'Retardo puro de transporte o de medición', 'Cuánto tarda en verse el primer efecto', 'Es lo que limita la ganancia utilizable'],
        ]}
      />
      <Table
        caption="Avance de la respuesta a un escalón"
        head={['Tiempo transcurrido', 'Fracción del cambio total']}
        rows={[['$\\tau$', '63.2 %'], ['$2\\tau$', '86.5 %'], ['$3\\tau$', '95.0 %'], ['$4\\tau$', '98.2 %'], ['$5\\tau$', '99.3 %']]}
        numeric={[1]}
      />

      <h3>Cuánto se autorregula un proceso</h3>
      <p>
        La distinción no es binaria. Definiendo la <strong>ganancia de autorregulación</strong> como la derivada de la
        salida neta respecto del estado:
      </p>
      <Eq n="3.21">{'\\sigma = -\\left.\\frac{\\partial(\\text{salidas} - \\text{entradas})}{\\partial x}\\right|_{ss} = \\frac{1}{R}, \\qquad\\tau = \\frac{C}{\\sigma}'}</Eq>
      <p>
        Cuanto mayor es <Ei>{'\\sigma'}</Ei>, más rápido el proceso encuentra su nuevo estado estacionario por sí solo.
        Cuando <Ei>{'\\sigma\\to 0'}</Ei> la constante de tiempo tiende a infinito y el proceso degenera en integrante.
        Hay un continuo: un tanque con la válvula muy cerrada se comporta casi como un integrante aunque su modelo diga
        lo contrario.
      </p>

      <h3>Linealización: los tres casos que aparecen siempre</h3>
      <p>
        El procedimiento general está en el módulo de herramientas matemáticas. Aquí basta con tener a mano los tres
        términos que aparecen en casi todo balance de proceso.
      </p>
      <Table
        caption="Términos no lineales frecuentes y su forma linealizada"
        head={['Término', 'Dónde aparece', 'Aproximación alrededor del punto de operación']}
        rows={[
          ['$\\sqrt{h}$', 'Descarga por gravedad', "$F' \\approx (C_v\\bar{x}/2\\sqrt{\\bar{h}})\\,h' + (C_v\\sqrt{\\bar{h}})\\,x'$"],
          ['$F\\cdot C$', 'Producto de flujo por concentración', "$(FC)' \\approx \\bar{F}\\,C' + \\bar{C}\\,F'$"],
          ['$k_0\\,e^{-E/RT}$', 'Velocidad de reacción', "$k' \\approx \\bar{k}\\,(E/R\\bar{T}^2)\\,T'$"],
        ]}
      />
      <p>
        El caso del producto merece atención: aparecen <strong>dos</strong> términos, uno por cada variable, y el
        coeficiente de cada uno es el valor de la <em>otra</em> en el estado estacionario.
      </p>

      <h3>Los parámetros dependen del punto de operación</h3>
      <p>
        La linealización se hace en un punto, así que <Ei>{'K'}</Ei> y <Ei>{'\\tau'}</Ei> valen solo cerca de él. Para el
        tanque con descarga por gravedad y apertura fija:
      </p>
      <Eq n="3.22">{'R = \\frac{2\\sqrt{\\bar{h}}}{C_v\\,\\bar{x}} \\;\\Longrightarrow\\; K = R \\propto\\sqrt{\\bar{h}}, \\qquad\\tau = A R \\propto\\sqrt{\\bar{h}}'}</Eq>
      <Table
        caption="El mismo tanque, tres puntos de operación"
        head={['Nivel de operación', 'Resistencia relativa', '$K$ relativa', '$\\tau$ relativa']}
        numeric={[1, 2, 3]}
        rows={[['25 % del rango', '0.71', '0.71', '0.71'], ['50 % del rango', '1.00', '1.00', '1.00'], ['100 % del rango', '1.41', '1.41', '1.41']]}
      />
      <p>
        Un factor de dos entre extremos. Como la estabilidad depende del producto <Ei>{'K_c K'}</Ei>, una sintonía
        calculada al 50 % queda 41 % más agresiva con el tanque lleno. Ese es el argumento cuantitativo para programar la
        ganancia, y la razón por la que la prueba de escalón se hace en el punto de operación real.
      </p>

      {/* ============ 3. EXCITAR ============ */}
      <h2>4. Cómo responde a cada tipo de entrada</h2>
      <p>
        El escalón es la prueba estándar, pero la planta no siempre entrega escalones. Las otras tres respuestas revelan
        cosas distintas del mismo proceso.
      </p>
      <FigEntradas />
      <Table
        caption="Un mismo primer orden ante cuatro entradas"
        head={['Entrada', 'Respuesta', 'Qué revela']}
        rows={[
          ['Escalón de altura $A$', '$y = KA(1 - e^{-t/\\tau})$', '$K$ y $\\tau$ de un solo ensayo'],
          ['Rampa de pendiente $a$', '$y = Ka[t - \\tau(1 - e^{-t/\\tau})]$', 'Con el tiempo la salida sigue la rampa retrasada exactamente $\\tau$'],
          ['Impulso de área $A$', '$y = (KA/\\tau)\\,e^{-t/\\tau}$', '$\\tau$ directamente, útil con trazadores'],
          ['Senoidal de amplitud $A$', '$y = KA\\operatorname{sen}(\\omega t + \\phi)/\\sqrt{1+(\\omega\\tau)^2}$', 'Atenuación y desfase: la base del análisis en frecuencia'],
        ]}
      />
      <Eq n="3.23">{'\\text{Rampa: } y(t) = K a\\left[t - \\tau\\left(1 - e^{-t/\\tau}\\right)\\right] \\;\\xrightarrow{\\;t \\gg\\tau\\;}\\; K a\\,(t - \\tau)'}</Eq>
      <p>
        Ante una rampa sostenida, un primer orden <strong>no se queda atrás en amplitud sino en tiempo</strong>,
        exactamente una constante de tiempo. Por eso un lazo que sigue una rampa de temperatura programada mantiene un
        error permanente proporcional a la pendiente.
      </p>
      <Eq n="3.24">{'\\text{Senoidal: } \\frac{\\text{amplitud de salida}}{\\text{amplitud de entrada}} = \\frac{K}{\\sqrt{1 + (\\omega\\tau)^2}}, \\qquad\\phi = -\\arctan(\\omega\\tau)'}</Eq>
      <p>
        A <Ei>{'\\omega = 1/\\tau'}</Ei> la amplitud cae al 70.7 % y el desfase vale 45 grados. Esa es la razón física de
        que un tanque grande filtre el ruido de la unidad anterior, y de que ese mismo tanque no sirva para responder
        rápido.
      </p>

      {/* ============ 4. RETARDAR ============ */}
      <h2>5. Tiempo muerto</h2>
      <FigDelay />
      <p>
        La forma del modelo ya salió en la sección 2: el retardo entra como el factor{' '}
        <Ei>{'e^{-\\theta s}'}</Ei> y produce el <strong>FOPDT</strong>, de primer orden con tiempo muerto. Lo que falta
        es de dónde sale ese retardo en un equipo real y cuánto pesa.
      </p>
      <Table
        caption="Los tres orígenes del tiempo muerto"
        head={['Origen', 'Cómo se calcula', 'Órdenes típicos']}
        rows={[
          ['Transporte por tubería', '$\\theta = L/v$, longitud sobre velocidad media', 'segundos a minutos'],
          ['Muestreo de un analizador', 'Medio ciclo de análisis en promedio, más el acondicionamiento', 'minutos a decenas de minutos'],
          ['Ciclo de un sistema digital', 'Medio periodo de barrido en promedio', 'décimas de segundo'],
        ]}
      />
      <p>
        Con tres números, <Ei>{'K'}</Ei>, <Ei>{'\\tau'}</Ei> y <Ei>{'\\theta'}</Ei>, el FOPDT describe
        razonablemente bien lazos de nivel, flujo, presión y temperatura de una planta real, y es la entrada de casi toda
        regla de sintonía.
      </p>
      <Callout kind="note" title="El indicador que decide la dificultad">
        <p>
          La relación <Ei>{'\\theta/\\tau'}</Ei> mide cuánto pesa el retardo frente a la inercia. Por debajo de 0.2 el
          lazo es fácil y admite ganancias altas. Entre 0.2 y 0.6 es un caso normal. Por encima de 1 el tiempo muerto
          domina, la realimentación sola rinde poco y conviene evaluar acción anticipativa o compensación de tiempo
          muerto.
        </p>
      </Callout>

      <h3>La aproximación de Padé</h3>
      <p>
        El término <Ei>{'e^{-\\theta s}'}</Ei> no es un polinomio, así que no se puede usar en el criterio de Routh ni en
        el álgebra de bloques ordinaria. Padé lo sustituye por un cociente de polinomios que coincide con la exponencial
        en los primeros términos de su serie.
      </p>
      <Eq n="3.26">{'\\text{Primer orden: } e^{-\\theta s} \\approx \\frac{1 - \\theta s/2}{1 + \\theta s/2}'}</Eq>
      <Eq n="3.27">{'\\text{Segundo orden: } e^{-\\theta s} \\approx \\frac{1 - \\theta s/2 + \\theta^2 s^2/12}{1 + \\theta s/2 + \\theta^2 s^2/12}'}</Eq>
      <p>
        El numerador tiene raíces con parte real positiva, es decir <strong>ceros positivos</strong>. Eso no es un
        artificio del método: es la forma en que el álgebra reconoce que un retardo se parece a una respuesta inversa,
        porque en ambos casos la información llega tarde o llega al revés.
      </p>
      <Callout kind="warn" title="Hasta dónde llega la aproximación">
        <p>
          Padé de primer orden es aceptable mientras <Ei>{'\\theta/\\tau'}</Ei> se mantenga por debajo de 0.5. Por encima
          subestima el efecto del retardo y hace parecer al lazo más estable de lo que es, que es el error más peligroso.
          Con relaciones mayores conviene el de segundo orden, o trabajar directamente en el dominio del tiempo.
        </p>
      </Callout>

      {/* ============ 5. REDUCIR ============ */}
      <h2>6. Cuándo un proceso de orden alto sigue pareciendo de primer orden</h2>
      <p>
        Casi ningún lazo real es de primer orden puro: encadena la válvula, el proceso, el sensor y el filtro del
        transmisor. La pregunta práctica es cuándo esa cadena todavía se puede tratar como un solo primer orden.
      </p>
      <Table
        caption="Criterio práctico de dominancia"
        head={['Relación $\\tau_1/\\tau_2$', 'Cómo se comporta', 'Modelo adecuado']}
        rows={[
          ['Mayor que 10', 'La segunda capacidad es casi invisible', 'Primer orden puro, $\\tau\\approx \\tau_1$'],
          ['Entre 5 y 10', 'Aparece una S suave al arrancar', 'FOPDT con $\\theta\\approx \\tau_2$'],
          ['Entre 2 y 5', 'La S es evidente', 'FOPDT con la regla de la semisuma'],
          ['Menor que 2', 'Las dos pesan igual', 'Segundo orden completo'],
        ]}
      />
      <Eq n="3.28">{'\\tau_{eq} = \\tau_1 + \\frac{\\tau_2}{2}, \\qquad\\theta_{eq} = \\theta + \\frac{\\tau_2}{2} + \\tau_3 + \\tau_4 + \\cdots'}</Eq>
      <p>
        Para <Ei>{'G = 1/[(10s+1)(2s+1)(0.5s+1)]'}</Ei> resulta <Ei>{'\\tau_{eq} = 11'}</Ei> y{' '}
        <Ei>{'\\theta_{eq} = 1.5'}</Ei>. La aproximación sirve para sintonizar; para analizar estabilidad conviene volver
        al modelo completo.
      </p>

      <h3>Órdenes de magnitud en planta</h3>
      <p>
        Antes de aceptar un resultado de identificación conviene contrastarlo con lo que es razonable para ese tipo de
        lazo. Un lazo de flujo con constante de tiempo de veinte minutos delata un error de lectura.
      </p>
      <Table
        caption="Valores típicos en planta química"
        head={['Tipo de lazo', '$\\tau$ típica', '$\\theta$ típico', '$\\theta/\\tau$', 'Qué domina']}
        rows={[
          ['Flujo de líquido', '1 a 10 s', '0.2 a 1 s', '0.1 a 0.3', 'La dinámica del elemento final'],
          ['Presión de gas', '5 s a 2 min', 'Casi nulo', 'Menor que 0.1', 'La capacidad del recipiente'],
          ['Nivel', '1 min a varias horas', 'Casi nulo', 'Muy pequeño', 'El área del tanque'],
          ['Temperatura', '1 a 30 min', '0.5 a 5 min', '0.1 a 0.5', 'La masa retenida y el termopozo'],
          ['pH', 'segundos a minutos', '0.2 a 2 min', 'Alta', 'La mezcla y la no linealidad'],
          ['Composición con analizador', '5 min a horas', '2 a 20 min', 'Mayor que 0.5', 'El ciclo del analizador'],
        ]}
      />

      {/* ============ 6. MEDIR ============ */}
      <h2>7. Identificación experimental</h2>
      <p>
        Los parámetros no se calculan casi nunca desde planos: se miden. Con el controlador en manual se aplica un
        escalón en la salida y se registra la respuesta.
      </p>
      <FigIdent />
      <Eq n="3.29">{'K = \\frac{\\Delta y_{\\infty}}{\\Delta u}, \\qquad\\tau = 1.5\\,(t_{63.2} - t_{28.3}), \\qquad\\theta = t_{63.2} - \\tau'}</Eq>
      <Table
        caption="Qué método usar según la calidad del dato"
        head={['Método', 'Qué necesita', 'Cuándo conviene']}
        rows={[
          ['Tangente en el punto de inflexión', 'Estimar una pendiente', 'Solo con datos muy limpios; el ruido lo arruina'],
          ['Dos puntos de Smith', 'Leer dos instantes', 'El estándar de planta, robusto frente a ruido'],
          ['Tres puntos', 'Leer un instante más', 'Cuando se sospecha que el proceso no es de primer orden'],
          ['Áreas o momentos', 'Integrar el registro completo', 'Cuando solo se puede aplicar un pulso'],
          ['Mínimos cuadrados', 'Registro completo y herramienta de cálculo', 'Cuando el dato es abundante y se busca el mejor modelo'],
        ]}
      />

      <h3>Identificación por área, cuando no hay escalón limpio</h3>
      <p>
        Si la planta no admite un escalón sostenido, se aplica un <strong>pulso</strong>: se mueve la salida, se espera y
        se devuelve. El método de áreas extrae los parámetros integrando la curva completa en lugar de leer puntos
        aislados, lo que lo vuelve muy robusto frente al ruido.
      </p>
      <Eq n="3.30">{'K = \\frac{\\int_0^{\\infty} y(t)\\,dt}{\\int_0^{\\infty} u(t)\\,dt}, \\qquad\\tau + \\theta = \\frac{\\int_0^{\\infty}\\left[K\\,u(t) - y(t)\\right]dt}{K\\,\\Delta u}'}</Eq>
      <p>
        La primera integral entrega la ganancia sin necesidad de alcanzar el estado estacionario. La segunda entrega la
        suma <Ei>{'\\tau + \\theta'}</Ei>, llamada <strong>tiempo de residencia aparente</strong>, que es la cantidad que
        gobierna el desempeño alcanzable del lazo.
      </p>
      <Callout kind="note" title="Por qué el pulso se prefiere en planta">
        <p>
          Un pulso devuelve el proceso a su punto de partida, así que no deja la unidad fuera de condiciones ni obliga a
          esperar cinco constantes de tiempo con el lazo abierto. El precio es integrar numéricamente el registro, cosa
          que cualquier historiador hace sin dificultad.
        </p>
      </Callout>

      <Callout kind="plant" title="Cómo se hace la prueba sin dañar la operación">
        <ol>
          <li>Avisar al turno y verificar que ninguna alarma esté cerca de su punto de disparo.</li>
          <li>Esperar a que el proceso esté realmente quieto: sin cambios de carga ni maniobras aguas arriba.</li>
          <li>Pasar el controlador a manual y registrar unos minutos de línea base.</li>
          <li>Aplicar un escalón suficientemente grande para superar el ruido, entre 5 % y 10 % de la salida.</li>
          <li>Esperar al nuevo estado estacionario, del orden de cinco constantes de tiempo.</li>
          <li>Aplicar el escalón inverso y verificar que los parámetros coinciden. Si no coinciden, el proceso no es lineal en ese rango.</li>
        </ol>
      </Callout>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Curva de reacción en vivo</h2>
      <p>
        Mueve los tres parámetros y observa que cambia en la respuesta. Vale la pena fijar <Ei>{'K'}</Ei> y{' '}
        <Ei>{'\\tau'}</Ei> y recorrer <Ei>{'\\theta'}</Ei> de extremo a extremo: la forma de la curva no cambia, solo se
        desplaza, y sin embargo la dificultad del lazo cambia por completo.
      </p>
      <SimFirstOrder />
      <Callout kind="note" title="Cuatro cosas que conviene verificar">
        <ul>
          <li>Al duplicar <Ei>{'K'}</Ei>, el valor final se duplica y el tiempo de asentamiento no cambia.</li>
          <li>Al duplicar <Ei>{'\\tau'}</Ei>, el valor final es el mismo y todo el proceso tarda el doble.</li>
          <li>Al aumentar <Ei>{'\\theta'}</Ei>, ni el valor final ni la forma cambian, y aun así el lazo se vuelve mas dificil.</li>
          <li>Con <Ei>{'\\theta/\\tau'}</Ei> por encima de 0.6, la lectura del indicador pasa a rojo: ese es el umbral donde la realimentación empieza a quedarse corta.</li>
        </ul>
      </Callout>
    </div>
  );
}

/* =========================================================
   Ejercicios resueltos
   ========================================================= */

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Problema 1. Nivel del tanque T-101</h2>
      <Enunciado
        pide={[
          'Calcular la resistencia hidráulica en el punto de operación.',
          'Obtener $\tau$ y la ganancia respecto de la perturbación, con su significado físico y sus unidades.',
          'Calcular la ganancia respecto de la variable manipulada, que es la apertura de LV-101.',
          'Escribir la función de transferencia de nivel y decidir si el lazo debe ser ajustado o promediante.',
          'Estimar el retardo de transporte que vería un transmisor de flujo instalado aguas abajo.',
        ]}
      >
        <p>
          El lazo de nivel de T-101 debe sintonizarse. Antes de eso hace falta el modelo dinámico, porque toda regla de
          sintonía se alimenta de la ganancia y de la constante de tiempo, y esos números no se pueden suponer. La
          variable controlada es el nivel, la manipulada es la apertura de LV-101 y la perturbación es el flujo de
          entrada, así que hacen falta dos ganancias distintas, una por cada entrada.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li><Ei>{'A = 3.20\\ \\text{m}^2'}</Ei>, <Ei>{'\\bar{h} = 2.25\\ \\text{m}'}</Ei>, <Ei>{'\\bar{F}_e = 12.0\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
          <li>Válvula de descarga: <Ei>{'C_v = 12.1\\ \\text{m}^{2.5}/\\text{h}'}</Ei>, <Ei>{'\\bar{x} = 0.66'}</Ei>.</li>
          <li>Tubería entre la válvula y el punto de medida aguas abajo: 18 m de longitud, 0.10 m de diámetro interno.</li>
        </ul>
      </Given>

      <Step n="1" title="Resistencia hidráulica en el punto de operación">
        <Eq>{'\\frac{1}{R} = \\frac{C_v\\,\\bar{x}}{2\\sqrt{\\bar{h}}} = \\frac{12.1 \\times 0.66}{2\\sqrt{2.25}} = \\frac{7.986}{3.00} = 2.662\\ \\text{m}^2/\\text{h}'}</Eq>
        <Eq>{'R = 0.3757\\ \\text{h}/\\text{m}^2'}</Eq>
      </Step>

      <Step n="2" title="Constante de tiempo y ganancia">
        <Eq>{'\\tau = A\\,R = 3.20 \\times 0.3757 = 1.202\\ \\text{h} = 72.1\\ \\text{min}'}</Eq>
        <Eq>{'K_{F_e} = R = 0.376\\ \\text{m por cada m}^3/\\text{h de cambio en } F_e'}</Eq>
      </Step>

      <Step n="3" title="Ganancia respecto de la variable manipulada">
        <p>
          Al abrir la válvula sale más líquido, así que el nivel baja: la ganancia debe salir negativa. Derivando el
          estado estacionario <Ei>{'\\bar{F}_e = C_v\\bar{x}\\sqrt{\\bar{h}}'}</Ei> respecto de la apertura:
        </p>
        <Eq>{'\\frac{\\partial h}{\\partial x} = -R\\,C_v\\sqrt{\\bar{h}} = -0.3757 \\times 12.1 \\times 1.50 = -6.82\\ \\text{m por unidad de apertura}'}</Eq>
        <p>
          Ese es el número que alimenta la sintonía, porque es la ganancia que ve el controlador. En porcentaje de
          apertura equivale a <Ei>{'-0.0682'}</Ei> m por punto porcentual.
        </p>
      </Step>

      <Step n="4" title="Retardo de transporte, solo si se mide aguas abajo">
        <p>
          LT-101 mide dentro del tanque, así que el lazo de nivel <strong>no tiene tiempo muerto</strong>. El cálculo
          siguiente aplica solo si aguas abajo hubiera un transmisor de flujo, por ejemplo a 18 m de la válvula:
        </p>
        <Eq>{'v = \\frac{12.0}{\\pi (0.05)^2} = \\frac{12.0}{7.854\\times 10^{-3}} = 1528\\ \\text{m/h}'}</Eq>
        <Eq>{'\\theta = \\frac{L}{v} = \\frac{18}{1528} = 0.0118\\ \\text{h} = 0.71\\ \\text{min}'}</Eq>
      </Step>

      <Answer>
        <p>
          <Ei>{"H'(s)/F_e'(s) = 0.376/(72.1 s + 1)"}</Ei> y{' '}
          <Ei>{"H'(s)/X'(s) = -6.82/(72.1 s + 1)"}</Ei>, con el tiempo en minutos y sin tiempo muerto, porque el
          transmisor mide dentro del tanque. El lazo debe ser <strong>promediante</strong>, y la razón es de proceso, no
          de dinámica: T-101 alimenta la succión de la bomba y su función es amortiguar las variaciones de la unidad
          anterior. Sostener el nivel con rigidez trasladaría cada cambio de <Ei>{'F_e'}</Ei> directamente a{' '}
          <Ei>{'F_s'}</Ei>, que es lo contrario de lo que el tanque existe para hacer.
        </p>
      </Answer>

      <h2>Problema 2. Tanque calentado con serpentín T-102</h2>
      <Enunciado
        pide={[
          'Calcular $\tau$ y las dos ganancias del proceso, verificando que sumen uno.',
          'Obtener la temperatura de salida en estado estacionario.',
          'Juzgar si el serpentín está bien dimensionado frente a la carga térmica.',
          'Recalcular los parámetros con una caída de 30 % en U y describir el síntoma que verá el operador.',
        ]}
      >
        <p>
          El tanque T-102 precalienta la alimentación con vapor que condensa en un serpentín sumergido. El nivel está
          controlado aparte, así que el volumen retenido permanece constante. Mantenimiento pregunta si la limpieza del
          serpentín debe programarse cada año o cada dos, y para responder hay que saber cuánto degrada el ensuciamiento
          al lazo de temperatura.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Volumen retenido <Ei>{'V = 4.5\\ \\text{m}^3'}</Ei>, flujo <Ei>{'F = 9.0\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
          <li><Ei>{'\\rho = 980\\ \\text{kg}/\\text{m}^3'}</Ei>, <Ei>{'C_p = 4.05\\ \\text{kJ}/\\text{kg}\\cdot \\text{K}'}</Ei>.</li>
          <li>Serpentin: <Ei>{'U = 720\\ \\text{W}/\\text{m}^2\\cdot \\text{K}'}</Ei>, <Ei>{'A = 6.8\\ \\text{m}^2'}</Ei>.</li>
          <li>Entrada a 28 °C, vapor saturado condensando a 140 °C.</li>
        </ul>
      </Given>

      <Step n="1" title="Llevar todo a las mismas unidades">
        <Eq>{'\\rho F C_p = 980 \\times 9.0 \\times 4.05 = 3.573\\times 10^{4}\\ \\text{kJ}/\\text{h}\\cdot \\text{K}'}</Eq>
        <Eq>{'U A = 720 \\times 6.8 = 4896\\ \\text{W/K} = 1.763\\times 10^{4}\\ \\text{kJ}/\\text{h}\\cdot \\text{K}'}</Eq>
        <Eq>{'\\rho V C_p = 980 \\times 4.5 \\times 4.05 = 1.786\\times 10^{4}\\ \\text{kJ}/\\text{K}'}</Eq>
      </Step>

      <Step n="2" title="Constante de tiempo">
        <Eq>{'\\tau = \\frac{\\rho V C_p}{\\rho F C_p + U A} = \\frac{1.786\\times 10^{4}}{3.573\\times 10^{4} + 1.763\\times 10^{4}} = \\frac{1.786\\times 10^{4}}{5.336\\times 10^{4}} = 0.335\\ \\text{h} = 20.1\\ \\text{min}'}</Eq>
        <p>
          Sin serpentin la constante sería el tiempo de residencia, <Ei>{'V/F = 0.50'}</Ei> h, es decir 30 min.
          El intercambio de calor <strong>acelera</strong> el proceso porque agrega una vía de salida de energía.
        </p>
      </Step>

      <Step n="3" title="Las dos ganancias">
        <Eq>{'K_{T_v} = \\frac{1.763\\times 10^{4}}{5.336\\times 10^{4}} = 0.330, \\qquad K_{T_e} = \\frac{3.573\\times 10^{4}}{5.336\\times 10^{4}} = 0.670'}</Eq>
        <p>Suman uno, como exige el balance. La temperatura de salida en estado estacionario resulta</p>
        <Eq>{'\\bar{T} = 0.670 \\times 28 + 0.330 \\times 140 = 18.8 + 46.2 = 65.0\\ \\text{°C}'}</Eq>
      </Step>

      <Step n="4" title="Leer el resultado como ingeniero de control">
        <p>
          La ganancia respecto de la perturbación, 0.670, es el doble de la ganancia respecto de la manipulada, 0.330.
          Un cambio de 10 °C en la alimentación mueve la salida 6.7 °C, y para compensarlo el vapor tendría que subir{' '}
          <Ei>{'6.7/0.330 = 20.3'}</Ei> °C de temperatura de condensación. El equipo está mal repartido: el serpentin es
          pequeño frente a la carga.
        </p>
      </Step>

      <Step n="5" title="Efecto del ensuciamiento">
        <p>Si tras un año de servicio <Ei>{'U'}</Ei> cae 30 %, hasta 504 W/m²·K:</p>
        <Eq>{'U A = 1.234\\times 10^{4}\\ \\text{kJ}/\\text{h}\\cdot \\text{K} \\Rightarrow \\tau = \\frac{1.786\\times 10^{4}}{4.807\\times 10^{4}} = 22.3\\ \\text{min}'}</Eq>
        <Eq>{'K_{T_v} = \\frac{1.234}{4.807} = 0.257 \\quad(\\text{antes } 0.330)'}</Eq>
        <p>
          El proceso se vuelve mas lento y menos sensible al vapor. Un lazo sintonizado con el equipo limpio queda
          conservador, aunque estable. El sintoma en planta es un lazo que responde cada vez peor sin que nadie haya
          tocado la sintonía.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 20.1'}</Ei> min, <Ei>{'K_{T_v} = 0.330'}</Ei>, <Ei>{'K_{T_e} = 0.670'}</Ei>,{' '}
          <Ei>{'\\bar{T} = 65.0'}</Ei> °C. La constante de tiempo cae por debajo del tiempo de residencia gracias al
          serpentin, y el ensuciamiento la alarga hasta 22.3 min mientras reduce la ganancia útil.
        </p>
      </Answer>

      <h2>Problema 3. Reactor R-201 con reacción de primer orden</h2>
      <Enunciado
        pide={[
          'Calcular el tiempo de residencia del reactor.',
          'Obtener $\tau$ y K del proceso, y explicar el papel de la reacción en cada uno.',
          'Determinar la concentración de salida y la conversión alcanzada.',
          'Recalcular con la constante cinética duplicada y decidir que le ocurre a la sintonía existente.',
        ]}
      >
        <p>
          El reactor R-201 opera en continuo con una reacción de primer orden. Producción propone subir la temperatura
          para ganar conversión. Control necesita anticipar que le pasara al lazo de composición si esa propuesta se
          aprueba, porque la cinética entra directamente en los parámetros del modelo.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Volumen de reacción <Ei>{'V = 2.8\\ \\text{m}^3'}</Ei>, alimentación <Ei>{'F = 5.6\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
          <li>Constante cinética a la temperatura de operación: <Ei>{'k = 1.4\\ \\text{h}^{-1}'}</Ei>.</li>
          <li>Concentración de entrada <Ei>{'C_{A0} = 2.0\\ \\text{kmol}/\\text{m}^3'}</Ei>.</li>
        </ul>
      </Given>

      <Step n="1" title="Tiempo de residencia">
        <Eq>{'\\tau_{res} = \\frac{V}{F} = \\frac{2.8}{5.6} = 0.50\\ \\text{h} = 30\\ \\text{min}'}</Eq>
      </Step>

      <Step n="2" title="Constante de tiempo y ganancia del proceso">
        <Eq>{'\\tau = \\frac{\\tau_{res}}{1 + \\tau_{res}k} = \\frac{0.50}{1 + 0.50 \\times 1.4} = \\frac{0.50}{1.70} = 0.294\\ \\text{h} = 17.6\\ \\text{min}'}</Eq>
        <Eq>{'K = \\frac{1}{1 + \\tau_{res}k} = \\frac{1}{1.70} = 0.588'}</Eq>
      </Step>

      <Step n="3" title="Concentración de salida y conversión">
        <Eq>{'\\bar{C}_A = K\\,C_{A0} = 0.588 \\times 2.0 = 1.176\\ \\text{kmol}/\\text{m}^3'}</Eq>
        <Eq>{'X = 1 - \\frac{\\bar{C}_A}{C_{A0}} = 1 - 0.588 = 0.412 \\quad (41.2\\ \\%)'}</Eq>
      </Step>

      <Step n="4" title="Que pasa si sube la temperatura">
        <p>
          Un aumento de temperatura que duplique la constante cinética hasta <Ei>{'k = 2.8\\ \\text{h}^{-1}'}</Ei>{' '}
          entrega
        </p>
        <Eq>{'\\tau = \\frac{0.50}{1 + 1.40} = 0.208\\ \\text{h} = 12.5\\ \\text{min}, \\qquad K = 0.417'}</Eq>
        <p>
          El reactor se vuelve un 29 % mas rápido y un 29 % menos sensible a la concentración de entrada. Como el producto{' '}
          <Ei>{'K_c K'}</Ei> gobierna la estabilidad del lazo, una sintonía hecha a baja temperatura queda con la mitad de
          ganancia efectiva a temperatura alta: el lazo responde lento sin que nada este averiado.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 17.6'}</Ei> min, <Ei>{'K = 0.588'}</Ei>, <Ei>{'\\bar{C}_A = 1.18'}</Ei> kmol/m³, conversión
          41.2 %. La reacción acorta la constante de tiempo respecto del tiempo de residencia, y su dependencia con la
          temperatura hace que ambos parámetros se muevan con el punto de operación.
        </p>
      </Answer>

      <h2>Problema 4. El punto de operación cambia los parámetros</h2>
      <Enunciado
        pide={[
          'Calcular K y $\tau$ del tanque T-101 en tres niveles de operación distintos.',
          'Determinar en cuánto varía el producto $K_{c}$·K si la sintonía se calculó en el punto medio.',
          'Decidir si hace falta programar la ganancia y con qué criterio.',
        ]}
      >
        <p>
          El tanque T-101 opera a distinta carga según la campaña: el nivel de trabajo baja a 1.2 m en carga reducida y
          sube a 3.4 m en carga plena, con 2.25 m como valor de diseño. La sintonía de LC-101 se calculó en el valor de
          diseño y operaciones reporta que el lazo se comporta distinto en cada caso.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li><Ei>{'A = 3.20\\ \\text{m}^2'}</Ei>, <Ei>{'C_v = 12.1\\ \\text{m}^{2.5}/\\text{h}'}</Ei>.</li>
          <li>La apertura nominal se reajusta en cada caso para sostener <Ei>{'F = 12.0\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
        </ul>
      </Given>

      <Step n="1" title="Apertura necesaria en cada nivel">
        <Eq>{'\\bar{x} = \\frac{F}{C_v\\sqrt{\\bar{h}}} \\;\\Rightarrow\\; \\bar{x}(1.2) = 0.905, \\quad\\bar{x}(2.25) = 0.661, \\quad\\bar{x}(3.4) = 0.538'}</Eq>
      </Step>

      <Step n="2" title="Resistencia, ganancia y constante de tiempo">
        <Eq>{'\\frac{1}{R} = \\frac{C_v\\,\\bar{x}}{2\\sqrt{\\bar{h}}} = \\frac{F}{2\\bar{h}} \\;\\Rightarrow\\; R = \\frac{2\\bar{h}}{F}'}</Eq>
        <p>
          Al reajustar la apertura para sostener el mismo flujo, la resistencia resulta proporcional al nivel y no a su
          raíz. Ese detalle cambia el resultado respecto de la fórmula general y conviene verlo escrito.
        </p>
        <Table
          caption="Parámetros en los tres puntos de operación"
          head={['Nivel (m)', 'Apertura', '$R (h/m^2)$', 'K', '$\\tau (\\operatorname{min})$']}
          numeric={[0, 1, 2, 3, 4]}
          rows={[
            ['1.20', '0.905', '0.200', '0.200', '38.4'],
            ['2.25', '0.661', '0.375', '0.375', '72.0'],
            ['3.40', '0.538', '0.567', '0.567', '108.8'],
          ]}
        />
      </Step>

      <Step n="3" title="Efecto sobre la ganancia del lazo">
        <Eq>{'\\frac{K(3.40)}{K(2.25)} = \\frac{0.567}{0.375} = 1.51, \\qquad\\frac{K(1.20)}{K(2.25)} = \\frac{0.200}{0.375} = 0.53'}</Eq>
        <p>
          Con sintonía fija, el producto <Ei>{'K_c K'}</Ei> vale 1.51 veces lo previsto en el nivel alto y 0.53 veces en
          el bajo. Casi un factor de tres entre extremos.
        </p>
      </Step>

      <Step n="4" title="Decidir">
        <p>
          La constante de tiempo también cambia, de 38 a 109 min, y en el mismo sentido que la ganancia. Ese
          acompañamiento es afortunado: reglas como IMC dan <Ei>{'K_c \\propto\\tau/K'}</Ei>, y como ambos escalan
          igual, la ganancia recomendada apenas se mueve. El criterio práctico es mirar el producto{' '}
          <Ei>{'K_c K'}</Ei>, no cada parámetro por separado.
        </p>
        <p>
          Aun así, un factor de 1.5 en la ganancia del lazo se tolera y uno de 3 no. La recomendación es sintonizar con
          criterio conservador en el nivel alto, que es el caso de mayor ganancia.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'K'}</Ei> va de 0.200 a 0.567 y <Ei>{'\\tau'}</Ei> de 38 a 109 min entre extremos. El producto{' '}
          <Ei>{'K_c K'}</Ei> varía un factor de 2.8 con sintonía fija. Como <Ei>{'\\tau'}</Ei> y <Ei>{'K'}</Ei> escalan
          juntos, una regla del tipo IMC absorbe casi toda la variación; conviene sintonizar en el nivel alto.
        </p>
      </Answer>

      <Reveal label="Problema 5. Identificación sobre datos de planta">
        <div className="enunciado">
          <span className="kicker">Enunciado</span>
          <p>
            El modelo teórico del problema 2 predice cierta constante de tiempo y ningún tiempo muerto. Antes de cargar
            una sintonía hay que contrastar esa predicción contra la planta. Se abrió la válvula de vapor de T-102 de
            44 % a 52 % con el controlador en manual y se registró la temperatura de salida.
          </p>
          <span className="kicker pide-t">Se pide</span>
          <ol className="pide">
            <li>Calcular la ganancia del proceso en grados por punto porcentual.</li>
            <li>Obtener $\\tau$ y $\\theta$ por el método de los dos puntos de Smith.</li>
            <li>Comparar el resultado con el modelo teórico y explicar de dónde sale la diferencia.</li>
            <li>Decidir cuál de los dos conjuntos de parámetros se carga en el controlador.</li>
          </ol>
        </div>
        <Table
          caption="Registro de la prueba"
          head={['t (min)', 'T (°C)', 't (min)', 'T (°C)']}
          numeric={[0, 1, 2, 3]}
          rows={[
            ['0', '65.0', '18', '75.7'],
            ['2', '65.0', '24', '77.6'],
            ['4', '66.1', '32', '79.1'],
            ['8', '70.0', '45', '80.3'],
            ['12', '72.8', '60', '80.8'],
          ]}
        />
        <p>La curva tiende a 81.0 °C, que es la asíntota del registro.</p>
        <Eq>{'\\Delta y_{\\infty} = 81.0 - 65.0 = 16.0\\ \\text{°C} \\qquad K = \\frac{16.0}{52 - 44} = 2.00\\ \\text{°C}/\\%'}</Eq>
        <p>Los dos puntos de referencia valen</p>
        <Eq>{'y_{28.3} = 65.0 + 0.283 \\times 16.0 = 69.5\\ \\text{°C} \\Rightarrow t_1 \\approx 7.5\\ \\text{min}'}</Eq>
        <Eq>{'y_{63.2} = 65.0 + 0.632 \\times 16.0 = 75.1\\ \\text{°C} \\Rightarrow t_2 \\approx 16.5\\ \\text{min}'}</Eq>
        <Eq>{'\\tau = 1.5\\,(16.5 - 7.5) = 13.5\\ \\text{min}, \\qquad\\theta = 16.5 - 13.5 = 3.0\\ \\text{min}'}</Eq>
        <p>
          El modelo teórico del problema 2 daba <Ei>{'\\tau = 20.1'}</Ei> min y ningún tiempo muerto. La prueba entrega{' '}
          <Ei>{'\\tau = 13.5'}</Ei> min y <Ei>{'\\theta = 3.0'}</Ei> min. La diferencia no es un error: el modelo teórico
          supone mezcla perfecta y sensor instantaneo, mientras que la planta tiene mezcla imperfecta, carrera del actuador
          y termopozo. La suma <Ei>{'\\tau + \\theta = 16.5'}</Ei> min se acerca mucho mas a la predicción que cualquiera
          de los dos por separado, y ese es el patron habitual cuando un proceso de orden alto se ajusta a un FOPDT.
        </p>
        <p>
          <strong>Conclusión práctica:</strong> el modelo teórico sirve para entender que mueve a que y para dimensionar
          equipos. Los números que se cargan en el controlador salen de la prueba.
        </p>
      </Reveal>
    </div>
  );
}

/* =========================================================
   Evaluación
   ========================================================= */

export const quiz = [
  {
    q: "Al transformar a Laplace el balance en variables de desviación, el término $h^{\\prime}(0)$ desaparece porque:",
    options: [
      'La transformada de una constante es cero',
      'La condición inicial solo importa en sistemas de segundo orden',
      'Se desprecia por ser pequeño frente a los demás',
      'En el instante inicial el proceso está en su punto de operación, así que la desviación vale cero'],
    answer: 3,
    why: 'La variable de desviación se define como la diferencia respecto del estado estacionario. En $t=0$ esa diferencia es nula por construcción, y eso es lo que permite escribir la función de transferencia como un cociente limpio entre salida y entrada.',
  },
  {
    q: 'Un proceso tiene función de transferencia $G(s) = 4/(6s + 1)$, con el tiempo en minutos. Su polo está en:',
    options: [ '$s = -1/6$','$s = -6$', '$s = 4$', '$s = -4/6$'],
    answer: 0,
    why: 'El polo anula el denominador: $6s + 1 = 0$ da $s = -1/6$ por minuto. Su inverso es la constante de tiempo, 6 min. Real y negativo, así que la respuesta decae sin oscilar.',
  },
  {
    q: 'La pendiente con que arranca la respuesta a un escalón de amplitud $\\Delta u$ sobre un primer orden vale:',
    options: ['$K\\Delta u$', '$\\tau/K\\Delta u$', '$K\\Delta u/\\tau$', 'Cero, porque el proceso arranca en reposo'],
    answer: 2,
    why: 'Se obtiene del teorema del valor inicial aplicado a la derivada. Esa pendiente es la que hace que la tangente en el origen corte el valor final exactamente en $t = \\tau$, y es el fundamento del método de la tangente.',
  },
  {
    q: 'El registro de un lazo de nivel en manual muestra oscilación amortiguada tras un escalón. El modelo de primer orden del tanque:',
    options: [
      'Explica la oscilación si la ganancia es suficientemente alta',
      'No puede explicarla: un polo real negativo nunca oscila, así que la causa está fuera del proceso modelado',
      'Explica la oscilación si el tiempo muerto es grande',
      'Explica la oscilación solo en procesos integrantes'],
    answer: 1,
    why: 'Un solo polo real y negativo produce una exponencial decreciente, sin parte imaginaria y por tanto sin oscilación. Si el registro oscila, la causa está en el elemento final, en el transmisor o en una segunda capacidad que el modelo no recogió.',
  },
  {
    q: 'El tiempo muerto aparece en la función de transferencia como $e^{-\\theta s}$. Eso significa que:',
    options: [
      'Agrega un polo en $s = -1/\\theta$',
      'Solo cambia la ganancia estática',
      'Agrega un cero en el semiplano derecho',
      'Multiplica a la función de transferencia sin agregar polos, y por eso no se puede tratar con álgebra de polinomios'],
    answer: 3,
    why: 'La propiedad de traslación real convierte un desplazamiento en el tiempo en un factor exponencial. No es un cociente de polinomios, así que el criterio de Routh y el álgebra de bloques ordinaria no lo admiten directamente: hace falta la aproximación de Padé.',
  },

  {
    q: 'Un proceso de primer orden tiene $\\tau = 12$ min. Tras un cambio en escalon en la entrada, el porcentaje del cambio total alcanzado a los 24 min es aproximadamente:',
    options: ['63.2 %', '75.0 %', '86.5 %', '95.0 %'],
    answer: 2,
    why: 'A los 24 min han transcurrido dos constantes de tiempo. La respuesta vale $1-e^{-2}=0.865$, es decir 86.5 % del cambio total.',
  },
  {
    q: 'En el tanque calentado con serpentin, la constante de tiempo vale $\\tau = \\rho V C_p/(\\rho F C_p + UA)$. Si se instala un serpentin mas grande, manteniendo todo lo demas:',
    options: [
      'El proceso se vuelve mas rápido y de mayor ganancia respecto del vapor',
      'El proceso se vuelve mas lento y de mayor ganancia respecto del vapor',
      'No cambia la dinámica, solo la capacidad de calentamiento',
      'El proceso se vuelve mas rápido y de menor ganancia respecto del vapor'],
    answer: 0,
    why: 'UA aparece en el denominador de tau, así que un serpentin mayor acorta la constante de tiempo. Y como también aparece en el numerador de $K_{T_v}$, la ganancia respecto del vapor sube. El equipo gana en las dos cosas a la vez.',
  },
  {
    q: 'Un tambor de gas descarga a un compresor de desplazamiento positivo que succiona flujo constante. Ante un aumento permanente en la alimentación y sin control:',
    options: [
      'La presión sube hasta un valor nuevo y se estabiliza',
      'La presión oscila alrededor del valor inicial',
      'La presión no cambia, porque la salida es constante',
      'La presión sube sin límite porque el proceso es integrante'],
    answer: 3,
    why: 'La salida no depende de la presión, así que no hay resistencia ni término en P al lado izquierdo del balance. El desbalance se integra y la presión crece sin encontrar un estado estacionario propio.',
  },
  {
    q: 'En un reactor continuo con reacción de primer orden, $\\tau = \\tau_{res}/(1+\\tau_{res}k)$. Al subir la temperatura y con ello la constante cinética:',
    options: [
      'La constante de tiempo crece y la ganancia crece',
      'La constante de tiempo se acorta y la ganancia baja',
      'La constante de tiempo y la ganancia no cambian, solo cambia la conversión',
      'La constante de tiempo se acorta y la ganancia sube'],
    answer: 1,
    why: 'La reacción es una vía de escape adicional para el reactivo: cuánto mas rápida, mas corto es tau y menor es K. Como el producto $K_cK$ gobierna la estabilidad, la sintonía hecha a otra temperatura deja de ser la adecuada.',
  },
  {
    q: 'La linealización del producto $F\\cdot C$ alrededor del punto de operación es:',
    options: [
      "$(FC)' \\approx F'\\,C'$",
      "$(FC)' \\approx \\bar{F}\\,\\bar{C}$",
      "$(FC)' \\approx \\bar{F}\\,C' + \\bar{C}\\,F'$",
      "$(FC)' \\approx \\bar{F}\\,F' + \\bar{C}\\,C'$"],
    answer: 2,
    why: 'Cada variable aporta un término, y su coeficiente es el valor de la otra variable en el estado estacionario. Olvidar uno de los dos es la falla mas frecuente al modelar mezclas y lazos de relación.',
  },
  {
    q: 'Se identifica un proceso con el método de los dos puntos y resulta $t_{28.3}=6$ min, $t_{63.2}=14$ min. Los parámetros son:',
    options: [
      '$\\tau = 12$ min, $\\theta = 2$ min',
      '$\\tau = 8$ min, $\\theta = 6$ min',
      '$\\tau = 14$ min, $\\theta = 6$ min',
      '$\\tau = 20$ min, $\\theta = -6$ min'],
    answer: 0,
    why: '$\\tau = 1.5(14-6) = 12$ min y $\\theta = 14 - 12 = 2$ min. Un tiempo muerto negativo no tiene sentido físico y siempre indica un error de lectura sobre la curva.',
  },
  {
    q: 'El método de la tangente en el punto de inflexion se descarta frente al de los dos puntos porque:',
    options: [
      'Requiere esperar mas tiempo hasta el estado estacionario',
      'Solo funciona en procesos integrantes',
      'No permite calcular la ganancia',
      'Obliga a estimar una pendiente, y el ruido de la medida la vuelve muy incierta'],
    answer: 3,
    why: 'Trazar una tangente sobre datos con ruido es una operación inestable: pequeñas variaciones cambian mucho la pendiente y con ella los dos parámetros. Leer dos instantes sobre la curva es mucho mas robusto.',
  },
  {
    q: 'Un termopozo de acero sin relleno conductor tiene $\\tau_{sensor} \\approx 45$ s. En un lazo de flujo cuyo proceso responde en 3 s, el efecto es:',
    options: [
      'Despreciable, porque el sensor no forma parte del proceso',
      'El sensor se convierte en el elemento lento del lazo y limita el desempeño alcanzable',
      'Aumenta la ganancia del lazo',
      'Introduce una respuesta inversa',
    ],
    answer: 1,
    why: 'La dinámica del sensor entra en el producto del lazo igual que la del proceso. Con 45 s frente a 3 s, el termopozo domina y ninguna sintonía lo compensa: la solución es cambiar el montaje del elemento.',
  },
  {
    q: 'Aplicando la regla de la semisuma a $G = 1/[(10s+1)(2s+1)(0.5s+1)]$, el modelo reducido de primer orden con tiempo muerto es:',
    options: [
      '$\\tau_{eq} = 11$, $\\theta_{eq} = 1.5$',
      '$\\tau_{eq} = 12.5$, $\\theta_{eq} = 0$',
      '$\\tau_{eq} = 10$, $\\theta_{eq} = 2.5$',
      '$\\tau_{eq} = 10$, $\\theta_{eq} = 0.5$'],
    answer: 0,
    why: 'Se conserva la constante mayor y se le suma la mitad de la segunda: $\\tau_{eq}=10+1=11$. El resto pasa a tiempo muerto: $\\theta_{eq}=1+0.5=1.5$.',
  },
  {
    q: 'Al sintonizar un lazo de nivel sobre un recipiente cuya descarga la hace una bomba de desplazamiento positivo, lo correcto es:',
    options: [
      'Usar Ziegler-Nichols de lazo abierto sobre la curva de reacción',
      'Aumentar la ganancia hasta eliminar el error permanente',
      'Reconocer que el proceso es integrante y usar reglas propias, con acción integral muy suave o nula',
      'Tratarlo como primer orden con $\\tau$ igual al tiempo de residencia'],
    answer: 2,
    why: 'Con flujo de salida impuesto no hay resistencia y el proceso es integrante: no existe la constante de tiempo que esas reglas necesitan. La acción integral sobre un integrante agrega un segundo polo en el origen y desestabiliza con facilidad.',
  },
  {
    q: 'En el balance de energía de un tanque agitado, el término de acumulación usa:',
    options: [
      'El flujo masico que entra, $\\rho F$',
      'La diferencia de temperaturas entre entrada y salida',
      'El producto $U A$ del serpentin',
      'La masa retenida dentro del equipo, $\\rho V$'],
    answer: 3,
    why: 'La acumulación se refiere a lo que hay almacenado dentro del volumen de control, no a lo que atraviesa la frontera. Confundirlos deja una constante de tiempo con unidades equivocadas, que es la señal de alerta al revisar.',
  },
  {
    q: 'Un modelo teórico predice $\\tau = 20$ min sin tiempo muerto, y la prueba de escalon en planta entrega $\\tau = 13.5$ min con $\\theta = 3$ min. La lectura correcta es:',
    options: [
      'El modelo teórico está equivocado y debe descartarse',
      'El proceso real es de orden alto, y el ajuste a FOPDT reparte la dinámica entre $\\tau$ y $\\theta$',
      'La prueba se hizo mal, porque el tiempo muerto no puede aparecer de la nada',
      'El transmisor está descalibrado'],
    answer: 1,
    why: 'La mezcla imperfecta, la carrera del actuador y el termopozo agregan capacidades que el modelo ideal ignora. Al forzar un ajuste de primer orden con retardo, esa dinámica extra se reparte, y por eso la suma $\\tau+\\theta$ se parece mas a la predicción que cualquiera de los dos por separado.',
  },
];
