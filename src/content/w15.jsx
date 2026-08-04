import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow, Bubble, Sig, ControlValve, Vessel } from '../lib/isa.jsx';

export const meta = {
  id: 'w15',
  week: 16,
  code: 'CP26II-M14',
  title: 'Seguridad de procesos y sistemas instrumentados',
  unit: 'Reactor R-201 y columna T-401',
  lede: 'El control regulatorio persigue rendimiento. La capa de seguridad persigue que ningún escenario razonable termine en un accidente, y por eso vive en un sistema aparte.',
  objectives: [
    'Describir las capas de protección de una instalación y el papel de cada una.',
    'Explicar la lógica de un HAZOP y construir una desviación con palabra guía.',
    'Relacionar el nivel de integridad de seguridad con la probabilidad de falla en demanda.',
    'Justificar la independencia entre el sistema de control y el sistema instrumentado de seguridad.',
  ],
  refs: ['isa84', 'iec61508', 'ccps', 'perry', 'marlin'],
};

function FigLayers() {
  const layers = [
    { r: 190, c: '#F5DCD8', t: 'Respuesta a la emergencia' },
    { r: 160, c: '#FAE7D5', t: 'Contención física, diques' },
    { r: 130, c: '#FDF2DC', t: 'Alivio mecánico, PSV' },
    { r: 100, c: '#E6F0E6', t: 'Sistema instrumentado de seguridad' },
    { r: 72, c: '#E2EEF6', t: 'Alarmas y acción del operador' },
    { r: 44, c: '#EAF1F8', t: 'Control regulatorio' },
  ];
  return (
    <Figure vw={1000} vh={430} num="13.1" caption="Capas de protección. Cada capa debe ser independiente de las demas: una falla común que inutilice dos capas a la vez anula el proposito del modelo.">
      {layers.map((l, i) => (
        <circle key={i} cx={230} cy={215} r={l.r} fill={l.c} stroke={C.ink} strokeWidth="1.4" />
      ))}
      <T x={230} y={222} size={20} color={C.navy} bold>Proceso</T>
      {layers.map((l, i) => (
        <g key={`t${i}`}>
          <L x1={230} y1={215 - l.r} x2={470} y2={40 + i * 62} color={C.grey} w={1} dash="4,4" />
          <T x={484} y={46 + i * 62} size={21} color={C.ink} anchor="start">{l.t}</T>
        </g>
      ))}
      <T x={484} y={400} size={19} color={C.grey} anchor="start">prevención hacia adentro, mitigación hacia afuera</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Capas de protección</h2>
      <FigLayers />
      <p>
        Un accidente de proceso rara vez proviene de una sola falla. Proviene de una secuencia donde varias barreras
        fallaron a la vez. El modelo de capas de protección organiza esas barreras desde el proceso hacia afuera, y exige
        que cada una sea independiente de las demas.
      </p>
      <Table
        caption="Las capas y su función"
        head={['Capa', 'Actua', 'Ejemplo en R-201']}
        rows={[
          ['Diseño inherentemente seguro', 'Antes de que exista el riesgo', 'Reducir el inventario de reactivo en el reactor'],
          ['Control regulatorio', 'De forma continua', 'TIC-201 mantiene la temperatura de reacción'],
          ['Alarmas y operador', 'Ante una desviación detectada', 'TAH-201 avisa y el turno reduce la carga'],
          ['Sistema instrumentado de seguridad', 'Ante una demanda, de forma automática', 'TSHH-201 corta el vapor y abre el enfriamiento'],
          ['Alivio mecánico', 'Cuando la presión ya subió', 'Válvula de seguridad hacia el tea'],
          ['Contención y mitigación', 'Después de la liberacion', 'Dique, sistema de espuma, plan de emergencia'],
        ]}
      />

      <Callout kind="risk" title="Por que la independencia no es negociable">
        <p>
          Si el lazo de control y el enclavamiento comparten transmisor, una obstrucción en la toma de proceso deja al
          reactor sin control y sin protección al mismo tiempo. Ese es el escenario de falla de causa común, y es la razón
          por la que ISA 84 exige elemento primario, lógica y elemento final separados para la capa de seguridad.
        </p>
      </Callout>

      <h2>Identificación de peligros: el HAZOP</h2>
      <p>
        El estudio de peligros y operabilidad recorre el proceso por nodos y aplica a cada uno un conjunto de palabras
        guía sobre cada parámetro. La estructura obliga a considerar desviaciones que nadie imaginaria de forma
        espontanea.
      </p>
      <Table
        caption="Palabras guía y desviaciones"
        head={['Palabra guía', 'Significado', 'Desviación sobre flujo de refrigerante']}
        rows={[
          ['No', 'Ausencia total', 'No hay flujo de agua a la chaqueta'],
          ['Mas', 'Aumento cuantitativo', 'Flujo mayor al de diseño'],
          ['Menos', 'Disminucion cuantitativa', 'Flujo insuficiente por obstrucción'],
          ['Además de', 'Presencia de algo mas', 'Agua contaminada con producto por fuga interna'],
          ['Parte de', 'Composición incompleta', 'Mezcla agua-glicol fuera de proporción'],
          ['Inverso', 'Sentido contrario', 'Retorno de agua hacia el cabezal'],
          ['Otro que', 'Sustitución completa', 'Se alimenta agua de servicio en lugar de refrigerada'],
        ]}
      />
      <p>
        Para cada desviación se documentan causas, consecuencias, salvaguardas existentes y recomendaciones. La salida del
        HAZOP es la entrada del análisis de capas de protección, que decide si las salvaguardas actuales bastan.
      </p>

      <h2>Nivel de integridad de seguridad</h2>
      <p>
        Cuando se concluye que hace falta una función instrumentada de seguridad, hay que decidir cuan confiable debe ser.
        Esa exigencia se expresa como <strong>nivel de integridad</strong>, definido a partir de la probabilidad de falla
        en demanda promedio:
      </p>
      <Eq n="13.1">{'\\text{PFD}_{avg} = \\frac{\\text{número de fallas peligrosas no detectadas}}{\\text{número de demandas}}'}</Eq>
      <Table
        caption="Niveles SIL para operación de baja demanda, según IEC 61508"
        head={['SIL', 'PFD promedio', 'Reducción de riesgo', 'Arquitectura típica']}
        numeric={[1, 2]}
        rows={[
          ['1', '$10^{-2} a 10^{-1}$', '10 a 100', 'Un solo canal, 1oo1'],
          ['2', '$10^{-3} a 10^{-2}$', '100 a 1000', 'Redundancia, 1oo2 o 2oo3'],
          ['3', '$10^{-4} a 10^{-3}$', '1000 a 10 000', 'Redundancia con diagnostico y pruebas frecuentes'],
          ['4', '$10^{-5} a 10^{-4}$', '10 000 a 100 000', 'Rara vez justificable en planta de proceso'],
        ]}
      />
      <p>
        La reducción de riesgo requerida sale de comparar la frecuencia del evento sin protección con la frecuencia
        tolerable definida por la organizacion:
      </p>
      <Eq n="13.2">{'\\text{RRF} = \\frac{f_{\\text{sin protección}}}{f_{\\text{tolerable}}} = \\frac{1}{\\text{PFD}_{avg}}'}</Eq>

      <Callout kind="warn" title="El SIL no se elige por catalogo">
        <p>
          Un instrumento no es SIL 2 por si mismo. Es apto para uso en una función SIL 2 dentro de una arquitectura,
          con una frecuencia de prueba definida y un intervalo de mantenimiento cumplido. El nivel pertenece a la función
          completa, que incluye sensor, resolvedor lógico y elemento final, y se degrada si la prueba de recorrido no se
          ejecuta.
        </p>
      </Callout>

      <h2>La función instrumentada de seguridad</h2>
      <p>Cada función se documenta con la misma estructura, y el examen suele pedir exactamente estos campos:</p>
      <ul>
        <li><strong>Evento peligroso</strong> que se quiere evitar.</li>
        <li><strong>Elemento sensor</strong>, con su etiqueta y su punto de disparo.</li>
        <li><strong>Lógica</strong>, con la votación y el resolvedor.</li>
        <li><strong>Elemento final</strong>, con su posición segura.</li>
        <li><strong>Tiempo de respuesta</strong> exigido, comparado con el tiempo disponible del proceso.</li>
        <li><strong>SIL asignado</strong> y frecuencia de prueba de recorrido.</li>
      </ul>

      <h2>Gestion de alarmas</h2>
      <p>
        La capa del operador funciona solo si el operador puede atenderla. La práctica documentada en la norma de gestion
        de alarmas fija como objetivo un promedio inferior a seis alarmas por hora en operación estable, con menos de diez
        en los diez minutos siguientes a una perturbación mayor.
      </p>
      <p>
        Toda alarma debe tener una respuesta definida, un tiempo disponible para ejecutarla y una consecuencia clara si no
        se atiende. Una alarma sin acción asociada no es una alarma, es un dato, y su lugar es la tendencia y no la lista
        de eventos activos.
      </p>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Función instrumentada de seguridad para el reactor R-201</h2>
      <Enunciado
        pide={[
          'Establecer la reducción de riesgo requerida y descontar el aporte de la capa del operador.',
          'Asignar el nivel de integridad de seguridad y la arquitectura que corresponde.',
          'Definir la función completa: sensor, punto de disparo, lógica, elemento final y tiempo de respuesta.',
          'Verificar la independencia frente al lazo de control regulatorio.',
          'Comprobar el escalonamiento entre operación normal, alarma, disparo y limite del escenario.',
        ]}
      >
        <p>
          El estudio de peligros del reactor R-201 concluyó que la desviación por alta temperatura puede llevar a
          reacción descontrolada y rotura del recipiente. La organización ya definió su frecuencia tolerable para eventos
          con posible daño a personas. Hay que dimensionar la función instrumentada que cierre la brecha entre el riesgo
          actual y ese limite.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Reacción exotérmica. Por encima de 145 °C la velocidad se descontrola y la presión supera el diseño del recipiente.</li>
          <li>Temperatura normal de operación: 118 °C. Alarma alta TAH-201 en 132 °C.</li>
          <li>Frecuencia estimada de la desviación sin protección instrumentada: 0.25 eventos por año.</li>
          <li>Frecuencia tolerable definida por la organizacion para un evento con posible daño a personas: 10⁻⁴ por año.</li>
          <li>Se acredita a la respuesta del operador ante TAH-201 una reducción de riesgo de 10.</li>
        </ul>
      </Given>

      <Step n="1" title="Establecer la reducción de riesgo requerida">
        <Eq>{'\\text{RRF}_{total} = \\frac{0.25}{1\\times 10^{-4}} = 2500'}</Eq>
        <p>La respuesta del operador aporta un factor 10, así que a la capa instrumentada le corresponde:</p>
        <Eq n="13.3">{'\\text{RRF}_{SIS} = \\frac{2500}{10} = 250'}</Eq>
      </Step>

      <Step n="2" title="Asignar el nivel de integridad">
        <Eq>{'\\text{PFD}_{avg} = \\frac{1}{250} = 4.0\\times 10^{-3}'}</Eq>
        <p>
          El valor cae dentro del intervalo de <Ei>{'10^{-3}'}</Ei> a <Ei>{'10^{-2}'}</Ei>, que corresponde a <strong>SIL 2</strong>. La arquitectura debe
          contemplar redundancia en el elemento sensor.
        </p>
      </Step>

      <Step n="3" title="Definir la función">
        <Table
          caption="SIF-201, protección por alta temperatura del reactor"
          head={['Campo', 'Definición']}
          rows={[
            ['Evento peligroso', 'Reacción descontrolada con rotura del recipiente'],
            ['Sensor', 'TSHH-201 A y B, dos termopares independientes con votación 1oo2'],
            ['Punto de disparo', '140 °C, con 5 °C de margen respecto del límite de 145 °C'],
            ['Resolvedor lógico', 'PLC de seguridad certificado, independiente del DCS'],
            ['Elemento final', 'XV-201 corta el vapor, falla cerrada; XV-202 abre el enfriamiento de emergencia, falla abierta'],
            ['Tiempo de respuesta', 'Menor a 8 s, frente a 90 s de tiempo disponible del proceso'],
            ['SIL', '2, con prueba de recorrido anual'],
          ]}
        />
      </Step>

      <Step n="4" title="Verificar la independencia">
        <p>
          El lazo de control TIC-201 usa TT-201, un transmisor distinto de TSHH-201 A y B, con toma de proceso separada.
          El resolvedor lógico es un PLC de seguridad y no el DCS. Los elementos finales son válvulas de corte dedicadas,
          distintas de la válvula de control TV-201. Ninguna falla única inutiliza control y protección a la vez.
        </p>
      </Step>

      <Step n="5" title="Comprobar el margen entre capas">
        <Table
          caption="Escalonamiento de los puntos de actuacion"
          head={['Valor (°C)', 'Que ocurre', 'Capa']}
          numeric={[0]}
          rows={[
            ['118', 'Operación normal', 'Control regulatorio'],
            ['132', 'Alarma alta, el operador reduce carga', 'Operador'],
            ['140', 'Disparo automático, corte de vapor', 'SIS'],
            ['145', 'Límite del escenario peligroso', 'Ninguna, ya se agoto el margen'],
            ['Presión de diseño', 'Alivio por PSV-201', 'Mecánica'],
          ]}
        />
        <p>
          Los 8 °C entre la alarma y el disparo dan al operador un margen razonable de actuacion, y los 5 °C entre el
          disparo y el límite cubren el tiempo de respuesta de la función. Un escalonamiento mas apretado convertiria cada
          alarma en un disparo, y uno mas holgado dejaría sin margen a la capa mecánica.
        </p>
      </Step>

      <Answer>
        <p>
          SIF-201 con SIL 2, sensores TSHH-201 A y B en votación 1oo2 a 140 °C, resolvedor en PLC de seguridad
          independiente, corte de vapor por XV-201 y apertura de enfriamiento por XV-202, tiempo de respuesta menor a 8 s
          y prueba de recorrido anual.
        </p>
      </Answer>

      <Reveal label="Nota sobre la votación 1oo2">
        <p>
          La notación <Ei>{'1\\text{oo}2'}</Ei> significa que basta con que uno de los dos sensores demande el disparo para
          que la función actue. Favorece la seguridad y penaliza la disponibilidad, porque una falla espuria de cualquiera
          de los dos detiene la planta. La votación <Ei>{'2\\text{oo}3'}</Ei> logra lo mejor de ambos objetivos a costa de
          un tercer instrumento, y es la arquitectura habitual cuando el disparo en falso resulta muy costoso.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'El sistema instrumentado de seguridad debe ser independiente del sistema de control porque:',
    options: [
      'Lo exige el fabricante del DCS',
      'El operador no debe poder ver el estado del SIS',
      'El SIS trabaja con señales digitales y el DCS con analogicas',
      'Una falla de causa común podría inutilizar control y protección al mismo tiempo'],
    answer: 3,
    why: 'Si comparten transmisor, lógica o elemento final, un solo fallo elimina dos capas. El modelo de capas de protección pierde todo su sentido si las capas no son independientes entre si.',
  },
  {
    q: 'Una función instrumentada requiere PFD promedio de $3\\times 10^{-3}$. El nivel de integridad correspondiente es:',
    options: ['SIL 1', 'SIL 2', 'SIL 3', 'SIL 4'],
    answer: 1,
    why: 'El intervalo de SIL 2 va de $10^{-3}$ a $10^{-2}$, y $3\\times 10^{-3}$ cae dentro. Corresponde a una reducción de riesgo entre 100 y 1000.',
  },
  {
    q: 'En un HAZOP, la palabra guía aplicada a un parámetro sirve para:',
    options: [
      'Clasificar la severidad de la consecuencia',
      'Generar de forma sistemática desviaciones que el equipo podría no considerar de manera espontanea',
      'Asignar el nivel SIL',
      'Determinar el tiempo de respuesta requerido',
    ],
    answer: 1,
    why: 'La estructura de palabras guía obliga a recorrer todas las formas de desviación sobre cada parámetro de cada nodo. Su valor está en la exhaustividad, no en la clasificación.',
  },
  {
    q: 'Un instrumento se anuncia como certificado SIL 3. La lectura técnicamente correcta es:',
    options: [
      'Cualquier función que lo use será SIL 3',
      'No requiere pruebas de recorrido',
      'Es apto para usarse en funciones hasta SIL 3, dentro de una arquitectura y con un régimen de pruebas definido',
      'Reemplaza la necesidad de un elemento final dedicado'],
    answer: 2,
    why: 'El nivel de integridad pertenece a la función completa, que incluye sensor, lógica y elemento final, con su arquitectura y su frecuencia de prueba. Un componente apto no basta para alcanzar el nivel.',
  },
  {
    q: 'La votación 1oo2 en los sensores de una función de seguridad:',
    options: [
      'Aumenta la disponibilidad y reduce la seguridad',
      'No afecta ninguna de las dos',
      'Aumenta la seguridad y reduce la disponibilidad, porque una falla espuria dispara',
      'Solo se usa en SIL 4'],
    answer: 2,
    why: 'Basta con que uno de los dos sensores demande el disparo. La función actua aunque uno falle sin detectarse, lo que favorece la seguridad, y también dispara si uno falla en falso, lo que penaliza la disponibilidad.',
  },
  {
    q: 'Una alarma que no tiene una acción definida para el operador:',
    options: [
      'No cumple la función de una alarma y debería ser una tendencia',
      'Es aceptable si la variable es importante',
      'Debe elevarse a nivel de enclavamiento',
      'Es obligatoria según ISA 84'],
    answer: 0,
    why: 'Una alarma existe para provocar una acción en un tiempo disponible. Sin acción asociada solo consume la atención del turno y contribuye al fenomeno de inundación de alarmas, que degrada toda la capa del operador.',
  },
];
