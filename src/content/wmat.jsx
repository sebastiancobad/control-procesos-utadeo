import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow, SumPoint, Vessel, CSTR, Sig, Flow, Conector } from '../lib/isa.jsx';

export const meta = {
  id: 'wmat',
  week: 3,
  code: 'CP26II-M03',
  title: 'Herramientas matemáticas del modelado',
  unit: 'Aplicable a cualquier equipo',
  lede: 'Del balance de conservación a la función de transferencia. Esta es la caja de herramientas que hace falta tener abierta antes de estudiar la dinámica de cualquier proceso.',
  objectives: [
    'Escribir la ecuación de conservación de un equipo y cerrarla con relaciones constitutivas.',
    'Contar grados de libertad y decidir cuántas variables se pueden fijar.',
    'Linealizar un modelo de varias variables con la expansión de Taylor y escribirlo en variables de desviación.',
    'Resolver una ecuación diferencial lineal con la transformada de Laplace y fracciones parciales.',
    'Obtener la función de transferencia, ubicar polos y ceros, y reducir un diagrama de bloques.',
  ],
  refs: ['bequette', 'smith', 'seborg', 'steph', 'cough'],
};

/* =========================================================
   Figuras
   ========================================================= */

function FigCamino() {
  return (
    <Figure vw={980} vh={250} num="M.1" caption="El camino completo. Cada flecha es una herramienta distinta, y perder una de ellas rompe la cadena: sin balance no hay modelo, sin linealización no hay transformada, sin fracciones parciales no hay respuesta en el tiempo.">
      <Block cx={92} cy={64} w={160} h={62} label="Equipo real" sub="lo que existe" />
      <Arrow x1={174} y1={64} x2={232} y2={64} color={C.navy} head="ahn" />
      <Block cx={314} cy={64} w={158} h={62} label="Balance" sub="conservación" />
      <Arrow x1={395} y1={64} x2={452} y2={64} color={C.navy} head="ahn" />
      <Block cx={534} cy={64} w={158} h={62} label="EDO" sub="no lineal" />
      <Arrow x1={615} y1={64} x2={672} y2={64} color={C.navy} head="ahn" />
      <Block cx={754} cy={64} w={168} h={62} label="Linealización" sub="Taylor" />
      <Arrow x1={754} y1={98} x2={754} y2={144} color={C.mv} head="ahm" />
      <Block cx={754} cy={182} w={168} h={62} label="Laplace" sub="dominio s" fill={C.white} stroke={C.mv} />
      <Arrow x1={668} y1={182} x2={614} y2={182} color={C.mv} head="ahm" />
      <Block cx={534} cy={182} w={158} h={62} label="G(s)" sub="polos y ceros" fill={C.white} stroke={C.mv} />
      <Arrow x1={454} y1={182} x2={398} y2={182} color={C.mv} head="ahm" />
      <Block cx={314} cy={182} w={168} h={62} label="Fracciones" sub="parciales" fill={C.white} stroke={C.mv} />
      <Arrow x1={228} y1={182} x2={174} y2={182} color={C.mv} head="ahm" />
      <Block cx={92} cy={182} w={160} h={62} label="y(t)" sub="respuesta" fill={C.pale} stroke={C.navy} />
      <T x={860} y={128} size={19} color={C.grey} anchor="start">ida y vuelta</T>
    </Figure>
  );
}

function FigBloques() {
  return (
    <Figure vw={960} vh={440} num="M.3" caption="Las tres reglas del álgebra de bloques. Con ellas se reduce cualquier diagrama a una sola función de transferencia, y de ahí sale la ecuación característica del lazo.">
      {/* ---------------- en serie ---------------- */}
      <T x={40} y={30} size={20} color={C.ink} anchor="start" bold>En serie</T>
      <Arrow x1={40} y1={78} x2={100} y2={78} color={C.ink} />
      <Block cx={166} cy={78} w={116} h={54} label="G_1" />
      <Arrow x1={224} y1={78} x2={282} y2={78} color={C.ink} />
      <Block cx={348} cy={78} w={116} h={54} label="G_2" />
      <Arrow x1={406} y1={78} x2={466} y2={78} color={C.ink} />
      <T x={512} y={88} size={28} color={C.navy}>=</T>
      <Arrow x1={556} y1={78} x2={606} y2={78} color={C.ink} />
      <Block cx={686} cy={78} w={156} h={54} label="G_1 G_2" fill={C.pale} stroke={C.navy} />
      <Arrow x1={764} y1={78} x2={824} y2={78} color={C.ink} />

      {/* ---------------- en paralelo ---------------- */}
      <T x={40} y={148} size={20} color={C.ink} anchor="start" bold>En paralelo</T>
      <Arrow x1={40} y1={224} x2={88} y2={224} color={C.ink} />
      <circle cx={88} cy={224} r={4.5} fill={C.ink} />
      <L x1={88} y1={186} x2={88} y2={262} color={C.ink} w={1.8} />
      <Arrow x1={88} y1={186} x2={122} y2={186} color={C.ink} />
      <Arrow x1={88} y1={262} x2={122} y2={262} color={C.ink} />
      <Block cx={188} cy={186} w={116} h={46} label="G_1" size={23} />
      <Block cx={188} cy={262} w={116} h={46} label="G_2" size={23} />
      {/* cada rama entra por su propio puerto del comparador */}
      <L x1={246} y1={186} x2={340} y2={186} color={C.ink} w={1.8} />
      <Arrow x1={340} y1={186} x2={340} y2={200} color={C.ink} />
      <L x1={246} y1={262} x2={340} y2={262} color={C.ink} w={1.8} />
      <Arrow x1={340} y1={262} x2={340} y2={248} color={C.ink} />
      <SumPoint cx={340} cy={224} r={22} signs={[['+', 'tr'], ['+', 'br']]} />
      <Arrow x1={362} y1={224} x2={430} y2={224} color={C.ink} />
      <T x={512} y={234} size={28} color={C.navy}>=</T>
      <Arrow x1={556} y1={224} x2={606} y2={224} color={C.ink} />
      <Block cx={696} cy={224} w={176} h={54} label="G_1 + G_2" fill={C.pale} stroke={C.navy} />
      <Arrow x1={784} y1={224} x2={844} y2={224} color={C.ink} />

      {/* ---------------- con realimentación ---------------- */}
      <T x={40} y={302} size={20} color={C.ink} anchor="start" bold>Con realimentación</T>
      <Arrow x1={40} y1={356} x2={88} y2={356} color={C.ink} />
      <SumPoint cx={112} cy={356} r={22} signs={[['+', 'tl'], ['-', 'bl']]} />
      <Arrow x1={134} y1={356} x2={182} y2={356} color={C.ink} />
      <Block cx={248} cy={356} w={116} h={50} label="G" size={24} />
      <L x1={306} y1={356} x2={430} y2={356} color={C.ink} w={1.8} />
      <circle cx={430} cy={356} r={4.5} fill={C.ink} />
      <Arrow x1={430} y1={356} x2={496} y2={356} color={C.ink} />
      {/* camino de retorno: toma, bloque de medida y entrada por abajo */}
      <L x1={430} y1={356} x2={430} y2={414} color={C.ink} w={1.8} />
      <L x1={430} y1={414} x2={302} y2={414} color={C.ink} w={1.8} />
      <Block cx={248} cy={414} w={108} h={40} label="H" size={22} />
      <L x1={194} y1={414} x2={112} y2={414} color={C.ink} w={1.8} />
      <Arrow x1={112} y1={414} x2={112} y2={384} color={C.ink} />
      <T x={512} y={366} size={28} color={C.navy}>=</T>
      <Arrow x1={556} y1={356} x2={624} y2={356} color={C.ink} />
      <Block cx={734} cy={356} w={216} h={58} label="G / (1 + GH)" fill={C.pale} stroke={C.navy} size={24} />
      <Arrow x1={842} y1={356} x2={906} y2={356} color={C.ink} />
    </Figure>
  );
}

