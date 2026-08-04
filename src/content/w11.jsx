import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import {
  C, T, L, Block, Arrow, SumPoint, Bubble, Sig, ControlValve, CSTR, Flow, Conector,
} from '../lib/isa.jsx';
import { SimCascade } from '../sims/loop.jsx';

export const meta = {
  id: 'w11',
  week: 12,
  code: 'CP26II-M10',
  title: 'Control en cascada',
  unit: 'Reactor R-201 con chaqueta de vapor',
  lede: 'Un lazo interno rápido intercepta la perturbación antes de que alcance la variable que importa. Es la estrategia avanzada mas usada en planta y la mas barata de implementar.',
  objectives: [
    'Reconocer cuando una perturbación justifica una estructura en cascada.',
    'Elegir la variable secundaria según los tres criterios de selección.',
    'Sintonizar el lazo interno primero y el externo después.',
    'Configurar el traspaso del punto de control y evitar la saturación del lazo interno.',
  ],
  refs: ['shinskey', 'marlin', 'smith', 'seborg', 'luyben'],
};

function FigCascade() {
  return (
    <Figure vw={900} vh={300} num="9.1" caption="La salida del controlador primario deja de ir a la válvula y pasa a ser el punto de control del secundario. La perturbación que entra en el lazo interno se corrige sin que la variable primaria llegue a moverse.">
      <SumPoint cx={118} cy={160} signs={[['+', 'l'], ['-', 'b']]} />
      <T x={10} y={150} size={20} color={C.navy} bold anchor="start">T_sp</T>
      <Arrow x1={58} y1={160} x2={92} y2={160} color={C.navy} head="ahn" />
      <Arrow x1={144} y1={160} x2={168} y2={160} color={C.ink} />
      <Block cx={240} cy={160} w={140} h={62} label="TIC-201" sub="primario" />
      <Arrow x1={310} y1={160} x2={352} y2={160} color={C.mv} head="ahm" />
      <SumPoint cx={386} cy={160} r={22} signs={[['+', 'l'], ['-', 'b']]} />
      <T x={386} y={112} size={19} color={C.mv}>punto de control remoto</T>
      <Arrow x1={408} y1={160} x2={452} y2={160} color={C.ink} />
      <Block cx={524} cy={160} w={140} h={62} label="FIC-202" sub="secundario" fill={C.white} stroke={C.dist} />
      <Arrow x1={594} y1={160} x2={636} y2={160} color={C.ink} />
      <Block cx={706} cy={160} w={130} h={62} label="Válvula" />
      <Arrow x1={771} y1={160} x2={806} y2={160} color={C.ink} />
      <Block cx={862} cy={160} w={70} h={62} label="P" fill={C.pale} />
      <T x={630} y={62} size={21} color={C.dist} anchor="middle">perturbación de presión de vapor</T>
      <Arrow x1={630} y1={76} x2={706} y2={126} color={C.dist} head="ahd" />
      <L x1={706} y1={196} x2={706} y2={238} color={C.ink} w={2} />
      <L x1={706} y1={238} x2={386} y2={238} color={C.ink} w={2} />
      <L x1={386} y1={238} x2={386} y2={186} color={C.ink} w={2} />
      <T x={546} y={258} size={19} color={C.grey}>medida secundaria, rápida</T>
      <L x1={862} y1={196} x2={862} y2={276} color={C.ink} w={2} />
      <L x1={862} y1={276} x2={95} y2={276} color={C.ink} w={2} />
      <L x1={95} y1={276} x2={95} y2={186} color={C.ink} w={2} />
      <T x={300} y={296} size={19} color={C.grey}>medida primaria, lenta</T>
    </Figure>
  );
}

