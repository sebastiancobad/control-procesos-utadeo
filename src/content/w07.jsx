import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow, SumPoint } from '../lib/isa.jsx';
import { SimTuning } from '../sims/loop.jsx';

export const meta = {
  id: 'w07',
  week: 8,
  code: 'CP26II-M07',
  title: 'El controlador PID y su sintonía',
  unit: 'Lazo de temperatura TIC-104',
  lede: 'Tres términos, tres preguntas: cuánto corregir ahora, cuánto compensar lo acumulado y cuánto anticipar. La sintonía decide el peso de cada respuesta.',
  objectives: [
    'Explicar el efecto de cada modo del PID sobre la respuesta del lazo.',
    'Justificar por que la acción proporcional sola deja error permanente.',
    'Aplicar Ziegler-Nichols, Cohen-Coon e IMC a un modelo FOPDT identificado.',
    'Elegir la regla adecuada según el criterio de desempeño exigido al lazo.',
  ],
  refs: ['zn', 'rivera', 'skoge', 'astrom', 'seborg'],
};

function FigPID() {
  return (
    <Figure vw={900} vh={310} num="6.1" caption="Los tres términos actuan en paralelo sobre el mismo error. La suma es la salida al elemento final.">
      <SumPoint cx={112} cy={150} signs={[['+', 'l'], ['-', 'b']]} />
      <T x={10} y={140} size={20} color={C.navy} bold anchor="start">y_sp</T>
      <Arrow x1={56} y1={150} x2={86} y2={150} color={C.navy} head="ahn" />
      <L x1={140} y1={150} x2={175} y2={150} color={C.ink} w={2} />
      <T x={146} y={138} size={20} color={C.grey}>e</T>
      <L x1={175} y1={60} x2={175} y2={240} color={C.ink} w={2} />
      <Arrow x1={175} y1={60} x2={252} y2={60} color={C.ink} />
      <Arrow x1={175} y1={150} x2={252} y2={150} color={C.ink} />
      <Arrow x1={175} y1={240} x2={252} y2={240} color={C.ink} />
      <Block cx={350} cy={60} w={190} h={62} label="Proporcional" sub="K_c e" />
      <Block cx={350} cy={150} w={190} h={62} label="Integral" sub="(K_c/τ_I) ∫e dt" />
      <Block cx={350} cy={240} w={190} h={62} label="Derivativo" sub="−K_c τ_D dy/dt" />
      <L x1={445} y1={60} x2={530} y2={60} color={C.ink} w={2} />
      <L x1={445} y1={150} x2={530} y2={150} color={C.ink} w={2} />
      <L x1={445} y1={240} x2={530} y2={240} color={C.ink} w={2} />
      <L x1={530} y1={60} x2={530} y2={240} color={C.ink} w={2} />
      <SumPoint cx={570} cy={150} signs={[['+', 't'], ['+', 'b']]} />
      <Arrow x1={598} y1={150} x2={666} y2={150} color={C.ink} />
      <Block cx={760} cy={150} w={170} h={70} label="Elemento final" sub="FV-104" />
      <T x={634} y={138} size={20} color={C.mv}>u</T>
      {/* retorno de la medida al comparador, que da sentido al signo negativo */}
      <L x1={845} y1={150} x2={845} y2={286} color={C.ink} w={2} />
      <L x1={845} y1={286} x2={112} y2={286} color={C.ink} w={2} />
      <Arrow x1={112} y1={286} x2={112} y2={182} color={C.ink} />
      <T x={660} y={276} size={19} color={C.grey}>medida de TT-104</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>La ecuación del controlador</h2>
      <p>La forma ideal, también llamada forma ISA, escribe la salida como</p>
      <Eq n="6.1">{'u(t) = \\bar{u} + K_c\\left[e(t) + \\frac{1}{\\tau_I}\\int_0^t e(t^{*})\\,dt^{*} + \\tau_D\\,\\frac{de(t)}{dt}\\right]'}</Eq>
      <p>
        con <Ei>{'\\bar{u}'}</Ei> la salida en el punto de operación, <Ei>{'K_c'}</Ei> la ganancia,
        <Ei>{'\\ \\tau_I'}</Ei> el tiempo integral y <Ei>{'\\tau_D'}</Ei> el tiempo derivativo, ambos en unidades de tiempo.
      </p>
      <FigPID />

      <h2>Que hace cada modo</h2>
      <Table
        caption="Efecto de cada término"
        head={['Modo', 'Responde a', 'Aporta', 'Cuesta']}
        rows={[
          ['Proporcional', 'El error presente', 'Velocidad de respuesta', 'Deja error permanente y desestabiliza si crece'],
          ['Integral', 'El error acumulado', 'Elimina el error permanente', 'Agrega retardo de fase y puede saturar'],
          ['Derivativo', 'La pendiente de la medida', 'Amortigua y anticipa', 'Amplifica el ruido del transmisor'],
        ]}
      />

      <h3>Por que el proporcional solo deja error</h3>
      <p>
        Con acción proporcional pura, para que la salida se aparte de <Ei>{'\\bar{u}'}</Ei> hace falta que el error sea
        distinto de cero. Si el error desapareciera, la corrección también lo haría y el proceso volvería a desviarse.
        El error residual en estado estacionario vale
      </p>
      <Eq n="6.2">{'e_{\\infty} = \\frac{\\Delta y_{sp}}{1 + K_c K}'}</Eq>
      <p>
        Aumentar <Ei>{'K_c'}</Ei> lo reduce pero nunca lo anula, y pasado cierto valor el lazo se vuelve inestable.
        La acción integral resuelve el problema de raiz: mientras exista error, la integral sigue creciendo y la salida
        sigue moviendose. Solo se detiene cuando el error llega a cero.
      </p>

      <Callout kind="warn" title="Saturación del integrador">
        <p>
          Si el elemento final llega a su tope y el error persiste, la integral sigue acumulando un valor que ya no puede
          traducirse en acción. Cuando el error cambia de signo, el controlador tarda en desandar esa acumulación y la
          respuesta queda muy sobrepasada. Todo PID industrial incorpora anti-windup; el simulador de este módulo usa
          integración condicional.
        </p>
      </Callout>

      <h3>Sobre el término derivativo</h3>
      <p>
        En la práctica la derivada se calcula sobre la medida y no sobre el error. La razón es que un cambio en escalon de
        el punto de control produciría una derivada infinita y un salto brusco en la salida, fenomeno conocido como golpe derivativo.
        Además el término se filtra con una constante <Ei>{'\\alpha\\tau_D'}</Ei>, con <Ei>{'\\alpha'}</Ei> entre 0.05 y 0.2,
        porque derivar amplifica el ruido de alta frecuencia.
      </p>

      <h2>Reglas de sintonía</h2>
      <p>Todas parten del modelo FOPDT identificado en el módulo de dinámica de primer orden.</p>

      <Table
        caption="Ziegler-Nichols sobre la curva de reacción"
        head={['Controlador', '$K_c$', '$\\tau_I$', '$\\tau_D$']}
        rows={[
          ['P', '$\\tau / (K \\theta )$', '$n/a$', 'n/a'],
          ['PI', '$0.9 \\tau / (K \\theta )$', '$3.33 \\theta$', 'n/a'],
          ['PID', '$1.2 \\tau / (K \\theta )$', '$2 \\theta$', '$0.5 \\theta$'],
        ]}
      />

      <Table
        caption="Cohen-Coon, con r = θ/τ"
        head={['Controlador', '$K_c$', '$\\tau_I$', '$\\tau_D$']}
        rows={[
          ['PI', '(1/K)(1/r)(0.9 + r/12)', '$\\theta (30 + 3r)/(9 + 20r)$', '$n/a$'],
          ['PID', '(1/K)(1/r)(1.33 + r/4)', '$\\theta (32 + 6r)/(13 + 8r)$', '$4\\theta /(11 + 2r)$'],
        ]}
      />

      <p>
        La sintonía por modelo interno (IMC) introduce un único parámetro de ajuste, <Ei>{'\\lambda'}</Ei>, que es la
        constante de tiempo deseada del lazo cerrado:
      </p>
      <Eq n="6.3">{'K_c = \\frac{1}{K}\\cdot \\frac{\\tau + \\theta/2}{\\lambda + \\theta/2}, \\qquad\\tau_I = \\tau + \\frac{\\theta}{2}, \\qquad\\tau_D = \\frac{\\tau\\theta}{2\\tau + \\theta}'}</Eq>
      <p>
        Con <Ei>{'\\lambda = \\theta'}</Ei> se obtiene una respuesta rápida; con <Ei>{'\\lambda = 3\\theta'}</Ei>, una muy
        conservadora y robusta. Ese parámetro único es lo que hace a IMC preferible en planta: el operador entiende que
        significa subirlo o bajarlo.
      </p>

      <Callout kind="note" title="Cual regla usar">
        <p>
          Ziegler-Nichols apunta a razón de decaimiento de un cuarto, es decir 50 % de sobrepaso. Sirve como punto de
          partida agresivo. Cohen-Coon compensa mejor cuando <Ei>{'\\theta/\\tau'}</Ei> supera 0.3. IMC y su versión
          moderna SIMC entregan lazos suaves y robustos, y son la elección por defecto en lazos de calidad o de reactores.
        </p>
      </Callout>

      <h2>Criterios de desempeño</h2>
      <p>Para comparar sintonias con un número en vez de con una impresión visual se usan integrales del error:</p>
      <Eq n="6.4">{'\\text{IAE} = \\int_0^{\\infty}|e|\\,dt \\qquad\\text{ISE} = \\int_0^{\\infty}e^2\\,dt \\qquad\\text{ITAE} = \\int_0^{\\infty}t\\,|e|\\,dt'}</Eq>
      <p>
        ISE penaliza los errores grandes y produce sintonias agresivas. ITAE penaliza los errores que persisten en el
        tiempo y produce sintonias con poco sobrepaso, que es lo que suele pedir un proceso químico.
      </p>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Tres reglas sobre el mismo proceso</h2>
      <p>
        El proceso está fijo en <Ei>{'K = 1.6'}</Ei>, <Ei>{'\\tau = 8'}</Ei> min y <Ei>{'\\theta = 2.5'}</Ei> min.
        Aplica cada regla con los botones y compara las métricas. Después manipula los parámetros a mano para ver que pasa
        cuando se exagera un modo.
      </p>
      <SimTuning />
      <Callout kind="note" title="Cuatro experimentos que vale la pena hacer">
        <ul>
          <li>Pon modo P y sube <Ei>{'K_c'}</Ei>: el error final baja pero nunca llega a cero.</li>
          <li>Pasa a PI y reduce <Ei>{'\\tau_I'}</Ei> por debajo de 2 min: el lazo se vuelve oscilante.</li>
          <li>Aplica Ziegler-Nichols y luego IMC: mismo proceso, sobrepasos muy distintos.</li>
          <li>Con PID, sube <Ei>{'\\tau_D'}</Ei> por encima de <Ei>{'\\tau_I/4'}</Ei> y observa que deja de ayudar.</li>
        </ul>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Sintonía del lazo TIC-104</h2>
      <Enunciado
        pide={[
          'Identificar el modelo FOPDT del lazo, trabajando en porcentaje de rango.',
          'Calcular la sintonía PID por Ziegler-Nichols, por Cohen-Coon y por IMC.',
          'Comparar las tres y elegir una, justificando la decisión con el criterio de desempeño que impone el proceso.',
        ]}
      >
        <p>
          El lazo de temperatura del intercambiador alimenta un reactor aguas abajo que exige temperatura estable: un
          sobrepaso grande saca el producto de especificación. Se hizo una prueba de escalón con el controlador en manual
          y ahora hay que decidir con que regla sintonizar y por que.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Curva de reacción sobre el intercambiador: escalon de 8 % en la salida del controlador.</li>
          <li>Temperatura: de 78.0 °C a 90.8 °C.</li>
          <li>Alcanza 81.6 °C a los 5.5 min y 86.1 °C a los 11.5 min.</li>
          <li>Rango del transmisor: 60 a 120 °C.</li>
        </ul>
      </Given>

      <Step n="1" title="Identificar el modelo">
        <Eq>{'\\Delta y = 90.8 - 78.0 = 12.8\\ \\text{°C}'}</Eq>
        <p>Conviene trabajar en porcentaje del rango para que la ganancia quede adimensional:</p>
        <Eq>{'\\Delta y_{\\%} = \\frac{12.8}{120 - 60}\\times 100 = 21.3\\ \\%'}</Eq>
        <Eq n="6.5">{'K = \\frac{21.3}{8} = 2.67\\ \\%/\\%'}</Eq>
        <p>Los dos puntos, verificados: 81.6 °C es el 28.1 % y 86.1 °C el 63.3 % del cambio total.</p>
        <Eq>{'\\tau = 1.5(11.5 - 5.5) = 9.0\\ \\text{min} \\qquad\\theta = 11.5 - 9.0 = 2.5\\ \\text{min}'}</Eq>
        <Eq>{'r = \\theta/\\tau = 0.278'}</Eq>
      </Step>

      <Step n="2" title="Ziegler-Nichols para PID">
        <Eq>{'K_c = \\frac{1.2\\,\\tau}{K\\,\\theta} = \\frac{1.2 \\times 9.0}{2.67 \\times 2.5} = \\frac{10.8}{6.675} = 1.62'}</Eq>
        <Eq>{'\\tau_I = 2\\theta = 5.0\\ \\text{min} \\qquad\\tau_D = 0.5\\theta = 1.25\\ \\text{min}'}</Eq>
      </Step>

      <Step n="3" title="Cohen-Coon para PID">
        <Eq>{'K_c = \\frac{1}{K}\\cdot \\frac{1}{r}\\left(1.33 + \\frac{r}{4}\\right) = \\frac{1}{2.67}\\cdot \\frac{1}{0.278}(1.33 + 0.0695) = 1.89'}</Eq>
        <Eq>{'\\tau_I = \\theta\\,\\frac{32 + 6r}{13 + 8r} = 2.5\\cdot \\frac{33.67}{15.22} = 5.53\\ \\text{min}'}</Eq>
        <Eq>{'\\tau_D = \\frac{4\\theta}{11 + 2r} = \\frac{10}{11.56} = 0.865\\ \\text{min}'}</Eq>
      </Step>

      <Step n="4" title="IMC con lambda igual al tiempo muerto">
        <Eq>{'K_c = \\frac{1}{2.67}\\cdot \\frac{9.0 + 1.25}{2.5 + 1.25} = \\frac{1}{2.67}\\cdot \\frac{10.25}{3.75} = 1.02'}</Eq>
        <Eq>{'\\tau_I = \\tau + \\frac{\\theta}{2} = 10.25\\ \\text{min} \\qquad\\tau_D = \\frac{9.0 \\times 2.5}{18 + 2.5} = 1.10\\ \\text{min}'}</Eq>
      </Step>

      <Step n="5" title="Comparar y decidir">
        <Table
          caption="Las tres sintonias sobre el mismo lazo"
          head={['Regla', '$K_c$', '$\\tau_I (\\operatorname{min})$', '$\\tau_D (\\operatorname{min})$', 'Caracter esperado']}
          numeric={[1, 2, 3]}
          rows={[
            ['Ziegler-Nichols', '1.62', '5.00', '1.25', 'Rápida, sobrepaso alto'],
            ['Cohen-Coon', '1.89', '5.53', '0.87', 'La mas agresiva de las tres'],
            ['$\\text{IMC}\\ (\\lambda = \\theta)$', '1.02', '10.25', '1.10', 'Suave, poco sobrepaso, robusta'],
          ]}
        />
        <p>
          El lazo alimenta un reactor aguas abajo que exige temperatura estable, así que el criterio dominante es poco
          sobrepaso y no velocidad. Se adopta IMC. Si mas adelante se necesita mayor rapidez, se reduce
          <Ei>{'\\ \\lambda'}</Ei> y se reajusta únicamente <Ei>{'K_c'}</Ei>.
        </p>
      </Step>

      <Answer>
        <p>
          Modelo <Ei>{'G = 2.67\\,e^{-2.5s}/(9s+1)'}</Ei>. Sintonía adoptada, IMC con <Ei>{'\\lambda = 2.5'}</Ei> min:
          <Ei>{'\\ K_c = 1.02'}</Ei>, <Ei>{'\\tau_I = 10.25'}</Ei> min, <Ei>{'\\tau_D = 1.10'}</Ei> min, con acción
          inversa y filtro derivativo <Ei>{'\\alpha = 0.1'}</Ei>.
        </p>
      </Answer>

      <Reveal label="Nota sobre unidades de la ganancia">
        <p>
          Muchos controladores se configuran con banda proporcional en lugar de ganancia:
          <Ei>{'\\ \\text{BP} = 100/K_c'}</Ei>. Para <Ei>{'K_c = 1.02'}</Ei> la banda proporcional es 98 %.
          Además, algunos fabricantes usan la forma serie en vez de la ideal, y las constantes no se transfieren
          directamente entre las dos. Verificar la forma del instrumento antes de cargar números es parte del trabajo.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Un lazo con controlador proporcional puro opera con $K_c = 4$ sobre un proceso de ganancia $K = 0.5$. Ante un cambio en el punto de control de 10 %, el error permanente es:',
    options: ['0 %', '3.3 %', '5.0 %', '10 %'],
    answer: 1,
    why: '$e_\\infty = \\Delta y_{sp}/(1 + K_c K) = 10/(1 + 2) = 3.33$ %. Subir la ganancia lo reduce, pero solo la acción integral lo anula.',
  },
  {
    q: 'La derivada se calcula sobre la medida y no sobre el error para:',
    options: [
      'Reducir el consumo de cálculo del controlador',
      'Evitar un salto brusco en la salida cuando cambia el punto de control',
      'Compensar el tiempo muerto del proceso',
      'Permitir el uso de anti-windup',
    ],
    answer: 1,
    why: 'Un escalon en el punto de control produce una derivada del error teóricamente infinita. Derivando solo la medida, que es continua, se evita ese golpe derivativo sin perder la acción anticipativa frente a perturbaciones.',
  },
  {
    q: 'Un proceso tiene $K = 2$, $\\tau = 10$ min, $\\theta = 2$ min. La ganancia PID por Ziegler-Nichols es:',
    options: ['1.5', '3.0', '6.0', '12.0'],
    answer: 1,
    why: '$K_c = 1.2\\tau/(K\\theta) = 1.2\\times 10/(2\\times 2) = 12/4 = 3.0$.',
  },
  {
    q: 'Un lazo lleva 20 minutos con la válvula al 100 % y el error sin corregirse. Al desaparecer la perturbación, la medida se pasa mucho del punto de control. La causa es:',
    options: [
      'Saturación del término integral por falta de anti-windup',
      'Ganancia proporcional excesiva',
      'Tiempo derivativo mal ajustado',
      'Ruido en el transmisor'],
    answer: 0,
    why: 'Mientras el elemento final estuvo saturado el integrador siguio acumulando acción que no podia ejecutarse. Al liberarse, el controlador debe desandar toda esa acumulación, y ese retraso produce el sobrepaso.',
  },
  {
    q: 'Se busca la sintonía mas robusta para un lazo de composición cuya medida es crítica para la especificación del producto. La regla mas adecuada es:',
    options: [
      'Ziegler-Nichols de lazo abierto',
      'IMC con $\\lambda$ del orden de dos a tres veces $\\theta$',
      'Cohen-Coon',
      'Proporcional puro con ganancia alta'],
    answer: 1,
    why: 'IMC con lambda grande entrega respuestas suaves y tolerantes al error de modelo. Ziegler-Nichols y Cohen-Coon persiguen velocidad y producen sobrepasos que un lazo de calidad no puede permitirse.',
  },
  {
    q: 'El criterio ITAE, comparado con ISE, produce sintonias que:',
    options: [
      'Son mas agresivas, porque penalizan los errores grandes',
      'Ignoran el tiempo muerto',
      'Tienen menos sobrepaso, porque penalizan los errores que persisten',
      'Solo aplican a lazos de flujo'],
    answer: 2,
    why: 'Al multiplicar el error por el tiempo, ITAE castiga sobre todo las colas largas de la respuesta y favorece sintonias que se asientan pronto sin oscilar. ISE, al elevar el error al cuadrado, castiga el pico inicial y empuja hacia sintonias rápidas y oscilantes.',
  },
];
