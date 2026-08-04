import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow } from '../lib/isa.jsx';

export const meta = {
  id: 'w10',
  week: 11,
  code: 'CP26II-R02',
  title: 'Segundo repaso integrador',
  unit: 'Intercambiador E-101 y reactor R-201',
  lede: 'De la válvula a la estabilidad. Síntesis del bloque que convierte un modelo dinámico en un lazo que funciona, con banco de problemas integradores.',
  objectives: [
    'Recorrer la cadena que va del dimensionamiento del elemento final hasta el límite de estabilidad.',
    'Decidir que herramienta aplica a cada sintoma observado en planta.',
    'Resolver problemas que combinan válvula, sintonía, perturbaciones y Routh.',
  ],
  refs: ['smith', 'seborg', 'shinskey', 'astrom', 'isa75'],
};

function FigDiag() {
  return (
    <Figure vw={880} vh={250} num="R2.1" caption="Arbol de diagnostico. La mayoría de los lazos que no funcionan en planta fallan por alguna de estas cuatro causas, y ninguna se corrige con sintonía salvo la última.">
      <Block cx={440} cy={40} w={280} h={54} label="El lazo no controla bien" />
      <L x1={440} y1={67} x2={440} y2={92} color={C.ink} w={2} />
      <L x1={120} y1={92} x2={760} y2={92} color={C.ink} w={2} />
      {[120, 333, 546, 760].map((x) => (
        <Arrow key={x} x1={x} y1={92} x2={x} y2={128} color={C.ink} />
      ))}
      <Block cx={120} cy={162} w={198} h={68} label="Saturación" sub="salida en el tope" fill={C.white} stroke={C.alarm} />
      <Block cx={333} cy={162} w={198} h={68} label="Banda muerta" sub="ciclo cuadrado" fill={C.white} stroke={C.alarm} />
      <Block cx={546} cy={162} w={198} h={68} label="Autoridad baja" sub="falla a alta carga" fill={C.white} stroke={C.alarm} />
      <Block cx={760} cy={162} w={198} h={68} label="Sintonía" sub="oscilación sinusoidal" fill={C.white} stroke={C.dist} />
      <T x={120} y={218} size={19} color={C.grey}>redimensionar</T>
      <T x={333} y={218} size={19} color={C.grey}>posicionador</T>
      <T x={546} y={218} size={19} color={C.grey}>revisar presiones</T>
      <T x={760} y={218} size={19} color={C.grey}>resintonizar</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Que cubre el corte</h2>
      <p>
        Los módulos de válvulas, sintonía, perturbaciones y estabilidad forman una sola secuencia. Se elige y dimensiona el elemento final, se ajusta el controlador,
        se estudia como responde el lazo frente a cargas y por último se verifica que el conjunto sea estable.
        El orden importa: sintonizar un lazo cuyo elemento final está mal dimensionado no produce ningún resultado útil.
      </p>

      <Table
        caption="Formulario del segundo corte"
        head={['Concepto', 'Expresión', 'Cuando se usa']}
        rows={[
          ['Flujo por la válvula', '$q = Cv f(x) \\sqrt{\\Delta P/Gf}$', 'Dimensionamiento y verificación de apertura'],
          ['Autoridad', '$\\psi = \\Delta P_{\\text{válvula, abierta}} / \\Delta P_{\\text{total}}$', 'Diagnostico de perdida de control a alta carga'],
          ['Característica instalada', '$f(x)/\\sqrt{\\psi + (1-\\psi)f(x)^2}$', 'Prever la deformación de la curva de catalogo'],
          ['PID ideal', '$u = \\bar{u} + Kc[e + (1/\\tau I)\\int e dt + \\tau D de/dt]$', 'Configuración del controlador'],
          ['Error proporcional', '$e_{\\infty} = \\Delta y_{sp}/(1 + K_c K)$', 'Justificar la acción integral'],
          ['Ziegler-Nichols PID', '$K_c = 1.2\\tau/(K\\theta),\\ \\tau_I = 2\\theta,\\ \\tau_D = 0.5\\theta$', 'Punto de partida agresivo'],
          ['IMC', '$K_c = (\\tau + \\theta/2)/[K(\\lambda + \\theta/2)],\\ \\tau_I = \\tau + \\theta/2$', 'Lazos de calidad y reactores'],
          ['Compensador anticipativo', '$G_{ff} = -\\dfrac{K_d}{K_p}\\cdot \\dfrac{\\tau_p s+1}{\\tau_d s+1}$', 'Carga grande, medible y frecuente'],
          ['Ecuación característica', '$1 + Gc Gv Gp Gm = 0$', 'Análisis de estabilidad'],
          ['Ziegler-Nichols cerrado', '$K_c = 0.6\\,K_{cu},\\ \\tau_I = P_u/2,\\ \\tau_D = P_u/8$', 'Sintonía a partir del ensayo del rele'],
        ]}
      />

      <h2>Diagnostico antes de sintonía</h2>
      <FigDiag />
      <p>
        En planta la petición mas frecuente es resintonizar un lazo que se comporta mal. Antes de tocar los parámetros
        conviene descartar las tres causas que no se arreglan desde el controlador.
      </p>
      <Table
        caption="Sintoma y causa probable"
        head={['Lo que se observa', 'Causa mas probable', 'Verificación']}
        rows={[
          ['La salida está en 100 % y el error persiste', 'Elemento final subdimensionado', 'Revisar Cv y flujo requerido'],
          ['Oscilación de forma cuadrada, no cambia con Kc', 'Banda muerta por fricción del vástago', 'Prueba de escalones pequeños sobre la válvula'],
          ['Controla bien a baja carga y mal a alta carga', 'Autoridad de válvula insuficiente', '$\\text{Calcular} \\psi\\text{con} \\text{las} \\text{perdidas} \\text{reales}$'],
          ['Oscilación sinusoidal creciente', 'Ganancia por encima del margen', 'Bajar $K_c$ y recalcular $K_{cu}$'],
          ['Sobrepaso enorme tras una saturación larga', 'Falta de anti-windup', 'Revisar configuración del integrador'],
          ['Salida ruidosa y válvula en movimiento continuo', 'Término derivativo sin filtro', '$\\text{Bajar} \\tau D$ o subir el $\\text{filtro} \\alpha$'],
        ]}
      />

      <Callout kind="warn" title="Los cinco errores que mas puntos cuestan en el parcial">
        <ol>
          <li>Dimensionar la válvula para el flujo nominal en lugar del máximo.</li>
          <li>Confundir característica inherente con instalada al calcular la ganancia del elemento final.</li>
          <li>Aplicar Ziegler-Nichols de lazo abierto con la fórmula de lazo cerrado, o al reves.</li>
          <li>Olvidar el transmisor y la válvula en la ecuación característica.</li>
          <li>Concluir estabilidad revisando solo la condición necesaria de los coeficientes.</li>
        </ol>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Problema integrador 1: del ensayo a la sintonía</h2>
      <Enunciado
        pide={[
          'Obtener el modelo FOPDT en porcentaje de rango.',
          'Calcular la sintonía PID por IMC tomando $\lambda$ igual al tiempo muerto.',
          'Comentar si la relación $\theta$/$\tau$ respalda esa elección.',
        ]}
      >
        <p>
          Prueba de escalón sobre el lazo de presión de un separador, con el controlador en manual. Hay que llevar el
          registro hasta los tres números que se cargan en el instrumento.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Lazo de presión en un separador. Escalon en manual de 35 % a 45 %.</li>
          <li>Presión medida: de 5.60 a 6.92 bar. Rango del transmisor: 0 a 10 bar.</li>
          <li>28.3 % del cambio a los 3.0 min; 63.2 % a los 6.6 min.</li>
        </ul>
      </Given>
      <Step n="1" title="Modelo en porcentaje de rango">
        <Eq>{'\\Delta y_{\\%} = \\frac{6.92 - 5.60}{10}\\times 100 = 13.2\\ \\% \\qquad K = \\frac{13.2}{10} = 1.32'}</Eq>
        <Eq>{'\\tau = 1.5(6.6 - 3.0) = 5.4\\ \\text{min} \\qquad\\theta = 6.6 - 5.4 = 1.2\\ \\text{min}'}</Eq>
      </Step>
      <Step n="2" title="Sintonía IMC con lambda igual al tiempo muerto">
        <Eq>{'K_c = \\frac{1}{1.32}\\cdot \\frac{5.4 + 0.6}{1.2 + 0.6} = \\frac{1}{1.32}\\cdot \\frac{6.0}{1.8} = 2.53'}</Eq>
        <Eq>{'\\tau_I = 5.4 + 0.6 = 6.0\\ \\text{min} \\qquad\\tau_D = \\frac{5.4 \\times 1.2}{10.8 + 1.2} = 0.54\\ \\text{min}'}</Eq>
      </Step>
      <Answer>
        <p>
          <Ei>{'G = 1.32\\,e^{-1.2s}/(5.4s+1)'}</Ei>. Sintonía IMC: <Ei>{'K_c = 2.53'}</Ei>,
          <Ei>{'\\ \\tau_I = 6.0'}</Ei> min, <Ei>{'\\tau_D = 0.54'}</Ei> min.
          Con <Ei>{'\\theta/\\tau = 0.22'}</Ei> el lazo tolera perfectamente esta sintonía.
        </p>
      </Answer>

      <h2>Problema integrador 2: válvula y ganancia de lazo</h2>
      <Enunciado
        pide={[
          'Calcular el flujo instalado en cada una de las dos aperturas.',
          'Obtener la ganancia local del elemento final en cada punto.',
          'Determinar la relación entre ambas ganancias.',
          'Decidir si basta con resintonizar o si hace falta programar la ganancia.',
        ]}
      >
        <p>
          Un lazo se sintonizó con la válvula al 40 % de apertura, en carga baja. La planta sube a plena capacidad y la
          válvula pasa a operar al 75 %. Operaciones reporta que el lazo se puso nervioso y pide que alguien lo revise.
          Nadie ha tocado los parámetros del controlador.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Válvula isoporcentual con <Ei>{'R = 50'}</Ei>, <Ei>{'C_v = 60'}</Ei>, autoridad <Ei>{'\\psi = 0.30'}</Ei>.</li>
          <li>El lazo se sintonizo con la válvula al 40 % de apertura.</li>
          <li>La planta sube de carga y la válvula pasa a operar al 75 %.</li>
        </ul>
      </Given>
      <Step n="1" title="Ganancia instalada en cada punto">
        <p>Con <Ei>{'f(x) = 50^{x-1}'}</Ei> y la ecuación 5.3 del módulo de válvulas:</p>
        <Eq>{'f(0.40) = 50^{-0.6} = 0.0956 \\qquad f(0.75) = 50^{-0.25} = 0.376'}</Eq>
        <Eq>{'\\frac{q}{q_{max}}\\Big|_{0.40} = \\frac{0.0956}{\\sqrt{0.30 + 0.70(0.00914)}} = \\frac{0.0956}{0.5537} = 0.173'}</Eq>
        <Eq>{'\\frac{q}{q_{max}}\\Big|_{0.75} = \\frac{0.376}{\\sqrt{0.30 + 0.70(0.1414)}} = \\frac{0.376}{0.6317} = 0.595'}</Eq>
      </Step>
      <Step n="2" title="Ganancia local por diferencias">
        <p>Evaluando la pendiente con incrementos de 0.02 alrededor de cada punto se obtiene</p>
        <Eq>{'\\left.\\frac{d(q/q_{max})}{dx}\\right|_{0.40} \\approx 0.66 \\qquad\\left.\\frac{d(q/q_{max})}{dx}\\right|_{0.75} \\approx 1.75'}</Eq>
        <Eq>{'\\frac{\\text{ganancia a 75 \\%}}{\\text{ganancia a 40 \\%}} = \\frac{1.75}{0.66} = 2.65'}</Eq>
      </Step>
      <Answer>
        <p>
          La ganancia del elemento final se multiplico por 2.65 al subir la carga, y con ella la ganancia total del lazo.
          Ese factor cae en la franja de 2 a 3 donde el propio criterio del curso pide verificar la sintonía en el punto
          nuevo antes de dejarla como está, y evaluar la programación de ganancia por rango de carga, que es el tema del
          módulo de estrategias selectivas.
        </p>
      </Answer>

      <Reveal label="Problema integrador 3, para resolver sin ayuda">
        <p>
          Un lazo tiene <Ei>{'G_p = 2.0/[(4s+1)(1.5s+1)]'}</Ei>, <Ei>{'G_v = 1/(0.4s+1)'}</Ei> y
          <Ei>{'\\ G_m = 0.9'}</Ei>, tiempo en minutos. Con controlador proporcional se pide: escribir la ecuación
          característica; construir el arreglo de Routh; determinar <Ei>{'K_{cu}'}</Ei> y <Ei>{'P_u'}</Ei>; y proponer una
          sintonía PID que deje un margen de al menos 2 frente a la inestabilidad.
        </p>
        <p style={{ color: 'var(--ink-3)', fontSize: '.93rem' }}>
          Respuestas: <Ei>{'2.4 s^3 + 8.2 s^2 + 5.9 s + (1 + 1.8K_c) = 0'}</Ei>;
          <Ei>{'\\ K_{cu} = 10.6'}</Ei>; <Ei>{'\\omega_u = 1.57'}</Ei> rad/min; <Ei>{'P_u = 4.0'}</Ei> min;
          sintonía propuesta <Ei>{'K_c = 5.3'}</Ei>, <Ei>{'\\tau_I = 2.0'}</Ei> min, <Ei>{'\\tau_D = 0.50'}</Ei> min.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Un lazo de flujo oscila con forma cuadrada y amplitud constante. Al reducir $K_c$ a la mitad la oscilación persiste igual. La acción correcta es:',
    options: ['Reducir $K_c$ otra vez', 'Aumentar $\\tau_I$', 'Revisar fricción y banda muerta en la válvula', 'Agregar acción derivativa'],
    answer: 2,
    why: 'Una oscilación por sintonía responde siempre a cambios en la ganancia. Un ciclo que ignora esos cambios y tiene forma cuadrada apunta al elemento final. La solución es mecánica: posicionador, empaque o mantenimiento del vástago.',
  },
  {
    q: 'Se dimensiona una válvula con $C_v$ para el flujo nominal en lugar del máximo. La consecuencia es:',
    options: [
      'La válvula no podra entregar el flujo máximo y el lazo se saturara a alta carga',
      'La válvula operara siempre casi cerrada',
      'La autoridad de la válvula será excesiva',
      'No hay consecuencia si el lazo es estable'],
    answer: 0,
    why: 'El elemento final debe cubrir el flujo máximo previsto con margen. Dimensionar al nominal deja al lazo sin capacidad de corrección justo cuando mas se necesita.',
  },
  {
    q: 'Un proceso tiene $K=1.5$, $\\tau=12$ min, $\\theta=3$ min. La ganancia PID por Ziegler-Nichols de lazo abierto es:',
    options: ['1.6', '3.2', '4.8', '9.6'],
    answer: 1,
    why: '$K_c = 1.2\\tau/(K\\theta) = 1.2\\times12/(1.5\\times3) = 14.4/4.5 = 3.2$.',
  },
  {
    q: 'Al escribir la ecuación característica de un lazo se omite la función de transferencia del transmisor. El error que se comete es:',
    options: [
      'Ninguno, el transmisor no afecta la estabilidad',
      'Se sobreestima el rango estable de la ganancia',
      'Se subestima la ganancia del proceso',
      'Se invierte el signo de la respuesta',
    ],
    answer: 1,
    why: 'El transmisor forma parte del producto del lazo. Su dinámica agrega retardo y su ganancia multiplica al resto, así que omitirlo hace parecer el lazo mas estable de lo que es.',
  },
  {
    q: 'La acción anticipativa es la herramienta indicada cuando:',
    options: [
      'La perturbación es grande, medible y el lazo realimentado es lento',
      'La perturbación es pequeña y poco frecuente',
      'El elemento final tiene banda muerta',
      'La ganancia del proceso varía con la carga'],
    answer: 0,
    why: 'Los cuatro criterios son magnitud, medibilidad, lentitud del lazo realimentado y existencia de un modelo. Cuando alguno falla, el compensador aporta poco frente a su costo de instrumentación y mantenimiento.',
  },
  {
    q: 'Un polinomio característico de tercer grado tiene todos sus coeficientes positivos. Se puede concluir que:',
    options: [
      'El lazo es estable',
      'El lazo es inestable',
      'Se cumple la condición necesaria, pero falta construir el arreglo de Routh',
      'Hay exactamente una raiz en el semiplano derecho',
    ],
    answer: 2,
    why: 'Coeficientes del mismo signo es condición necesaria y no suficiente a partir del tercer grado. Un polinomio como $s^3+s^2+s+6$ tiene todos los coeficientes positivos y aun así es inestable.',
  },
  {
    q: 'Un lazo sale de una saturación larga con un sobrepaso enorme. El remedio correcto es:',
    options: [
      'Reducir $K_c$',
      'Cambiar la característica de la válvula',
      'Aumentar $\\tau_D$',
      'Habilitar o corregir el anti-windup del integrador'],
    answer: 3,
    why: 'El sobrepaso proviene de la acción integral acumulada mientras el elemento final estuvo en su tope. Bajar la ganancia no evita la acumulación; limitar el integrador cuando la salida satura si lo hace.',
  },
  {
    q: 'La característica isoporcentual con autoridad cercana a 0.3 se elige porque:',
    options: [
      'Da la mayor rangeabilidad posible',
      'La curva instalada resulta casi lineal y la ganancia de lazo se mantiene estable con la carga',
      'Evita la cavitación',
      'Reduce la banda muerta del actuador',
    ],
    answer: 1,
    why: 'La ganancia creciente de la isoporcentual compensa la caida de autoridad al aumentar el flujo. El producto de los dos efectos aplana la ganancia del elemento final, que es lo que la sintonía necesita para seguir siendo válida en todo el rango.',
  },
];
