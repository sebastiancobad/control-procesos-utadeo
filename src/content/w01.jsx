import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Vessel, ControlValve, Bubble, Sig, Block, SumPoint, Arrow, ManualValve, Flow, Nozzle } from '../lib/isa.jsx';

export const meta = {
  id: 'w01',
  week: 1,
  code: 'CP26II-M01',
  title: 'Qué significa controlar un proceso',
  unit: 'Tanque de almacenamiento T-101',
  lede: 'Un proceso químico nunca opera en el punto exacto de diseño. El control existe para que esa diferencia no se convierta en un problema de seguridad, de calidad o de dinero.',
  objectives: [
    'Distinguir variable controlada, manipulada y perturbación en una unidad de proceso.',
    'Describir los cuatro elementos físicos de un lazo de realimentación y la señal que viaja entre ellos.',
    'Explicar por que la realimentación corrige sin conocer la causa y que precio paga por ello.',
    'Reconocer cuando un problema pide control regulador y cuando pide control servo.',
  ],
  refs: ['smith', 'seborg', 'marlin', 'steph', 'cough'],
};

/* ---------------- figuras ---------------- */

function FigLoop() {
  return (
    <Figure vw={900} vh={300} num="1.1" caption="Lazo de realimentación. La medida recorre el camino completo antes de que el controlador pueda actuar, y ese recorrido es la razón de que ningún lazo corrija instantaneamente.">
      <SumPoint cx={130} cy={110} signs={[['+', 'l'], ['-', 'b']]} />
      <T x={16} y={100} size={22} color={C.navy} bold anchor="start">h_sp</T>
      <Arrow x1={72} y1={110} x2={102} y2={110} color={C.navy} head="ahn" />
      <Arrow x1={158} y1={110} x2={222} y2={110} color={C.ink} />
      <T x={190} y={96} size={20} color={C.grey}>e</T>
      <Block cx={300} cy={110} w={152} h={72} label="Controlador" sub="LC-101" />
      <Arrow x1={378} y1={110} x2={442} y2={110} color={C.ink} />
      <T x={410} y={96} size={20} color={C.grey}>u</T>
      <Block cx={520} cy={110} w={152} h={72} label="Válvula" sub="LV-101" />
      <Arrow x1={598} y1={110} x2={662} y2={110} color={C.ink} />
      <Block cx={745} cy={110} w={160} h={72} label="Proceso" sub="T-101" />
      <Arrow x1={745} y1={40} x2={745} y2={72} color={C.dist} head="ahd" />
      <T x={745} y={28} size={21} color={C.dist}>perturbación F_e</T>
      <L x1={825} y1={110} x2={862} y2={110} color={C.ink} w={2} />
      <T x={862} y={98} size={22} color={C.navy} bold anchor="start">h</T>
      <L x1={862} y1={110} x2={862} y2={232} color={C.ink} w={2} />
      <L x1={862} y1={232} x2={618} y2={232} color={C.ink} w={2} />
      <Block cx={520} cy={232} w={196} h={64} label="Transmisor" sub="LT-101" fill={C.white} />
      <Arrow x1={422} y1={232} x2={130} y2={232} color={C.ink} />
      <L x1={130} y1={232} x2={130} y2={140} color={C.ink} w={2} />
      <T x={640} y={262} size={20} color={C.grey} anchor="start">medida</T>
    </Figure>
  );
}

