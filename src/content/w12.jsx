import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Block, Arrow, Bubble, Sig, ControlValve, HeatExchanger, Flow, Conector, Orifice,
} from '../lib/isa.jsx';

export const meta = {
  id: 'w12',
  week: 13,
  code: 'CP26II-M11',
  title: 'Control de relación y rango partido',
  unit: 'Torre de enfriamiento CT-301',
  lede: 'Dos estrategias que no persiguen un valor sino una proporción o un reparto. Aparecen en toda planta con mezcla, combustion o servicios duales.',
  objectives: [
    'Distinguir las dos configuraciones de control de relación y decir cual es preferible.',
    'Calcular el punto de control de la corriente controlada a partir de la relación deseada.',
    'Diseñar un esquema de rango partido con su tabla de asignación de recorrido.',
    'Reconocer el problema de la zona muerta y de la ganancia desigual en rango partido.',
  ],
  refs: ['shinskey', 'marlin', 'smith', 'perry', 'luyben'],
};

function FigRatio() {
  return (
    <Figure vw={920} vh={400} num="10.1" caption="Configuración recomendada. El flujo salvaje se mide, se multiplica por la relación deseada y el resultado se envía como punto de control al lazo de la corriente controlada, que tiene su propio transmisor.">
      {/* corriente salvaje: se mide y no se manipula */}
      <Sig x1={0} y1={70} x2={330} y2={70} kind="process" color={C.ink} />
      <Flow x={140} y={70} dir="right" s={7} />
      <T x={10} y={52} size={20} color={C.grey} anchor="start">corriente salvaje F_s</T>
      <Orifice cx={230} cy={70} s={16} dir="down" />
      <Bubble cx={230} cy={140} tag="FT" num="301" r={28} tagsize={20} numsize={18} />
      <L x1={208} y1={100} x2={212} y2={112} color={C.ink} w={1.4} />
      <L x1={252} y1={100} x2={248} y2={112} color={C.ink} w={1.4} />
      <Conector x={332} y={70} dir="right" label="a mezcla" />

      {/* cálculo de la relación y controlador */}
      <Sig x1={258} y1={140} x2={312} y2={140} kind="electric" color={C.ink} arrow />
      <Bubble cx={342} cy={140} tag="FY" num="301" r={28} tagsize={20} numsize={18} location="rear" system="computer" />
      <T x={342} y={192} size={19} color={C.mv}>multiplica por R</T>
      <Sig x1={370} y1={140} x2={452} y2={140} kind="software" color={C.mv} arrow />
      <Bubble cx={482} cy={140} tag="FIC" num="302" r={28} tagsize={20} numsize={18} location="room" system="dcs" />

      {/* corriente controlada: transmisor propio y elemento final */}
      <Sig x1={0} y1={268} x2={700} y2={268} kind="process" color={C.ink} />
      <Flow x={120} y={268} dir="right" s={7} />
      <T x={10} y={250} size={20} color={C.grey} anchor="start">corriente controlada F_c</T>
      <Orifice cx={400} cy={268} s={16} dir="down" />
      <Bubble cx={400} cy={338} tag="FT" num="302" r={28} tagsize={20} numsize={18} />
      <L x1={378} y1={298} x2={382} y2={310} color={C.ink} w={1.4} />
      <L x1={422} y1={298} x2={418} y2={310} color={C.ink} w={1.4} />
      <Sig x1={428} y1={338} x2={482} y2={338} kind="electric" color={C.ink} />
      <Sig x1={482} y1={338} x2={482} y2={172} kind="electric" color={C.ink} arrow />
      <ControlValve cx={600} cy={268} s={18} />
      <T x={600} y={312} size={18} color={C.navy} bold>FV-302</T>
      <Sig x1={510} y1={140} x2={600} y2={140} kind="pneumatic" color={C.ink} />
      <Sig x1={600} y1={140} x2={600} y2={228} kind="pneumatic" color={C.ink} arrow />
      <Flow x={660} y={268} dir="right" s={7} />
      <Conector x={702} y={268} dir="right" label="a mezcla" />
    </Figure>
  );
}

