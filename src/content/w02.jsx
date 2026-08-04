import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Vessel, HeatExchanger, ControlValve, ManualValve, CheckValve, Bubble, Sig, Pump, Orifice, Flow,
} from '../lib/isa.jsx';

export const meta = {
  id: 'w02',
  week: 2,
  code: 'CP26II-M02',
  title: 'Variables, etiquetas y lectura de un P&ID',
  unit: 'Tanque T-101 y bomba P-101',
  lede: 'Un P&ID es el idioma común entre diseño, montaje, operación y mantenimiento. Leerlo mal cuesta paradas de planta, así que la norma que lo rige no admite improvisación.',
  objectives: [
    'Construir e interpretar una etiqueta de instrumento según ANSI/ISA-5.1.',
    'Distinguir ubicación y tipo de sistema a partir de la burbuja dibujada.',
    'Identificar cada tipo de línea de señal y decir que tecnología representa.',
    'Contar grados de libertad para saber cuántos lazos admite una unidad.',
  ],
  refs: ['isa51', 'smith', 'perry', 'marlin', 'isa88'],
};

function FigTag() {
  return (
    <Figure vw={950} vh={330} num="2.1" caption="Anatomía de una etiqueta ISA. La primera letra nombra la variable medida; las siguientes describen la función que cumple el instrumento sobre esa variable.">
      <Bubble cx={150} cy={140} tag="TIC" num="205" r={62} tagsize={40} numsize={34} location="room" system="dcs" />
      <L x1={150} y1={62} x2={150} y2={34} color={C.grey} w={1.4} />
      <T x={150} y={26} size={22} color={C.grey}>identificación funcional</T>
      <L x1={150} y1={218} x2={150} y2={252} color={C.grey} w={1.4} />
      <T x={150} y={274} size={22} color={C.grey}>número de lazo</T>

      <L x1={330} y1={60} x2={330} y2={250} color={C.grid} w={1} />
      <T x={370} y={72} size={26} color={C.navy} bold anchor="start">T</T>
      <T x={410} y={72} size={23} color={C.ink} anchor="start">Variable medida: temperatura</T>
      <T x={370} y={116} size={26} color={C.navy} bold anchor="start">I</T>
      <T x={410} y={116} size={23} color={C.ink} anchor="start">Función pasiva: indica</T>
      <T x={370} y={160} size={26} color={C.navy} bold anchor="start">C</T>
      <T x={410} y={160} size={23} color={C.ink} anchor="start">Función activa: controla</T>
      <T x={370} y={210} size={26} color={C.navy} bold anchor="start">205</T>
      <T x={445} y={210} size={23} color={C.ink} anchor="start">Lazo 205 de la unidad</T>
      <T x={370} y={258} size={21} color={C.grey} anchor="start">Cuadro con circulo: función en sistema distribuido</T>
      <T x={370} y={288} size={21} color={C.grey} anchor="start">Línea horizontal: accesible al operador en sala</T>
    </Figure>
  );
}

function FigBubbles() {
  const items = [
    { x: 128, tag: 'PT', n: '301', loc: 'field', sys: 'discrete', t1: 'En campo', t2: 'Instrumento discreto' },
    { x: 358, tag: 'PIC', n: '301', loc: 'room', sys: 'discrete', t1: 'Accesible en sala', t2: 'Instrumento discreto' },
    { x: 588, tag: 'PIC', n: '302', loc: 'room', sys: 'dcs', t1: 'Accesible en sala', t2: 'Sistema distribuido' },
    { x: 818, tag: 'PY', n: '303', loc: 'rear', sys: 'computer', t1: 'Detrás del tablero', t2: 'Función de cómputo' },
    { x: 1048, tag: 'PSH', n: '304', loc: 'room', sys: 'plc', t1: 'Accesible en sala', t2: 'Lógica programable' },
  ];
  return (
    <Figure vw={1180} vh={210} num="2.2" caption="La forma del contorno dice donde vive la función; la línea interior dice quien tiene acceso a ella. Las dos cosas se leen de un vistazo, sin consultar listas.">
      {items.map((it) => (
        <g key={it.tag + it.n}>
          <Bubble cx={it.x} cy={64} tag={it.tag} num={it.n} r={40} location={it.loc} system={it.sys} tagsize={23} numsize={21} />
          <T x={it.x} y={144} size={19} color={C.ink}>{it.t1}</T>
          <T x={it.x} y={172} size={19} color={C.grey}>{it.t2}</T>
        </g>
      ))}
    </Figure>
  );
}