function FigPID() {
  return (
    <Figure vw={880} vh={430} num="1.2" caption="Lazo de nivel LT-101 / LC-101 / LV-101 sobre el tanque T-101. Las flechas marcan el sentido del flujo en las líneas de proceso y el sentido de la información en las líneas de señal: la medida sube al controlador y la orden baja al elemento final.">
      {/* línea de proceso de entrada */}
      <Sig x1={0} y1={70} x2={250} y2={70} kind="process" color={C.ink} />
      <ManualValve cx={110} cy={70} s={18} />
      <Flow x={190} y={70} dir="right" s={7} />
      <T x={36} y={52} size={22} color={C.grey} anchor="start">F_e</T>
      <T x={36} y={96} size={19} color={C.grey} anchor="start">perturbación</T>
      <L x1={250} y1={70} x2={250} y2={116} color={C.ink} w={3.8} />
      <Flow x={250} y={100} dir="down" s={7} />

      {/* recipiente */}
      <Vessel cx={250} top={110} w={170} h={180} level={0.58} />
      <T x={150} y={332} size={23} color={C.navy} bold anchor="middle">T-101</T>
      <T x={30} y={396} size={19} color={C.grey} anchor="start">variable controlada: nivel h</T>

      {/* toma de nivel y transmisor */}
      <Nozzle x={335} y={250} dir="right" len={0} />
      <L x1={335} y1={250} x2={390} y2={250} color={C.ink} w={1.6} />
      <Bubble cx={420} cy={250} tag="LT" num="101" r={30} />
      <T x={420} y={302} size={19} color={C.grey}>transmisor</T>

      {/* señal de medida hacia el controlador */}
      <Sig x1={420} y1={220} x2={420} y2={120} kind="electric" color={C.ink} />
      <Sig x1={420} y1={120} x2={528} y2={120} kind="electric" color={C.ink} arrow />
      <T x={474} y={102} size={19} color={C.grey}>4 a 20 mA</T>

      {/* controlador */}
      <Bubble cx={560} cy={120} tag="LC" num="101" r={31} location="room" system="dcs" />
      <T x={606} y={114} size={20} color={C.navy} anchor="start">h_sp</T>
      <T x={606} y={138} size={19} color={C.grey} anchor="start">punto de control</T>

      {/* señal de salida hacia el elemento final */}
      <Sig x1={560} y1={151} x2={560} y2={306} kind="pneumatic" color={C.ink} arrow />
      <T x={598} y={236} size={19} color={C.grey} anchor="start">salida, 3 a 15 psi</T>

      {/* línea de proceso de salida */}
      <L x1={250} y1={290} x2={250} y2={350} color={C.ink} w={3.8} />
      <Flow x={250} y={324} dir="down" s={7} />
      <Sig x1={250} y1={350} x2={880} y2={350} kind="process" color={C.ink} />
      <ControlValve cx={560} cy={350} s={20} />
      <Flow x={400} y={350} dir="right" s={7} />
      <Flow x={720} y={350} dir="right" s={7} />
      <T x={560} y={398} size={20} color={C.navy} bold>LV-101</T>
      <T x={560} y={420} size={19} color={C.grey}>variable manipulada</T>
      <T x={790} y={332} size={22} color={C.grey} anchor="start">F_s</T>
    </Figure>
  );
}

/* ---------------- teoría ---------------- */