function FigPIDCascade() {
  return (
    <Figure vw={840} vh={430} num="9.2" caption="La misma estructura sobre el P&ID. FIC-202 recibe su punto de control de TIC-201 y no del operador, y esa relación se dibuja con el enlace de software entre las dos burbujas.">
      {/* cabezal de vapor hacia la chaqueta */}
      <Sig x1={840} y1={55} x2={255} y2={55} kind="process" color={C.ink} />
      <Flow x={547.5} y={55} dir="left" s={7} />
      <T x={790} y={37} size={21} color={C.grey} anchor="end">vapor</T>
      <ControlValve cx={600} cy={55} s={20} />
      <L x1={255} y1={55} x2={255} y2={182} color={C.ink} w={3.8} />
      <Flow x={255} y={118.5} dir="down" s={7} />

      {/* reactor */}
      <Sig x1={0} y1={128} x2={112} y2={128} kind="process" color={C.ink} />
      <Flow x={64} y={128} dir="right" s={7} />
      <T x={8} y={110} size={19} color={C.grey} anchor="start">alimentación</T>
      <L x1={112} y1={128} x2={112} y2={177} color={C.ink} w={3.8} />
      <Flow x={112} y={158} dir="down" s={6} />
      <CSTR cx={170} cy={250} w={140} h={170} level={0.6} jacket />
      <L x1={170} y1={335} x2={170} y2={390} color={C.ink} w={3.8} />
      <Flow x={170} y={370} dir="down" s={7} />
      <Sig x1={170} y1={390} x2={620} y2={390} kind="process" color={C.ink} />
      <Flow x={300} y={390} dir="right" s={7} />
      <Conector x={622} y={390} dir="right" label="a T-401" />
      <T x={266} y={286} size={22} color={C.navy} bold anchor="start">R-201</T>

      {/* lazo secundario de flujo */}
      <Bubble cx={420} cy={120} tag="FT" num="202" r={29} tagsize={21} numsize={19} />
      <L x1={420} y1={89} x2={420} y2={57} color={C.ink} w={1.6} />
      <Sig x1={420} y1={149} x2={420} y2={184} kind="electric" color={C.ink} arrow />
      <Bubble cx={420} cy={215} tag="FIC" num="202" r={30} tagsize={21} numsize={19} location="room" system="dcs" />

      {/* salida del secundario hacia el actuador */}
      <Sig x1={451} y1={215} x2={700} y2={215} kind="pneumatic" color={C.ink} />
      <Sig x1={700} y1={215} x2={700} y2={14} kind="pneumatic" color={C.ink} />
      <Sig x1={700} y1={14} x2={623} y2={14} kind="pneumatic" color={C.ink} arrow />

      {/* lazo primario de temperatura */}
      <Bubble cx={300} cy={310} tag="TT" num="201" r={29} tagsize={21} numsize={19} />
      <L x1={271} y1={310} x2={240} y2={310} color={C.ink} w={1.6} />
      <Sig x1={331} y1={310} x2={389} y2={310} kind="electric" color={C.ink} arrow />
      <Bubble cx={420} cy={310} tag="TIC" num="201" r={30} tagsize={21} numsize={19} location="room" system="dcs" />
      <Sig x1={420} y1={280} x2={420} y2={247} kind="software" color={C.mv} arrow />
      <T x={462} y={268} size={19} color={C.mv} anchor="start">punto de control remoto</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>El problema que resuelve</h2>
      <p>
        El reactor R-201 se calienta con vapor en la chaqueta. La temperatura de reacción responde con
        <Ei>{'\\ \\tau\\approx 20'}</Ei> min. La presión del cabezal de vapor cambia cada vez que otra unidad de la
        planta demanda vapor, y ese cambio altera el flujo que entrega la válvula aunque su apertura no se haya movido.
      </p>
      <p>
        Con un solo lazo de temperatura, la secuencia es: cambia la presión, cambia el flujo de vapor, cambia el aporte
        de calor, cambia la temperatura del reactor y solo entonces el controlador se entera. Han pasado varios minutos y
        la temperatura ya se desvio.
      </p>

      <h2>La estructura en cascada</h2>
      <FigCascade />
      <p>
        La cascada agrega un lazo interno sobre una variable intermedia que reacciona rápido a la perturbación. El
        controlador primario deja de enviar su salida a la válvula y pasa a enviarla como <strong>punto de control</strong> del
        secundario.
      </p>
      <Table
        caption="Reparto de responsabilidades"
        head={['Lazo', 'Variable', 'Velocidad', 'Que corrige']}
        rows={[
          ['Primario (maestro)', 'Temperatura del reactor', 'Lenta', 'La calidad del producto, el objetivo real'],
          ['Secundario (esclavo)', 'Flujo o temperatura de chaqueta', 'Rápida', 'Las perturbaciones que entran por el servicio'],
        ]}
      />
      <FigPIDCascade />

      <h2>Criterios para elegir la variable secundaria</h2>
      <ol>
        <li>
          <strong>Debe ser mas rápida que la primaria.</strong> La referencia práctica es que
          <Ei>{'\\ \\tau_1/\\tau_2 \\geq 5'}</Ei>. Con relaciones menores los dos lazos interfieren y la cascada aporta poco.
        </li>
        <li>
          <strong>Debe recibir la perturbación antes que la primaria.</strong> Si la carga entra por otro camino, el lazo
          interno no la ve y la estructura no sirve.
        </li>
        <li>
          <strong>Debe existir una relación causal clara con la manipulada.</strong> La válvula tiene que influir sobre la
          secundaria de forma directa y monotona.
        </li>
      </ol>

      <Callout kind="note" title="Elecciones habituales de variable secundaria">
        <p>
          Flujo del servicio, cuando la perturbación viene de la presión del cabezal. Temperatura de la chaqueta, cuando
          la perturbación viene de la temperatura del servicio. Presión de vapor en la coraza, en intercambiadores con
          condensación. Posición del vástago, que es lo que hace un posicionador y constituye la cascada mas pequeña
          que existe.
        </p>
      </Callout>

      <h2>Sintonía: siempre de adentro hacia afuera</h2>
      <ol>
        <li>
          <strong>Lazo interno primero.</strong> Con el primario en manual, se sintoniza el secundario de forma agresiva.
          Suele bastar con PI, y muchas veces con P solo, porque el primario aportara la acción integral del conjunto.
        </li>
        <li>
          <strong>Lazo externo después.</strong> Con el secundario ya en automático, se identifica el proceso visto desde
          el punto de control del secundario y se sintoniza el primario con la regla habitual.
        </li>
      </ol>
      <p>
        El orden es obligatorio. Sintonizar el primario sobre un secundario mal ajustado produce parámetros que dejaran de
        servir en cuánto el interno se corrija.
      </p>

      <Callout kind="warn" title="Saturación del lazo interno">
        <p>
          Si el secundario llega a su límite, el primario sigue subiendo su punto de control sin obtener respuesta y su integrador
          se satura. La solución es la retroalimentación de estado del esclavo hacia el maestro, que en los sistemas
          comerciales aparece como inicialización externa o como seguimiento del punto de control. Sin ella, la cascada hereda el
          mismo problema de windup que se estudio en el módulo de sintonía.
        </p>
      </Callout>

      <h2>Que gana y que cuesta</h2>
      <Table
        caption="Balance de la estrategia"
        head={['Ventaja', 'Costo']}
        rows={[
          ['Rechaza las perturbaciones del servicio antes de que afecten la variable primaria', 'Requiere un transmisor adicional'],
          ['Linealiza el elemento final, porque el lazo interno compensa la característica de la válvula', 'Dos controladores que sintonizar y mantener'],
          ['Permite subir la ganancia del lazo primario', 'La operación se vuelve menos evidente para el turno'],
          ['Detecta problemas de la válvula sin afectar la variable primaria', 'Un secundario mal sintonizado empeora el conjunto'],
        ]}
      />
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Cascada frente a lazo simple, con la misma perturbación</h2>
      <p>
        Aplica la misma carga en las dos arquitecturas y compara la desviación máxima de la temperatura. En lazo simple la
        variable secundaria se desvia y arrastra a la primaria; en cascada, el lazo interno la devuelve a su punto de control antes
        de que el reactor lo note.
      </p>
      <SimCascade />
      <Callout kind="note" title="Experimento sugerido">
        <p>
          Baja la ganancia del secundario hasta 0.6 y vuelve a aplicar la perturbación. Con un lazo interno lento la
          cascada pierde casi toda su ventaja, y esa es la demostración práctica del criterio
          <Ei>{'\\ \\tau_1/\\tau_2 \\geq 5'}</Ei>.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Diseño de la cascada del reactor R-201</h2>
      <Enunciado
        pide={[
          'Verificar que se cumple el criterio de velocidad entre los dos lazos.',
          'Sintonizar el lazo secundario de flujo.',
          'Obtener el proceso equivalente que ve el lazo primario con el secundario ya cerrado.',
          'Sintonizar el lazo primario de temperatura.',
          'Comparar con la sintonía del lazo simple y cuantificar lo que aporta la cascada.',
        ]}
      >
        <p>
          La presión del cabezal de vapor cambia varias veces por turno porque otras unidades de la planta demandan
          vapor, y la temperatura del reactor lo resiente aunque la válvula no se haya movido. Se evalúa pasar el lazo a
          cascada usando el flujo de vapor como variable secundaria.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Temperatura del reactor: <Ei>{'G_1 = 1.4/(20 s + 1)'}</Ei>, en % de rango sobre % de flujo de vapor.</li>
          <li>Flujo de vapor visto desde la válvula: <Ei>{'G_2 = 1.2/(2.2 s + 1)'}</Ei>, en % sobre % de apertura.</li>
          <li>La presión del cabezal cambia en escalones de hasta 12 %, con frecuencia de varias veces por turno.</li>
          <li>La perturbación afecta directamente al flujo de vapor con ganancia unitaria.</li>
        </ul>
      </Given>

      <Step n="1" title="Verificar el criterio de velocidad">
        <Eq>{'\\frac{\\tau_1}{\\tau_2} = \\frac{20}{2.2} = 9.1'}</Eq>
        <p>La relación supera 5 con holgura, así que la cascada está justificada.</p>
      </Step>

      <Step n="2" title="Sintonizar el lazo secundario">
        <p>
          El lazo de flujo es de primer orden sin tiempo muerto apreciable. Se usa PI con IMC y
          <Ei>{'\\ \\lambda_2 = \\tau_2/3'}</Ei>, criterio habitual para lazos internos:
        </p>
        <Eq>{'K_{c2} = \\frac{1}{K_2}\\cdot \\frac{\\tau_2}{\\lambda_2} = \\frac{1}{1.2}\\cdot \\frac{2.2}{0.733} = 2.50'}</Eq>
        <Eq>{'\\tau_{I2} = \\tau_2 = 2.2\\ \\text{min}'}</Eq>
      </Step>

      <Step n="3" title="Proceso visto por el lazo primario">
        <p>
          Con el secundario cerrado, la relación entre su punto de control y su medida es de primer orden con constante de tiempo
          igual a <Ei>{'\\lambda_2'}</Ei> y ganancia unitaria:
        </p>
        <Eq n="9.1">{'\\frac{F_{vapor}}{F_{sp}} = \\frac{1}{0.733 s + 1}'}</Eq>
        <p>El primario ve entonces la serie de ese lazo cerrado con el proceso térmico:</p>
        <Eq>{'G_{1,eq} = \\frac{1.4}{(20 s + 1)(0.733 s + 1)}'}</Eq>
        <p>
          Tomando el polo rápido completo como tiempo muerto equivalente, criterio conservador que evita subestimar el
          retardo del lazo secundario, resulta <Ei>{'\\ \\theta_{eq} \\approx 0.73'}</Ei> min y{' '}
          <Ei>{'\\tau_{eq} \\approx 20'}</Ei> min. La regla de la semisuma daría la mitad de ese retardo, 0.37 min, y
          una sintonía más agresiva.
        </p>
      </Step>

      <Step n="4" title="Sintonizar el lazo primario">
        <p>Con IMC y <Ei>{'\\lambda_1 = 3\\theta_{eq} = 2.2'}</Ei> min, que es una elección conservadora para un reactor:</p>
        <Eq>{'K_{c1} = \\frac{1}{1.4}\\cdot \\frac{20 + 0.37}{2.2 + 0.37} = \\frac{1}{1.4}\\cdot \\frac{20.37}{2.57} = 5.66'}</Eq>
        <Eq>{'\\tau_{I1} = 20 + 0.37 = 20.4\\ \\text{min}'}</Eq>
      </Step>

      <Step n="5" title="Comparar con el lazo simple">
        <p>
          Sin cascada, el primario ve el proceso completo <Ei>{'1.4 \\times 1.2/[(20s+1)(2.2s+1)]'}</Ei>, con
          <Ei>{'\\ \\theta_{eq} \\approx 2.2'}</Ei> min. Aplicando la misma regla con
          <Ei>{'\\ \\lambda = 3\\theta_{eq} = 6.6'}</Ei> min:
        </p>
        <Eq>{'K_{c,simple} = \\frac{1}{1.68}\\cdot \\frac{21.1}{7.7} = 1.63'}</Eq>
        <p>
          La cascada permite triplicar la ganancia efectiva del lazo primario, porque el interno ya elimino el retardo
          asociado a la dinámica de la válvula y del flujo.
        </p>
      </Step>

      <Answer>
        <p>
          Secundario FIC-202: <Ei>{'K_{c2} = 2.50'}</Ei>, <Ei>{'\\tau_{I2} = 2.2'}</Ei> min.
          Primario TIC-201: <Ei>{'K_{c1} = 5.66'}</Ei>, <Ei>{'\\tau_{I1} = 20.4'}</Ei> min, con salida escalada al rango
          del transmisor de flujo y con inicialización externa habilitada.
        </p>
      </Answer>

      <Reveal label="Detalle de configuración que se olvida con frecuencia">
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            La salida del primario se expresa en porcentaje y debe convertirse al rango de ingeniería del transmisor
            secundario. Si FT-202 está calibrado de 0 a 5000 kg/h, una salida de 60 % del TIC-201 equivale a un punto de control
            de 3000 kg/h. Un error de escalado en ese punto produce un lazo que parece mal sintonizado y en realidad esta
            pidiendo puntos de control imposibles.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'La condición práctica que debe cumplir una estructura en cascada es:',
    options: [
      'Que las dos variables tengan la misma velocidad',
      'Que ambos lazos usen controlador PID completo',
      'Que el lazo primario sea mas rápido que el secundario',
      'Que el lazo secundario sea al menos cinco veces mas rápido que el primario'],
    answer: 3,
    why: 'Si el interno no es claramente mas rápido, los dos lazos interactuan y la cascada deja de aportar. La referencia habitual es una relación de constantes de tiempo de cinco o mas.',
  },
  {
    q: 'En una cascada, la salida del controlador primario es:',
    options: [
      'El punto de control del controlador secundario',
      'La señal directa a la válvula',
      'La medida del secundario',
      'Una alarma sobre el lazo interno'],
    answer: 0,
    why: 'Esa es exactamente la definición de la estructura. El primario deja de mandar sobre el elemento final y pasa a mandar sobre el objetivo del lazo interno.',
  },
  {
    q: 'El orden correcto de sintonía de una cascada es:',
    options: [
      'Primario primero, luego secundario',
      'Secundario primero con el primario en manual, luego el primario',
      'Los dos al mismo tiempo',
      'Es indiferente si ambos son PI',
    ],
    answer: 1,
    why: 'El primario ve el lazo interno ya cerrado como parte de su proceso. Sintonizarlo antes produce parámetros que dejaran de ser validos en cuánto el interno cambie.',
  },
  {
    q: 'Una perturbación de presión en el cabezal de vapor afecta al reactor. La variable secundaria adecuada es:',
    options: [
      'La temperatura de la corriente de producto',
      'El nivel del reactor',
      'El flujo de vapor a la chaqueta',
      'La composición de la alimentación'],
    answer: 2,
    why: 'El flujo de vapor recibe la perturbación de forma inmediata, responde rápido y depende de forma directa de la apertura de la válvula. Cumple los tres criterios de selección.',
  },
  {
    q: 'Si el lazo secundario se satura y el primario no tiene inicialización externa, ocurre que:',
    options: [
      'El secundario deja de responder pero el primario no se ve afectado',
      'La cascada se desconecta automáticamente',
      'El integrador del primario se satura pidiendo puntos de control que el interno no puede alcanzar',
      'La variable primaria queda sin control integral'],
    answer: 2,
    why: 'Es el mismo fenomeno de windup del módulo de sintonía, trasladado a la cascada. El primario sigue acumulando error sobre un punto de control inalcanzable, y al liberarse produce un sobrepaso grande.',
  },
  {
    q: 'Un beneficio adicional de la cascada, mas alla del rechazo de perturbaciones, es:',
    options: [
      'Linealiza el elemento final, porque el lazo interno compensa su característica',
      'Elimina la necesidad de dimensionar la válvula',
      'Reduce el tiempo muerto del proceso primario',
      'Permite prescindir del transmisor primario'],
    answer: 0,
    why: 'El lazo interno controla el flujo, no la apertura, así que la relación entre el punto de control del secundario y el flujo real es lineal aunque la válvula no lo sea. El primario deja de ver la deformación de la característica instalada.',
  },
];
