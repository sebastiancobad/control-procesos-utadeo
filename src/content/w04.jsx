import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Vessel, Block, Arrow, HeatExchanger, Sig, ControlValve, Flow, Conector,
} from '../lib/isa.jsx';
import { SimSecondOrder } from '../sims/dynamics.jsx';

export const meta = {
  id: 'w04',
  week: 5,
  code: 'CP26II-M05',
  title: 'Dinámica de segundo orden',
  unit: 'Intercambiador E-101',
  lede: 'Cuando dos capacidades se conectan en serie la respuesta deja de ser exponencial y aparece la forma de S. Si además hay realimentación interna, aparece la oscilación.',
  objectives: [
    'Deducir el modelo de dos capacidades en serie y distinguir el caso interactuante del no interactuante.',
    'Escribir la forma estándar de segundo orden e identificar tau y zeta.',
    'Relacionar la posición de los polos con la forma de la respuesta.',
    'Calcular sobrepaso, razón de decaimiento y periodo a partir de zeta.',
  ],
  refs: ['seborg', 'smith', 'cough', 'ogun', 'luyben'],
};

function FigTanks() {
  return (
    <Figure vw={900} vh={390} num="4.1" caption="Izquierda: dos capacidades no interactuantes, la descarga del primero cae libre sobre el segundo y su nivel no influye sobre el primero. Derecha: capacidades interactuantes, donde el nivel del segundo contrapresiona la descarga del primero y realimenta la dinámica.">
      {/* ---------- no interactuantes ---------- */}
      <T x={170} y={26} size={20} color={C.grey}>no interactuantes</T>
      <Conector x={0} y={62} dir="right" w={44} h={12} size={14} label="F" />
      <Sig x1={44} y1={62} x2={85} y2={62} kind="process" color={C.ink} />
      <Flow x={68} y={62} dir="right" s={6} />
      <Vessel cx={140} top={42} w={110} h={104} level={0.5} />
      <T x={206} y={100} size={19} color={C.navy} bold anchor="start">T-1</T>
      <L x1={140} y1={146} x2={140} y2={192} color={C.ink} w={3.8} />
      <Flow x={140} y={176} dir="down" s={6} />
      <Sig x1={140} y1={192} x2={255} y2={192} kind="process" color={C.ink} />
      <Flow x={200} y={192} dir="right" s={6} />
      <L x1={255} y1={192} x2={255} y2={216} color={C.ink} w={3.8} />
      <Vessel cx={255} top={214} w={110} h={104} level={0.45} />
      <T x={321} y={272} size={19} color={C.navy} bold anchor="start">T-2</T>
      <L x1={255} y1={318} x2={255} y2={390} color={C.ink} w={3.8} />
      <Flow x={255} y={360} dir="down" s={6} />
      <T x={44} y={306} size={18} color={C.grey} anchor="start">el nivel de T-2 no afecta</T>
      <T x={44} y={330} size={18} color={C.grey} anchor="start">la descarga de T-1</T>

      <L x1={440} y1={20} x2={440} y2={368} color={C.grid} w={1} />

      {/* ---------- interactuantes ---------- */}
      <T x={690} y={26} size={20} color={C.grey}>interactuantes</T>
      <Conector x={452} y={104} dir="right" w={44} h={12} size={14} label="F" />
      <Sig x1={496} y1={104} x2={545} y2={104} kind="process" color={C.ink} />
      <Flow x={524} y={104} dir="right" s={6} />
      <Vessel cx={600} top={84} w={110} h={112} level={0.62} />
      <T x={600} y={64} size={19} color={C.navy} bold>T-1</T>
      <Vessel cx={770} top={84} w={110} h={112} level={0.48} />
      <T x={770} y={64} size={19} color={C.navy} bold>T-2</T>
      <L x1={600} y1={196} x2={600} y2={232} color={C.ink} w={3.8} />
      <Sig x1={600} y1={232} x2={770} y2={232} kind="process" color={C.ink} />
      <Flow x={690} y={232} dir="right" s={6} />
      <L x1={770} y1={232} x2={770} y2={196} color={C.ink} w={3.8} />
      <Sig x1={825} y1={172} x2={900} y2={172} kind="process" color={C.ink} />
      <Flow x={870} y={172} dir="right" s={6} />
      <T x={690} y={268} size={18} color={C.mv}>la conexión transmite presión</T>
      <T x={690} y={296} size={18} color={C.grey}>el nivel de T-2 frena la descarga de T-1</T>
    </Figure>
  );
}