export function Teoria() {
  return (
    <div className="prose">
      <h2>El problema, antes de la solución</h2>
      <p>
        El tanque T-101 recibe una corriente de proceso desde la unidad anterior y alimenta una bomba aguas abajo.
        La corriente de entrada cambia de flujo porque la unidad anterior tiene su propia dinámica. Si nadie interviene,
        el nivel del tanque sube hasta rebosar o baja hasta descebar la bomba. Ninguna de las dos cosas es aceptable.
      </p>
      <p>
        Ese es el problema de control en su forma más simple: <strong>mantener una variable en un valor deseado a pesar de
        cambios que no controlamos</strong>. Los objetivos que justifican el gasto en instrumentación son cinco y aparecen
        siempre en el mismo orden de prioridad.
      </p>

      <Table
        caption="Objetivos del control de procesos, en orden de prioridad"
        head={['Objetivo', 'Qué protege', 'Ejemplo en T-101']}
        rows={[
          ['Seguridad', 'Personas y equipos', 'Evitar rebose de producto inflamable'],
          ['Ambiente', 'Cumplimiento de vertimientos y emisiones', 'Impedir descarga por el rebosadero al sistema de drenaje'],
          ['Integridad del equipo', 'Vida útil de la maquinaria', 'Mantener sumergida la succión de la bomba P-101'],
          ['Calidad del producto', 'Especificación de venta', 'Estabilizar el flujo a la unidad siguiente'],
          ['Economía', 'Rendimiento y consumo energetico', 'Operar cerca del límite sin margen excesivo'],
        ]}
      />

      <Callout kind="note" title="Regla de decisión">
        <p>
          Cuando dos objetivos entran en conflicto, gana el que este más arriba en la tabla. Un lazo que produce más
          pero acerca el nivel al rebosadero se ajusta hacia atras, no al reves. Esta jerarquia es la que ordena
          las capas de protección que se estudian en el módulo de seguridad.
        </p>
      </Callout>

      <h2>Las tres clases de variable</h2>
      <p>
        Todo problema de control se plantea nombrando tres cosas. Sin esa clasificación no se puede dibujar un lazo
        ni escribir un modelo.
      </p>

      <Table
        caption="Clasificación de variables"
        head={['Clase', 'Simbolo usual', 'Definición', 'En T-101']}
        rows={[
          ['Controlada', 'CV, y', 'La que debe permanecer en el valor deseado', 'Nivel h'],
          ['Manipulada', 'MV, u', 'La que el controlador mueve para lograrlo', 'Apertura de LV-101'],
          ['Perturbación', 'DV, d', 'La que afecta la controlada y no se manipula', 'Flujo de entrada $F_e$'],
        ]}
      />

      <p>
        El valor deseado de la variable controlada se llama <strong>punto de control</strong> o <em>setpoint</em>,
        y se escribe <Ei>{'h_{sp}'}</Ei>. La diferencia entre punto de control y medida es el <strong>error</strong>:
      </p>

      <Eq n="1.1">{'e(t) = h_{sp}(t) - h(t)'}</Eq>

      <p>
        Toda la disciplina cabe en una frase: el controlador observa <Ei>{'e(t)'}</Ei> y decide <Ei>{'u(t)'}</Ei>.
        Lo que cambia de un curso a otro es cuanta física del proceso se mete en esa decisión.
      </p>

      <h2>Los cuatro elementos del lazo</h2>
      <FigLoop />
      <p>
        Un lazo de realimentación tiene cuatro elementos físicos, y cada uno introduce su propia dinámica.
        El error más común al empezar es atribuir toda la lentitud al proceso cuando buena parte viene del sensor
        o del actuador.
      </p>
      <ol>
        <li><strong>Elemento primario y transmisor.</strong> Mide la variable y la convierte en señal estándar de 4 a 20 mA. En T-101 es LT-101.</li>
        <li><strong>Controlador.</strong> Compara con el punto de control y calcula la salida. Hoy vive dentro de un DCS o un PLC, y por eso su burbuja se dibuja con cuadro.</li>
        <li><strong>Elemento final de control.</strong> Casí siempre una válvula con actuador. Traduce la señal en un cambio físico de flujo.</li>
        <li><strong>Proceso.</strong> El equipo donde ocurre el fenomeno, con su capacidad y su resistencia.</li>
      </ol>

      <FigPID />

      <h2>Por que la realimentación funciona y que le cuesta</h2>
      <p>
        La realimentación actua sobre el sintoma, no sobre la causa. No necesita saber que fue lo que movio el nivel:
        le basta con detectar que se movio. Esa es su virtud, porque corrige perturbaciones que nadie modelo ni midió.
      </p>
      <p>
        El precio es igual de claro. Como espera a que el error exista para actuar, <strong>toda corrección llega tarde</strong>.
        Si la perturbación es grande y el proceso es lento, la desviación puede ser inaceptable aunque el lazo termine
        corrigiendo. La alternativa complementaria es la acción anticipativa, que mide la perturbación y actua antes
        de que la variable controlada se mueva. Se estudia en el módulo de perturbaciones.
      </p>

      <Callout kind="warn" title="Error frecuente">
        <p>
          Aumentar la ganancia del controlador no siempre mejora el desempeño. Pasado cierto valor el lazo oscila y
          después se vuelve inestable, y esto ocurre precisamente porque la corrección llega con retraso. El módulo de estabilidad
          cuantifica ese límite con el criterio de Routh.
        </p>
      </Callout>

      <h2>Servo y regulador</h2>
      <p>
        Los problemas de control se agrupan en dos familias según que es lo que cambia.
      </p>
      <Table
        caption="Dos formas de exigirle a un lazo"
        head={['Modo', 'Qué cambia', 'Qué se pide', 'Ejemplo típico']}
        rows={[
          ['Regulador', 'La perturbación', 'Qué la medida no se mueva', 'Nivel de $T-101 \\text{frente}$ a cambios de $F_e$'],
          ['Servo', 'El punto de control', 'Qué la medida siga al nuevo valor', 'Rampa de temperatura en un reactor por lotes'],
        ]}
      />
      <p>
        La distinción importa porque una sintonía óptima para rechazar cargas suele responder con lentitud a cambios de
        punto de control, y viceversa. En planta continua la mayoría de los lazos son reguladores; en operación por lotes
        predomina el modo servo.
      </p>

      <h2>Lazo abierto y lazo cerrado</h2>
      <p>
        Cuando el controlador está en <strong>manual</strong>, la salida <Ei>{'u'}</Ei> la fija el operador y la medida no
        influye sobre ella. El lazo está abierto. En <strong>automático</strong> la medida cierra el camino de vuelta y el
        lazo está cerrado. Toda la identificación experimental que veremos en el módulo de dinámica de primer orden se hace en manual, porque solo
        así se observa el proceso solo, sin el controlador encima.
      </p>
    </div>
  );
}