function FigPolos() {
  return (
    <Figure vw={900} vh={340} num="M.2" caption="Cada polo aporta un término a la respuesta. La parte real fija si crece o decae y con qué rapidez; la parte imaginaria, si oscila y a qué frecuencia.">
      <rect x="50" y="46" width="360" height="240" fill="rgba(46,125,111,.07)" />
      <rect x="410" y="46" width="330" height="240" fill="rgba(169,50,38,.06)" />
      <L x1={50} y1={166} x2={760} y2={166} color={C.ink} w={1.6} />
      <L x1={410} y1={46} x2={410} y2={286} color={C.ink} w={1.6} />
      <T x={754} y={156} size={20} color={C.grey} anchor="end">Re(s)</T>
      <T x={424} y={64} size={20} color={C.grey} anchor="start">Im(s)</T>
      <T x={220} y={30} size={20} color={C.dist}>decae</T>
      <T x={576} y={30} size={20} color={C.alarm}>crece sin límite</T>

      {[[150, 166, C.dist, 'real negativo'], [300, 166, C.dist, ''], [560, 166, C.alarm, 'real positivo']].map(([x, y, col, lb], i) => (
        <g key={`r${i}`}>
          <L x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} color={col} w={2.6} />
          <L x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} color={col} w={2.6} />
        </g>
      ))}
      {[[230, 96], [230, 236]].map(([x, y], i) => (
        <g key={`c${i}`}>
          <L x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} color={C.navy} w={2.6} />
          <L x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} color={C.navy} w={2.6} />
        </g>
      ))}
      <T x={150} y={198} size={18} color={C.dist}>e^(−at)</T>
      <T x={300} y={198} size={18} color={C.dist}>e^(−bt)</T>
      <T x={560} y={198} size={18} color={C.alarm}>e^(+ct)</T>
      <T x={252} y={90} size={18} color={C.navy} anchor="start">par conjugado</T>
      <T x={252} y={248} size={18} color={C.navy} anchor="start">oscila y decae</T>
      <T x={410} y={310} size={19} color={C.mv}>eje imaginario: oscilación sostenida</T>
      <T x={782} y={120} size={17} color={C.grey} anchor="start">un polo más</T>
      <T x={782} y={142} size={17} color={C.grey} anchor="start">a la izquierda</T>
      <T x={782} y={164} size={17} color={C.grey} anchor="start">decae antes</T>
    </Figure>
  );
}

/* =========================================================
   Teoria
   ========================================================= */