function FigLines() {
  const rows = [
    { y: 40, kind: 'process', label: 'Línea de proceso', note: 'Tubería que transporta materia' },
    { y: 95, kind: 'impulse', label: 'Línea de impulso', note: 'Conexión mecánica al proceso' },
    { y: 150, kind: 'pneumatic', label: 'Señal neumática', note: '3 a 15 psi' },
    { y: 205, kind: 'electric', label: 'Señal eléctrica', note: '4 a 20 mA' },
    { y: 260, kind: 'software', label: 'Enlace de software', note: 'Comunicación entre sistemas' },
    { y: 315, kind: 'capillary', label: 'Tubo capilar', note: 'Sistema lleno de fluido' },
  ];
  return (
    <Figure vw={960} vh={360} num="2.3" caption="Líneas de señal según ANSI/ISA-5.1. Cambiar una por otra en un plano equivale a especificar mal la tecnología de conexión.">
      {rows.map((r) => (
        <g key={r.kind}>
          <Sig x1={40} y1={r.y} x2={330} y2={r.y} kind={r.kind} color={C.ink} />
          <T x={370} y={r.y + 7} size={23} color={C.ink} anchor="start" bold>{r.label}</T>
          <T x={600} y={r.y + 7} size={21} color={C.grey} anchor="start">{r.note}</T>
        </g>
      ))}
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Por que existe una norma</h2>
      <p>
        Un mismo tanque lo dibuja un diseñador en Bogota, lo monta un contratista en Barrancabermeja y lo opera un turno
        que rota cada ocho horas. Sin un código común, cada plano sería una interpretación personal. ANSI/ISA-5.1 fija
        ese codigo: que letras usar, que forma dibujar y que significa cada línea.
      </p>

      <h2>La etiqueta del instrumento</h2>
      <FigTag />
      <p>
        La identificación se divide en dos bloques. El primero describe la función y se lee letra por letra.
        El segundo es el número de lazo, común a todos los instrumentos que participan en el mismo control.
      </p>

      <Table
        caption="Primera letra: variable medida o iniciadora"
        head={['Letra', 'Variable', 'Letra', 'Variable']}
        rows={[
          ['A', 'Análisis (composición, pH)', 'L', 'Nivel'],
          ['C', 'Conductividad', 'P', 'Presión o vacío'],
          ['D', 'Densidad', 'Q', 'Cantidad (totalizada)'],
          ['F', 'Flujo', 'S', 'Velocidad o frecuencia'],
          ['H', 'Manual (accionado por operador)', 'T', 'Temperatura'],
          ['I', 'Corriente eléctrica', 'W', 'Peso o fuerza'],
          ['J', 'Potencia', 'Z', 'Posición'],
        ]}
      />

      <Table
        caption="Letras sucesivas: función del instrumento"
        head={['Letra', 'Función', 'Tipo']}
        rows={[
          ['A', 'Alarma', 'Salida'],
          ['C', 'Controlar', 'Salida'],
          ['E', 'Elemento primario (sensor)', 'Lectura'],
          ['I', 'Indicar', 'Lectura'],
          ['R', 'Registrar', 'Lectura'],
          ['S', 'Interruptor (switch)', 'Salida'],
          ['T', 'Transmitir', 'Salida'],
          ['V', 'Válvula, compuerta o persiana', 'Salida'],
          ['Y', 'Cálculo, relevo o conversión', 'Salida'],
          ['H, L', 'Alto, bajo (modificador de posición)', 'Modificador'],
        ]}
      />

      <Callout kind="note" title="Como leer cualquier etiqueta">
        <p>
          <strong>FRC-208</strong> se descompone en F (flujo), R (registra), C (controla), lazo 208: un controlador
          registrador de flujo. <strong>LSHH-101</strong> es L (nivel), S (interruptor), HH (muy alto): el enclavamiento
          que dispara por nivel altísimo. <strong>TY-205</strong> es un elemento de cálculo sobre la señal de temperatura,
          típicamente el convertidor que alimenta el posicionador.
        </p>
      </Callout>

      <h2>La burbuja: ubicación y tipo de sistema</h2>
      <FigBubbles />
      <p>
        El contorno indica que tecnología implementa la función. El circulo simple corresponde a un instrumento discreto,
        montado como aparato independiente. El cuadro con circulo inscrito señala una función residente en un sistema de
        control distribuido. El hexagono marca funciones de computo, y el rombo dentro de un cuadro, lógica programable.
      </p>
      <p>
        La línea horizontal dentro de la burbuja marca la accesibilidad: sin línea, el instrumento está en campo;
        con línea continua, es accesible al operador en la sala de control; con línea discontinua, está detras del
        tablero y no es accesible; con doble línea, corresponde a una ubicación auxiliar.
      </p>

      <h2>Líneas de señal</h2>
      <FigLines />

      <h2>Vocabulario del curso</h2>
      <p>
        Un mismo concepto tiene nombre de libro, nombre de norma y nombre de planta. Conviene reconocer los tres, y usar
        siempre el primero al escribir.
      </p>
      <Table
        caption="Como se dice cada cosa"
        head={['En el curso y en Smith y Corripio', 'En planta', 'Simbolo']}
        rows={[
          ['Punto de control', 'Setpoint, SP', '$y_{sp}, h_{sp}$'],
          ['Variable controlada', 'PV, variable de proceso', 'y'],
          ['Variable manipulada', 'OP, salida del controlador', 'u'],
          ['Perturbación', 'Carga, disturbio', 'd'],
          ['Flujo', 'Caudal', 'F'],
          ['Razón de amortiguamiento', 'Damping', '$\\zeta$'],
          ['Elemento final de control', 'Válvula de control', 'LV, FV, TV'],
        ]}
      />
      <Callout kind="note" title="Sobre la etiqueta del elemento final">
        <p>
          En la norma el elemento final lleva la letra de la variable seguida de <strong>V</strong> y el número del lazo:
          <strong> LV-101</strong> en un lazo de nivel, <strong>FV-202</strong> en uno de flujo. La forma <em>LCV</em> se
          ve en planos antiguos y en catalogos, pero la que se escribe en este curso es la de la norma, que además deja
          claro que la válvula comparte el número de lazo con LT-101 y LC-101.
        </p>
      </Callout>

      <h2>Cuantos lazos admite una unidad</h2>
      <p>
        Antes de dibujar controladores conviene contar. El número de variables que se pueden fijar de forma independiente
        es el número de grados de libertad de control:
      </p>
      <Eq n="2.1">{'N_{GL} = N_{variables} - N_{ecuaciones}'}</Eq>
      <p>
        Para un proceso ya construido esa cuenta se simplifica: <strong>hay tantos grados de libertad como corrientes de
        materia o energía que se puedan manipular de forma independiente</strong>. Cada grado de libertad admite un lazo
        y solo uno.
      </p>

      <Callout kind="warn" title="Error frecuente">
        <p>
          Intentar controlar dos variables con una sola válvula. Si el tanque T-101 solo tiene la válvula de salida como
          elemento manipulable, se puede controlar el nivel o el flujo de descarga, nunca los dos a la vez.
          El sintoma en planta es un lazo que "pelea" contra otro y termina en manual.
        </p>
      </Callout>
    </div>
  );
}

