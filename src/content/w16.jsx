import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Block, Arrow, Bubble, Sig, ControlValve, Vessel, HeatExchanger, CSTR, Pump, Conector, Drum, Flow,
} from '../lib/isa.jsx';

export const meta = {
  id: 'w16',
  week: 17,
  code: 'CP26II-M15',
  title: 'Síntesis de control de planta completa',
  unit: 'Planta integrada: T-101, E-101, R-201, CT-301, T-401',
  lede: 'Cada módulo agrego un equipo. Esta cierra el circulo: decidir la estructura de control de una planta entera, donde los lazos compiten por los mismos grados de libertad.',
  objectives: [
    'Aplicar un procedimiento ordenado de síntesis de control de planta completa.',
    'Reconocer el efecto de los reciclos sobre la dinámica global.',
    'Decidir donde fijar el inventario y como propagar la producción.',
    'Presentar una estructura de control justificada, al nivel exigido en el proyecto final.',
  ],
  refs: ['luyben', 'marlin', 'skoge', 'shinskey', 'smith'],
};

function FigPlant() {
  return (
    <Figure vw={980} vh={430} num="14.1" caption="La planta completa del curso. El reciclo desde el fondo de la columna hacia el precalentamiento acopla toda la unidad, y es el punto donde se decide la estructura global de control.">
      {/* alimentación fresca y tanque pulmón */}
      <Sig x1={0} y1={70} x2={96} y2={70} kind="process" color={C.ink} />
      <Flow x={50} y={70} dir="right" s={7} />
      <T x={8} y={52} size={17} color={C.grey} anchor="start">alimentación fresca</T>
      <Vessel cx={134} top={44} w={76} h={92} level={0.55} />
      <T x={176} y={64} size={17} color={C.navy} bold anchor="start">T-101</T>
      <L x1={134} y1={134} x2={134} y2={182} color={C.ink} w={3.8} />
      <Flow x={134} y={166} dir="down" s={7} />
      <Sig x1={134} y1={182} x2={236} y2={182} kind="process" color={C.ink} />
      <Flow x={196} y={182} dir="right" s={7} />
      <ControlValve cx={172} cy={182} s={13} />

      {/* precalentamiento */}
      <HeatExchanger cx={284} cy={182} w={96} h={48} stubs={false} />
      <T x={284} y={146} size={17} color={C.navy} bold>E-101</T>
      <Sig x1={332} y1={182} x2={404} y2={182} kind="process" color={C.ink} />
      <Flow x={370} y={182} dir="right" s={7} />

      {/* reactor */}
      <CSTR cx={470} cy={196} w={86} h={104} level={0.6} jacket />
      <T x={526} y={200} size={17} color={C.navy} bold anchor="start">R-201</T>
      <L x1={470} y1={248} x2={470} y2={306} color={C.ink} w={3.8} />
      <Flow x={470} y={288} dir="down" s={7} />
      <Sig x1={470} y1={306} x2={612} y2={306} kind="process" color={C.ink} />
      <Flow x={550} y={306} dir="right" s={7} />
      <L x1={612} y1={306} x2={612} y2={132} color={C.ink} w={3.8} />
      <Flow x={612} y={220} dir="up" s={7} />
      <Sig x1={612} y1={132} x2={640} y2={132} kind="process" color={C.ink} />

      {/* columna */}
      <Vessel cx={686} top={74} w={92} h={212} level={0} />
      <T x={742} y={110} size={17} color={C.navy} bold anchor="start">T-401</T>
      {[112, 152, 192, 232].map((y) => (
        <L key={y} x1={648} y1={y} x2={724} y2={y} color={C.ink} w={1.2} />
      ))}
      <L x1={686} y1={78} x2={686} y2={46} color={C.ink} w={3.8} />
      <Sig x1={686} y1={46} x2={874} y2={46} kind="process" color={C.ink} />
      <Flow x={790} y={46} dir="right" s={7} />
      <Conector x={876} y={46} dir="right" label="producto" />

      {/* reciclo de fondos hacia el precalentamiento */}
      <L x1={686} y1={282} x2={686} y2={352} color={C.ink} w={3.8} />
      <Flow x={686} y={330} dir="down" s={7} />
      <Sig x1={686} y1={352} x2={284} y2={352} kind="process" color={C.dist} />
      <Flow x={500} y={352} dir="left" s={7} color={C.dist} />
      <ControlValve cx={400} cy={352} s={13} />
      <L x1={284} y1={352} x2={284} y2={210} color={C.ink} w={3.8} />
      <Flow x={284} y={290} dir="up" s={7} />
      <T x={400} y={390} size={18} color={C.dist}>reciclo de fondos</T>

      {/* purga del circuito */}
      <Sig x1={686} y1={352} x2={874} y2={352} kind="process" color={C.ink} />
      <Flow x={800} y={352} dir="right" s={7} />
      <Conector x={876} y={352} dir="right" label="purga" />

      {/* servicio de enfriamiento */}
      <Sig x1={0} y1={330} x2={30} y2={330} kind="process" color={C.dist} />
      <Drum cx={100} cy={330} w={140} h={54} level={0.45} />
      <T x={100} y={382} size={17} color={C.navy} bold>CT-301</T>
      <Sig x1={170} y1={330} x2={244} y2={330} kind="process" color={C.dist} />
      <Flow x={214} y={330} dir="right" s={7} color={C.dist} />
      <Conector x={246} y={330} dir="right" label="servicios" />
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Del lazo a la planta</h2>
      <FigPlant />
      <p>
        Hasta aquí cada estrategia se estudio sobre una unidad aislada. Una planta real acopla esas unidades, y el
        acoplamiento cambia el problema. Un reciclo puede multiplicar por diez la constante de tiempo global, y una
        decisión tomada en el reactor puede dejar sin grados de libertad a la columna.
      </p>

      <h2>Procedimiento de síntesis</h2>
      <p>
        Luyben propone un orden que evita la mayor parte de los conflictos. Cada paso consume grados de libertad y el
        orden importa.
      </p>
      <Table
        caption="Los pasos, en orden de ejecución"
        head={['Paso', 'Decisión', 'Aplicación en la planta del curso']}
        rows={[
          ['1', 'Fijar los objetivos de control y la calidad exigida', 'Pureza del producto en cabeza de T-401'],
          ['2', 'Contar los grados de libertad de control', 'Tantos como válvulas manipulables independientes'],
          ['3', 'Establecer las restricciones de seguridad y ambientales', 'SIF-201 y capacidad de la torre CT-301'],
          ['4', 'Fijar la producción en un punto', 'Alimentación fresca al tanque T-101'],
          ['5', 'Controlar la calidad del producto', 'Composición en cabeza de T-401'],
          ['6', 'Controlar el inventario de cada fase', 'Nivel en T-101, en R-201 y en el acumulador de T-401'],
          ['7', 'Verificar el balance de componentes en los reciclos', 'Acumulación de inertes en el reciclo de fondos'],
          ['8', 'Emparejar los lazos restantes y optimizar', 'RGA sobre la columna, eficiencia energetica'],
        ]}
      />

      <Callout kind="note" title="La regla que ordena todo lo demas">
        <p>
          El inventario de cada fase debe tener alguien que lo controle, y ese controlador consume un grado de libertad.
          Un tanque sin lazo de nivel se llena o se vacia, y no existe sintonía que arregle un balance de materia que no
          cierra. Por eso el paso 6 es obligatorio y el paso 8 es opcional.
        </p>
      </Callout>

      <h2>El efecto del reciclo</h2>
      <p>
        Un reciclo introduce realimentación positiva de materia. Si una perturbación aumenta la cantidad de un componente
        en el reactor, ese exceso sale por el fondo de la columna y regresa al reactor, donde vuelve a aumentar. El sistema
        se estabiliza solo si existe una salida para el componente.
      </p>
      <Eq n="14.1">{'\\tau_{planta} \\approx \\frac{\\tau_{unidad}}{1 - R\\,K_{reciclo}}'}</Eq>
      <p>
        Con una fracción de reciclo <Ei>{'R'}</Ei> alta y ganancia cercana a uno, la constante de tiempo de la planta
        crece varios ordenes de magnitud sobre la de cada unidad. Es el fenomeno conocido como <strong>efecto bola de
        nieve</strong>: un cambio pequeño en la alimentación fresca produce un cambio enorme en el flujo de reciclo.
      </p>
      <Table
        caption="Como se controla un reciclo"
        head={['Estrategia', 'En que consiste', 'Costo']}
        rows={[
          ['Fijar el flujo de reciclo', 'Un lazo de flujo sobre la corriente de reciclo', 'La composición del reactor queda libre'],
          ['Fijar el inventario del reactor', 'Nivel del reactor manipula la alimentación fresca', 'La producción deja de fijarse aguas arriba'],
          ['Purga sobre el reciclo', 'Sangrar una fracción para evacuar inertes', 'Perdida de reactivo valioso'],
        ]}
      />
      <p>
        La regla práctica es que <strong>en todo lazo de reciclo debe haber al menos un flujo fijado</strong>. Dejar todos
        los flujos del circuito bajo control de composición o de nivel produce un sistema sin referencia, donde el
        inventario deriva sin límite.
      </p>

      <h2>Donde fijar la producción</h2>
      <p>
        Fijar la producción en la alimentación fresca es lo mas intuitivo y lo mas común. El flujo se impone y cada unidad
        aguas abajo lo acepta, ajustando sus inventarios. Funciona bien mientras ninguna unidad se acerque a su límite de
        capacidad.
      </p>
      <p>
        Cuando una unidad se convierte en cuello de botella, conviene fijar la producción <strong>en ese punto</strong> y
        propagar la demanda hacia atras. La alimentación fresca pasa entonces a controlarse por el nivel del primer
        recipiente. La estructura resultante se llama control orientado a la demanda, y suele aumentar la producción real
        sin ninguna inversión en equipos.
      </p>

      <h2>Nivel promediante e inventario</h2>
      <p>
        Los lazos de nivel de los tanques pulmon no deben sintonizarse para mantener el nivel constante. Su función es
        absorber variaciones de flujo, y para eso conviene una sintonía deliberadamente lenta:
      </p>
      <Eq n="14.2">{'K_c \\approx \\frac{2}{\\text{fracción del volumen útil que se acepta usar}}'}</Eq>
      <p>
        Con un tanque cuyo volumen útil entre 20 % y 80 % equivale a diez minutos de residencia, aceptar que el nivel se
        mueva en todo ese rango permite entregar aguas abajo un flujo casi constante. Eso ya se anticipo en el módulo de dinámica de primer orden y
        aquí cobra sentido a escala de planta.
      </p>

      <h2>Que se espera del proyecto final</h2>
      <p>
        La presentación del módulo de síntesis de planta debe sostener una estructura de control completa con argumentos, no con
        preferencias. Se evalua que el trabajó demuestre:
      </p>
      <ol>
        <li>El conteo de grados de libertad y la coherencia entre lazos propuestos y válvulas disponibles.</li>
        <li>Los modelos identificados de forma experimental, con su curva de reacción y sus parámetros.</li>
        <li>La sintonía justificada con una regla, y el criterio de desempeño que la motivo.</li>
        <li>Al menos una estrategia avanzada, con la razón técnica que la hace necesaria.</li>
        <li>El análisis de estabilidad del lazo crítico.</li>
        <li>La capa de seguridad, con al menos una función instrumentada documentada.</li>
        <li>Resultados medidos en la planta construida, comparados con la predicción del modelo.</li>
      </ol>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Estructura de control de la planta integrada</h2>
      <Enunciado
        pide={[
          'Contar los grados de libertad de control de la planta completa.',
          'Ubicar las restricciones de seguridad antes de asignar cualquier lazo regulatorio.',
          'Decidir en que punto se fija la producción y justificarlo.',
          'Asignar el lazo de calidad y explicar por que no se controlan las dos composiciones.',
          'Asignar todos los inventarios y verificar que el circuito de reciclo tenga referencia.',
          'Comprobar que el número de lazos coincide con el de válvulas manipulables.',
        ]}
      >
        <p>
          La planta esta construida y hay que proponer la estructura de control completa antes del arranque. Producción
          informa que el rehervidor de la columna es el equipo que opera mas cerca de su limite, al 92 % de su capacidad
          térmica. El circuito reactor, columna y reciclo acopla toda la unidad, así que las decisiones no se pueden
          tomar equipo por equipo.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Alimentación fresca al tanque T-101, precalentada en E-101 con vapor.</li>
          <li>Reactor R-201 encamisado, con conversión incompleta. Reciclo del fondo de T-401 hacia la entrada de E-101.</li>
          <li>Columna T-401 con condensador total y rehervidor de vapor. Producto por cabeza, reciclo por fondo.</li>
          <li>Torre CT-301 provee agua de enfriamiento al condensador y a la chaqueta del reactor.</li>
          <li>Válvulas disponibles: alimentación fresca, vapor a E-101, vapor a la chaqueta de R-201, reflujo, vapor al rehervidor, producto por cabeza, reciclo por fondo, purga, agua de enfriamiento.</li>
        </ul>
      </Given>

      <Step n="1" title="Contar grados de libertad">
        <p>
          Nueve válvulas manipulables independientes significan nueve grados de libertad de control. Cada lazo que se
          proponga debe corresponder a una y solo una de esas válvulas.
        </p>
      </Step>

      <Step n="2" title="Restricciones de seguridad primero">
        <p>
          La chaqueta de R-201 alimenta la función SIF-201 del módulo de seguridad. Esa función usa válvulas de corte dedicadas,
          así que no consume grados de libertad del control regulatorio. El agua de enfriamiento del condensador debe ser
          falla abierta.
        </p>
      </Step>

      <Step n="3" title="Fijar la producción">
        <p>
          Se analiza la capacidad de cada unidad y se identifica que el rehervidor de T-401 está al 92 % de su capacidad
          térmica en condiciones nominales. Ese es el cuello de botella, así que la producción se fija ahí:
          <strong> FIC sobre el vapor al rehervidor con punto de control en el límite operativo</strong>.
        </p>
        <p>
          La alimentación fresca deja de fijarse y pasa a controlar el nivel del tanque T-101, propagando la demanda hacia
          atras.
        </p>
      </Step>

      <Step n="4" title="Calidad del producto">
        <p>
          La pureza en cabeza se controla con el reflujo, mediante temperatura de plato inferida y corregida por presión,
          con actualización lenta desde el analizador. La composición de fondos queda sin control directo, decisión
          justificada por el resultado del RGA del módulo multivariable, que mostro
          <Ei>{'\\ \\lambda_{11} = 3.93'}</Ei> y desaconsejaba el control dual.
        </p>
      </Step>

      <Step n="5" title="Inventarios">
        <Table
          caption="Asignación de lazos de inventario"
          head={['Inventario', 'Manipulada', 'Sintonía']}
          rows={[
            ['Nivel de T-101', 'Alimentación fresca', 'Promediante, $K_c \\text{bajo}$'],
            ['Nivel de R-201', 'Salida del reactor', 'Promediante'],
            ['Nivel del acumulador de T-401', 'Producto por cabeza', 'Promediante'],
            ['Nivel del fondo de T-401', 'Flujo de reciclo', 'Promediante'],
            ['Presión de T-401', 'Agua de enfriamiento al condensador', 'Ajustada, la presión afecta la separación'],
          ]}
        />
      </Step>

      <Step n="6" title="Verificar el reciclo">
        <p>
          El circuito reactor-columna-reciclo tiene todos sus flujos bajo control de nivel, lo que deja el inventario del
          circuito sin referencia. Se corrige fijando la purga como flujo proporcional al reciclo, con relación ajustable:
        </p>
        <Eq n="14.3">{'F_{purga} = R_{purga}\\,F_{reciclo}, \\qquad R_{purga} \\approx 0.02\\ \\text{a}\\ 0.05'}</Eq>
        <p>
          Esa purga evacua los inertes y ancla el inventario del circuito, evitando el efecto bola de nieve.
        </p>
      </Step>

      <Step n="7" title="Verificar el conteo final">
        <Table
          caption="Nueve válvulas, nueve lazos"
          head={['Válvula', 'Lazo asignado']}
          numeric={[]}
          rows={[
            ['Alimentación fresca', 'LIC de T-101'],
            ['Vapor a E-101', 'TIC de precalentamiento'],
            ['Vapor a chaqueta de R-201', 'TIC de temperatura de reacción, en cascada con flujo'],
            ['Salida del reactor', 'LIC de R-201'],
            ['Vapor al rehervidor', 'FIC que fija la producción'],
            ['Reflujo', 'Control de calidad por temperatura de plato'],
            ['Producto por cabeza', 'LIC del acumulador'],
            ['Reciclo por fondo', 'LIC del fondo de T-401'],
            ['Purga', 'Control de relación sobre el reciclo'],
          ]}
        />
      </Step>

      <Answer>
        <p>
          Estructura orientada a la demanda, con la producción fijada en el rehervidor por ser el cuello de botella, una
          sola composición controlada por temperatura de plato inferida, todos los inventarios con sintonía promediante,
          cascada en la temperatura del reactor y purga en relación con el reciclo para anclar el inventario del circuito.
          Nueve lazos sobre nueve grados de libertad, sin conflicto.
        </p>
      </Answer>

      <Reveal label="La pregunta que decide la calificación del proyecto">
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            Ante cualquier estructura propuesta, la pregunta que la evalua es siempre la misma: que pasa cuando esta
            válvula llega a su tope. Si la respuesta es que el lazo pierde el control y arrastra a los demas, la estructura
            necesita un esquema override. Si la respuesta es que otro lazo absorbe la desviación, la estructura es robusta.
            Recorrer esa pregunta válvula por válvula revela mas debilidades que cualquier simulación.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'En la síntesis de control de planta completa, el paso que debe ejecutarse antes de emparejar lazos de calidad es:',
    options: [
      'Optimizar el consumo energetico',
      'Sintonizar los lazos de flujo',
      'Instalar los desacopladores',
      'Asegurar que todos los inventarios tengan quien los controle'],
    answer: 3,
    why: 'Un inventario sin control produce un balance de materia que no cierra, y ninguna sintonía lo corrige. Por eso el control de inventario precede a la optimización y al emparejamiento fino.',
  },
  {
    q: 'El efecto bola de nieve en un circuito con reciclo consiste en que:',
    options: [
      'La temperatura del reactor crece sin control',
      'Un cambio pequeño en la alimentación fresca produce un cambio muy grande en el flujo de reciclo',
      'El nivel de todos los tanques sube a la vez',
      'La columna inunda por exceso de vapor',
    ],
    answer: 1,
    why: 'La realimentación positiva de materia amplifica la perturbación en cada vuelta del circuito. La constante de tiempo global crece y el flujo de reciclo puede multiplicarse ante cambios modestos en la alimentación.',
  },
  {
    q: 'La regla práctica sobre reciclos establece que:',
    options: [
      'En todo lazo de reciclo debe haber al menos un flujo fijado',
      'Todo reciclo debe controlarse por composición',
      'El reciclo debe ser siempre menor que la alimentación fresca',
      'El reciclo no requiere control'],
    answer: 0,
    why: 'Si todos los flujos del circuito quedan bajo control de nivel o de composición, el inventario carece de referencia y deriva. Fijar un flujo, o anclarlo con una purga proporcional, resuelve el problema.',
  },
  {
    q: 'Una unidad opera al 92 % de su capacidad y es el cuello de botella de la planta. Conviene:',
    options: [
      'Fijar la producción en la alimentación fresca, como siempre',
      'Poner esa unidad en manual',
      'Fijar la producción en esa unidad y propagar la demanda hacia atras',
      'Aumentar la ganancia de todos los lazos aguas arriba'],
    answer: 2,
    why: 'El control orientado a la demanda fija el flujo en la restricción real y deja que las unidades aguas arriba se ajusten. Suele aumentar la producción sin inversión, porque elimina el margen que la estructura convencional obliga a dejar.',
  },
  {
    q: 'Un lazo de nivel sobre un tanque pulmon debe sintonizarse:',
    options: [
      'Con ganancia alta, para mantener el nivel en punto de control',
      'Con acción derivativa alta',
      'En manual, porque el nivel no importa',
      'Con sintonía promediante, para que el flujo de salida sea estable'],
    answer: 3,
    why: 'La función del tanque es amortiguar variaciones de flujo. Un lazo agresivo las traslada intactas aguas abajo y anula el proposito del equipo.',
  },
  {
    q: 'La pregunta mas útil para evaluar la robustez de una estructura de control de planta es:',
    options: [
      'Cuantos lazos PID tiene',
      'Que ocurre cuando cada válvula llega a su tope',
      'Cual es el costo de la instrumentación',
      'Cuantos analizadores en línea requiere',
    ],
    answer: 1,
    why: 'La saturación de un elemento final es la situación donde una estructura revela si degrada de forma ordenada o si arrastra a los demas lazos. Recorrer esa pregunta válvula por válvula descubre mas debilidades que cualquier simulación.',
  },
];