export function Teoria() {
  return (
    <div className="prose">
      <h2>Para qué sirve esta caja de herramientas</h2>
      <p>
        Todo lo que viene después descansa sobre una cadena de cinco pasos: escribir el balance, cerrarlo con relaciones
        físicas, linealizar, transformar y resolver. Si falta un eslabón, el modelo no llega a la función de
        transferencia y sin ella no hay sintonía, no hay análisis de estabilidad y no hay diseño de estrategia.
      </p>
      <FigCamino />

      <h2>1. La ecuación de conservación</h2>
      <p>
        Toda dinámica de proceso nace del mismo enunciado, aplicado a un volumen de control con una frontera bien
        definida:
      </p>
      <Eq n="M.1">{'\\underbrace{\\frac{d(\\text{acumulado})}{dt}}_{\\text{lo que cambia}} = \\underbrace{\\text{entra} - \\text{sale}}_{\\text{a través de la frontera}} + \\underbrace{\\text{genera} - \\text{consume}}_{\\text{dentro del volumen}}'}</Eq>
      <Table
        caption="La misma ecuación, tres magnitudes"
        head={['Balance', 'Se acumula', 'Término de generación', 'Cuándo se usa']}
        rows={[
          ['Materia total', '$\\rho V$', 'Nunca existe', 'Nivel, presión, inventario'],
          ['Componente', '$V\\cdot C_A$', 'La reacción química', 'Composición, conversión'],
          ['Energía', '$\\rho V\\cdot C_p\\cdot T$', 'Calor de reacción, agitación, disipación', 'Temperatura'],
          ['Cantidad de movimiento', '$m\\cdot v$', 'Fuerzas aplicadas', 'Caudal en tuberías largas, golpe de ariete'],
        ]}
      />
      <Callout kind="warn" title="Los dos errores que arruinan un balance">
        <p>
          El primero es confundir lo <strong>acumulado</strong> con lo que <strong>atraviesa la frontera</strong>: la
          acumulación usa la masa retenida <Ei>{'\\rho V'}</Ei>, el arrastre usa el flujo másico{' '}
          <Ei>{'\\rho F'}</Ei>. El segundo es escribir un balance sin dibujar antes el volumen de control: si la frontera
          no está definida, no se sabe qué entra y qué sale.
        </p>
      </Callout>

      <h3>Relaciones constitutivas</h3>
      <p>
        El balance por sí solo casi nunca se cierra: aparecen más incógnitas que ecuaciones. Las relaciones
        constitutivas son las leyes físicas que expresan un flujo en función de un estado.
      </p>
      <Table
        caption="Las que aparecen una y otra vez"
        head={['Relación', 'Expresión', 'Dónde']}
        rows={[
          ['Descarga por gravedad', '$F = C_v\\cdot x\\cdot \\sqrt{h}$', 'Tanques con salida por válvula'],
          ['Transferencia de calor', '$Q = U\\cdot A\\cdot \\Delta T$', 'Serpentines, chaquetas, intercambiadores'],
          ['Cinética de reacción', '$r = k\\cdot C_A^n$', 'Reactores'],
          ['Arrhenius', '$k = k_0\\cdot e^{-E/RT}$', 'Dependencia de la cinética con la temperatura'],
          ['Gas ideal', '$PV = \\text{nRT}$', 'Tambores y recipientes de gas'],
          ['Equilibrio líquido-vapor', '$y = \\alpha x / (1 + (\\alpha-1)x)$', 'Columnas, evaporadores'],
        ]}
      />

      <h3>Grados de libertad</h3>
      <Eq n="M.2">{'N_{GL} = N_{variables} - N_{ecuaciones}'}</Eq>
      <p>
        Un modelo bien planteado tiene <Ei>{'N_{GL}'}</Ei> igual al número de entradas independientes, y cada una de
        esas entradas es una manipulada o una perturbación. Si el conteo da cero, el modelo está sobreespecificado y no
        admite control; si da más de lo esperado, falta una relación constitutiva.
      </p>

      <h2>2. Forma estándar de un modelo dinámico</h2>
      <p>
        Terminado el balance, el modelo se ordena como un sistema de ecuaciones de primer orden. Ese es el formato que
        entienden todos los métodos posteriores.
      </p>
      <Eq n="M.3">{'\\frac{dx_1}{dt} = f_1(x_1,\\ldots,x_n,\\;u,\\;d), \\qquad\\ldots\\qquad\\frac{dx_n}{dt} = f_n(x_1,\\ldots,x_n,\\;u,\\;d)'}</Eq>
      <Table
        caption="Cada símbolo tiene un papel"
        head={['Símbolo', 'Nombre', 'Cómo se reconoce']}
        rows={[
          ['x', 'Variable de estado', 'Aparece derivada respecto del tiempo'],
          ['u', 'Entrada manipulada', 'La mueve el controlador'],
          ['d', 'Perturbación', 'Cambia sin que nadie la mueva a propósito'],
          ['y', 'Salida medida', 'La que ve el transmisor, función de los estados'],
          ['Parámetros', 'Constantes del equipo', 'Área, volumen, $U\\cdot A, C_p, k_{0}$'],
        ]}
      />
      <p>
        <strong>El número de estados es el orden del sistema.</strong> Un tanque tiene un estado y es de primer orden.
        Un reactor no isotérmico tiene concentración y temperatura, dos estados, y es de segundo orden. Contar los
        estados antes de calcular nada evita sorpresas.
      </p>

      <h2>3. Linealización</h2>
      <p>
        Casi todos los balances entregan ecuaciones no lineales, y toda la teoría clásica de control está construida
        sobre modelos lineales. El puente es la expansión de Taylor truncada en el primer término, alrededor del punto de
        operación.
      </p>
      <Eq n="M.4">{'f(x, u) \\approx f(\\bar{x}, \\bar{u}) + \\left.\\frac{\\partial f}{\\partial x}\\right|_{\\bar{x},\\bar{u}}(x - \\bar{x}) + \\left.\\frac{\\partial f}{\\partial u}\\right|_{\\bar{x},\\bar{u}}(u - \\bar{u})'}</Eq>
      <p>
        En el estado estacionario <Ei>{'f(\\bar{x}, \\bar{u}) = 0'}</Ei>, así que ese término desaparece. Definiendo las
        <strong> variables de desviación</strong> <Ei>{"x' = x - \\bar{x}"}</Ei> y <Ei>{"u' = u - \\bar{u}"}</Ei>, el
        modelo linealizado queda
      </p>
      <Eq n="M.5">{"\\frac{dx'}{dt} = a\\,x' + b\\,u', \\qquad a = \\left.\\frac{\\partial f}{\\partial x}\\right|_{ss}, \\quad b = \\left.\\frac{\\partial f}{\\partial u}\\right|_{ss}"}</Eq>
      <p>
        Y con condición inicial nula, porque en el instante inicial el proceso está en su punto de operación. Esa es la
        segunda razón para usar variables de desviación: permite aplicar Laplace sin arrastrar condiciones iniciales.
      </p>

      <Table
        caption="Linealización de los términos más frecuentes"
        head={['Término', 'Derivada evaluada en el punto de operación', 'Resultado linealizado']}
        rows={[
          ['$\\sqrt{h}$', '$1/(2\\sqrt{\\bar{h}})$', "$F' \\approx (C_v\\bar{x}/2\\sqrt{\\bar{h}})\\,h' + (C_v\\sqrt{\\bar{h}})\\,x'$"],
          ['$F\\cdot C$', '$\\partial/\\partial F = \\bar{C}\\ \\text{y}\\ \\partial/\\partial C = \\bar{F}$', "$(FC)' \\approx \\bar{F} C' + \\bar{C} F'$"],
          ['$k_0 e^{-E/RT}$', '$\\bar{k} \\cdot E/(R \\bar{T}^2)$', "$k' \\approx \\bar{k}\\,(E/R\\bar{T}^2)\\,T'$"],
          ['$x^{2}$', '$2\\bar{x}$', "$\\approx 2\\bar{x} x'$"],
          ['$1/x$', '$-1/\\bar{x}^{2}$', "$\\approx -x'/\\bar{x}^{2}$"],
        ]}
      />
      <Callout kind="note" title="El caso del producto merece atención">
        <p>
          Al linealizar <Ei>{'F\\cdot C'}</Ei> aparecen <strong>dos</strong> términos, uno por cada variable, y el
          coeficiente de cada uno es el valor de la <em>otra</em> en el estado estacionario. Olvidar uno de los dos es la
          falla más frecuente al modelar mezclas, lazos de relación y reactores.
        </p>
      </Callout>
      <Callout kind="warn" title="Cuándo deja de valer">
        <p>
          La aproximación vale en la vecindad del punto de operación, que es donde un lazo bien sintonizado mantiene al
          proceso. Deja de valer en arranques, paradas y cambios grandes de carga, y también cuando el proceso tiene
          múltiples estados estacionarios, como un reactor exotérmico. Para esos casos se integra el modelo no lineal
          completo.
        </p>
      </Callout>

      <h2>4. Espacio de estados</h2>
      <p>Con varios estados, el modelo linealizado se escribe en forma matricial:</p>
      <Eq n="M.6">{"\\frac{d\\mathbf{x}'}{dt} = \\mathbf{A}\\mathbf{x}' + \\mathbf{B}\\mathbf{u}', \\qquad\\mathbf{y}' = \\mathbf{C}\\mathbf{x}' + \\mathbf{D}\\mathbf{u}'"}</Eq>
      <p>
        La matriz <Ei>{'\\mathbf{A}'}</Ei> es el jacobiano del sistema evaluado en el punto de operación, y sus
        <strong> valores propios son los polos</strong> del sistema. Esa es la conexión entre las dos representaciones:
      </p>
      <Eq n="M.7">{'\\mathbf{G}(s) = \\mathbf{C}(s\\mathbf{I} - \\mathbf{A})^{-1}\\mathbf{B} + \\mathbf{D}'}</Eq>
      <p>
        El polinomio característico <Ei>{'\\det(s\\mathbf{I} - \\mathbf{A}) = 0'}</Ei> es exactamente el denominador de
        la función de transferencia. Un proceso es estable si todos los valores propios de{' '}
        <Ei>{'\\mathbf{A}'}</Ei> tienen parte real negativa.
      </p>

      <h2>5. Transformada de Laplace</h2>
      <p>
        La transformada convierte una ecuación diferencial en el tiempo en una ecuación algebraica en la variable
        compleja <Ei>{'s'}</Ei>. Resolver un cociente de polinomios es mucho más simple que resolver una diferencial.
      </p>
      <Eq n="M.8">{'F(s) = \\mathcal{L}\\{f(t)\\} = \\int_0^{\\infty} f(t)\\,e^{-st}\\,dt'}</Eq>

      <Table
        caption="Transformadas que se usan en el curso"
        head={['$f(t)$', '$F(s)$', 'Dónde aparece']}
        rows={[
          ['Escalón de altura $A$', '$A / s$', 'Prueba de escalón, cambio en el punto de control'],
          ['Impulso de área $A$', '$A$', 'Inyección instantánea de trazador'],
          ['Rampa de pendiente $a$', '$a / s^{2}$', 'Cambio programado de consigna'],
          ['$e^{-at}$', '$1 / (s + a)$', 'Respuesta de primer orden'],
          ['$1 - e^{-t/\\tau}$', '$1 / [s(\\tau s + 1)]$', 'Escalón sobre primer orden'],
          ['$t\\cdot e^{-at}$', '$1/(s + a)^2$', 'Polo repetido, amortiguamiento crítico'],
          ['$\\operatorname{sen}(\\omega t)$', '$\\omega / (s^{2} + \\omega^{2})$', 'Oscilación sostenida'],
          ['$e^{-at} \\operatorname{sen}(\\omega t)$', '$\\omega / [(s + a)^{2} + \\omega^{2}]$', 'Respuesta subamortiguada'],
        ]}
      />

      <Table
        caption="Propiedades operativas"
        head={['Propiedad', 'Enunciado', 'Uso']}
        rows={[
          ['Linealidad', '$\\mathcal{L}\\{a f + b g\\} = a F(s) + b G(s)$', 'Separar términos de un balance'],
          ['Derivada', "$\\mathcal{L}\\{\\dfrac{df}{dt}\\} = s F(s) - f(0)$", 'Con variables de desviación, $f(0) = 0$'],
          ['Derivada n-ésima', '$\\mathcal{L}\\{\\dfrac{d^n f}{dt^n}\\} = s^{n} F(s)$', 'Sistemas de orden alto'],
          ['Integral', '$\\mathcal{L}\\{\\int f dt\\} = F(s) / s$', 'Acción integral del controlador'],
          ['Traslación real', '$\\mathcal{L}\\{f(t - \\theta)\\} = e^{-\\theta s} F(s)$', 'Tiempo muerto'],
          ['Traslación compleja', '$\\mathcal{L}\\{e^{-at} f(t)\\} = F(s + a)$', 'Respuestas amortiguadas'],
          ['Valor inicial', '$f(0^+) = \\lim s\\cdot F(s) \\text{ cuando } s \\to \\infty$', 'Pendiente inicial, respuesta inversa'],
          ['Valor final', '$f(\\infty ) = \\lim s\\cdot F(s) \\text{ cuando } s \\to 0$', 'Ganancia estática, error permanente'],
        ]}
      />
      <Callout kind="risk" title="El teorema del valor final tiene condición">
        <p>
          Solo vale si <Ei>{'s F(s)'}</Ei> no tiene polos en el semiplano derecho ni sobre el eje imaginario. Aplicarlo a
          un sistema inestable devuelve un número finito que no significa nada, y aplicarlo a un integrador devuelve
          infinito, que sí es correcto. Antes de usarlo hay que mirar dónde están los polos.
        </p>
      </Callout>

      <h2>6. Resolver una ecuación diferencial con Laplace</h2>
      <p>El procedimiento tiene cuatro pasos y no cambia nunca:</p>
      <ol>
        <li>Transformar la ecuación diferencial término a término, con condiciones iniciales nulas.</li>
        <li>Despejar la variable de salida y sustituir la entrada transformada.</li>
        <li>Descomponer en fracciones parciales.</li>
        <li>Antitransformar cada fracción con la tabla.</li>
      </ol>
      <p>Aplicado a un primer orden con escalón de altura <Ei>{'A'}</Ei>:</p>
      <Eq n="M.9">{"\\tau\\frac{dy}{dt} + y = K u \\;\\xrightarrow{\\;\\mathcal{L}\\;}\\; (\\tau s + 1)Y(s) = K U(s) \\;\\Rightarrow\\; Y(s) = \\frac{K}{\\tau s + 1}\\cdot \\frac{A}{s}"}</Eq>
      <Eq n="M.10">{'Y(s) = \\frac{KA}{s(\\tau s + 1)} = KA\\left[\\frac{1}{s} - \\frac{\\tau}{\\tau s + 1}\\right] \\;\\Rightarrow\\; y(t) = KA\\left(1 - e^{-t/\\tau}\\right)'}</Eq>

      <h2>7. Fracciones parciales</h2>
      <p>
        Es el paso que devuelve la respuesta al dominio del tiempo. Hay tres casos y cada uno tiene su receta.
      </p>

      <h3>Raíces reales distintas</h3>
      <Eq n="M.11">{'\\frac{N(s)}{(s + p_1)(s + p_2)} = \\frac{A_1}{s + p_1} + \\frac{A_2}{s + p_2}, \\qquad A_i = \\left[(s + p_i)\\,F(s)\\right]_{s = -p_i}'}</Eq>
      <p>
        Ese método de cubrir el factor y evaluar se llama método de los residuos, y es la forma más rápida de obtener
        cada coeficiente sin resolver un sistema de ecuaciones.
      </p>

      <h3>Raíces repetidas</h3>
      <Eq n="M.12">{'\\frac{N(s)}{(s + p)^2} = \\frac{A_1}{(s + p)^2} + \\frac{A_2}{s + p}, \\qquad A_2 = \\left[\\frac{d}{ds}\\left((s+p)^2 F(s)\\right)\\right]_{s = -p}'}</Eq>
      <p>
        Una raíz doble produce el término <Ei>{'t\\,e^{-pt}'}</Ei>, que es el que da el amortiguamiento crítico su forma
        característica: sube, se dobla y se acuesta sin pasarse.
      </p>

      <h3>Raíces complejas conjugadas</h3>
      <p>
        Cuando el denominador tiene <Ei>{'(s + a)^2 + \\omega^2'}</Ei>, en vez de separar los conjugados conviene
        completar el cuadrado y usar directamente las transformadas del seno y el coseno amortiguados:
      </p>
      <Eq n="M.13">{'\\mathcal{L}^{-1}\\left\\{\\frac{\\omega}{(s+a)^2 + \\omega^2}\\right\\} = e^{-at}\\operatorname{sen}(\\omega t), \\qquad\\mathcal{L}^{-1}\\left\\{\\frac{s+a}{(s+a)^2 + \\omega^2}\\right\\} = e^{-at}\\cos(\\omega t)'}</Eq>
      <p>
        De ahí sale la respuesta subamortiguada del segundo orden: <Ei>{'a'}</Ei> es la parte real del par de polos y
        controla el decaimiento, <Ei>{'\\omega'}</Ei> es la parte imaginaria y controla la frecuencia.
      </p>

      <h2>8. Función de transferencia, polos y ceros</h2>
      <Eq n="M.14">{'G(s) = \\frac{Y(s)}{U(s)} = \\frac{b_m s^m + \\cdots + b_1 s + b_0}{a_n s^n + \\cdots + a_1 s + a_0}'}</Eq>
      <FigPolos />
      <Table
        caption="Qué dice cada elemento"
        head={['Elemento', 'Definición', 'Qué gobierna']}
        rows={[
          ['Polos', 'Raíces del denominador', 'La forma y la velocidad de la respuesta, y la estabilidad'],
          ['Ceros', 'Raíces del numerador', 'El reparto entre los modos: sobreimpulso y respuesta inversa'],
          ['Orden n', 'Grado del denominador', 'Número de estados del sistema'],
          ['Grado relativo n − m', 'Diferencia de grados', 'Cuántas derivadas separan la entrada de la salida'],
          ['Ganancia G(0)', 'Valor en s = 0', 'Cambio en estado estacionario por unidad de entrada'],
        ]}
      />
      <Callout kind="note" title="Un cero positivo no es un polo positivo">
        <p>
          Un polo con parte real positiva hace que la respuesta crezca sin límite: el sistema es inestable. Un cero con
          parte real positiva no desestabiliza, pero produce <strong>respuesta inversa</strong>: la salida arranca hacia
          el lado contrario. Confundirlos lleva a diagnósticos equivocados en planta.
        </p>
      </Callout>

      <h2>9. Álgebra de diagramas de bloques</h2>
      <FigBloques />
      <p>Con las tres reglas se reduce cualquier estructura. Para el lazo de realimentación completo del curso:</p>
      <Eq n="M.15">{'\\frac{Y(s)}{Y_{sp}(s)} = \\frac{G_c G_v G_p}{1 + G_c G_v G_p G_m}, \\qquad\\frac{Y(s)}{D(s)} = \\frac{G_d}{1 + G_c G_v G_p G_m}'}</Eq>
      <p>
        Las dos comparten denominador, y por eso comparten condición de estabilidad. Igualar ese denominador a cero da la
        <strong> ecuación característica</strong>, que es el objeto central del módulo de estabilidad.
      </p>
      <Callout kind="plant" title="Una regla que ahorra errores">
        <p>
          En un lazo simple, el numerador es el camino directo desde la entrada hasta la salida, y el denominador es
          uno más el producto de todo el lazo. Escribir eso de memoria es más rápido y más seguro que reducir bloque a
          bloque, siempre que el diagrama tenga un solo lazo.
        </p>
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
      <h2>Problema 1. Del balance a la respuesta, de principio a fin</h2>
      <Enunciado
        pide={[
          'Plantear el balance de componente sobre el reactor y contar grados de libertad.',
          'Linealizar el término no lineal e identificar los coeficientes.',
          'Escribir el modelo en variables de desviación y transformarlo a Laplace.',
          'Obtener la función de transferencia y ubicar su polo.',
          'Resolver por fracciones parciales la respuesta a un escalón en la concentración de entrada.',
        ]}
      >
        <p>
          El reactor R-201 opera en continuo con una reacción de segundo orden, <Ei>{'r = k\\,C_A^2'}</Ei>. La unidad
          aguas arriba va a cambiar de proveedor de materia prima y la concentración de entrada subirá de forma
          permanente. Producción pregunta cuánto tardará la salida en estabilizarse y en qué valor quedará.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Volumen de reacción <Ei>{'V = 3.0\\ \\text{m}^3'}</Ei>, alimentación <Ei>{'F = 6.0\\ \\text{m}^3/\\text{h}'}</Ei>, ambos constantes.</li>
          <li>Constante cinética <Ei>{'k = 0.40\\ \\text{m}^3/(\\text{kmol}\\cdot \\text{h})'}</Ei>.</li>
          <li>Concentración de entrada nominal <Ei>{'\\bar{C}_{A0} = 4.0\\ \\text{kmol}/\\text{m}^3'}</Ei>.</li>
          <li>Escalón previsto: <Ei>{'\\Delta C_{A0} = +1.0\\ \\text{kmol}/\\text{m}^3'}</Ei>.</li>
        </ul>
      </Given>

      <Step n="1" title="Balance de componente y grados de libertad">
        <Eq>{'V\\frac{dC_A}{dt} = F\\,C_{A0} - F\\,C_A - V k C_A^2'}</Eq>
        <p>
          Variables: <Ei>{'C_A'}</Ei> y <Ei>{'C_{A0}'}</Ei>. Ecuaciones: una. Grados de libertad: uno, y corresponde a la
          entrada <Ei>{'C_{A0}'}</Ei>, que en este caso es una perturbación. El sistema tiene un solo estado, así que es
          de primer orden pese a que la cinética sea de segundo.
        </p>
      </Step>

      <Step n="2" title="Estado estacionario">
        <Eq>{'0 = F(\\bar{C}_{A0} - \\bar{C}_A) - V k \\bar{C}_A^2 \\;\\Rightarrow\\; 1.2\\,\\bar{C}_A^2 + 6\\bar{C}_A - 24 = 0'}</Eq>
        <Eq>{'\\bar{C}_A = \\frac{-6 + \\sqrt{36 + 4(1.2)(24)}}{2(1.2)} = \\frac{-6 + \\sqrt{151.2}}{2.4} = \\frac{6.296}{2.4} = 2.622\\ \\text{kmol}/\\text{m}^3'}</Eq>
        <p>La conversión nominal resulta <Ei>{'X = 1 - 2.622/4.0 = 34.5\\ \\%'}</Ei>.</p>
      </Step>

      <Step n="3" title="Linealizar el término cuadrático">
        <Eq>{'\\left.\\frac{\\partial (k C_A^2)}{\\partial C_A}\\right|_{ss} = 2k\\bar{C}_A = 2(0.40)(2.622) = 2.098\\ \\text{h}^{-1}'}</Eq>
        <p>Sustituyendo y restando el estado estacionario, en variables de desviación:</p>
        <Eq>{"V\\frac{dC_A'}{dt} = F\\,C_{A0}' - F\\,C_A' - V(2k\\bar{C}_A)\\,C_A'"}</Eq>
        <Eq>{"3.0\\frac{dC_A'}{dt} + \\left[6.0 + 3.0(2.098)\\right]C_A' = 6.0\\,C_{A0}' \\;\\Rightarrow\\; 3.0\\frac{dC_A'}{dt} + 12.29\\,C_A' = 6.0\\,C_{A0}'"}</Eq>
      </Step>

      <Step n="4" title="Forma estándar, Laplace y función de transferencia">
        <Eq>{"\\frac{3.0}{12.29}\\frac{dC_A'}{dt} + C_A' = \\frac{6.0}{12.29}C_{A0}' \\;\\Rightarrow\\; \\tau = 0.244\\ \\text{h} = 14.7\\ \\text{min}, \\quad K = 0.488"}</Eq>
        <Eq>{'G(s) = \\frac{C_A(s)}{C_{A0}(s)} = \\frac{0.488}{0.244\\,s + 1} = \\frac{2.0}{s + 4.10}'}</Eq>
        <p>
          Polo único en <Ei>{'s = -4.10\\ \\text{h}^{-1}'}</Ei>, real y negativo: el proceso es estable y no oscila. Su
          inverso es la constante de tiempo, <Ei>{'1/4.10 = 0.244'}</Ei> h.
        </p>
      </Step>

      <Step n="5" title="Respuesta al escalón por fracciones parciales">
        <p>Con <Ei>{"C_{A0}'(s) = 1.0/s"}</Ei>:</p>
        <Eq>{"C_A'(s) = \\frac{2.0}{s + 4.10}\\cdot \\frac{1.0}{s} = \\frac{A_1}{s} + \\frac{A_2}{s + 4.10}"}</Eq>
        <Eq>{'A_1 = \\left[\\frac{2.0}{s + 4.10}\\right]_{s=0} = 0.488, \\qquad A_2 = \\left[\\frac{2.0}{s}\\right]_{s=-4.10} = -0.488'}</Eq>
        <Eq>{"C_A'(t) = 0.488\\left(1 - e^{-4.10\\,t}\\right) \\quad\\text{con } t \\text{ en horas}"}</Eq>
      </Step>

      <Step n="6" title="Verificar con el teorema del valor final">
        <Eq>{"C_A'(\\infty) = \\lim_{s \\to 0} s\\,C_A'(s) = \\lim_{s \\to 0}\\frac{2.0}{s + 4.10} = 0.488\\ \\text{kmol}/\\text{m}^3"}</Eq>
        <p>
          Coincide con el coeficiente <Ei>{'A_1'}</Ei>, como debe ser. El polo está en el semiplano izquierdo, así que el
          teorema es aplicable.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 14.7'}</Ei> min, <Ei>{'K = 0.488'}</Ei>. La concentración de salida sube de 2.622 a 3.110
          kmol/m³ y alcanza el 95 % del cambio en <Ei>{'3\\tau = 44'}</Ei> min. La conversión sube de 34.5 % a 37.8 %,
          es decir el reactor absorbe buena parte del aumento de entrada gracias a que la cinética es de segundo orden y
          se acelera con la concentración.
        </p>
      </Answer>

      <h2>Problema 2. Reducción de un diagrama de bloques</h2>
      <Enunciado
        pide={[
          'Reducir el diagrama a la función de transferencia entre el punto de control y la salida.',
          'Obtener la función de transferencia entre la perturbación y la salida.',
          'Escribir la ecuación característica del lazo.',
          'Calcular la ganancia estática del lazo cerrado y el error permanente con controlador proporcional.',
        ]}
      >
        <p>
          El lazo de temperatura del intercambiador tiene controlador proporcional de ganancia{' '}
          <Ei>{'K_c'}</Ei>, válvula de ganancia <Ei>{'K_v = 0.8'}</Ei>, proceso{' '}
          <Ei>{'G_p = 2.0/(5s+1)'}</Ei> y transmisor <Ei>{'G_m = 0.9'}</Ei>. La perturbación entra directamente sobre la
          salida con <Ei>{'G_d = 1.5/(5s+1)'}</Ei>. Se quiere saber qué error permanente deja el controlador ante un
          cambio en el punto de control.
        </p>
      </Enunciado>

      <Step n="1" title="Aplicar la regla de realimentación">
        <p>Camino directo dividido por uno más el producto del lazo:</p>
        <Eq>{'\\frac{Y}{Y_{sp}} = \\frac{K_c K_v G_p}{1 + K_c K_v G_p G_m} = \\frac{1.6 K_c/(5s+1)}{1 + 1.44 K_c/(5s+1)} = \\frac{1.6 K_c}{5s + 1 + 1.44 K_c}'}</Eq>
      </Step>

      <Step n="2" title="Respuesta a la perturbación">
        <Eq>{'\\frac{Y}{D} = \\frac{G_d}{1 + K_c K_v G_p G_m} = \\frac{1.5}{5s + 1 + 1.44 K_c}'}</Eq>
        <p>Mismo denominador, distinto numerador. Esa es la regla general del lazo simple.</p>
      </Step>

      <Step n="3" title="Ecuación característica y constante de tiempo del lazo cerrado">
        <Eq>{'5s + 1 + 1.44 K_c = 0 \\;\\Rightarrow\\; s = -\\frac{1 + 1.44 K_c}{5}'}</Eq>
        <Eq>{'\\tau_{lc} = \\frac{5}{1 + 1.44 K_c}'}</Eq>
        <p>
          El polo del lazo cerrado se aleja del origen a medida que sube la ganancia, lo que significa que el lazo se
          vuelve más rápido. Con un solo polo real nunca hay oscilación ni inestabilidad, por alta que sea la ganancia.
        </p>
      </Step>

      <Step n="4" title="Ganancia estática y error permanente">
        <Eq>{'\\left.\\frac{Y}{Y_{sp}}\\right|_{s=0} = \\frac{1.6 K_c}{1 + 1.44 K_c}'}</Eq>
        <p>Con <Ei>{'K_c = 3'}</Ei>: la ganancia estática vale <Ei>{'4.8/5.32 = 0.902'}</Ei>. Ante un escalón de 10 % en el punto de control la medida sube 9.02 %, y el error permanente es</p>
        <Eq>{'e_{\\infty} = 10 - 9.02 = 0.98\\ \\% \\qquad\\text{o bien} \\qquad e_{\\infty} = \\frac{\\Delta y_{sp}}{1 + K_c K_v K_p K_m} = \\frac{10}{5.32} = 1.88\\ \\%'}</Eq>
        <p>
          Los dos números difieren porque el primero mide la desviación de la variable de proceso y el segundo la del
          error que ve el controlador, que pasa por el transmisor de ganancia 0.9. Es un punto que confunde con
          frecuencia: <strong>hay que decir siempre en qué escala se reporta el error</strong>.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'Y/Y_{sp} = 1.6K_c/(5s + 1 + 1.44K_c)'}</Ei>,{' '}
          <Ei>{'Y/D = 1.5/(5s + 1 + 1.44K_c)'}</Ei>, ecuación característica{' '}
          <Ei>{'5s + 1 + 1.44K_c = 0'}</Ei>. Con <Ei>{'K_c = 3'}</Ei> el lazo tiene{' '}
          <Ei>{'\\tau_{lc} = 0.94'}</Ei> min y deja un error permanente cercano al 1 % del rango en la variable de
          proceso.
        </p>
      </Answer>

      <Reveal label="Problema 3, para resolver sin ayuda">
        <div className="enunciado">
          <span className="kicker">Enunciado</span>
          <p>
            Un tanque agitado de volumen constante recibe una corriente con caudal <Ei>{'F'}</Ei> y concentración{' '}
            <Ei>{'C_e'}</Ei>, ambos variables. No hay reacción.
          </p>
          <span className="kicker pide-t">Se pide</span>
          <ol className="pide">
            <li>Plantear el balance de componente y señalar el término no lineal.</li>
            <li>Linealizar respecto de las dos entradas y escribir el modelo en variables de desviación.</li>
            <li>Obtener las dos funciones de transferencia, una por cada entrada, y comprobar que comparten polo.</li>
            <li>Calcular la respuesta a un escalón simultáneo en las dos entradas usando superposición.</li>
          </ol>
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: '.93rem', marginTop: 'var(--s4)' }}>
          Pista: el término no lineal es <Ei>{'F\\,C_e'}</Ei> y también <Ei>{'F\\,C'}</Ei>. Al linealizar aparecen cuatro
          términos, dos por cada producto. El resultado es{' '}
          <Ei>{"(V/\\bar{F})\\,dC'/dt + C' = C_e' + [(\\bar{C}_e - \\bar{C})/\\bar{F}]\\,F'"}</Ei>, con la misma constante
          de tiempo para ambas entradas.
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
    q: 'En la ecuación de conservación aplicada a un tanque agitado, el término de generación:',
    options: [
      'Solo existe en el balance de componente con reacción y en el de energía con calor de reacción',
      'Existe siempre que haya flujo de entrada',
      'Es el flujo másico que atraviesa la frontera',
      'Corresponde a la masa retenida en el equipo'],
    answer: 0,
    why: 'La materia total no se genera ni se destruye. Un componente sí puede generarse o consumirse por reacción, y la energía puede generarse por reacción, agitación o disipación viscosa.',
  },
  {
    q: 'Un reactor no isotérmico se modela con balance de componente y balance de energía. El orden del sistema es:',
    options: ['Uno, porque hay un solo equipo', 'Tres, contando el flujo', 'Dos, porque hay dos variables de estado', 'Depende de la cinética'],
    answer: 2,
    why: 'El orden es el número de variables que aparecen derivadas respecto del tiempo. Concentración y temperatura son dos estados, así que el sistema es de segundo orden.',
  },
  {
    q: 'Al linealizar el producto $F\\cdot C$ alrededor del punto de operación se obtiene:',
    options: [
      "$\\bar{F}\\,F' + \\bar{C}\\,C'$",
      "$\\bar{F}\\,\\bar{C}$",
      "$F'\\,C'$",
      "$\\bar{F}\\,C' + \\bar{C}\\,F'$"],
    answer: 3,
    why: 'Cada variable aporta un término y su coeficiente es el valor de la otra en el estado estacionario. Olvidar uno de los dos es el error más frecuente al modelar mezclas.',
  },
  {
    q: 'La razón principal para trabajar en variables de desviación es que:',
    options: [
      'Los números resultan más pequeños',
      'La condición inicial vale cero y desaparecen los términos constantes',
      'Permite ignorar las relaciones constitutivas',
      'Convierte un sistema no lineal en lineal',
    ],
    answer: 1,
    why: 'Al restar el estado estacionario, las constantes se cancelan y la condición inicial es nula, que es lo que permite aplicar Laplace directamente sin arrastrar términos adicionales.',
  },
  {
    q: 'La propiedad de traslación real, $\\mathcal{L}\\{f(t-\\theta)\\}=e^{-\\theta s}F(s)$, sirve para representar:',
    options: ['La acción integral', 'Un cero positivo', 'La ganancia estática', 'El tiempo muerto'],
    answer: 3,
    why: 'Desplazar una función en el tiempo equivale a multiplicar su transformada por una exponencial en s. Ese factor es exactamente el modelo del retardo por transporte o por muestreo.',
  },
  {
    q: 'Los valores propios de la matriz A del modelo en espacio de estados corresponden a:',
    options: [
      'Los polos de la función de transferencia',
      'Los ceros de la función de transferencia',
      'Las ganancias estáticas de cada entrada',
      'Las condiciones iniciales del sistema'],
    answer: 0,
    why: 'El polinomio característico $\\det(sI - A) = 0$ es el denominador de la función de transferencia, así que sus raíces, los valores propios, son los polos.',
  },
  {
    q: 'Una función de transferencia tiene un polo en $s = +2$. Esto significa que:',
    options: [
      'La respuesta arranca hacia el lado contrario',
      'El sistema oscila con periodo 2',
      'La respuesta crece sin límite: el sistema es inestable',
      'La ganancia estática vale 2'],
    answer: 2,
    why: 'Cada polo aporta un término $e^{st}$. Con parte real positiva ese término crece indefinidamente. Arrancar hacia el lado contrario es efecto de un cero positivo, no de un polo.',
  },
  {
    q: 'El teorema del valor final aplicado a $F(s) = 1/[s(s-3)]$:',
    options: [
      'Da −1/3 y ese es el valor final',
      'Da infinito, y eso confirma la estabilidad',
      'Da cero',
      'No es aplicable, porque hay un polo en el semiplano derecho'],
    answer: 3,
    why: 'El teorema exige que $sF(s)$ no tenga polos en el semiplano derecho ni sobre el eje imaginario. Aquí hay uno en $s=3$, así que el límite calculado sería un número sin significado físico.',
  },
  {
    q: 'Reduciendo el lazo $G$ con realimentación $H$, la función de transferencia resultante es:',
    options: [ '$G/(1 + GH)$', '$G + H$','$G\\cdot H$', '$(1 + GH)/G$'],
    answer: 0,
    why: 'La regla general es camino directo sobre uno más el producto del lazo. En un lazo de control eso da $G_cG_vG_p/(1 + G_cG_vG_pG_m)$.',
  },
  {
    q: 'Una raíz doble en el denominador, del tipo $1/(s+p)^2$, produce en el tiempo un término:',
    options: ['$e^{-pt}$', '$\\operatorname{sen}(pt)$', '$t\\,e^{-pt}$', '$1 - e^{-pt}$'],
    answer: 2,
    why: 'La antitransformada de $1/(s+p)^2$ es $t e^{-pt}$. Ese término es el que da al amortiguamiento crítico su forma característica: sube, se dobla y se acuesta sin sobrepasar.',
  },
  {
    q: 'Un modelo tiene 8 variables y 6 ecuaciones. Los grados de libertad son:',
    options: [ 'Cero, el modelo está cerrado', '14', '6, uno por ecuación','2, y corresponden a las entradas independientes'],
    answer: 3,
    why: 'Grados de libertad es variables menos ecuaciones. Esos dos se llenan con las entradas independientes del sistema, que serán manipuladas o perturbaciones.',
  },
  {
    q: 'La aproximación de Taylor de primer orden deja de ser válida sobre todo cuando:',
    options: [
      'El proceso opera cerca del punto de diseño',
      'Se simula un arranque o una parada, donde las variables recorren todo su rango',
      'La ganancia del proceso es negativa',
      'El transmisor tiene tiempo muerto',
    ],
    answer: 1,
    why: 'La serie truncada aproxima bien solo en la vecindad del punto de expansión. En arranques y paradas las variables se apartan mucho de ese punto y hay que integrar el modelo no lineal completo.',
  },
];