function FigPIDRead() {
  return (
    <Figure vw={900} vh={470} num="2.4" caption="Fragmento de P&ID del área 100. Un lazo de control, una cadena de medición con totalización y una función de protección independiente conviven en el mismo dibujo.">
      {/* entrada */}
      <Sig x1={0} y1={130} x2={230} y2={130} kind="process" color={C.ink} />
      <Flow x={170} y={130} dir="right" s={7} />
      <ManualValve cx={130} cy={130} s={17} />
      <L x1={230} y1={130} x2={230} y2={152} color={C.ink} w={3.8} />

      {/* recipiente */}
      <Vessel cx={230} top={150} w={150} h={175} level={0.5} />
      <T x={300} y={352} size={22} color={C.navy} bold anchor="start">T-101</T>

      {/* salida */}
      <L x1={230} y1={318} x2={230} y2={395} color={C.ink} w={3.8} />
      <Flow x={230} y={368} dir="down" s={7} />
      <Sig x1={230} y1={395} x2={900} y2={395} kind="process" color={C.ink} />
      <Flow x={310} y={395} dir="right" s={7} /><Flow x={790} y={395} dir="right" s={7} />
      <ControlValve cx={390} cy={395} s={20} />
      <T x={790} y={377} size={21} color={C.grey} anchor="start">a U-200</T>

      {/* lazo de nivel */}
      <Bubble cx={380} cy={215} tag="LT" num="101" r={29} tagsize={21} numsize={19} />
      <L x1={351} y1={215} x2={305} y2={215} color={C.ink} w={1.6} />
      <Sig x1={411} y1={215} x2={529} y2={215} kind="electric" color={C.ink} arrow />
      <Bubble cx={560} cy={215} tag="LC" num="101" r={30} tagsize={21} numsize={19} location="room" system="dcs" />
      <Sig x1={560} y1={245} x2={560} y2={353} kind="pneumatic" color={C.ink} />
      <Sig x1={560} y1={353} x2={413} y2={353} kind="pneumatic" color={C.ink} arrow />

      {/* capa de protección con interruptor propio, sin compartir transmisor */}
      <Bubble cx={72} cy={215} tag="LSHH" num="101" r={28} tagsize={18} numsize={18} />
      <L x1={100} y1={215} x2={155} y2={215} color={C.ink} w={1.4} />
      <Sig x1={72} y1={187} x2={72} y2={80} kind="electric" color={C.ink} />
      <Sig x1={72} y1={80} x2={529} y2={80} kind="electric" color={C.ink} arrow />
      <Bubble cx={560} cy={80} tag="LAHH" num="101" r={30} tagsize={18} numsize={18} location="room" system="plc" />
      <T x={600} y={44} size={19} color={C.grey} anchor="start">capa de protección aparte</T>
      <T x={72} y={266} size={17} color={C.grey}>toma propia</T>

      {/* cadena de medición de flujo */}
      <Bubble cx={700} cy={300} tag="FT" num="102" r={29} tagsize={21} numsize={19} />
      <L x1={700} y1={329} x2={700} y2={393} color={C.ink} w={1.6} />
      <Sig x1={731} y1={300} x2={769} y2={300} kind="electric" color={C.ink} arrow />
      <Bubble cx={800} cy={300} tag="FY" num="102" r={29} tagsize={21} numsize={19} location="rear" system="computer" />
      <Sig x1={800} y1={268} x2={800} y2={212} kind="software" color={C.ink} arrow />
      <Bubble cx={800} cy={180} tag="FQI" num="102" r={29} tagsize={20} numsize={19} location="room" system="dcs" />
    </Figure>
  );
}


