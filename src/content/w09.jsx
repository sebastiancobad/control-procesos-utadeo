import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow } from '../lib/isa.jsx';
import { SimStability } from '../sims/loop.jsx';

export const meta = {
  id: 'w09',
  week: 10,
  code: 'CP26II-M09',
  title: 'Análisis de estabilidad en el dominio del tiempo',
  unit: 'Reactor R-201',
  lede: 'La estabilidad no se negocia. Antes de discutir si un lazo responde rápido hay que garantizar que responde, y esa garantia se decide en las raices de una sola ecuación.',
  objectives: [
    'Escribir la ecuación característica de un lazo cerrado y explicar por que gobierna la estabilidad.',
    'Aplicar el criterio de Routh-Hurwitz para determinar el rango estable de la ganancia.',
    'Calcular la ganancia última y el periodo último, y usarlos para sintonizar.',
    'Explicar por que el tiempo muerto reduce el margen de estabilidad disponible.',
  ],
  refs: ['smith', 'seborg', 'cough', 'steph', 'zn'],
};

function FigPoles() {
  return (
    <Figure vw={860} vh={340} num="8.1" caption="La parte real de las raíces decide todo. La parte imaginaria decide solo la forma. Al subir la ganancia el par de polos cruza al semiplano derecho, y ese cruce ocurre exactamente en la ganancia última.">
      <T x={215} y={30} size={22} color={C.dist}>semiplano izquierdo: estable</T>
      <T x={620} y={30} size={22} color={C.alarm}>semiplano derecho: inestable</T>
      <rect x="60" y="52" width="340" height="236" fill="rgba(46,125,111,.07)" />
      <rect x="400" y="52" width="340" height="236" fill="rgba(169,50,38,.06)" />
      <L x1={60} y1={170} x2={790} y2={170} color={C.ink} w={1.6} />
      <L x1={400} y1={52} x2={400} y2={288} color={C.ink} w={1.6} />
      <T x={784} y={160} size={21} color={C.grey} anchor="end">Re(s)</T>
      <T x={414} y={70} size={21} color={C.grey} anchor="start">Im(s)</T>
      {[[210, 116], [210, 224]].map(([x, y], i) => (
        <g key={`a${i}`}>
          <L x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} color={C.dist} w={2.6} />
          <L x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} color={C.dist} w={2.6} />
        </g>
      ))}
      {[[400, 116], [400, 224]].map(([x, y], i) => (
        <g key={`b${i}`}>
          <L x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} color={C.mv} w={2.6} />
          <L x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} color={C.mv} w={2.6} />
        </g>
      ))}
      {[[578, 116], [578, 224]].map(([x, y], i) => (
        <g key={`c${i}`}>
          <L x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} color={C.alarm} w={2.6} />
          <L x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} color={C.alarm} w={2.6} />
        </g>
      ))}
      <T x={210} y={268} size={20} color={C.dist}>K_c bajo</T>
      <T x={442} y={300} size={20} color={C.mv} anchor="start">K_c = K_cu</T>
      <T x={578} y={268} size={20} color={C.alarm}>K_c alto</T>
      <Arrow x1={236} y1={104} x2={552} y2={104} color={C.grey} />
      <T x={300} y={94} size={19} color={C.grey}>al subir la ganancia</T>
      <T x={430} y={318} size={19} color={C.grey}>el cruce del eje imaginario es el límite de estabilidad</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>La ecuación característica</h2>
      <p>
        Las dos funciones de transferencia del lazo cerrado comparten denominador. Igualarlo a cero define la
        ecuación característica:
      </p>
      <Eq n="8.1">{'1 + G_c(s)\\,G_v(s)\\,G_p(s)\\,G_m(s) = 0'}</Eq>
      <p>
        Sus raices son los polos del lazo cerrado. La respuesta temporal es una combinación de términos
        <Ei>{'\\ e^{s_i t}'}</Ei>, uno por cada raiz. El criterio queda entonces reducido a una condición sobre el signo
        de la parte real:
      </p>
      <Eq n="8.2">{'\\text{El lazo es estable si y solo si } \\operatorname{Re}(s_i) < 0 \\ \\ \\text{para toda raiz } s_i'}</Eq>
      <FigPoles />

      <Callout kind="note" title="La estabilidad depende del lazo completo">
        <p>
          En la ecuación 8.1 aparecen el controlador, la válvula, el proceso y el transmisor. Un proceso estable en lazo
          abierto puede volverse inestable al cerrarlo, y esa transformacion la produce la ganancia del controlador.
          Cambiar la válvula o recalibrar el transmisor también mueve las raices.
        </p>
      </Callout>

      <h2>Criterio de Routh-Hurwitz</h2>
      <p>
        Calcular todas las raices de un polinomio de grado alto es incomodo y además innecesario: basta con saber cuantas
        caen a la derecha. Para un polinomio
      </p>
      <Eq n="8.3">{'a_0 s^n + a_1 s^{n-1} + \\cdots + a_{n-1} s + a_n = 0'}</Eq>
      <p>
        una <strong>condición necesaria</strong> es que todos los coeficientes existan y tengan el mismo signo. Si falta
        alguno o si hay cambio de signo, el sistema es inestable y no hace falta seguir. La condición suficiente la da el
        arreglo de Routh, que se construye así:
      </p>
      <Table
        caption="Construcción del arreglo"
        head={['Fila', 'Columna 1', 'Columna 2', 'Columna 3']}
        rows={[
          ['$s^n$', '$a_0$', '$a_2$', '$a_4$'],
          ['$s^{n-1}$', '$a_1$', '$a_3$', '$a_5$'],
          ['$s^{n-2}$', '$b_1 = (a_1a_2 - a_0a_3)/a_1$', '$b_2 = (a_1a_4 - a_0a_5)/a_1$', '$...$'],
          ['$s^{n-3}$', '$c_1 = (b_1a_3 - a_1b_2)/b_1$', '$...$', ''],
        ]}
      />
      <p>
        El número de raices con parte real positiva es igual al <strong>número de cambios de signo en la primera
        columna</strong>. Sin cambios de signo, el lazo es estable.
      </p>

      <h3>Casos especiales</h3>
      <ul>
        <li>
          <strong>Un cero en la primera columna</strong> con el resto de la fila distinto de cero. Se sustituye por un
          número positivo muy pequeño y se continua, evaluando los signos en el límite.
        </li>
        <li>
          <strong>Una fila completa de ceros</strong>. Indica raices simétricas respecto del origen, típicamente un par
          imaginario puro. Se deriva el polinomio auxiliar de la fila anterior y se usan sus coeficientes para continuar.
          Este caso corresponde justamente al límite de estabilidad.
        </li>
      </ul>

      <h2>Ganancia última y periodo último</h2>
      <p>
        Al aumentar <Ei>{'K_c'}</Ei>, las raices se desplazan hacia la derecha. El valor que las coloca exactamente sobre
        el eje imaginario es la <strong>ganancia última</strong> <Ei>{'K_{cu}'}</Ei>. En ese punto el lazo oscila con
        amplitud constante y con un periodo llamado <strong>periodo último</strong> <Ei>{'P_u'}</Ei>.
      </p>
      <p>
        Los dos valores se obtienen del arreglo de Routh: <Ei>{'K_{cu}'}</Ei> es la ganancia que anula un elemento de la
        primera columna, y <Ei>{'P_u = 2\\pi/\\omega_u'}</Ei> sale del polinomio auxiliar de esa fila.
      </p>

      <Table
        caption="Ziegler-Nichols de lazo cerrado, a partir de K_cu y P_u"
        head={['Controlador', '$K_c$', '$\\tau_I$', '$\\tau_D$']}
        rows={[
          ['P', '$0.50 K_{cu}$', '$n/a$', 'n/a'],
          ['PI', '$0.45 K_{cu}$', '$P_u / 1.2$', 'n/a'],
          ['PID', '$0.60 K_{cu}$', '$P_u / 2$', '$P_u / 8$'],
        ]}
      />

      <Callout kind="risk" title="Sobre el método de oscilación sostenida">
        <p>
          Llevar un lazo real hasta la oscilación sostenida significa operar la planta en el límite de estabilidad. En un
          reactor exotérmico, en una columna o en cualquier equipo con enclavamientos, ese ensayo no se hace. Se prefiere
          el método del rele, que provoca una oscilación controlada de amplitud limitada, o se calcula
          <Ei>{'\\ K_{cu}'}</Ei> a partir del modelo identificado.
        </p>
      </Callout>

      <h2>Por que el tiempo muerto reduce el margen</h2>
      <p>
        El término <Ei>{'e^{-\\theta s}'}</Ei> no es un polinomio, así que el arreglo de Routh no se aplica directamente.
        Se recurre a la aproximación de Pade de primer orden:
      </p>
      <Eq n="8.4">{'e^{-\\theta s} \\approx \\frac{1 - \\theta s/2}{1 + \\theta s/2}'}</Eq>
      <p>
        El numerador introduce un cero positivo, que es la firma matematica de la respuesta inversa. Al sustituir en la
        ecuación característica, ese cero recorta el rango estable de la ganancia. Cuanto mayor es
        <Ei>{'\\ \\theta'}</Ei>, menor es <Ei>{'K_{cu}'}</Ei>. Con el modelo FOPDT la relación aproximada es
      </p>
      <Eq n="8.5">{'K_{cu} \\approx \\frac{1}{K}\\sqrt{1 + (\\omega_u \\tau)^2}, \\qquad\\arctan(\\omega_u \\tau) + \\omega_u \\theta = \\pi'}</Eq>
      <p>
        Esta es la razón de fondo por la que todas las reglas de sintonía del módulo de sintonía llevan
        <Ei>{'\\ \\theta'}</Ei> en el denominador de <Ei>{'K_c'}</Ei>.
      </p>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Cruzar el límite y verlo en la tabla</h2>
      <p>
        El panel simula un lazo de tercer orden con controlador proporcional y construye el arreglo de Routh en cada
        instante. Sube la ganancia por pasos y observa dos cosas al mismo tiempo: la respuesta pasa de amortiguada a
        oscilación sostenida y luego a divergente, mientras el elemento de la tercera fila cambia de signo.
      </p>
      <SimStability />
      <Callout kind="note" title="Verificación recomendada">
        <p>
          Pulsa el boton que lleva la ganancia a <Ei>{'K_{cu}'}</Ei>. En ese punto la oscilación debe mantener amplitud
          constante y el elemento crítico del arreglo debe aproximarse a cero. Mide el periodo de esa oscilación sobre la
          gráfica y comparalo con el <Ei>{'P_u'}</Ei> reportado.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Rango estable del lazo de temperatura del reactor</h2>
      <Enunciado
        pide={[
          'Escribir la ecuación característica del lazo cerrado, incluyendo válvula y transmisor.',
          'Verificar la condición necesaria sobre los coeficientes.',
          'Construir el arreglo de Routh y determinar el rango estable de la ganancia.',
          'Calcular $K_{cu}$ y $P_{u}$.',
          'Proponer una sintonía que deje margen suficiente para un reactor.',
        ]}
      >
        <p>
          Antes de cargar cualquier sintonía en el controlador de temperatura del reactor hay que conocer el limite de
          estabilidad del lazo. Llevar el equipo a oscilación sostenida para medirlo no es una opción, porque el reactor
          tiene enclavamientos por alta temperatura. Se dispone de los modelos del proceso, de la válvula y del
          transmisor.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Proceso: <Ei>{'G_p = \\dfrac{1.2}{(5s+1)(2s+1)}'}</Ei>, tiempo en minutos.</li>
          <li>Válvula: <Ei>{'G_v = \\dfrac{0.8}{0.5s+1}'}</Ei>.</li>
          <li>Transmisor: <Ei>{'G_m = 1'}</Ei>, calibrado en el mismo rango que la salida.</li>
          <li>Controlador proporcional: <Ei>{'G_c = K_c'}</Ei>.</li>
        </ul>
      </Given>

      <Step n="1" title="Ecuación característica">
        <Eq>{'1 + \\frac{0.96\\,K_c}{(5s+1)(2s+1)(0.5s+1)} = 0'}</Eq>
        <p>Multiplicando por el denominador y expandiendo:</p>
        <Eq>{'(5s+1)(2s+1)(0.5s+1) + 0.96 K_c = 0'}</Eq>
        <Eq>{'(10s^2 + 7s + 1)(0.5s + 1) + 0.96 K_c = 0'}</Eq>
        <Eq n="8.6">{'5 s^3 + 13.5 s^2 + 7.5 s + (1 + 0.96 K_c) = 0'}</Eq>
      </Step>

      <Step n="2" title="Condición necesaria">
        <p>
          Todos los coeficientes deben ser positivos. Los tres primeros lo son siempre; el último exige
          <Ei>{'\\ 1 + 0.96 K_c > 0'}</Ei>, es decir <Ei>{'K_c > -1.04'}</Ei>. La condición no restringe nada en la
          práctica porque el controlador operara con ganancia positiva.
        </p>
      </Step>

      <Step n="3" title="Arreglo de Routh">
        <Table
          caption="Arreglo para el polinomio de tercer grado"
          head={['Fila', 'Columna 1', 'Columna 2']}
          rows={[
            ['$s^3$', '$5$', '7.5'],
            ['$s^{2}$', '$13.5$', '$1 + 0.96 K_c$'],
            ['$s^{1}$', '$(13.5 \\times 7.5 - 5(1 + 0.96 K_c)) / 13.5$', '0'],
            ['$s^{0}$', '$1 + 0.96 K_c$', ''],
          ]}
        />
        <p>El único elemento que puede cambiar de signo es el de la fila <Ei>{'s^1'}</Ei>:</p>
        <Eq>{'b_1 = \\frac{101.25 - 5 - 4.8 K_c}{13.5} = \\frac{96.25 - 4.8 K_c}{13.5}'}</Eq>
      </Step>

      <Step n="4" title="Ganancia última">
        <Eq n="8.7">{'b_1 = 0 \\quad\\Longrightarrow\\quad K_{cu} = \\frac{96.25}{4.8} = 20.05'}</Eq>
        <p>El rango estable es <Ei>{'0 < K_c < 20.05'}</Ei>.</p>
      </Step>

      <Step n="5" title="Periodo último">
        <p>En el límite, la fila <Ei>{'s^2'}</Ei> proporciona el polinomio auxiliar:</p>
        <Eq>{'13.5 s^2 + (1 + 0.96 \\times 20.05) = 13.5 s^2 + 20.25 = 0'}</Eq>
        <Eq>{'s^2 = -1.5 \\quad\\Longrightarrow\\quad s = \\pm 1.225 j \\quad\\Longrightarrow\\quad\\omega_u = 1.225\\ \\text{rad/min}'}</Eq>
        <Eq n="8.8">{'P_u = \\frac{2\\pi}{\\omega_u} = \\frac{6.283}{1.225} = 5.13\\ \\text{min}'}</Eq>
      </Step>

      <Step n="6" title="Sintonía y margen">
        <p>Ziegler-Nichols de lazo cerrado para PID:</p>
        <Eq>{'K_c = 0.6 \\times 20.05 = 12.0 \\qquad\\tau_I = \\frac{5.13}{2} = 2.57\\ \\text{min} \\qquad\\tau_D = \\frac{5.13}{8} = 0.64\\ \\text{min}'}</Eq>
        <p>
          Esa ganancia deja un margen de <Ei>{'20.05/12.0 = 1.67'}</Ei> frente a la inestabilidad. Es un margen ajustado.
          Para un reactor conviene un factor de al menos 2, lo que sugiere <Ei>{'K_c \\leq 10'}</Ei>.
        </p>
      </Step>

      <Answer>
        <p>
          Rango estable <Ei>{'0 < K_c < 20.05'}</Ei>, con <Ei>{'\\omega_u = 1.225'}</Ei> rad/min y
          <Ei>{'\\ P_u = 5.13'}</Ei> min. La sintonía de Ziegler-Nichols entrega <Ei>{'K_c = 12'}</Ei>, que deja poco
          margen. Se recomienda <Ei>{'K_c = 10'}</Ei>, <Ei>{'\\tau_I = 2.6'}</Ei> min, <Ei>{'\\tau_D = 0.64'}</Ei> min.
        </p>
      </Answer>

      <Reveal label="Que pasa si se agrega tiempo muerto">
        <p>
          Si el mismo lazo incorpora un analizador con <Ei>{'\\theta = 1.5'}</Ei> min, la aproximación de Pade agrega el
          factor <Ei>{'(1 - 0.75 s)/(1 + 0.75 s)'}</Ei>. La ecuación característica pasa a cuarto grado y la ganancia
          última cae aproximadamente a 4.8, una cuarta parte del valor anterior.
        </p>
        <p>
          El resultado cuantifica algo que ya se había enunciado en el módulo de dinámica de primer orden: el tiempo muerto es el factor que mas
          limita el desempeño alcanzable de un lazo realimentado. Reducirlo, acercando el punto de medición o acelerando
          el muestreo del analizador, suele rendir mas que cualquier reajuste de sintonía.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'La ecuación característica de un lazo cerrado es:',
    options: [
      'El numerador de la función de transferencia servo igualado a cero',
      'La suma de las constantes de tiempo igualada a cero',
      '$G_cG_vG_p = 1$',
      '$1 + G_cG_vG_pG_m = 0$'],
    answer: 3,
    why: 'Es el denominador común de las respuestas servo y regulador igualado a cero. Sus raices son los polos del lazo cerrado y su signo decide la estabilidad.',
  },
  {
    q: 'Un polinomio característico es $2s^3 + 4s^2 - 3s + 6 = 0$. Sin construir el arreglo de Routh se puede afirmar que:',
    options: [
      'El sistema es estable, porque todos los coeficientes existen',
      'El sistema es inestable, porque hay un coeficiente negativo',
      'Hace falta el arreglo completo para decidir',
      'El sistema es criticamente estable',
    ],
    answer: 1,
    why: 'La condición necesaria exige que todos los coeficientes tengan el mismo signo. Un coeficiente negativo garantiza al menos una raiz con parte real positiva, y el arreglo ya no aporta información adicional para la decisión.',
  },
  {
    q: 'La primera columna del arreglo de Routh de un lazo presenta dos cambios de signo. Esto significa que:',
    options: [
      'El lazo tiene dos polos en el origen',
      'El arreglo se construyo mal',
      'El lazo tiene dos raices complejas conjugadas',
      'El lazo tiene dos raices con parte real positiva'],
    answer: 3,
    why: 'El teorema de Routh establece que el número de cambios de signo en la primera columna es igual al número de raices en el semiplano derecho.',
  },
  {
    q: 'Se determina $K_{cu} = 16$ y $P_u = 8$ min. La sintonía PI por Ziegler-Nichols de lazo cerrado es:',
    options: [
      '$K_c = 7.2$, $\\tau_I = 6.7$ min',
      '$K_c = 8.0$, $\\tau_I = 4.0$ min',
      '$K_c = 9.6$, $\\tau_I = 4.0$ min',
      '$K_c = 7.2$, $\\tau_I = 1.0$ min'],
    answer: 0,
    why: 'Para PI la regla es $K_c = 0.45K_{cu} = 7.2$ y $\\tau_I = P_u/1.2 = 6.67$ min.',
  },
  {
    q: 'Al aumentar el tiempo muerto de un lazo manteniendo K y $\\tau$ constantes, la ganancia última:',
    options: ['Aumenta', 'Disminuye', 'No cambia', 'Se vuelve infinita'],
    answer: 1,
    why: 'El tiempo muerto agrega retardo sin atenuar la señal, así que el lazo alcanza la condición de oscilación con menos ganancia. Ese es el motivo de que todas las reglas de sintonía lleven $\\theta$ en el denominador de $K_c$.',
  },
  {
    q: 'Un reactor exotérmico opera con enclavamientos por alta temperatura. Para determinar $K_{cu}$ el procedimiento adecuado es:',
    options: [
      'Subir la ganancia en automático hasta observar oscilación sostenida',
      'Estimarla como diez veces la ganancia actual',
      'Calcularla del modelo identificado o usar el método del rele con amplitud limitada',
      'Ponerlo en manual y esperar a que oscile solo'],
    answer: 2,
    why: 'Llevar un reactor exotérmico al límite de estabilidad expone la planta a un disparo o a algo peor. El cálculo sobre el modelo y el ensayo del rele obtienen la misma información sin operar en el límite.',
  },
];
