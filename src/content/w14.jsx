import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Block, Arrow, Bubble, Sig, ControlValve, Vessel, HeatExchanger, Conector, Flow,
} from '../lib/isa.jsx';

export const meta = {
  id: 'w14',
  week: 15,
  code: 'CP26II-M13',
  title: 'Control multivariable y emparejamiento de lazos',
  unit: 'Columna de destilación T-401',
  lede: 'Cuando cada válvula mueve todas las variables a la vez, la pregunta ya no es como sintonizar sino que controla que. La matriz de ganancias relativas responde esa pregunta con un número.',
  objectives: [
    'Reconocer la interacción entre lazos y sus consecuencias sobre la estabilidad.',
    'Calcular la matriz de ganancias relativas para un sistema de dos entradas y dos salidas.',
    'Emparejar variables controladas y manipuladas con el criterio de Bristol.',
    'Explicar en que consiste un desacoplador y por que rara vez se implementa completo.',
  ],
  refs: ['bristol', 'luyben', 'ogun', 'marlin', 'shinskey'],
};

function FigColumn() {
  return (
    <Figure vw={900} vh={470} num="12.1" caption="Columna T-401 en configuración LV: reflujo y vapor al rehervidor como manipuladas, composiciones de destilado y de fondos como controladas. Cada válvula afecta a las dos composiciones.">
      {/* columna */}
      <Vessel cx={270} top={40} w={130} h={330} level={0} />
      <T x={110} y={120} size={21} color={C.navy} bold anchor="start">T-401</T>
      {[110, 160, 210, 260, 310].map((y) => (
        <L key={y} x1={212} y1={y} x2={328} y2={y} color={C.ink} w={1.4} />
      ))}

      {/* alimentación */}
      <Sig x1={0} y1={210} x2={205} y2={210} kind="process" color={C.ink} />
      <Flow x={100} y={210} dir="right" s={7} />
      <T x={10} y={192} size={19} color={C.grey} anchor="start">alimentación</T>

      {/* cabeza: vapor al condensador y acumulador */}
      <L x1={270} y1={44} x2={270} y2={26} color={C.ink} w={3.8} />
      <Sig x1={270} y1={26} x2={470} y2={26} kind="process" color={C.ink} />
      <Flow x={370} y={26} dir="right" s={7} />
      <L x1={470} y1={26} x2={470} y2={113} color={C.ink} w={3.8} />
      <Flow x={470} y={78} dir="down" s={7} />
      <HeatExchanger cx={470} cy={140} w={110} h={54} stubs={false} />
      <T x={534} y={140} size={18} color={C.grey} anchor="start">condensador</T>
      <L x1={470} y1={167} x2={470} y2={200} color={C.ink} w={3.8} />
      <Vessel cx={470} top={200} w={110} h={62} level={0.5} />

      {/* reflujo de vuelta a la columna */}
      <L x1={470} y1={262} x2={470} y2={280} color={C.ink} w={3.8} />
      <Sig x1={470} y1={280} x2={360} y2={280} kind="process" color={C.ink} />
      <Flow x={452} y={280} dir="left" s={7} />
      <ControlValve cx={400} cy={280} s={16} />
      <T x={318} y={246} size={17} color={C.navy} bold>LV-401</T>
      <L x1={360} y1={280} x2={360} y2={150} color={C.ink} w={3.8} />
      <Flow x={360} y={220} dir="up" s={7} />
      <Sig x1={360} y1={150} x2={333} y2={150} kind="process" color={C.ink} />
      <T x={392} y={186} size={18} color={C.mv} anchor="start">reflujo L</T>

      {/* destilado */}
      <Sig x1={525} y1={231} x2={760} y2={231} kind="process" color={C.ink} />
      <Flow x={660} y={231} dir="right" s={7} />
      <Conector x={762} y={231} dir="right" label="a TQ-401" />
      <Bubble cx={600} cy={168} tag="AT" num="401" r={26} tagsize={19} numsize={17} />
      <L x1={600} y1={194} x2={600} y2={229} color={C.ink} w={1.4} />
      <T x={646} y={200} size={18} color={C.grey} anchor="start">destilado, x_D</T>

      {/* fondos y rehervidor */}
      <L x1={270} y1={366} x2={270} y2={412} color={C.ink} w={3.8} />
      <Flow x={270} y={394} dir="down" s={7} />
      <Sig x1={270} y1={412} x2={470} y2={412} kind="process" color={C.ink} />
      <Flow x={380} y={412} dir="right" s={7} />
      <L x1={470} y1={412} x2={470} y2={357} color={C.ink} w={3.8} />
      <Flow x={470} y={388} dir="up" s={7} />
      <HeatExchanger cx={470} cy={330} w={110} h={54} stubs={false} />
      <T x={470} y={296} size={18} color={C.grey}>rehervidor</T>
      <Sig x1={900} y1={330} x2={525} y2={330} kind="process" color={C.ink} />
      <Flow x={740} y={330} dir="left" s={7} />
      <ControlValve cx={660} cy={330} s={16} />
      <T x={660} y={370} size={17} color={C.navy} bold>FV-402</T>
      <T x={824} y={312} size={18} color={C.mv} anchor="end">vapor V</T>

      {/* producto de fondos */}
      <Sig x1={270} y1={412} x2={82} y2={412} kind="process" color={C.ink} />
      <Flow x={160} y={412} dir="left" s={7} />
      <Conector x={80} y={412} dir="left" label="a U-500" />
      <Bubble cx={150} cy={348} tag="AT" num="402" r={26} tagsize={19} numsize={17} />
      <L x1={150} y1={374} x2={150} y2={410} color={C.ink} w={1.4} />
      <T x={104} y={318} size={18} color={C.grey} anchor="start">fondos, x_B</T>
    </Figure>
  );
}