function FigDescriptores() {
  const W = 900, H = 400, X0 = 80, Y0 = 40, PW = 720, PH = 280;
  const z = 0.32, wn = 1, wd = Math.sqrt(1 - z * z), TM = 22;
  const y = (t) => 1 - Math.exp(-z * t) * (Math.cos(wd * t) + (z / wd) * Math.sin(wd * t));
  const esc = 1.55;
  const px = (t) => X0 + (PW * t) / TM;
  const py = (v) => Y0 + PH - (PH * v) / esc;
  let d = '';
  for (let i = 0; i <= 300; i++) { const t = (TM * i) / 300; d += `${i ? 'L' : 'M'}${px(t).toFixed(1)},${py(y(t)).toFixed(1)}`; }
  const tp = Math.PI / wd, tp2 = 3 * Math.PI / wd;
  const pico1 = y(tp), pico2 = y(tp2);
  return (
    <Figure vw={W} vh={H} num="4.3" caption="Los cinco descriptores se leen directamente sobre el registro. Sobrepaso, razón de decaimiento y periodo dependen solo de la razón de amortiguamiento, y por eso permiten estimarla sin conocer nada más del proceso.">
      <rect x={X0} y={Y0} width={PW} height={PH} fill="#FCFDFE" stroke={C.grid} />
      <L x1={X0} y1={py(1)} x2={X0 + PW} y2={py(1)} color={C.sp || C.grey} w={1.8} dash="9,5" />
      <T x={X0 + PW - 6} y={py(1) - 10} size={17} color={C.grey} anchor="end">valor final</T>
      <path d={d} fill="none" stroke={C.navy} strokeWidth="2.6" />
      <L x1={X0} y1={Y0} x2={X0} y2={Y0 + PH} color={C.ink} w={1.4} />
      <L x1={X0} y1={Y0 + PH} x2={X0 + PW} y2={Y0 + PH} color={C.ink} w={1.4} />
      <T x={X0 + PW / 2} y={Y0 + PH + 34} size={19} color={C.ink}>tiempo</T>

      <L x1={px(tp)} y1={py(pico1)} x2={px(tp)} y2={py(1)} color={C.alarm} w={1.6} />
      <T x={px(tp) + 10} y={py(pico1) + 6} size={18} color={C.alarm} anchor="start">sobrepaso A</T>
      <L x1={px(tp2)} y1={py(pico2)} x2={px(tp2)} y2={py(1)} color={C.mv} w={1.6} />
      <T x={px(tp2) + 10} y={py(pico2) - 6} size={18} color={C.mv} anchor="start">segundo pico B</T>
      <T x={px(tp2) + 10} y={py(pico2) + 40} size={17} color={C.mv} anchor="start">B / A = razón de decaimiento</T>

      <L x1={px(tp)} y1={Y0 + PH} x2={px(tp)} y2={py(pico1)} color={C.grid} w={1.2} dash="5,4" />
      <L x1={px(tp2)} y1={Y0 + PH} x2={px(tp2)} y2={py(pico2)} color={C.grid} w={1.2} dash="5,4" />
      <Arrow x1={px(tp)} y1={Y0 + PH - 16} x2={px(tp2)} y2={Y0 + PH - 16} color={C.dist} head="ahd" />
      <T x={px((tp + tp2) / 2)} y={Y0 + PH - 24} size={18} color={C.dist}>periodo P</T>
      <T x={px(tp) - 10} y={Y0 + PH - 42} size={17} color={C.grey} anchor="end">t de pico</T>
    </Figure>
  );
}