/* ---------------- ejemplo resuelto ---------------- */

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Estado estacionario del tanque T-101</h2>
      <Enunciado
        pide={[
          'Clasificar las tres variables del problema: controlada, manipulada y perturbación.',
          'Plantear el balance de materia que gobierna el nivel.',
          'Verificar si el punto de operación propuesto por el equipo de proceso existe fisicamente.',
          'Si no existe, dimensionar de nuevo la válvula para que el flujo máximo previsto se alcance al 80 % de apertura.',
        ]}
      >
        <p>
          El tanque T-101 recibe la descarga de la unidad anterior y alimenta la succión de la bomba P-201. El equipo de
          proceso propone operarlo con la válvula de salida al 62 % de apertura y pide aprobación antes de ordenar la
          instrumentación. La revisión no empieza por el controlador: empieza por comprobar que el punto de operación
          exista y que el elemento final tenga capacidad para sostenerlo.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Tanque cilíndrico vertical, área transversal <Ei>{'A = 3.20\\ \\text{m}^2'}</Ei>.</li>
          <li>Flujo de entrada nominal <Ei>{'\\bar{F}_e = 12.0\\ \\text{m}^3/\\text{h}'}</Ei>, con variaciones de hasta <Ei>{'\\pm 2.5\\ \\text{m}^3/\\text{h}'}</Ei>.</li>
          <li>Salida por válvula con descarga libre: <Ei>{'F_s = C_v\\, x\\, \\sqrt{h}'}</Ei>, con <Ei>{'C_v = 4.60\\ \\text{m}^{2.5}/\\text{h}'}</Ei>.</li>
          <li>Apertura nominal de LV-101: <Ei>{'\\bar{x} = 0.62'}</Ei>.</li>
          <li>Altura total del tanque: 4.5 m. Rebosadero a 4.2 m. Succión de la bomba a 0.35 m.</li>
        </ul>
      </Given>

      <Step n="1" title="Identificar las variables">
        <p>
          El punto de control se impone sobre el nivel, luego <Ei>{'h'}</Ei> es la variable controlada. El controlador solo puede
          mover la apertura de la válvula de salida, así que <Ei>{'x'}</Ei> es la manipulada. El flujo de entrada llega
          impuesto por la unidad anterior: es la perturbación.
        </p>
        <p>
          Nótese que <Ei>{'F_s'}</Ei> no es la variable manipulada. Es una consecuencia de mover <Ei>{'x'}</Ei>, y depende
          además del propio nivel. Confundir la manipulada con su efecto es el error más común de este primer análisis.
        </p>
      </Step>

      <Step n="2" title="Plantear el balance de materia">
        <p>Con densidad constante, el balance sobre el volumen retenido queda:</p>
        <Eq n="1.2">{'A\\,\\frac{dh}{dt} = F_e - F_s = F_e - C_v\\, x\\, \\sqrt{h}'}</Eq>
        <p>En estado estacionario la derivada se anula y la entrada iguala a la salida.</p>
      </Step>

      <Step n="3" title="Resolver el nivel de operación">
        <Eq>{'\\bar{F}_e = C_v\\,\\bar{x}\\,\\sqrt{\\bar{h}} \\quad\\Longrightarrow\\quad\\bar{h} = \\left(\\frac{\\bar{F}_e}{C_v\\,\\bar{x}}\\right)^{2}'}</Eq>
        <Eq>{'\\bar{h} = \\left(\\frac{12.0}{4.60 \\times 0.62}\\right)^{2} = (4.208)^{2} = 17.7\\ \\text{m}'}</Eq>
        <p>
          El resultado excede la altura del tanque, así que el punto de operación propuesto no existe: con esa apertura
          la válvula no evacua 12 m<sup>3</sup>/h a ningún nivel alcanzable. El tanque rebosaría.
        </p>
      </Step>

      <Step n="4" title="Corregir el diseño">
        <p>Se impone el nivel de operación en la mitad del tanque, <Ei>{'\\bar{h} = 2.25\\ \\text{m}'}</Ei>, y se despeja la apertura necesaria:</p>
        <Eq n="1.3">{'\\bar{x} = \\frac{\\bar{F}_e}{C_v\\sqrt{\\bar{h}}} = \\frac{12.0}{4.60\\sqrt{2.25}} = \\frac{12.0}{6.90} = 1.74'}</Eq>
        <p>
          Una apertura mayor que 1 tampoco es física. La conclusión de ingeniería es que <strong>la válvula esta
          subdimensionada</strong>: su <Ei>{'C_v'}</Ei> no alcanza. El control no puede reparar un elemento final incapaz
          de entregar el flujo requerido, y este es el hallazgo más importante del ejercicio.
        </p>
      </Step>

      <Step n="5" title="Dimensionar la válvula de nuevo">
        <p>
          Se pide que la válvula pase el flujo máximo previsto, <Ei>{'F_{e,max} = 14.5\\ \\text{m}^3/\\text{h}'}</Ei>,
          con una apertura del 80 % al nivel de operación, dejando margen para la acción del controlador:
        </p>
        <Eq n="1.4">{'C_v = \\frac{F_{e,max}}{x_{max}\\sqrt{\\bar{h}}} = \\frac{14.5}{0.80\\sqrt{2.25}} = 12.1\\ \\text{m}^{2.5}/\\text{h}'}</Eq>
        <p>Con ese coeficiente, la apertura en condiciones nominales vuelve a ser razonable:</p>
        <Eq>{'\\bar{x} = \\frac{12.0}{12.1\\sqrt{2.25}} = 0.66'}</Eq>
      </Step>

      <Answer>
        <p>
          Variable controlada: nivel <Ei>{'h'}</Ei>. Manipulada: apertura <Ei>{'x'}</Ei> de LV-101.
          Perturbación: flujo de entrada <Ei>{'F_e'}</Ei>. La válvula original no sirve; se requiere
          <Ei>{'\\ C_v \\approx 12\\ \\text{m}^{2.5}/\\text{h}'}</Ei>, que deja la apertura nominal en 66 % y
          conserva margen de maniobra en ambos sentidos.
        </p>
      </Answer>

      <Reveal label="Ver la lectura de ingeniería">
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            Una válvula que opera por encima del 90 % o por debajo del 10 % deja al controlador sin capacidad de corrección
            en uno de los dos sentidos. Es una de las causas más frecuentes de lazos que "no controlan" y que en realidad
            están saturados. La banda útil de trabajo va entre 20 % y 80 % de apertura.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------------- quiz ---------------- */