function FigInteract() {
  return (
    <Figure vw={890} vh={280} num="12.2" caption="Estructura de interacción. Las trayectorias cruzadas hacen que cerrar un lazo cambie el proceso que ve el otro.">
      <Block cx={130} cy={70} w={130} h={58} label="C_1" />
      <Block cx={130} cy={210} w={130} h={58} label="C_2" />
      <Arrow x1={198} y1={70} x2={264} y2={70} color={C.ink} />
      <Arrow x1={198} y1={210} x2={264} y2={210} color={C.ink} />
      <Block cx={340} cy={70} w={140} h={58} label="G_11" fill={C.pale} />
      <Block cx={340} cy={210} w={140} h={58} label="G_22" fill={C.pale} />
      <Block cx={480} cy={140} w={140} h={58} label="G_12" fill={C.white} stroke={C.alarm} />
      <Block cx={200} cy={140} w={140} h={58} label="G_21" fill={C.white} stroke={C.alarm} />
      <path d="M264,70 L264,140 L128,140" fill="none" stroke={C.alarm} strokeWidth="1.8" strokeDasharray="7,5" />
      <path d="M264,210 L410,210 L410,140" fill="none" stroke={C.alarm} strokeWidth="1.8" strokeDasharray="7,5" />
      <Arrow x1={410} y1={70} x2={540} y2={70} color={C.ink} />
      <Arrow x1={410} y1={210} x2={540} y2={210} color={C.ink} />
      <T x={600} y={78} size={22} color={C.navy} bold anchor="start">y_1</T>
      <T x={600} y={218} size={22} color={C.navy} bold anchor="start">y_2</T>
      <T x={640} y={140} size={20} color={C.alarm} anchor="start">trayectorias cruzadas</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>El problema de la interacción</h2>
      <FigColumn />
      <p>
        En la columna T-401 se quiere controlar la composición de destilado y la de fondos. Las manipuladas disponibles son
        el reflujo y el vapor al rehervidor. Aumentar el reflujo purifica el destilado y también altera la carga térmica de
        la columna, con lo que la composición de fondos cambia. Aumentar el vapor arrastra mas ligeros hacia arriba y
        modifica las dos composiciones a la vez.
      </p>
      <FigInteract />
      <p>
        En forma matricial, para un sistema de dos entradas y dos salidas:
      </p>
      <Eq n="12.1">{'\\begin{bmatrix} y_1 \\\\ y_2 \\end{bmatrix} = \\begin{bmatrix} G_{11} & G_{12} \\\\ G_{21} & G_{22} \\end{bmatrix}\\begin{bmatrix} u_1 \\\\ u_2 \\end{bmatrix}'}</Eq>
      <p>
        Los términos fuera de la diagonal son la interacción. Si valen cero, hay dos lazos independientes y todo lo
        estudiado hasta ahora se aplica sin cambios. Si no valen cero, cerrar un lazo modifica el proceso que ve el otro.
      </p>

      <Callout kind="warn" title="Consecuencias prácticas de la interacción">
        <ul>
          <li>Un lazo estable por separado puede volverse inestable al cerrar el otro.</li>
          <li>Sintonizar los dos lazos de forma independiente conduce a parámetros que dejan de servir.</li>
          <li>Poner un lazo en manual cambia el desempeño del que queda en automático.</li>
          <li>Un emparejamiento equivocado produce un sistema que no se puede sintonizar de ninguna manera.</li>
        </ul>
      </Callout>

      <h2>La matriz de ganancias relativas</h2>
      <p>
        Bristol propuso comparar la ganancia de un lazo en dos situaciones extremas. La ganancia relativa entre la salida
        <Ei>{'\\ i'}</Ei> y la entrada <Ei>{'j'}</Ei> se define como
      </p>
      <Eq n="12.2">{'\\lambda_{ij} = \\frac{(\\partial y_i/\\partial u_j)_{\\text{otros lazos abiertos}}}{(\\partial y_i/\\partial u_j)_{\\text{otros lazos cerrados}}}'}</Eq>
      <p>
        Para el caso de dos por dos, con la matriz de ganancias en estado estacionario, la expresión se reduce a un solo
        cálculo:
      </p>
      <Eq n="12.3">{'\\lambda_{11} = \\frac{1}{1 - \\dfrac{K_{12}K_{21}}{K_{11}K_{22}}}'}</Eq>
      <p>
        y el resto de la matriz queda determinado, porque las filas y las columnas suman uno:
      </p>
      <Eq n="12.4">{'\\Lambda = \\begin{bmatrix} \\lambda_{11} & 1-\\lambda_{11} \\\\ 1-\\lambda_{11} & \\lambda_{11} \\end{bmatrix}'}</Eq>

      <h3>Como se interpreta</h3>
      <Table
        caption="Criterio de emparejamiento de Bristol"
        head={['$\\text{Valor} de \\lambda$', 'Significado', 'Decisión']}
        rows={[
          ['$\\lambda = 1$', 'Sin interacción en ese emparejamiento', 'Emparejar, caso ideal'],
          ['$0.7 < \\lambda < 1.3$', 'Interacción moderada', 'Emparejar, sintonía algo mas conservadora'],
          ['$0.5 < \\lambda < 0.7$', 'Interacción fuerte', 'Emparejar solo si no hay opción mejor'],
          ['$\\lambda = 0.5$', 'Interacción máxima, ambas opciones equivalentes', 'Buscar otra estructura'],
          ['$\\lambda > 1.5$', 'Los otros lazos se oponen a la acción', 'Evitar, el lazo pierde eficacia al cerrar los demas'],
          ['$\\lambda < 0$', 'El signo de la ganancia cambia al cerrar los otros lazos', 'Nunca emparejar, produce inestabilidad'],
        ]}
      />

      <Callout kind="risk" title="El caso de ganancia relativa negativa">
        <p>
          Un valor negativo significa que el lazo actua en un sentido cuando los demas están en manual y en el sentido
          contrario cuando están en automático. Un controlador configurado para una de las dos situaciones desestabiliza
          la otra. Es el único caso donde el criterio de Bristol emite una prohibición y no una recomendación.
        </p>
      </Callout>

      <h2>Reglas de uso</h2>
      <ol>
        <li>Se emparejan las variables cuyos <Ei>{'\\lambda_{ij}'}</Ei> queden lo mas cerca posible de 1.</li>
        <li>Cada fila y cada columna deben usarse una sola vez.</li>
        <li>Nunca se empareja sobre un valor negativo.</li>
        <li>
          El criterio usa solo ganancias de estado estacionario, así que ignora la dinámica. Un emparejamiento con
          <Ei>{'\\ \\lambda'}</Ei> favorable pero con tiempo muerto muy grande puede ser peor que otro con
          <Ei>{'\\ \\lambda'}</Ei> algo menos favorable y respuesta rápida.
        </li>
      </ol>

      <h2>Desacopladores</h2>
      <p>
        Si la interacción es inevitable, cabe cancelarla con un compensador. El desacoplador ideal para el lazo 1 vale
      </p>
      <Eq n="12.5">{'D_{12}(s) = -\\frac{G_{12}(s)}{G_{11}(s)}'}</Eq>
      <p>
        y cumple la misma función que el compensador anticipativo del módulo de perturbaciones, con la diferencia de que la
        perturbación es la acción del otro controlador, que se conoce exactamente.
      </p>
      <p>
        En la práctica el desacoplamiento completo se implementa poco. Depende por entero del modelo, y los errores en
        las ganancias cruzadas producen un desacoplamiento parcial que a veces empeora el conjunto. Lo habitual es el
        <strong> desacoplamiento estático</strong>, que usa solo las ganancias sin la dinámica, o el
        <strong> desacoplamiento parcial</strong>, que cancela una sola dirección de la interacción.
      </p>

      <Callout kind="plant" title="La alternativa que se usa mas">
        <p>
          Antes de desacoplar conviene ensayar la <strong>separación en el tiempo</strong>: sintonizar un lazo mucho mas
          rápido que el otro. El lento ve al rápido como parte de su proceso y la interacción deja de manifestarse como
          competencia. Cuesta nada y no depende de ningún modelo.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Emparejamiento de lazos en la columna T-401</h2>
      <Enunciado
        pide={[
          'Verificar que los signos de la matriz de ganancias sean coherentes con la fisica de la separación.',
          'Calcular los productos de la diagonal y de la antidiagonal.',
          'Obtener $\lambda$11 y escribir la matriz de ganancias relativas completa.',
          'Interpretar el resultado y decidir cual emparejamiento es admisible.',
          'Proponer una estructura viable si el control dual resulta comprometido.',
        ]}
      >
        <p>
          Se quiere controlar las dos composiciones de la columna T-401 manipulando el reflujo y el vapor al rehervidor.
          Antes de cerrar los lazos hay que decidir que variable manipula cual, porque un emparejamiento equivocado
          produce un sistema que ninguna sintonía puede estabilizar. Se dispone de la matriz de ganancias medida en
          planta.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Variables controladas: composición de destilado <Ei>{'x_D'}</Ei> y composición de fondos <Ei>{'x_B'}</Ei>.</li>
          <li>Manipuladas: flujo de reflujo <Ei>{'L'}</Ei> y flujo de vapor al rehervidor <Ei>{'V'}</Ei>.</li>
          <li>Ganancias de estado estacionario medidas en planta, en fracción molar por unidad de flujo:</li>
        </ul>
        <Eq>{'K = \\begin{bmatrix} 0.0084 & -0.0076 \\\\ 0.0122 & -0.0148 \\end{bmatrix}'}</Eq>
        <p style={{ fontSize: '.93rem', color: 'var(--ink-2)', margin: 0 }}>
          Fila 1 corresponde a <Ei>{'x_D'}</Ei>, fila 2 a <Ei>{'x_B'}</Ei>. Columna 1 a <Ei>{'L'}</Ei>, columna 2 a
          <Ei>{'\\ V'}</Ei>.
        </p>
      </Given>

      <Step n="1" title="Verificar los signos">
        <p>
          Aumentar el reflujo purifica el destilado, así que <Ei>{'K_{11} > 0'}</Ei> con la convención de composición del
          componente ligero. Aumentar el vapor arrastra ligero hacia arriba y ensucia el fondo, lo que da
          <Ei>{'\\ K_{22} < 0'}</Ei>. Los signos son coherentes con la física de la separación.
        </p>
      </Step>

      <Step n="2" title="Calcular el determinante del producto cruzado">
        <Eq>{'K_{11}K_{22} = 0.0084 \\times (-0.0148) = -1.243\\times 10^{-4}'}</Eq>
        <Eq>{'K_{12}K_{21} = (-0.0076) \\times 0.0122 = -0.927\\times 10^{-4}'}</Eq>
      </Step>

      <Step n="3" title="Ganancia relativa">
        <Eq n="12.6">{'\\lambda_{11} = \\frac{1}{1 - \\dfrac{-0.927\\times 10^{-4}}{-1.243\\times 10^{-4}}} = \\frac{1}{1 - 0.7458} = \\frac{1}{0.2542} = 3.93'}</Eq>
        <Eq>{'\\Lambda = \\begin{bmatrix} 3.93 & -2.93 \\\\ -2.93 & 3.93 \\end{bmatrix}'}</Eq>
      </Step>

      <Step n="4" title="Interpretar el resultado">
        <p>
          El emparejamiento diagonal, reflujo con destilado y vapor con fondos, da <Ei>{'\\lambda = 3.93'}</Ei>.
          El valor supera con creces 1.5, lo que anticipa interacción severa: al cerrar el segundo lazo, el primero pierde
          casi las tres cuartas partes de su eficacia y necesita mover el reflujo mucho mas para el mismo efecto.
        </p>
        <p>
          El emparejamiento cruzado da <Ei>{'\\lambda = -2.93'}</Ei>, que queda prohibido por negativo.
          El diagonal es entonces la única opción viable entre las dos, aunque sea mala.
        </p>
      </Step>

      <Step n="5" title="Decidir la estructura">
        <p>Con las dos alternativas descartadas o comprometidas, las salidas razonables son tres:</p>
        <ol>
          <li>
            <strong>Controlar una sola composición.</strong> Se cierra el lazo de destilado y se deja el fondo en control
            de nivel o en flujo fijo. Elimina la interacción por completo, a costa de renunciar a una especificación.
          </li>
          <li>
            <strong>Cambiar la estructura de manipuladas.</strong> La configuración de relación, con
            <Ei>{'\\ L/D'}</Ei> y <Ei>{'V/B'}</Ei> como manipuladas, suele dar ganancias relativas mucho mas cercanas a 1
            en columnas con alta relación de reflujo.
          </li>
          <li>
            <strong>Separación en el tiempo.</strong> Sintonizar el lazo de destilado rápido y el de fondos lento, con una
            relación de al menos cinco entre sus constantes de tiempo de lazo cerrado.
          </li>
        </ol>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\lambda_{11} = 3.93'}</Ei>. El único emparejamiento admisible es reflujo con destilado y vapor con fondos,
          pero la interacción es severa. Se recomienda ensayar la configuración de relación
          <Ei>{'\\ (L/D,\\ V/B)'}</Ei> antes de intentar el control dual de composición con la estructura LV.
        </p>
      </Answer>

      <Reveal label="Como se miden las ganancias en planta">
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            Cada columna de la matriz sale de una prueba independiente. Con todos los lazos de composición en manual se
            aplica un escalon en el reflujo, se espera al nuevo estado estacionario, que en una columna puede tardar varias
            horas, y se registran las dos composiciones. Después se repite con el vapor. Los lazos de nivel e inventario
            deben permanecer en automático durante toda la prueba, porque forman parte del proceso que se esta
            caracterizando.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Una ganancia relativa $\\lambda_{11} = 1$ indica que:',
    options: [
      'La interacción es máxima',
      'Los dos lazos tienen la misma velocidad',
      'El emparejamiento está prohibido',
      'No hay interacción: cerrar el otro lazo no cambia la ganancia de este'],
    answer: 3,
    why: 'Por definición lambda es el cociente entre la ganancia con los otros lazos abiertos y con los otros lazos cerrados. Si vale 1, las dos situaciones son identicas y los lazos son independientes.',
  },
  {
    q: 'Se obtiene $\\lambda_{11} = -1.8$ para el emparejamiento diagonal. La decisión correcta es:',
    options: [
      'Emparejar de todos modos, con sintonía conservadora',
      'Nunca emparejar así, porque el signo de la ganancia cambia al cerrar el otro lazo',
      'Emparejar solo si el lazo es de flujo',
      'Instalar un desacoplador y emparejar',
    ],
    answer: 1,
    why: 'Un lambda negativo implica que el lazo actua en un sentido con los demas en manual y en el contrario con los demas en automático. Ninguna configuración de acción del controlador sirve para las dos situaciones.',
  },
  {
    q: 'Un sistema dos por dos tiene $K_{11}=2$, $K_{12}=1$, $K_{21}=1$, $K_{22}=2$. La ganancia relativa $\\lambda_{11}$ vale:',
    options: ['0.75', '1.33', '3.00', '0.25'],
    answer: 1,
    why: '$\\lambda_{11} = 1/(1 - K_{12}K_{21}/(K_{11}K_{22})) = 1/(1 - 1/4) = 1/0.75 = 1.33$. Interacción moderada, emparejamiento diagonal aceptable.',
  },
  {
    q: 'La principal limitación del criterio de Bristol es que:',
    options: [
      'Solo aplica a sistemas de dos por dos',
      'Requiere conocer la función de transferencia completa',
      'Usa únicamente ganancias de estado estacionario e ignora la dinámica',
      'No distingue entre lazos estables e inestables'],
    answer: 2,
    why: 'La matriz se construye con ganancias estaticas. Un emparejamiento con lambda favorable puede ser inferior a otro si arrastra un tiempo muerto mucho mayor, y el criterio no lo detecta.',
  },
  {
    q: 'El desacoplador $D_{12} = -G_{12}/G_{11}$ cumple una función analoga a:',
    options: [
      'El controlador secundario de una cascada',
      'La programación de ganancia',
      'El selector de un esquema override',
      'El compensador anticipativo, tomando la acción del otro controlador como perturbación'],
    answer: 3,
    why: 'Es exactamente la misma estructura del feedforward del módulo de perturbaciones. La diferencia es que aquí la perturbación se conoce con exactitud, porque es la salida del otro controlador.',
  },
  {
    q: 'Antes de implementar un desacoplador completo conviene ensayar:',
    options: [
      'Aumentar la ganancia de ambos lazos',
      'Separar los lazos en el tiempo, sintonizando uno mucho mas rápido que el otro',
      'Poner los dos lazos en manual',
      'Cambiar la característica de las válvulas',
    ],
    answer: 1,
    why: 'La separación en el tiempo hace que el lazo lento vea al rápido como parte de su proceso, con lo que la interacción deja de manifestarse como competencia. No cuesta nada y no depende de un modelo, a diferencia del desacoplador.',
  },
];