function FigSplit() {
  return (
    <Figure vw={820} vh={315} num="10.2" caption="Rango partido. Una sola salida del controlador acciona dos elementos finales en tramos complementarios del recorrido, con una zona de traslape para evitar el hueco de control.">
      <L x1={90} y1={240} x2={760} y2={240} color={C.ink} w={2} />
      <L x1={90} y1={40} x2={90} y2={240} color={C.ink} w={2} />
      <T x={425} y={300} size={21} color={C.ink}>salida del controlador (%)</T>
      <T x={16} y={30} size={21} color={C.ink} anchor="start">apertura</T>
      {[0, 25, 50, 75, 100].map((v, i) => (
        <g key={v}>
          <L x1={90 + i * 167.5} y1={240} x2={90 + i * 167.5} y2={246} color={C.ink} w={1.4} />
          <T x={90 + i * 167.5} y={264} size={19} color={C.grey}>{String(v)}</T>
        </g>
      ))}
      {/* enfriamiento: cierra del 0 al 52 % de la salida */}
      <path d="M90,60 L438,240" fill="none" stroke={C.dist} strokeWidth="3" />
      <T x={150} y={92} size={21} color={C.dist} anchor="start">agua de enfriamiento</T>
      {/* calentamiento: abre desde el 48 %, de modo que ambas se traslapan entre 48 y 52 */}
      <path d="M412,240 L760,60" fill="none" stroke={C.mv} strokeWidth="3" />
      <T x={745} y={92} size={21} color={C.mv} anchor="end">vapor de calentamiento</T>
      <rect x="412" y="40" width="26" height="200" fill="rgba(194,113,28,.12)" />
      <L x1={412} y1={40} x2={412} y2={240} color={C.grey} w={1.2} dash="6,5" />
      <L x1={438} y1={40} x2={438} y2={240} color={C.grey} w={1.2} dash="6,5" />
      <T x={425} y={32} size={19} color={C.grey}>traslape 48 a 52 %</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Control de relación</h2>
      <p>
        Hay procesos donde el objetivo no es un valor absoluto sino una proporción entre dos corrientes. La relación
        aire-combustible en un horno, la relación reflujo-destilado en una columna, la dosificación de biocida en el agua
        de reposición de la torre CT-301 y la relación de reactivos en una alimentación de reactor comparten la misma
        estructura.
      </p>
      <p>
        Una de las dos corrientes se llama <strong>salvaje</strong> porque su flujo lo fija otra parte del proceso y no se
        manipula. La otra es la <strong>controlada</strong>, y su punto de control se calcula para sostener la relación:
      </p>
      <Eq n="10.1">{'R = \\frac{F_c}{F_s} \\quad\\Longrightarrow\\quad F_{c,sp} = R\\,F_s'}</Eq>

      <h3>Las dos configuraciones posibles</h3>
      <Table
        caption="Comparación de configuraciones"
        head={['Configuración', 'Como opera', 'Problema']}
        rows={[
          ['Dividir las medidas', 'Se $\\text{calcula} R \\text{medido} = F_c/F_s$ y un controlador lo lleva a el punto de control de relación', 'La $\\text{ganancia} \\text{del} \\text{lazo} \\text{depende}$ de $F_s$ y $\\text{varía} \\text{con}$ la carga'],
          ['Multiplicar la salvaje', 'Se $\\text{calcula} F_c,sp = R \\cdot F_s$ y un lazo de flujo la sigue', 'Ninguno relevante, es la recomendada'],
        ]}
      />
      <FigRatio />
      <p>
        La razón de preferir la segunda es dinámica. En la configuración por división, la ganancia del proceso visto por el
        controlador vale <Ei>{'1/F_s'}</Ei>, así que a bajo flujo el lazo se vuelve muy sensible y a alto flujo, muy
        lento. La configuración por multiplicación conserva un lazo de flujo ordinario, con ganancia constante.
      </p>

      <Callout kind="warn" title="Error frecuente">
        <p>
          Poner la válvula sobre la corriente salvaje. Si el flujo salvaje se manipula deja de ser salvaje, y el esquema
          pierde sentido. La válvula va siempre sobre la corriente controlada.
        </p>
      </Callout>

      <h3>Relación con corrección por calidad</h3>
      <p>
        La relación fija no garantiza calidad. En un horno, la relación aire-combustible estequiométrica se corrige con la
        medida de oxigeno en gases, que es la que informa sobre la combustion real. La estructura resultante es una
        cascada donde el analizador de oxigeno ajusta lentamente la relación mientras el lazo de relación mantiene la
        proporción instante a instante.
      </p>
      <Eq n="10.2">{'R_{ajustada} = R_{nominal} + \\Delta R(\\%\\,O_2)'}</Eq>

      <h2>Control de rango partido</h2>
      <FigSplit />
      <p>
        Cuando una sola variable controlada necesita dos elementos finales que actuan en sentidos opuestos, la salida del
        controlador se reparte en dos tramos. El caso típico es un reactor que a veces requiere calentamiento y a veces
        enfriamiento, o un tanque cuya presión se sostiene con nitrogeno y se alivia con venteo.
      </p>
      <Table
        caption="Tabla de asignación típica"
        head={['Salida del controlador', 'Válvula de enfriamiento', 'Válvula de calentamiento']}
        rows={[
          ['0 %', 'Abierta 100 %', 'Cerrada'],
          ['48 %', 'Abierta 4 %', 'Cerrada'],
          ['52 %', 'Cerrada', 'Abierta 4 %'],
          ['100 %', 'Cerrada', 'Abierta 100 %'],
        ]}
      />

      <h3>Los dos problemas del rango partido</h3>
      <p>
        <strong>Zona muerta.</strong> Si el reparto se hace exactamente al 50 % sin traslape, existe un intervalo donde
        ninguna válvula está efectivamente abierta, porque toda válvula tiene un umbral por debajo del cual no pasa flujo.
        El controlador mueve su salida y no obtiene respuesta, lo que produce un ciclo permanente. Se resuelve con un
        traslape del 4 al 6 % del recorrido.
      </p>
      <p>
        <strong>Ganancia desigual.</strong> El vapor y el agua de enfriamiento no tienen la misma capacidad por punto de
        apertura. Si la ganancia de un lado es tres veces la del otro, una sola sintonía no puede servir en los dos tramos.
        Se corrige escalando el recorrido de cada válvula o programando la ganancia según el tramo activo, que es el tema
        del módulo siguiente.
      </p>

      <Callout kind="risk" title="Consumo simultaneo">
        <p>
          Un rango partido mal ajustado puede abrir vapor y agua de enfriamiento al mismo tiempo. Además de desperdiciar
          los dos servicios, oculta el sintoma: el lazo parece controlar mientras la planta gasta energía en calentar y
          enfriar a la vez. Se detecta revisando la posición de ambas válvulas, no la variable controlada.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Dosificación de inhibidor en la torre CT-301</h2>
      <Enunciado
        pide={[
          'Calcular el flujo másico de inhibidor puro requerido en condiciones nominales.',
          'Convertirlo a flujo volumétrico de la solución comercial.',
          'Obtener la relación en unidades de ingeniería.',
          'Expresar la relación en porcentaje de rango para configurar el calculador FY-301.',
          'Verificar que el lazo de dosificación opera dentro de un rango util en los dos extremos de carga.',
        ]}
      >
        <p>
          La torre de enfriamiento CT-301 recibe agua de reposición cuyo flujo varía con la carga térmica de la planta,
          entre 8 y 26 m³/h. El inhibidor de corrosión debe mantenerse en 45 ppm sin que el operador intervenga. Hoy la
          dosificación es manual y el laboratorio reporta concentraciones que van de 20 a 90 ppm.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Agua de reposición a la torre: flujo salvaje, entre 8 y 26 m³/h según la carga térmica de la planta.</li>
          <li>Se dosifica inhibidor de corrosión a razón de 45 ppm en masa sobre el agua de reposición.</li>
          <li>El inhibidor se entrega como solución al 30 % en masa, densidad 1.08 kg/L.</li>
          <li>Rango del transmisor de agua FT-301: 0 a 30 m³/h. Rango del de inhibidor FT-302: 0 a 6 L/h.</li>
        </ul>
      </Given>

      <Step n="1" title="Flujo masico de inhibidor requerido">
        <p>Para el flujo nominal de 18 m³/h de agua, equivalente a 18 000 kg/h:</p>
        <Eq>{'\\dot{m}_{inh} = 45\\times 10^{-6}\\times 18\\,000 = 0.81\\ \\text{kg/h de inhibidor puro}'}</Eq>
      </Step>

      <Step n="2" title="Flujo volumétrico de la solución comercial">
        <Eq>{'\\dot{m}_{sol} = \\frac{0.81}{0.30} = 2.70\\ \\text{kg/h de solución}'}</Eq>
        <Eq n="10.3">{'q_{sol} = \\frac{2.70}{1.08} = 2.50\\ \\text{L/h}'}</Eq>
      </Step>

      <Step n="3" title="Relación en unidades de ingeniería">
        <Eq>{'R = \\frac{q_{sol}}{F_{agua}} = \\frac{2.50\\ \\text{L/h}}{18\\ \\text{m}^3/\\text{h}} = 0.1389\\ \\text{L}/\\text{m}^3'}</Eq>
      </Step>

      <Step n="4" title="Relación en porcentaje de rango">
        <p>
          El calculador FY-301 trabaja con señales normalizadas, así que la relación debe expresarse sobre los rangos de
          los dos transmisores:
        </p>
        <Eq n="10.4">{'R_{\\%} = R\\cdot \\frac{\\text{rango de } F_{agua}}{\\text{rango de } q_{sol}} = 0.1389\\cdot \\frac{30}{6} = 0.694'}</Eq>
        <p>
          Verificación: con el agua al 60 % de su rango, es decir 18 m³/h, el punto de control del lazo de inhibidor resulta
          <Ei>{'\\ 0.694 \\times 60 = 41.7\\ \\%'}</Ei> de 6 L/h, esto es 2.50 L/h. Coincide con el paso 2.
        </p>
      </Step>

      <Step n="5" title="Verificar el rango de operación">
        <Table
          caption="Puntos extremos de la operación"
          head={['$Agua (m^3/h)$', '% de FT-301', 'Punto de control (% de FT-302)', 'Inhibidor (L/h)']}
          numeric={[0, 1, 2, 3]}
          rows={[
            ['8', '26.7', '18.5', '1.11'],
            ['18', '60.0', '41.7', '2.50'],
            ['26', '86.7', '60.2', '3.61'],
          ]}
        />
        <p>
          El lazo de inhibidor recorre del 18.5 % al 60.2 % de su rango, lo que deja margen suficiente en ambos extremos.
          Si el mínimo hubiera caido por debajo del 10 %, la bomba dosificadora estaría trabajando en una zona de mala
          repetibilidad y habría que reducir el rango del transmisor.
        </p>
      </Step>

      <Answer>
        <p>
          Relación configurada <Ei>{'R_{\\%} = 0.694'}</Ei> en el calculador FY-301, con FIC-302 como lazo de flujo
          ordinario recibiendo punto de control remoto. El esquema mantiene 45 ppm en todo el rango de carga sin intervención del
          operador.
        </p>
      </Answer>

      <Reveal label="Segundo caso: rango partido en el reactor R-201">
        <p>
          El mismo reactor del módulo de cascada necesita enfriamiento durante la etapa exotérmica y calentamiento durante el
          arranque. Se instala una segunda válvula de agua de enfriamiento sobre la chaqueta.
        </p>
        <p>
          Ganancias medidas: vapor <Ei>{'K_v = 1.4'}</Ei> °C/% de apertura; agua <Ei>{'K_a = -0.52'}</Ei> °C/%. La
          relación de ganancias es 2.7, demasiado alta para una sola sintonía.
        </p>
        <p>
          <strong>Corrección por escalado.</strong> Se limita el recorrido útil de la válvula de vapor de modo que su
          ganancia efectiva por punto de salida del controlador iguale la del agua. Asignando al vapor el tramo de 52 a
          100 % y al agua el de 0 a 48 %, y limitando la apertura máxima del vapor al 37 %:
        </p>
        <Eq>{'K_{v,\\text{efectiva}} = 1.4 \\times \\frac{0.37}{0.48} = 1.08\\ \\text{°C}/\\%\\ \\text{de recorrido}'}</Eq>
        <p>
          Queda todavía el doble de la del agua. La solución completa exige programación de ganancia por tramo, que se
          estudia en el módulo de estrategias selectivas.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'En un esquema de control de relación, la corriente salvaje es:',
    options: [
      'La que lleva la válvula de control',
      'La que se mide con placa de orificio',
      'La de mayor flujo de las dos',
      'Aquella cuyo flujo lo fija otra parte del proceso y no se manipula'],
    answer: 3,
    why: 'La corriente salvaje se mide pero no se controla. Su flujo lo determina otra unidad o la demanda del proceso, y la estrategia consiste en acompanarla proporcionalmente.',
  },
  {
    q: 'La configuración recomendada de control de relación multiplica el flujo salvaje por R en lugar de dividir las dos medidas porque:',
    options: [
      'Requiere un transmisor menos',
      'Conserva un lazo de flujo con ganancia constante, independiente de la carga',
      'Es la única permitida por ISA 5.1',
      'Permite usar controlador proporcional puro',
    ],
    answer: 1,
    why: 'En la configuración por división la ganancia del proceso visto por el controlador vale $1/F_s$, así que cambia con la carga y una sola sintonía deja de servir. La multiplicación evita ese problema.',
  },
  {
    q: 'Se requiere una relación de 0.25 kg de reactivo B por kg de A. El transmisor de A tiene rango 0 a 4000 kg/h y el de B, 0 a 1500 kg/h. La relación configurada en porcentaje de rango es:',
    options: ['0.25', '0.67', '1.50', '0.094'],
    answer: 1,
    why: '$R_\\% = R\\cdot(\\text{rango de A}/\\text{rango de B}) = 0.25\\times(4000/1500) = 0.667$. Omitir la conversión de rangos es el error mas frecuente en este cálculo.',
  },
  {
    q: 'Un esquema de rango partido presenta un ciclo permanente cuando la salida del controlador ronda el 50 %. La causa mas probable es:',
    options: [
      'Ganancia del controlador excesiva',
      'Saturación del integrador',
      'Zona muerta en el punto de cruce, donde ninguna válvula pasa flujo',
      'Ruido en el transmisor'],
    answer: 2,
    why: 'Toda válvula tiene un umbral por debajo del cual no entrega flujo. Sin traslape, el controlador mueve su salida en esa zona y no obtiene respuesta, lo que produce un ciclo. Se corrige con un traslape del 4 al 6 % del recorrido.',
  },
  {
    q: 'En rango partido, las ganancias de los dos elementos finales difieren en un factor de tres. La consecuencia es:',
    options: [
      'La estabilidad se pierde en los dos tramos',
      'El lazo deja de tener error permanente',
      'La zona muerta se duplica',
      'Una sola sintonía será adecuada en un tramo e inadecuada en el otro'],
    answer: 3,
    why: 'La ganancia total del lazo cambia al pasar de un tramo al otro. Se corrige escalando el recorrido de cada válvula o programando la ganancia del controlador según el tramo activo.',
  },
  {
    q: 'La relación aire-combustible de un horno se corrige con la medida de oxigeno en gases porque:',
    options: [
      'El analizador es mas rápido que los transmisores de flujo',
      'La relación fija no garantiza la combustion real, que depende de la composición y del estado de los quemadores',
      'La norma ISA 84 lo exige',
      'Permite prescindir del lazo de relación',
    ],
    answer: 1,
    why: 'La estequiometría calculada supone una composición de combustible y un estado de equipos que cambian con el tiempo. El oxigeno en gases mide el resultado y corrige lentamente la relación, mientras el lazo de relación mantiene la proporción instante a instante.',
  },
];