function FigRegimes() {
  // respuesta analítica a un escalon unitario, para no dibujar curvas a mano
  const X0 = 70, X1 = 760, Y0 = 250, Y1 = 100, TMAX = 26, TAU = 3;
  const step = (t, zeta) => {
    const x = t / TAU;
    if (zeta < 1) {
      const w = Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * x) * (Math.cos(w * x) + (zeta / w) * Math.sin(w * x));
    }
    if (zeta === 1) return 1 - (1 + x) * Math.exp(-x);
    const b = Math.sqrt(zeta * zeta - 1);
    return 1 - Math.exp(-zeta * x) * (Math.cosh(b * x) + (zeta / b) * Math.sinh(b * x));
  };
  const path = (zeta) => {
    let d = '';
    for (let i = 0; i <= 220; i++) {
      const t = (TMAX * i) / 220;
      const px = X0 + ((X1 - X0) * t) / TMAX;
      const py = Y0 - (Y0 - Y1) * step(t, zeta);
      d += `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    }
    return d;
  };
  return (
    <Figure vw={820} vh={300} num="4.2" caption="Los tres regímenes con la misma ganancia y la misma constante de tiempo. La única diferencia entre las tres curvas es el valor de zeta.">
      <L x1={X0} y1={Y0} x2={X1 + 20} y2={Y0} color={C.ink} w={2} />
      <L x1={X0} y1={40} x2={X0} y2={Y0} color={C.ink} w={2} />
      <L x1={X0} y1={Y1} x2={X1 + 20} y2={Y1} color={C.grey} w={1.3} dash="7,5" />
      <T x={X1 + 16} y={Y1 - 8} size={20} color={C.grey} anchor="end">valor final</T>
      <path d={path(0.3)} fill="none" stroke={C.alarm} strokeWidth="2.6" />
      <path d={path(1)} fill="none" stroke={C.navy} strokeWidth="2.6" />
      <path d={path(2.5)} fill="none" stroke={C.dist} strokeWidth="2.6" />
      <T x={200} y={52} size={20} color={C.alarm} anchor="start">ζ = 0.3 subamortiguado</T>
      <T x={330} y={132} size={20} color={C.navy} anchor="start">ζ = 1.0 crítico</T>
      <T x={470} y={214} size={20} color={C.dist} anchor="start">ζ = 2.5 sobreamortiguado</T>
      <T x={X0} y={274} size={21} color={C.ink}>0</T>
      <T x={430} y={274} size={21} color={C.ink}>tiempo</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <p className="eyebrow">Origen · forma · descriptores · lazo cerrado · ceros · orden superior</p>
      <p>
        Segundo orden significa dos cosas que acumulan. Este módulo recorre de dónde salen esas dos capacidades, cómo se
        escribe el modelo resultante, qué se mide sobre su curva, cómo el propio controlador fabrica un segundo orden, y
        qué ocurre cuando aparece un cero o una tercera capacidad.
      </p>
      <h2>1. De dónde sale un segundo orden</h2>
      <p>
        Un proceso es de segundo orden cuando su modelo necesita <strong>dos variables de estado</strong> para quedar
        descrito, es decir cuando hay dos cosas que acumulan. En una planta química eso ocurre por tres caminos
        distintos, y conviene distinguirlos porque no se comportan igual.
      </p>
      <Table
        caption="Los tres orígenes de una dinámica de segundo orden"
        head={['Origen', 'Qué acumula', 'Rango de $\\zeta$', 'Ejemplo']}
        rows={[
          ['Dos capacidades en serie', 'Dos inventarios de materia o de energía', '$\\zeta\\geq 1\\ \\text{siempre}$', 'Tanques en cascada, dos zonas de un horno'],
          ['Capacidad más inercia', 'Masa y cantidad de movimiento', '$\\zeta$ puede ser menor que 1', 'Manómetro con líquido, columna de líquido en U'],
          ['Lazo cerrado', 'La capacidad del proceso y la memoria del integrador', '$\\zeta$ ajustable por sintonía', 'Cualquier lazo con controlador PI'],
        ]}
      />
      <Callout kind="note" title="El punto que se olvida">
        <p>
          Un proceso químico abierto formado por capacidades en serie <strong>no puede oscilar</strong>. La oscilación
          aparece cuando existe un mecanismo que devuelve energía o información al principio de la cadena: la inercia de
          una masa en movimiento, o el controlador. Por eso el segundo orden subamortiguado es, en la práctica, el
          estudio del lazo cerrado.
        </p>
      </Callout>

      <h3>Caso 1. Dos capacidades no interactuantes</h3>
      <FigTanks />
      <p>
        El primer tanque descarga libremente sobre el segundo. Su nivel depende solo de sí mismo, así que el balance de
        cada uno se escribe por separado:
      </p>
      <Eq n="4.1">{'A_1\\frac{dh_1}{dt} = F_e - \\frac{h_1}{R_1}, \\qquad A_2\\frac{dh_2}{dt} = \\frac{h_1}{R_1} - \\frac{h_2}{R_2}'}</Eq>
      <p>
        En variables de desviación y aplicando Laplace, cada balance entrega un primer orden y la salida de uno alimenta
        al otro. Las funciones de transferencia se multiplican:
      </p>
      <Eq n="4.2">{'\\frac{H_2(s)}{F_e(s)} = \\frac{R_1}{\\tau_1 s + 1}\\cdot \\frac{R_2/R_1}{\\tau_2 s + 1} = \\frac{R_2}{(\\tau_1 s + 1)(\\tau_2 s + 1)}'}</Eq>
      <p>con <Ei>{'\\tau_1 = A_1 R_1'}</Ei> y <Ei>{'\\tau_2 = A_2 R_2'}</Ei>. Expandiendo el denominador:</p>
      <Eq n="4.3">{'\\tau^2 = \\tau_1\\tau_2 \\;\\Rightarrow\\; \\tau = \\sqrt{\\tau_1\\tau_2}, \\qquad 2\\zeta\\tau = \\tau_1 + \\tau_2 \\;\\Rightarrow\\; \\zeta = \\frac{\\tau_1 + \\tau_2}{2\\sqrt{\\tau_1\\tau_2}}'}</Eq>
      <p>
        La constante de tiempo equivalente es la <strong>media geométrica</strong> y el amortiguamiento es la razón entre
        la media aritmética y la geométrica. Por la desigualdad entre ambas medias, ese cociente vale al menos uno, con
        igualdad solo cuando <Ei>{'\\tau_1 = \\tau_2'}</Ei>. Ese es el argumento formal de por qué este arreglo nunca
        oscila.
      </p>

      <h3>Caso 2. Dos capacidades interactuantes</h3>
      <p>
        Ahora el segundo tanque contrapresiona al primero: el flujo entre ambos ya no depende solo de{' '}
        <Ei>{'h_1'}</Ei> sino de la diferencia de niveles.
      </p>
      <Eq n="4.4">{'A_1\\frac{dh_1}{dt} = F_e - \\frac{h_1 - h_2}{R_1}, \\qquad A_2\\frac{dh_2}{dt} = \\frac{h_1 - h_2}{R_1} - \\frac{h_2}{R_2}'}</Eq>
      <p>Eliminando <Ei>{'h_1'}</Ei> entre las dos ecuaciones en el dominio de Laplace se obtiene</p>
      <Eq n="4.5">{'\\frac{H_2(s)}{F_e(s)} = \\frac{R_2}{\\tau_1\\tau_2 s^2 + (\\tau_1 + \\tau_2 + A_1 R_2)\\,s + 1}'}</Eq>
      <p>
        Aparece el término cruzado <Ei>{'A_1 R_2'}</Ei>. Comparando con la forma estándar, la constante de tiempo
        equivalente no cambia, pero el amortiguamiento crece:
      </p>
      <Eq n="4.6">{'\\zeta_{int} = \\frac{\\tau_1 + \\tau_2 + A_1 R_2}{2\\sqrt{\\tau_1\\tau_2}} > \\zeta_{no\\,int}'}</Eq>
      <Callout kind="warn" title="Lo que esto significa en planta">
        <p>
          La interacción <strong>ralentiza</strong> el conjunto. Un arreglo interactuante responde más despacio que el
          mismo par de tanques sin contrapresión, y por supuesto tampoco oscila. El error frecuente es suponer lo
          contrario, que interactuar acelera o desestabiliza.
        </p>
      </Callout>

      <h2>2. Forma estándar, polos y regímenes</h2>
      <p>Toda función de transferencia de segundo orden se lleva a la misma forma canónica:</p>
      <Eq n="4.7">{'G(s) = \\frac{K}{\\tau^2 s^2 + 2\\zeta\\tau s + 1}'}</Eq>
      <p>
        donde <Ei>{'\\tau'}</Ei> es la constante de tiempo característica y <Ei>{'\\zeta'}</Ei> la razón de
        amortiguamiento, adimensional. Las raíces del denominador son los polos:
      </p>
      <Eq n="4.8">{'s_{1,2} = \\frac{-\\zeta\\pm \\sqrt{\\zeta^2 - 1}}{\\tau}'}</Eq>
      <Table
        caption="Regímenes de respuesta"
        head={['Rango de $\\zeta$', 'Polos', 'Respuesta', 'Dónde aparece']}
        rows={[
          ['$\\zeta > 1$', 'Dos reales distintos', 'Sobreamortiguada, sin sobrepaso', 'Capacidades en serie, procesos térmicos'],
          ['$\\zeta = 1$', 'Dos reales iguales', 'Crítica, la más rápida sin sobrepaso', 'Caso límite de diseño'],
          ['$0 < \\zeta < 1$', 'Par complejo conjugado', 'Subamortiguada, oscila y converge', 'Lazos cerrados, sistemas con inercia'],
          ['$\\zeta = 0$', 'Imaginarios puros', 'Oscilación sostenida', 'Límite de estabilidad'],
          ['$\\zeta < 0$', 'Parte real positiva', 'Divergente', 'Sistema inestable'],
        ]}
      />
      <FigRegimes />

      <h3>La respuesta en el tiempo, caso por caso</h3>
      <p>Para un escalón de amplitud <Ei>{'\\Delta u'}</Ei> la solución analítica es distinta en cada régimen:</p>
      <Eq n="4.9">{'\\zeta > 1:\\quad y = K\\Delta u\\left[1 - e^{-\\zeta t/\\tau}\\left(\\cosh\\frac{\\sqrt{\\zeta^2-1}}{\\tau}t + \\frac{\\zeta}{\\sqrt{\\zeta^2-1}}\\sinh\\frac{\\sqrt{\\zeta^2-1}}{\\tau}t\\right)\\right]'}</Eq>
      <Eq n="4.10">{'\\zeta = 1:\\quad y = K\\Delta u\\left[1 - \\left(1 + \\frac{t}{\\tau}\\right)e^{-t/\\tau}\\right]'}</Eq>
      <Eq n="4.11">{'\\zeta < 1:\\quad y = K\\Delta u\\left[1 - e^{-\\zeta t/\\tau}\\left(\\cos\\frac{\\sqrt{1-\\zeta^2}}{\\tau}t + \\frac{\\zeta}{\\sqrt{1-\\zeta^2}}\\sin\\frac{\\sqrt{1-\\zeta^2}}{\\tau}t\\right)\\right]'}</Eq>
      <p>
        Las tres tienen la misma estructura: el valor final <Ei>{'K\\Delta u'}</Ei> menos un término que decae con
        <Ei>{'\\ e^{-\\zeta t/\\tau}'}</Ei>. Lo único que cambia es si el paréntesis contiene funciones hiperbólicas o
        trigonométricas, y eso lo decide el signo de <Ei>{'\\zeta^2 - 1'}</Ei>. La envolvente del decaimiento es la misma
        exponencial en los tres casos, y su constante de tiempo vale <Ei>{'\\tau/\\zeta'}</Ei>.
      </p>

      <h2>3. Descriptores de la respuesta subamortiguada</h2>
      <FigDescriptores />
      <p>Con <Ei>{'0 < \\zeta < 1'}</Ei>, la respuesta queda descrita por cinco cantidades medibles sobre el registro:</p>
      <Eq n="4.12">{'\\text{Sobrepaso} = \\exp\\!\\left(\\frac{-\\pi\\zeta}{\\sqrt{1-\\zeta^2}}\\right) \\times 100\\ \\%'}</Eq>
      <Eq n="4.13">{'\\text{Razón de decaimiento} = \\exp\\!\\left(\\frac{-2\\pi\\zeta}{\\sqrt{1-\\zeta^2}}\\right) = (\\text{sobrepaso})^2'}</Eq>
      <Eq n="4.14">{'t_{p} = \\frac{\\pi\\tau}{\\sqrt{1-\\zeta^2}}, \\qquad P = \\frac{2\\pi\\tau}{\\sqrt{1-\\zeta^2}}, \\qquad t_{s,2\\%} \\approx \\frac{4\\tau}{\\zeta}'}</Eq>
      <p>
        Las tres primeras dependen <strong>solo de zeta</strong>, no de tau. Eso es lo que permite el camino inverso:
        medir el sobrepaso sobre una curva de planta y despejar el amortiguamiento sin conocer nada más.
      </p>
      <Eq n="4.15">{'\\zeta = \\frac{-\\ln(\\text{SO})}{\\sqrt{\\pi^2 + \\ln^2(\\text{SO})}}, \\qquad\\tau = \\frac{P\\sqrt{1-\\zeta^2}}{2\\pi}'}</Eq>
      <p>
        con el sobrepaso expresado en fracción. Estas dos fórmulas son el método de identificación de un lazo cerrado a
        partir de su respuesta oscilatoria, y se usan cuando el registro de planta muestra oscilación amortiguada.
      </p>

      <Table
        caption="Valores de referencia que conviene memorizar"
        head={['$\\zeta$', 'Sobrepaso', 'Razón de decaimiento', '$t_s (en \\tau )$', 'Comentario']}
        numeric={[0, 1, 2, 3]}
        rows={[
          ['0.10', '73 %', '0.53', '40', 'Inaceptable en operación'],
          ['0.215', '50 %', '0.25', '19', 'Razón de un cuarto, criterio de Ziegler-Nichols'],
          ['0.40', '25 %', '0.06', '10', 'Compromiso habitual en planta'],
          ['0.707', '4.3 %', '0.002', '5.7', 'Máxima rapidez sin sobrepaso apreciable'],
          ['1.00', '0 %', '0', '5.8', 'Sin oscilación'],
        ]}
      />
      <Callout kind="warn" title="Error frecuente">
        <p>
          Tomar la razón de decaimiento de un cuarto como objetivo universal. Ese criterio nació en 1942 con Ziegler y
          Nichols para lazos neumáticos, y significa aceptar 50 % de sobrepaso. En un reactor exotérmico o en una columna
          ese sobrepaso saca el producto de especificación o dispara un enclavamiento. Además la tabla muestra algo poco
          intuitivo: <Ei>{'\\zeta = 0.707'}</Ei> se asienta en 5.7 constantes de tiempo, más rápido que{' '}
          <Ei>{'\\zeta = 0.215'}</Ei>, que necesita 19. Perseguir velocidad con poco amortiguamiento produce lo contrario.
        </p>
      </Callout>

      <h2>4. Cómo el controlador fabrica un segundo orden</h2>
      <p>
        Cerrar un lazo proporcional sobre un proceso de primer orden mantiene el orden. Cerrarlo sobre un proceso de
        segundo orden, o usar acción integral, cambia la ecuación característica. Con proceso{' '}
        <Ei>{'G_p = K/[(\\tau_1 s + 1)(\\tau_2 s + 1)]'}</Ei> y controlador proporcional:
      </p>
      <Eq n="4.16">{'(\\tau_1 s + 1)(\\tau_2 s + 1) + K_c K = 0 \\;\\Longrightarrow\\; \\frac{\\tau_1\\tau_2}{1 + K_c K}s^2 + \\frac{\\tau_1 + \\tau_2}{1 + K_c K}s + 1 = 0'}</Eq>
      <Eq n="4.17">{'\\tau_{lc} = \\sqrt{\\frac{\\tau_1\\tau_2}{1 + K_c K}}, \\qquad\\zeta_{lc} = \\frac{\\tau_1 + \\tau_2}{2\\sqrt{\\tau_1\\tau_2\\,(1 + K_c K)}} = \\frac{\\zeta_{la}}{\\sqrt{1 + K_c K}}'}</Eq>
      <p>
        Dos lecturas que valen todo el módulo. Primera: subir <Ei>{'K_c'}</Ei> <strong>acorta</strong> la constante de
        tiempo del lazo cerrado, es decir lo hace más rápido. Segunda: subir <Ei>{'K_c'}</Ei>{' '}
        <strong>reduce</strong> el amortiguamiento en proporción a <Ei>{'\\sqrt{1 + K_c K}'}</Ei>. Rapidez y
        amortiguamiento se mueven en direcciones opuestas, y ese conflicto es el que la sintonía resuelve.
      </p>
      <Callout kind="plant" title="El valor de ganancia que produce cada comportamiento">
        <p>
          Partiendo de <Ei>{'\\zeta_{la}'}</Ei> en lazo abierto, la ganancia que lleva el lazo cerrado a un
          amortiguamiento objetivo <Ei>{'\\zeta_{obj}'}</Ei> es{' '}
          <Ei>{'K_c = [(\\zeta_{la}/\\zeta_{obj})^2 - 1]/K'}</Ei>. Con este par de tanques nunca se alcanza la
          inestabilidad por más que se suba la ganancia: <Ei>{'\\zeta_{lc}'}</Ei> tiende a cero pero no cambia de signo.
          Hace falta un tercer polo o tiempo muerto para que el lazo se vuelva inestable, y de eso trata el módulo de
          estabilidad.
        </p>
      </Callout>

      <h2>5. Respuesta inversa: el cero positivo</h2>
      <p>
        Algunos procesos se mueven primero en dirección contraria a la final. Ocurre cuando dos efectos con signos
        opuestos y velocidades distintas compiten. El caso clásico es el nivel de un calderín: aumentar el agua de
        alimentación enfría el líquido, colapsa las burbujas y hace <strong>bajar</strong> el nivel indicado antes de que
        la masa adicional lo suba.
      </p>
      <Eq n="4.18">{'G(s) = \\frac{K_1}{\\tau_1 s + 1} - \\frac{K_2}{\\tau_2 s + 1} = \\frac{(K_1 - K_2) + (K_1\\tau_2 - K_2\\tau_1)s}{(\\tau_1 s + 1)(\\tau_2 s + 1)}'}</Eq>
      <p>
        Hay respuesta inversa cuando el numerador tiene un cero con parte real positiva, lo que exige{' '}
        <Ei>{'K_1 > K_2'}</Ei> en estado estacionario pero <Ei>{'K_2/\\tau_2 > K_1/\\tau_1'}</Ei> en el instante inicial:
        el efecto contrario es más pequeño pero más rápido. El cero queda en
      </p>
      <Eq n="4.19">{'s_0 = \\frac{K_2 - K_1}{K_1\\tau_2 - K_2\\tau_1} > 0'}</Eq>
      <p>
        Para el controlador ese cero se comporta como un tiempo muerto: durante los primeros instantes la información que
        recibe apunta al lado equivocado. La consecuencia práctica es la misma, hay que bajar la ganancia, y a diferencia
        del tiempo muerto real esta limitación no se puede compensar con un predictor.
      </p>

      <h2>6. Sistemas de orden superior</h2>
      <p>
        Tres o más capacidades en serie dan un polinomio de grado tres o más. En la práctica no se trabaja con ellos
        directamente: se reducen a un segundo orden equivalente o a un primer orden con tiempo muerto, según lo que se
        vaya a hacer con el modelo.
      </p>
      <Table
        caption="Qué modelo usar según el propósito"
        head={['Propósito', 'Modelo adecuado', 'Motivo']}
        rows={[
          ['Sintonizar un lazo', 'Primer orden con tiempo muerto', 'Es lo que piden todas las reglas de sintonía'],
          ['Analizar estabilidad', 'El polinomio completo', 'Cada polo cuenta en el criterio de Routh'],
          ['Explicar la forma de la curva', 'Segundo orden equivalente', '$\\zeta$ y $\\tau\\text{describen}$ el sobrepaso y el periodo'],
          ['Simular arranque o parada', 'El modelo no lineal completo', 'La linealización pierde validez fuera del punto de operación'],
        ]}
      />
      <p>
        Una regla útil: en una cadena de capacidades, si una constante de tiempo es al menos cinco veces mayor que las
        demás, esa constante <strong>domina</strong> y el sistema se comporta casi como un primer orden con un pequeño
        retardo. Cuando dos constantes son del mismo orden, hace falta el segundo orden completo para explicar la forma
        de S de la respuesta.
      </p>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Recorrer los tres regímenes</h2>
      <p>
        El panel integra numéricamente la ecuación completa, así que la misma corrida sirve para los tres regímenes.
        Observa el plano <Ei>{'s'}</Ei> en la barra lateral: cuando <Ei>{'\\zeta'}</Ei> baja de 1, los dos polos reales se
        encuentran y se separan hacia arriba y abajo del eje real. Ese es el instante exacto en que aparece la oscilación.
      </p>
      <SimSecondOrder />
      <Callout kind="note" title="Experimento sugerido">
        <p>
          Fija <Ei>{'\\zeta = 0.215'}</Ei> y verifica que el sobrepaso marcado sea 50 % y la razón de decaimiento 0.25.
          Ese es exactamente el criterio que persigue la sintonía de Ziegler-Nichols, y de ahí salen las reglas de la
          módulo de sintonía.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Dos tanques en serie no interactuantes</h2>
      <Enunciado
        pide={[
          'Calcular las constantes de tiempo individuales de cada tanque.',
          'Obtener la función de transferencia del conjunto.',
          'Identificar $\tau$ y $\zeta$, y decidir si el arreglo puede oscilar.',
          'Determinar el cambio total en el nivel del segundo tanque y estimar el tiempo de asentamiento.',
        ]}
      >
        <p>
          Dos tanques descargan en serie por gravedad, sin que el segundo contrapresione al primero. Operaciones reporta
          que el nivel del segundo oscila tras cada cambio en la alimentación y atribuye la culpa al equipo. Antes de
          intervenir hay que establecer si ese arreglo puede oscilar por si solo.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Tanque 1: <Ei>{'A_1 = 1.80\\ \\text{m}^2'}</Ei>, <Ei>{'R_1 = 0.50\\ \\text{h}/\\text{m}^2'}</Ei>.</li>
          <li>Tanque 2: <Ei>{'A_2 = 4.20\\ \\text{m}^2'}</Ei>, <Ei>{'R_2 = 0.30\\ \\text{h}/\\text{m}^2'}</Ei>.</li>
          <li>Escalon en la alimentación del primero: <Ei>{'\\Delta F = +3.0\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
        </ul>
      </Given>

      <Step n="1" title="Constantes de tiempo individuales">
        <Eq>{'\\tau_1 = A_1 R_1 = 1.80 \\times 0.50 = 0.90\\ \\text{h} = 54\\ \\text{min}'}</Eq>
        <Eq>{'\\tau_2 = A_2 R_2 = 4.20 \\times 0.30 = 1.26\\ \\text{h} = 75.6\\ \\text{min}'}</Eq>
      </Step>

      <Step n="2" title="Función de transferencia del conjunto">
        <Eq>{"\\frac{H_2'(s)}{F'(s)} = \\frac{R_2}{(0.90 s + 1)(1.26 s + 1)} = \\frac{0.30}{1.134 s^2 + 2.16 s + 1}"}</Eq>
      </Step>

      <Step n="3" title="Identificar tau y zeta">
        <p>Comparando con la forma estándar <Ei>{'\\tau^2 s^2 + 2\\zeta\\tau s + 1'}</Ei>:</p>
        <Eq>{'\\tau^2 = 1.134 \\Rightarrow \\tau = 1.065\\ \\text{h} = 63.9\\ \\text{min}'}</Eq>
        <Eq>{'2\\zeta\\tau = 2.16 \\Rightarrow \\zeta = \\frac{2.16}{2 \\times 1.065} = 1.014'}</Eq>
        <p>
          El resultado es mayor que uno, como debia ser. Se puede demostrar que para dos capacidades no interactuantes
          <Ei>{'\\ \\zeta = (\\tau_1 + \\tau_2)/(2\\sqrt{\\tau_1\\tau_2}) \\geq 1'}</Ei> siempre, con igualdad solo cuando
          las dos constantes coinciden. Un arreglo de este tipo <strong>no puede oscilar</strong>.
        </p>
      </Step>

      <Step n="4" title="Cambio total en el nivel del segundo tanque">
        <Eq>{'\\Delta h_{2,\\infty} = K\\,\\Delta F = 0.30 \\times 3.0 = 0.90\\ \\text{m}'}</Eq>
      </Step>

      <Step n="5" title="Tiempo de asentamiento aproximado">
        <p>
          Al ser sobreamortiguado, el polo dominante es el mas lento, <Ei>{'\\tau_2 = 75.6'}</Ei> min. Como referencia
          práctica se toman tres veces la suma de las dos constantes de tiempo:
        </p>
        <Eq>{'t_{95\\%} \\approx 3(\\tau_1 + \\tau_2) = 3(54 + 75.6) = 389\\ \\text{min} \\approx 6.5\\ \\text{h}'}</Eq>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 63.9'}</Ei> min, <Ei>{'\\zeta = 1.01'}</Ei>, respuesta sobreamortiguada sin sobrepaso.
          El nivel del segundo tanque sube 0.90 m y tarda unas 6.5 h en estabilizarse. Este par de tanques, por si solo,
          jamas oscilara: si en planta se observa oscilación, la causa está en el controlador o en el elemento final.
        </p>
      </Answer>

      <Reveal label="Segundo caso: intercambiador con lazo cerrado">
        <p>
          El intercambiador E-101 se modela como <Ei>{'G_p = 2.4/(4s+1)(1.5s+1)'}</Ei> con el tiempo en minutos.
          Al cerrar el lazo con un controlador proporcional de <Ei>{'K_c = 3.5'}</Ei>, la ecuación característica es
          <Ei>{'\\ (4s+1)(1.5s+1) + 3.5 \\times 2.4 = 0'}</Ei>:
        </p>
        <Eq>{'6 s^2 + 5.5 s + 9.4 = 0 \\quad\\Longrightarrow\\quad\\tau_{lc} = \\sqrt{6/9.4} = 0.799\\ \\text{min}'}</Eq>
        <Eq>{'2\\zeta\\tau_{lc} = 5.5/9.4 = 0.585 \\Rightarrow \\zeta = \\frac{0.585}{2 \\times 0.799} = 0.366'}</Eq>
        <p>
          El lazo cerrado quedó subamortiguado con 30 % de sobrepaso, aunque el proceso abierto era sobreamortiguado.
          Esa transformacion la produjo el controlador, y es la razón por la que <Ei>{'\\zeta'}</Ei> se convierte en un
          criterio de sintonía y no solo en una propiedad del equipo.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Un sistema de segundo orden tiene $\\zeta = 0.6$. Su respuesta a un escalon:',
    options: [
      'Oscila con sobrepaso cercano al 9 % y converge',
      'No presenta sobrepaso y es la mas rápida posible',
      'Oscila de forma sostenida sin converger',
      'Diverge, porque $\\zeta < 1$'],
    answer: 0,
    why: 'Con $0<\\zeta<1$ los polos son complejos conjugados con parte real negativa: la respuesta oscila y converge. Para $\\zeta=0.6$ el sobrepaso es $\\exp(-\\pi\\cdot 0.6/\\sqrt{1-0.36})\\times 100 \\approx 9.5$ %.',
  },
  {
    q: 'Dos tanques en serie no interactuantes con $\\tau_1 = 5$ min y $\\tau_2 = 5$ min. El razón de amortiguamiento del conjunto es:',
    options: ['0.5', '1.0', '2.0', 'Depende de las ganancias'],
    answer: 1,
    why: 'Para capacidades no interactuantes $\\zeta = (\\tau_1+\\tau_2)/(2\\sqrt{\\tau_1\\tau_2})$. Con las dos constantes iguales, $\\zeta = 10/10 = 1$: amortiguamiento crítico, el mínimo alcanzable en este arreglo.',
  },
  {
    q: 'La razón de decaimiento de un cuarto corresponde a un sobrepaso de:',
    options: ['12.5 %', '25 %', '50 %', '75 %'],
    answer: 2,
    why: 'La razón de decaimiento es el cuadrado del sobrepaso expresado en fracción: $0.25 = (0.50)^2$. Aceptar decaimiento de un cuarto significa aceptar que la variable se pase la mitad del cambio pedido.',
  },
  {
    q: 'Al conectar dos tanques de forma interactuante en lugar de no interactuante, el efecto sobre la dinámica es:',
    options: [
      'El conjunto se vuelve mas rápido',
      'El conjunto empieza a oscilar',
      'El conjunto se vuelve mas lento y mas amortiguado',
      'No hay cambio, porque las capacidades son las mismas'],
    answer: 2,
    why: 'La interacción agrega el término $A_1R_2$ al coeficiente de $s$, lo que aumenta el amortiguamiento y alarga la respuesta. La contrapresión del segundo tanque frena la descarga del primero.',
  },
  {
    q: 'El nivel de un calderin baja al aumentar el agua de alimentación y sube después. Esa respuesta inversa, para el controlador, se comporta como:',
    options: [
      'Un tiempo muerto adicional',
      'Una ganancia mayor',
      'Una perturbación medible',
      'Un aumento del amortiguamiento'],
    answer: 0,
    why: 'Durante el tramo inicial la medida se mueve en dirección contraria a la correcta, así que el controlador recibe información engañosa. El efecto sobre la estabilidad es el mismo que el de un tiempo muerto: obliga a reducir la ganancia.',
  },
];