export const quiz = [
  {
    q: 'En el tanque T-101 el controlador ajusta la apertura de la válvula de salida para sostener el nivel frente a cambios del flujo de entrada. La variable manipulada es:',
    options: [
      'La apertura $x$ de la válvula LV-101',
      'El nivel $h$ del tanque',
      'El flujo de salida $F_s$',
      'El flujo de entrada $F_e$'],
    answer: 0,
    why: 'La manipulada es aquello sobre lo que el controlador actua directamente. El flujo de salida cambia como consecuencia, y además depende del nivel, así que no es una variable de decisión del controlador.',
  },
  {
    q: 'Un operador pone el controlador LC-101 en manual y fija la salida en 55 %. En ese momento el lazo:',
    options: [
      'Sigue cerrado porque el transmisor continua midiendo',
      'Queda abierto porque la válvula deja de responder',
      'Queda abierto porque la medida ya no influye sobre la salida',
      'Se vuelve un lazo anticipativo'],
    answer: 2,
    why: 'Lo que define un lazo cerrado es que la medida realimente la decisión. El transmisor puede seguir midiendo y mostrando el valor, pero si la salida la fija el operador el camino de retorno está interrumpido.',
  },
  {
    q: 'La principal desventaja del control por realimentación es que:',
    options: [
      'Necesita un modelo detallado del proceso',
      'Requiere medir todas las perturbaciones',
      'No puede eliminar el error permanente',
      'Solo actua después de que el error ya existe'],
    answer: 3,
    why: 'La realimentación corrige sin conocer la causa, y por eso no necesita modelo ni medición de la perturbación. Su limitación estructural es que espera a que la desviación aparezca para reaccionar.',
  },
  {
    q: 'En un reactor por lotes se programa una rampa de temperatura de 25 a 80 grados en 40 minutos. Ese problema de control es:',
    options: [
      'Regulador, porque hay que rechazar perdidas de calor',
      'Servo, porque el punto de control cambia con el tiempo',
      'De lazo abierto, porque la receta está fijada de antemano',
      'Anticipativo, porque la trayectoria se conoce',
    ],
    answer: 1,
    why: 'La exigencia dominante es seguir un punto de control que se mueve, y eso define el modo servo. Las perdidas de calor existen, pero el criterio de clasificación es que cambia: aquí cambia el punto de control.',
  },
  {
    q: 'Un lazo de nivel opera de forma estable con la válvula al 94 % de apertura. La objeción técnica correcta es:',
    options: [
      'Ninguna, si el lazo es estable el diseño está bien',
      'El transmisor debe recalibrarse a un rango mayor',
      'La ganancia del controlador está demasiado baja',
      'La válvula quedó sin margen para aumentar el flujo ante una perturbación'],
    answer: 3,
    why: 'Estabilidad y capacidad son cosas distintas. Con 94 % de apertura el elemento final casi no tiene recorrido disponible en un sentido, así que ante una carga que exija más flujo el lazo se satura y pierde el control.',
  },
  {
    q: 'Al ordenar los objetivos del control, mantener sumergida la succión de la bomba P-101 corresponde a:',
    options: [
      'Integridad del equipo',
      'Economía de la operación',
      'Calidad del producto',
      'Cumplimiento ambiental'],
    answer: 0,
    why: 'Descebar una bomba centrifuga la daña por cavitación y por falta de lubricación del sello. Es protección del activo, un escalon por encima de calidad y economía en la jerarquia de objetivos.',
  },
];