function FigUnidad() {
  return (
    <Figure vw={1020} vh={470} num="2.5" caption="Unidad de precalentamiento U-200 completa. Tres lazos de control, una función de protección independiente y una cadena de medición, sobre cinco equipos.">
      {/* ---- alimentación y tanque T-201 ---- */}
      <Sig x1={0} y1={90} x2={210} y2={90} kind="process" color={C.ink} />
      <Flow x={182} y={90} dir="right" s={7} />
      <T x={34} y={126} size={20} color={C.grey} anchor="start">alimentación</T>
      <ControlValve cx={150} cy={90} s={17} />
      <T x={196} y={72} size={19} color={C.navy} bold anchor="start">LV-201</T>
      <L x1={210} y1={90} x2={210} y2={114} color={C.ink} w={3.8} />
      <Vessel cx={210} top={112} w={140} h={150} level={0.55} />
      <T x={296} y={272} size={20} color={C.navy} bold anchor="start">T-201</T>

      {/* interruptor de nivel muy bajo, independiente del transmisor */}
      <Bubble cx={80} cy={230} tag="LSLL" num="201" r={26} tagsize={17} numsize={17} />
      <L x1={106} y1={230} x2={140} y2={230} color={C.ink} w={1.6} />
      <Sig x1={80} y1={256} x2={80} y2={332} kind="electric" color={C.ink} arrow />
      <T x={30} y={356} size={18} color={C.grey} anchor="start">a enclavamiento de P-201</T>

      {/* lazo de nivel */}
      <Bubble cx={330} cy={190} tag="LT" num="201" r={27} tagsize={20} numsize={18} />
      <L x1={303} y1={190} x2={282} y2={190} color={C.ink} w={1.6} />
      <Sig x1={330} y1={163} x2={330} y2={142} kind="electric" color={C.ink} arrow />
      <Bubble cx={330} cy={110} tag="LIC" num="201" r={29} tagsize={20} numsize={18} location="room" system="dcs" />
      <Sig x1={330} y1={81} x2={330} y2={44} kind="pneumatic" color={C.ink} />
      <Sig x1={330} y1={44} x2={150} y2={44} kind="pneumatic" color={C.ink} />
      <Sig x1={150} y1={44} x2={150} y2={56} kind="pneumatic" color={C.ink} arrow />

      {/* ---- bombeo ---- */}
      <L x1={210} y1={262} x2={210} y2={330} color={C.ink} w={3.8} />
      <Flow x={210} y={306} dir="down" s={7} />
      <Sig x1={210} y1={330} x2={319} y2={330} kind="process" color={C.ink} />
      <Flow x={272} y={330} dir="right" s={7} />
      <Pump cx={355} cy={330} r={24} />
      <T x={355} y={378} size={20} color={C.navy} bold>P-201</T>
      <L x1={355} y1={294} x2={355} y2={262} color={C.ink} w={3.8} />
      <Flow x={355} y={278} dir="up" s={7} />

      {/* ---- medición y control de flujo ---- */}
      <Sig x1={355} y1={262} x2={700} y2={262} kind="process" color={C.ink} />
      <Flow x={400} y={262} dir="right" s={7} /><Flow x={520} y={262} dir="right" s={7} />
      <Orifice cx={450} cy={262} s={16} dir="up" />
      <Bubble cx={450} cy={170} tag="FT" num="202" r={26} tagsize={20} numsize={18} />
      <L x1={428} y1={232} x2={432} y2={196} color={C.ink} w={1.6} />
      <L x1={472} y1={232} x2={468} y2={196} color={C.ink} w={1.6} />
      <Sig x1={450} y1={144} x2={450} y2={104} kind="electric" color={C.ink} />
      <Sig x1={450} y1={104} x2={530} y2={104} kind="electric" color={C.ink} arrow />
      <Bubble cx={560} cy={104} tag="FIC" num="202" r={29} tagsize={20} numsize={18} location="room" system="dcs" />
      <ControlValve cx={620} cy={262} s={18} />
      <Sig x1={560} y1={133} x2={560} y2={224} kind="pneumatic" color={C.ink} />
      <Sig x1={560} y1={224} x2={601} y2={224} kind="pneumatic" color={C.ink} arrow />

      {/* ---- intercambiador E-201 ---- */}
      <Sig x1={700} y1={280} x2={740} y2={280} kind="process" color={C.ink} />
      <L x1={700} y1={262} x2={700} y2={280} color={C.ink} w={3.8} />
      <HeatExchanger cx={810} cy={280} w={140} h={76} stubs={false} />
      <T x={876} y={266} size={20} color={C.navy} bold anchor="end">E-201</T>
      <Sig x1={880} y1={280} x2={1020} y2={280} kind="process" color={C.ink} />
      <Flow x={950} y={280} dir="right" s={7} />
      <T x={900} y={262} size={20} color={C.grey} anchor="start">a R-201</T>

      {/* vapor y condensado */}
      <Sig x1={1020} y1={160} x2={810} y2={160} kind="process" color={C.ink} />
      <Flow x={870} y={160} dir="left" s={7} />
      <T x={996} y={142} size={20} color={C.grey} anchor="end">vapor</T>
      <ControlValve cx={930} cy={160} s={17} />
      <L x1={810} y1={160} x2={810} y2={242} color={C.ink} w={3.8} />
      <Flow x={810} y={201} dir="down" s={7} />
      <L x1={810} y1={318} x2={810} y2={410} color={C.ink} w={3.8} />
      <Flow x={810} y={382} dir="down" s={7} />
      <Sig x1={810} y1={410} x2={1020} y2={410} kind="process" color={C.ink} />
      <Flow x={945} y={410} dir="right" s={7} />
      <T x={866} y={432} size={20} color={C.grey} anchor="start">condensado</T>

      {/* lazo de temperatura */}
      <Bubble cx={920} cy={352} tag="TT" num="203" r={26} tagsize={20} numsize={18} />
      <L x1={920} y1={326} x2={920} y2={284} color={C.ink} w={1.6} />
      <Sig x1={894} y1={352} x2={701} y2={352} kind="electric" color={C.ink} arrow />
      <Bubble cx={670} cy={352} tag="TIC" num="203" r={29} tagsize={20} numsize={18} location="room" system="dcs" />
      <Sig x1={670} y1={323} x2={670} y2={60} kind="pneumatic" color={C.ink} />
      <Sig x1={670} y1={60} x2={930} y2={60} kind="pneumatic" color={C.ink} />
      <Sig x1={930} y1={60} x2={930} y2={122} kind="pneumatic" color={C.ink} arrow />
    </Figure>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Lectura de un fragmento de P&ID</h2>
      <Enunciado
        pide={[
          'Identificar cada instrumento del plano y decir que hace.',
          'Determinar cuántos lazos de control hay y cuántas funciones de protección.',
          'Justificar la tecnología que representa cada tipo de línea de señal dibujada.',
        ]}
      >
        <p>
          Un contratista entrega el plano del área 100 para revisión antes del montaje. No viene acompañado de lista de
          instrumentos ni de memoria de cálculo, así que toda la información debe salir del dibujo. Esa es exactamente la
          situación para la que existe la norma.
        </p>
      </Enunciado>
      <FigPIDRead />

      <Step n="1" title="Inventario de instrumentos">
        <Table
          caption="Instrumentos del fragmento"
          head={['Etiqueta', 'Lectura', 'Ubicación', 'Función en el área']}
          rows={[
            ['LT-101', 'Transmisor de nivel', 'Campo', 'Mide el nivel de T-101 y lo transmite en 4 a 20 mA'],
            ['LC-101', 'Indicador controlador de nivel', 'Sala, en DCS', 'Regula el nivel actuando sobre LV-101'],
            ['LAHH-101', 'Alarma de nivel altísimo', 'Sala, en PLC', 'Dispara el enclavamiento por rebose inminente'],
            ['FT-102', 'Transmisor de flujo', 'Campo', 'Mide la descarga hacia la unidad 200'],
            ['FY-102', 'Elemento de cálculo de flujo', 'Detrás del tablero', 'Integra el flujo instantaneo en el tiempo'],
            ['FQI-102', 'Indicador de cantidad totalizada', 'Sala, en DCS', 'Muestra el volumen acumulado enviado a U-200'],
          ]}
        />
      </Step>

      <Step n="2" title="Contar lazos y funciones de protección">
        <p>
          Hay <strong>un solo lazo de control</strong>: LT-101 mide, LC-101 decide y LV-101 actua. Los demás instrumentos
          no cierran ningún lazo. FT-102, FY-102 y FQI-102 forman una cadena de medición y totalización, sin acción sobre el
          proceso. LAHH-101 pertenece a la capa de protección, no a la de control, y por eso su burbuja aparece dibujada como
          lógica programable, en un sistema distinto al DCS.
        </p>
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            Qué la alarma de nivel altísimo viva en un PLC de seguridad y no en el DCS no es un detalle de dibujo. La norma
            ISA 84 exige independencia entre la capa de control y la capa instrumentada de seguridad. Si ambas compartieran
            el mismo transmisor y el mismo procesador, una falla única dejaría sin protección al tanque.
          </p>
        </div>
      </Step>

      <Step n="3" title="Justificar cada línea">
        <ul>
          <li><strong>Línea gruesa continua</strong> entre equipos: tubería de proceso, transporta el liquido.</li>
          <li><strong>Línea fina continua</strong> entre LT-101 y el tanque: conexión de impulso, es un tramo mecánico, no una señal.</li>
          <li><strong>Línea discontinua</strong> desde los transmisores: señal eléctrica de 4 a 20 mA.</li>
          <li><strong>Doble barra inclinada</strong> entre LC-101 y la válvula: señal neumática de 3 a 15 psi hacia el actuador de diafragma.</li>
          <li><strong>Línea con circulos</strong> entre FY-102 y FQI-102: enlace de software, porque el dato viaja dentro del sistema sin cableado dedicado.</li>
        </ul>
      </Step>

      <Answer>
        <p>
          Un lazo de control (nivel), una cadena de medición con totalización (flujo), y una función de protección
          independiente (LAHH-101). El área tiene un solo elemento final manipulable, así que un solo lazo es también
          el máximo que los grados de libertad permiten.
        </p>
      </Answer>

      <h2>Lectura de una unidad completa</h2>
      <Enunciado
        pide={[
          'Inventariar los instrumentos y equipos de la unidad, con su lectura y su papel.',
          'Contar los grados de libertad y verificar que el número de lazos sea coherente.',
          'Explicar por que la función de protección no consume ningún grado de libertad.',
          'Responder las seis preguntas de lectura del plano.',
        ]}
      >
        <p>
          El área de ingeniería entrega el P&amp;ID de la unidad de precalentamiento U-200 para la revisión previa a
          construcción. Antes de liberar el plano hay que verificar dos cosas: que la estructura de control sea coherente
          con las válvulas disponibles, y que la capa de protección este realmente separada del control regulatorio.
        </p>
      </Enunciado>
      <p>
        El fragmento anterior tiene un solo lazo. Una unidad real encadena varios, y ahí es donde la nomenclatura deja de
        ser un tramite y empieza a ahorrar tiempo.
      </p>
      <FigUnidad />

      <Step n="4" title="Inventario de la unidad U-200">
        <Table
          caption="Instrumentos y equipos de U-200"
          head={['Etiqueta', 'Lectura', 'Ubicación', 'Papel en la unidad']}
          rows={[
            ['LSLL-201', 'Interruptor de nivel muy bajo', 'Campo', 'Dispara el enclavamiento que detiene P-201 antes de que se descebe'],
            ['LT-201 / LIC-201', 'Transmisor y controlador de nivel', 'Campo / sala en DCS', 'Sostiene el inventario del tanque'],
            ['FT-202 / FIC-202', 'Transmisor y controlador de flujo', 'Campo / sala en DCS', 'Fija la carga que la unidad envia a R-201'],
            ['FE tipo placa', 'Elemento primario de flujo', 'Campo', 'Genera la presión diferencial que mide FT-202'],
            ['TT-203 / TIC-203', 'Transmisor y controlador de temperatura', 'Campo / sala en DCS', 'Regula el precalentamiento manipulando el vapor'],
            ['P-201', 'Bomba centrifuga', 'Campo', 'Impulsa la alimentación hacia el intercambiador'],
            ['E-201', 'Intercambiador de coraza y tubos', 'Campo', 'Precalienta con vapor que condensa en la coraza'],
          ]}
        />
      </Step>

      <Step n="5" title="Contar grados de libertad y verificar coherencia">
        <p>
          Las válvulas manipulables son tres: la de descarga del tanque, la de flujo a la salida de la bomba y la de
          vapor al intercambiador. Hay tres lazos de control. El número coincide, así que la estructura es viable.
        </p>
        <p>
          LSLL-201 no consume ningún grado de libertad porque no modula nada: actua sobre el arranque de la bomba, en la
          capa de protección. Por eso se dibuja como interruptor independiente y no como una salida derivada de LT-201.
          Si compartiera el transmisor con el lazo de nivel, una toma tapada dejaría a la bomba sin control y sin
          protección al mismo tiempo.
        </p>
      </Step>

      <Step n="6" title="Preguntas de lectura, con respuesta">
        <Table
          caption="Ejercicio de lectura sobre el plano"
          head={['Pregunta', 'Respuesta']}
          rows={[
            ['Qué tipo de señal une FT-202 con FIC-202', 'Eléctrica de 4 a 20 mA, dibujada con trazo discontinuo'],
            ['Y la que sale de FIC-202 hacia su válvula', 'Neumática de 3 a 15 psi, con doble barra inclinada, hacia el actuador de diafragma'],
            ['Por que la burbuja de TIC-203 lleva cuadro y línea continua', 'Reside en el sistema de control distribuido y es accesible al operador en sala'],
            ['Por que LSLL-201 no lleva cuadro', 'Es un instrumento discreto montado en campo, fuera del DCS'],
            ['Cual es el elemento primario del lazo de flujo', 'La placa de orificio, cuyas tomas alimentan a FT-202'],
            ['Qué ocurre con el vapor si se pierde el aire de instrumentos', 'La válvula debe cerrar, porque dejar aporte de calor sin supervisión no es un estado seguro'],
          ]}
        />
      </Step>

      <Answer>
        <p>
          Tres lazos de control sobre tres válvulas manipulables, una función de protección con instrumento propio y una
          cadena de medición por placa de orificio. La unidad está balanceada: no sobran ni faltan grados de libertad.
        </p>
      </Answer>

      <Reveal label="Ejercicio para resolver por cuenta propia">
        <p>
          Al fragmento anterior se le agrega un intercambiador E-101 aguas abajo de la válvula, con vapor de servicio
          en la coraza. Dibuje el lazo de temperatura completo con nomenclatura ISA, indique la ubicación de cada burbuja
          y decida si el nuevo lazo agrega o consume un grado de libertad.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'La etiqueta PDT-304 corresponde a:',
    options: [
      'Transmisor de densidad de proceso, lazo 304',
      'Transmisor de presión diferencial, lazo 304',
      'Controlador de presión con acción derivativa, lazo 304',
      'Interruptor de presión en descarga, lazo 304'],
    answer: 1,
    why: 'P es presión, D funciona como modificador de la primera letra y significa diferencial, T es transmitir. Es el instrumento típico de medición de flujo por placa de orificio y de nivel en recipientes cerrados.',
  },
  {
    q: 'Una burbuja dibujada como cuadrado con un circulo inscrito y una línea horizontal continua indica:',
    options: [
      'Instrumento discreto montado en campo',
      'Función en lógica programable, detras del tablero',
      'Función en sistema de control distribuido, accesible al operador',
      'Elemento de cálculo montado en el instrumento primario'],
    answer: 2,
    why: 'El cuadro con circulo identifica al sistema de control distribuido. La línea continua indica que la función está disponible para el operador en la sala de control.',
  },
  {
    q: 'En un P&ID aparece una línea con doble barra inclinada entre el controlador y la válvula. Esto significa que:',
    options: [
      'La señal es eléctrica de 4 a 20 mA',
      'Existe un enlace de software entre dos sistemas',
      'La señal es neumática, típicamente de 3 a 15 psi',
      'Se trata de una conexión de impulso al proceso',
    ],
    answer: 2,
    why: 'La doble barra inclinada es la convención ISA para señal neumática. Sigue siendo común en la última etapa del lazo porque el actuador de diafragma trabaja con aire.',
  },
  {
    q: 'Un recipiente tiene una sola válvula manipulable en su salida. El equipo de proceso pide controlar simultaneamente el nivel y el flujo de descarga. La respuesta técnica correcta es:',
    options: [
      'No es viable: hay un grado de libertad y se pide fijar dos variables',
      'Es viable si se sintoniza un lazo mucho más lento que el otro',
      'Es viable usando un controlador con dos puntos de control',
      'Es viable solo si la válvula tiene posicionador'],
    answer: 0,
    why: 'Con un único elemento final hay un grado de libertad de control. Fijar dos variables independientes exige dos manipuladas. Cualquier arreglo que lo intente termina con uno de los dos lazos en manual.',
  },
  {
    q: 'La cadena FT-102, FY-102, FQI-102 del ejemplo del área 100:',
    options: [
      'Es un lazo de control de flujo en cascada',
      'Convierte la señal de flujo en una señal neumática',
      'Es una función de protección contra sobreflujo',
      'Mide, integra y muestra el volumen acumulado, sin actuar sobre el proceso'],
    answer: 3,
    why: 'Ninguno de los tres instrumentos actua sobre un elemento final. Y significa cálculo, Q significa cantidad totalizada e I significa indicación: es una cadena de medición, útil para balance de materia y para facturación interna.',
  },
];
