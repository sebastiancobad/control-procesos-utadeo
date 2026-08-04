import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow, SumPoint, Bubble, Sig, HeatExchanger, ControlValve } from '../lib/isa.jsx';
import { SimDisturbance } from '../sims/loop.jsx';

export const meta = {
  id: 'w08',
  week: 9,
  code: 'CP26II-M08',
  title: 'Análisis de perturbaciones y acción anticipativa',
  unit: 'Reactor R-201',
  lede: 'La realimentación espera al error. Cuando la carga es grande, medible y rápida, conviene actuar antes de que el error aparezca.',
  objectives: [
    'Escribir las funciones de transferencia de lazo cerrado para punto de control y para carga.',
    'Explicar por que una sintonía buena para servo puede ser mala para regulador.',
    'Deducir el compensador anticipativo ideal y reconocer cuando es irrealizable.',
    'Justificar por que el feedforward siempre se acompana de realimentación.',
  ],
  refs: ['smith', 'marlin', 'shinskey', 'seborg', 'steph'],
};

function FigFF() {
  return (
    <Figure vw={880} vh={330} num="7.1" caption="Estructura combinada. El compensador anticipativo actua sobre la carga medida; la realimentación se queda con lo que el modelo no alcanzo a predecir.">
      <T x={70} y={40} size={22} color={C.dist} anchor="start">carga d</T>
      <L x1={70} y1={54} x2={70} y2={92} color={C.dist} w={2} />
      <L x1={70} y1={92} x2={330} y2={92} color={C.dist} w={2} />
      <Arrow x1={330} y1={92} x2={392} y2={92} color={C.dist} head="ahd" />
      <Block cx={470} cy={92} w={166} h={62} label="G_d" sub="efecto de la carga" fill={C.white} stroke={C.dist} />
      <L x1={70} y1={92} x2={70} y2={168} color={C.dist} w={2} />
      <Arrow x1={70} y1={168} x2={152} y2={168} color={C.dist} head="ahd" />
      <Block cx={238} cy={168} w={168} h={62} label="G_ff" sub="anticipativo" fill={C.white} stroke={C.mv} />

      <SumPoint cx={120} cy={258} r={26} signs={[['+', 'l'], ['-', 'b']]} />
      <T x={12} y={248} size={20} color={C.navy} bold anchor="start">y_sp</T>
      <Arrow x1={62} y1={258} x2={94} y2={258} color={C.navy} head="ahn" />
      <Arrow x1={148} y1={258} x2={196} y2={258} color={C.ink} />
      <Block cx={282} cy={258} w={160} h={62} label="G_c" sub="PID" />
      <Arrow x1={362} y1={258} x2={404} y2={258} color={C.ink} />
      <SumPoint cx={438} cy={258} r={22} signs={[['+', 'l'], ['+', 't']]} />
      <L x1={322} y1={168} x2={438} y2={168} color={C.mv} w={2} />
      <Arrow x1={438} y1={168} x2={438} y2={232} color={C.mv} head="ahm" />
      <Arrow x1={460} y1={258} x2={520} y2={258} color={C.ink} />
      <Block cx={606} cy={258} w={172} h={62} label="G_p" sub="proceso" />
      <Arrow x1={692} y1={258} x2={742} y2={258} color={C.ink} />
      <SumPoint cx={776} cy={258} r={22} signs={[['+', 'l'], ['+', 't']]} />
      <Arrow x1={470} y1={123} x2={470} y2={200} color={C.dist} head="ahd" />
      <L x1={470} y1={200} x2={776} y2={200} color={C.dist} w={2} />
      <Arrow x1={776} y1={200} x2={776} y2={232} color={C.dist} head="ahd" />
      <Arrow x1={798} y1={258} x2={856} y2={258} color={C.navy} head="ahn" />
      <T x={856} y={244} size={22} color={C.navy} bold anchor="end">y</T>
      <L x1={840} y1={258} x2={840} y2={322} color={C.ink} w={2} />
      <L x1={840} y1={322} x2={120} y2={322} color={C.ink} w={2} />
      <L x1={120} y1={322} x2={120} y2={284} color={C.ink} w={2} />
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Las dos funciones de transferencia del lazo cerrado</h2>
      <p>
        Un lazo cerrado responde a dos entradas independientes. Aplicando algebra de bloques al diagrama con
        realimentación unitaria se obtiene:
      </p>
      <Eq n="7.1">{'\\frac{Y(s)}{Y_{sp}(s)} = \\frac{G_c G_v G_p}{1 + G_c G_v G_p G_m} \\qquad\\text{(servo)}'}</Eq>
      <Eq n="7.2">{'\\frac{Y(s)}{D(s)} = \\frac{G_d}{1 + G_c G_v G_p G_m} \\qquad\\text{(regulador)}'}</Eq>
      <p>
        Las dos comparten el mismo denominador, y por eso comparten la misma condición de estabilidad. Los numeradores
        son distintos, y por eso el desempeño frente a punto de control y frente a carga no coincide.
      </p>

      <Callout kind="note" title="Lo que se lee en esas dos expresiones">
        <p>
          Si el producto <Ei>{'G_c G_v G_p G_m'}</Ei> es grande, el cociente de la segunda expresión se hace pequeño:
          la carga se rechaza mejor. La acción integral consigue exactamente eso a frecuencia cero, y por eso elimina el
          error permanente frente a perturbaciones sostenidas.
        </p>
      </Callout>

      <h2>Servo y regulador piden sintonias distintas</h2>
      <p>
        En modo servo la entrada llega por delante del controlador. En modo regulador la perturbación entra dentro del
        proceso, casi siempre después del elemento final, y la corrección debe recorrer todo el lazo antes de tener efecto.
        La consecuencia práctica es que un lazo ajustado para seguir puntos de control con poco sobrepaso suele rechazar cargas
        con lentitud.
      </p>
      <Table
        caption="Como se ajusta cada objetivo"
        head={['Objetivo dominante', 'Ganancia', 'Tiempo integral', 'Recurso adicional']}
        rows={[
          ['Seguir el punto de control sin sobrepaso', 'Moderada', 'Largo', 'Ponderación del punto de control, factor beta'],
          ['Rechazar cargas rápido', 'Alta', 'Corto', 'Acción anticipativa sobre la carga medida'],
        ]}
      />
      <p>
        La ponderación del punto de control resuelve el conflicto sin sacrificar ninguno de los dos. El término proporcional actua
        sobre <Ei>{'\\beta\\,y_{sp} - y'}</Ei> con <Ei>{'\\beta'}</Ei> entre 0 y 1, mientras el integral sigue actuando
        sobre el error completo. Así se sintoniza agresivo para carga sin que el cambio en el punto de control produzca un salto.
      </p>

      <h2>Compensación anticipativa</h2>
      <FigFF />
      <p>
        Si la perturbación se puede medir, cabe actuar sobre el elemento final antes de que la variable controlada se mueva.
        Para que el efecto de la carga se cancele en la salida se exige
      </p>
      <Eq n="7.3">{'G_d + G_{ff}\\,G_v\\,G_p = 0 \\quad\\Longrightarrow\\quad G_{ff} = -\\frac{G_d}{G_v\\,G_p}'}</Eq>
      <p>
        Con modelos de primer orden con tiempo muerto para cada trayecto, la expresión se vuelve concreta:
      </p>
      <Eq n="7.4">{'G_{ff}(s) = -\\frac{K_d}{K_p}\\cdot \\frac{\\tau_p s + 1}{\\tau_d s + 1}\\cdot e^{-(\\theta_d - \\theta_p)s}'}</Eq>
      <p>
        El primer factor es la <strong>ganancia estática</strong> del compensador. El segundo es un adelanto-retardo que
        ajusta la dinámica. El tercero es un retardo puro, y solo es realizable si <Ei>{'\\theta_d \\geq \\theta_p'}</Ei>.
      </p>

      <Callout kind="warn" title="Cuando el compensador ideal no se puede construir">
        <p>
          Si la carga llega a la variable controlada mas rápido de lo que llega la acción del elemento final, la
          cancelación exacta exigiría predecir el futuro. En ese caso se implementa solo la parte realizable, típicamente
          la ganancia estática con un adelanto-retardo, y se acepta una compensación parcial.
        </p>
      </Callout>

      <h2>Por que el feedforward nunca va solo</h2>
      <p>
        La compensación anticipativa depende por completo del modelo. Errores en <Ei>{'K_d'}</Ei> o en
        <Ei>{'\\ K_p'}</Ei>, ensuciamiento del intercambiador, cambio de carga o deriva del transmisor de la
        perturbación producen una cancelación incompleta que nadie detecta, porque el compensador no mide la variable
        controlada. Además solo corrige las perturbaciones que se midieron.
      </p>
      <p>
        Por eso la estructura industrial estándar suma las dos acciones. El anticipativo se encarga del grueso y de la
        rapidez; la realimentación se queda con el residuo y con todo lo que nadie previo. Es la única que garantiza
        error cero en estado estacionario.
      </p>

      <h2>Casos donde el anticipativo se justifica</h2>
      <ul>
        <li>La perturbación es <strong>grande</strong> y frecuente frente a la tolerancia de la variable controlada.</li>
        <li>La perturbación es <strong>medible</strong> con un instrumento confiable y económico.</li>
        <li>El lazo realimentado es <strong>lento</strong>, por tiempo muerto alto o constante de tiempo grande.</li>
        <li>Existe un modelo razonable del efecto de la carga, aunque sea aproximado.</li>
      </ul>
      <p>
        Los ejemplos clasicos son el flujo y la temperatura de alimentación en una columna de destilación, el flujo de
        proceso en un intercambiador y la carga térmica en un reactor exotérmico.
      </p>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Servo, regulador y el efecto del anticipativo</h2>
      <p>
        Cambia primero el escenario entre servo y regulador con la misma sintonía, y compara la forma de las dos respuestas.
        Después, en modo regulador, activa la acción anticipativa y observa cuánto baja la desviación máxima sin tocar
        <Ei>{'\\ K_c'}</Ei> ni <Ei>{'\\tau_I'}</Ei>.
      </p>
      <SimDisturbance />
      <Callout kind="note" title="Lo que hay que notar">
        <p>
          El feedforward reduce la desviación máxima sin modificar la estabilidad del lazo, porque actua fuera del
          camino de realimentación. El denominador de la ecuación 7.2 no cambia, y eso significa que la compensación
          anticipativa nunca desestabiliza un lazo estable.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Anticipativo sobre el reactor R-201</h2>
      <Enunciado
        pide={[
          'Estimar la desviación que produce la carga sin compensación y verificar que el caso justifica un anticipativo.',
          'Calcular la ganancia estática del compensador y verificar su signo contra la fisica del proceso.',
          'Obtener la parte dinámica y decidir si el compensador ideal es realizable.',
          'Estimar la compensación alcanzada y definir la estructura final del lazo.',
        ]}
      >
        <p>
          El flujo de alimentación fría al reactor cambia varias veces por turno en escalones de hasta 15 %, y la
          temperatura se sale de tolerancia antes de que la realimentación alcance a corregir. Operaciones ya subió la
          ganancia del TIC dos veces sin resultado. Se evalúa medir la carga y actuar antes de que el error aparezca.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Reactor encamisado. Variable controlada: temperatura de reacción, medida por TT-201.</li>
          <li>Manipulada: apertura de la válvula de vapor a la chaqueta.
            <Ei>{'\\ G_p = 1.9\\,e^{-1.2 s}/(14 s + 1)'}</Ei>, en % de rango sobre % de salida, tiempo en minutos.</li>
          <li>Perturbación: flujo de alimentación fría, medido por FT-203.
            <Ei>{'\\ G_d = -2.6\\,e^{-0.5 s}/(9 s + 1)'}</Ei>, en % de rango sobre % de flujo.</li>
          <li>El flujo de alimentación cambia en escalones de hasta 15 % varias veces por turno.</li>
          <li>Tolerancia de la temperatura: 1.5 % del rango.</li>
        </ul>
      </Given>

      <Step n="1" title="Estimar la desviación sin compensación">
        <p>Con el lazo en manual, un escalon de 15 % en la carga desplaza la temperatura en estado estacionario:</p>
        <Eq>{'\\Delta y = K_d\\,\\Delta d = -2.6 \\times 15 = -39\\ \\%'}</Eq>
        <p>
          La realimentación terminara corrigiendo, pero durante los primeros minutos la desviación será de varios puntos
          porcentuales, muy por encima de la tolerancia de 1.5 %. El caso cumple los cuatro criterios para justificar
          acción anticipativa.
        </p>
      </Step>

      <Step n="2" title="Ganancia estática del compensador">
        <Eq n="7.5">{'K_{ff} = -\\frac{K_d}{K_p} = -\\frac{-2.6}{1.9} = 1.37'}</Eq>
        <p>
          El signo positivo significa que un aumento del flujo frio debe abrir la válvula de vapor. Es coherente con la
          física: mas alimentación fría exige mas calor.
        </p>
      </Step>

      <Step n="3" title="Parte dinámica">
        <Eq>{'G_{ff}(s) = 1.37\\cdot \\frac{14 s + 1}{9 s + 1}\\cdot e^{-(0.5 - 1.2)s}'}</Eq>
        <p>
          El exponente resulta positivo, <Ei>{'e^{+0.7 s}'}</Ei>, que corresponde a un predictor. No es realizable, y la
          razón física es clara: la carga alcanza la temperatura 0.7 min antes de que la acción del vapor pueda llegar.
          Se descarta ese factor y se conserva el adelanto-retardo:
        </p>
        <Eq n="7.6">{'G_{ff}(s) = 1.37\\cdot \\frac{14 s + 1}{9 s + 1}'}</Eq>
      </Step>

      <Step n="4" title="Verificar el efecto del adelanto-retardo">
        <p>
          La relación de constantes es <Ei>{'14/9 = 1.56'}</Ei>, mayor que uno, así que el compensador aporta adelanto:
          responde con un pico inicial de <Ei>{'1.37 \\times 1.56 = 2.14'}</Ei> y decae hasta su ganancia estática de 1.37.
          Ese pico compensa que la acción del vapor es mas lenta que el efecto de la carga.
        </p>
      </Step>

      <Step n="5" title="Estimar la compensación alcanzada">
        <p>
          Sin el retardo puro, la cancelación es incompleta durante los primeros 0.7 min. Una estimación conservadora
          asume que la compensación elimina entre 80 % y 90 % del efecto de la carga:
        </p>
        <Eq>{'\\Delta y_{residual} \\approx 0.15 \\times 39 = 5.9\\ \\%\\ \\text{en estado estacionario sin realimentación}'}</Eq>
        <p>
          Ese residuo lo absorbe el PID, que ahora enfrenta una perturbación equivalente seis veces menor. La desviación
          transitoria cae por debajo de la tolerancia.
        </p>
      </Step>

      <Answer>
        <p>
          Se implementa <Ei>{'G_{ff} = 1.37\\,(14 s + 1)/(9 s + 1)'}</Ei>, sumado a la salida del TIC-201 antes del
          elemento final. Se conserva el PID realimentado con su sintonía, que ahora solo corrige el residuo del modelo
          y las perturbaciones no medidas.
        </p>
      </Answer>

      <Reveal label="Como se pone en marcha en planta">
        <div className="callout plant">
          <span className="kicker">En planta</span>
          <p>
            El compensador se arranca con la ganancia estática en cero y se sube por pasos mientras se provocan cambios
            controlados en la carga. Solo cuando la ganancia está bien ajustada se activa el adelanto-retardo. Poner los
            dos a la vez impide saber cual de los dos causa una respuesta indeseada.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Las funciones de transferencia servo y regulador de un mismo lazo comparten:',
    options: ['El numerador', 'La ganancia estática', 'El denominador, y por tanto la condición de estabilidad', 'Nada, son independientes'],
    answer: 2,
    why: 'Ambas tienen $1 + G_cG_vG_pG_m$ en el denominador. Por eso la estabilidad del lazo es una sola propiedad, mientras el desempeño frente a punto de control y frente a carga puede ser muy distinto.',
  },
  {
    q: 'El compensador anticipativo ideal resulta $G_{ff} = -K_d/K_p \\cdot (\\tau_p s+1)/(\\tau_d s+1)\\cdot e^{-(\\theta_d-\\theta_p)s}$. Es irrealizable cuando:',
    options: [
      '$\\theta_d < \\theta_p$, porque exigiría predecir la perturbación',
      '$\\tau_p > \\tau_d$',
      '$K_d$ y $K_p$ tienen el mismo signo',
      'La perturbación no es un escalon'],
    answer: 0,
    why: 'Si el tiempo muerto de la carga es menor que el del proceso, el exponente queda positivo y corresponde a un predictor. Se implementa solo la parte realizable y se acepta compensación parcial durante ese intervalo.',
  },
  {
    q: 'Anadir acción anticipativa a un lazo estable:',
    options: [
      'Puede desestabilizarlo si la ganancia del compensador es alta',
      'Elimina la necesidad de acción integral',
      'Obliga a resintonizar el PID por completo',
      'No afecta la estabilidad, porque actua fuera del camino de realimentación'],
    answer: 3,
    why: 'El feedforward modifica el numerador de la respuesta a la carga y deja el denominador intacto. La estabilidad depende solo del denominador, así que no se compromete.',
  },
  {
    q: 'Un proceso tiene $K_p = 2.0$ y la carga afecta la salida con $K_d = 3.0$. La ganancia estática del compensador anticipativo es:',
    options: ['0.67', '−1.5', '1.5', '6.0'],
    answer: 1,
    why: '$K_{ff} = -K_d/K_p = -3.0/2.0 = -1.5$. El signo negativo indica que la acción sobre el elemento final debe ir en sentido contrario al efecto de la carga.',
  },
  {
    q: 'La razón principal por la que nunca se implementa feedforward sin realimentación es:',
    options: [
      'Que depende del modelo y solo corrige las perturbaciones medidas, sin verificar el resultado',
      'Que el compensador es demasiado costoso',
      'Que la norma ISA lo prohibe',
      'Que introduce tiempo muerto adicional'],
    answer: 0,
    why: 'El compensador actua a ciegas: no mide la variable controlada. Cualquier error de modelo o cualquier perturbación no medida quedaría sin corregir de forma permanente. La realimentación es la que garantiza error cero en estado estacionario.',
  },
  {
    q: 'La ponderación del punto de control con $\\beta < 1$ sirve para:',
    options: [
      'Eliminar el error permanente sin acción integral',
      'Compensar la banda muerta de la válvula',
      'Sintonizar agresivo para carga sin que el cambio en el punto de control produzca un salto en la salida',
      'Filtrar el ruido del transmisor'],
    answer: 2,
    why: 'Con beta menor que uno el término proporcional responde de forma atenuada al escalon del punto de control, mientras el integral sigue viendo el error completo. Así se resuelve el conflicto entre desempeño servo y desempeño regulador con un solo juego de parámetros.',
  },
];
