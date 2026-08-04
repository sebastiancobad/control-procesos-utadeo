import { Eq, Ei, Callout, Table, Enunciado, Given, Step, Answer, Reveal, Figure } from '../components/ui.jsx';
import { C, T, L, Block, Arrow } from '../lib/isa.jsx';

export const meta = {
  id: 'w05',
  week: 6,
  code: 'CP26II-R01',
  title: 'Primer repaso integrador',
  unit: 'Tanque T-101 e intercambiador E-101',
  lede: 'Síntesis de los cuatro primeros módulos y banco de problemas integradores. El parcial mide justamente lo que aparece en este mapa.',
  objectives: [
    'Recorrer el hilo que va del balance de materia a la función de transferencia.',
    'Reconocer los errores que mas puntos cuestan en el parcial.',
    'Resolver problemas que combinan clasificación de variables, modelado y dinámica.',
  ],
  refs: ['smith', 'seborg', 'cough', 'isa51'],
};

function FigMap() {
  return (
    <Figure vw={880} vh={230} num="R1.1" caption="El recorrido completo del primer corte. Cada flecha es un paso que el parcial puede pedir por separado o encadenado.">
      <Block cx={100} cy={70} w={158} h={68} label="Proceso real" sub="T-101" />
      <Arrow x1={180} y1={70} x2={244} y2={70} color={C.navy} head="ahn" />
      <Block cx={330} cy={70} w={160} h={68} label="Balance" sub="dh/dt" />
      <Arrow x1={412} y1={70} x2={476} y2={70} color={C.navy} head="ahn" />
      <Block cx={562} cy={70} w={168} h={68} label="Linealización" sub="Taylor" />
      <Arrow x1={648} y1={70} x2={712} y2={70} color={C.navy} head="ahn" />
      <Block cx={798} cy={70} w={152} h={68} label="G(s)" sub="K, τ, θ" />
      <Arrow x1={798} y1={106} x2={798} y2={150} color={C.mv} head="ahm" />
      <Block cx={798} cy={190} w={152} h={62} label="Sintonía" sub="mas adelante" fill={C.white} stroke={C.mv} />
      <Arrow x1={100} y1={106} x2={100} y2={150} color={C.mv} head="ahm" />
      <Block cx={100} cy={190} w={158} h={62} label="Curva real" sub="identificación" fill={C.white} stroke={C.mv} />
      <L x1={178} y1={190} x2={718} y2={190} color={C.grey} w={1.6} dash="6,5" />
      <T x={448} y={182} size={20} color={C.grey}>los dos caminos deben coincidir</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>El mapa del corte</h2>
      <FigMap />
      <p>
        Los cuatro primeros módulos construyen una sola cadena: se parte de un equipo real, se escribe su balance, se
        linealiza, se obtiene la función de transferencia y se resumen sus parámetros. En paralelo existe un camino
        experimental que llega a los mismos números midiendo. Un ingeniero de procesos debe poder recorrer los dos.
      </p>

      <h2>Formulario del corte</h2>
      <Table
        caption="Lo que hay que tener disponible en el parcial"
        head={['Concepto', 'Expresión', 'Cuando se usa']}
        rows={[
          ['Error', '$e = y_{sp} - y$', 'Definición de partida de todo lazo'],
          ['Balance con acumulación', '$A dh/dt = F_e - F_s$', 'Modelado de cualquier capacidad'],
          ['Linealización', '$f(x) \\approx f(\\bar{x}) + f^{\\prime}(\\bar{x})(x - \\bar{x})$', 'Cuando aparece una raiz, un producto o un exponente'],
          ['Primer orden', '$G = K/(\\tau s + 1)$', 'Una sola capacidad dominante'],
          ['FOPDT', '$G = K e^{-\\theta s}/(\\tau s + 1)$', 'Modelo estándar de planta'],
          ['Dos puntos de Smith', '$\\tau = 1.5\\,(t_{63.2} - t_{28.3}),\\ \\theta = t_{63.2} - \\tau$', 'Identificación sobre datos con ruido'],
          ['Segundo orden', '$G = K/(\\tau^2s^2 + 2\\zeta\\tau s + 1)$', 'Dos capacidades o lazo cerrado'],
          ['Sobrepaso', '$e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}$', 'Evaluar si la oscilación es aceptable'],
        ]}
      />

      <h2>Los seis errores que mas puntos cuestan</h2>
      <ol>
        <li><strong>Confundir la manipulada con su efecto.</strong> En T-101 la manipulada es la apertura, no el flujo de salida.</li>
        <li><strong>Olvidar las variables de desviación.</strong> Si no se resta el estado estacionario, la función de transferencia arrastra términos constantes y deja de ser válida.</li>
        <li><strong>Evaluar la derivada de la linealización en un punto cualquiera.</strong> Siempre se evalua en el estado estacionario nominal.</li>
        <li><strong>Reportar unidades inconsistentes en K.</strong> La ganancia lleva unidades de la medida sobre unidades de la entrada; sin ellas el número no significa nada.</li>
        <li><strong>Dar un tiempo muerto negativo.</strong> Sale de leer mal los tiempos del método de dos puntos y no tiene sentido físico.</li>
        <li><strong>Dibujar dos controladores sobre un solo elemento final.</strong> Los grados de libertad no lo permiten.</li>
      </ol>

      <Callout kind="warn" title="Sobre el signo de la ganancia">
        <p>
          Si abrir la válvula hace <em>bajar</em> la medida, la ganancia del proceso es negativa y el controlador debe
          configurarse con acción directa. Reportar la ganancia sin signo es tan incompleto como reportarla sin unidades,
          porque el signo decide como se configura el instrumento.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <p>
        Los cuatro problemas siguientes recorren un mismo equipo, el precalentador E-101 de la unidad U-200, y encadenan
        todo lo visto: clasificar variables, escribir el balance, linealizar, transformar, identificar desde datos de
        planta y contrastar. Están pensados para resolverse en ese orden, porque cada uno usa el resultado del anterior.
      </p>

      {/* ---------------------------------------------------------- */}
      <h2>Problema 1. Clasificar y contar antes de calcular</h2>
      <Enunciado
        pide={[
          'Clasificar cada variable del equipo como controlada, manipulada, perturbación o parámetro.',
          'Contar los grados de libertad y decir cuántos lazos admite la unidad.',
          'Indicar la acción de falla de la válvula y justificarla por consecuencia.',
          'Escribir la etiqueta ISA de los tres instrumentos del lazo.',
        ]}
      >
        <p>
          El precalentador E-101 lleva la alimentación del reactor de 28 °C a 78 °C con vapor que condensa en la coraza.
          El flujo de alimentación lo fija la unidad anterior. La única válvula manipulable es la de vapor. Antes de
          modelar nada, el jefe de proceso pide el planteamiento del problema de control por escrito.
        </p>
      </Enunciado>

      <Step n="1" title="Clasificación">
        <Table
          caption="Las cuatro clases de variable en E-101"
          head={['Variable', 'Clase', 'Por qué']}
          rows={[
            ['Temperatura de salida $T$', 'Controlada', 'Es la que se quiere sostener en su valor deseado'],
            ['Apertura de la válvula de vapor', 'Manipulada', 'Es lo único sobre lo que el controlador puede actuar'],
            ['Flujo de alimentación $F$', 'Perturbación', 'Lo impone la unidad anterior, nadie lo mueve a propósito'],
            ['Temperatura de entrada $T_e$', 'Perturbación', 'Cambia con las condiciones de la corriente que llega'],
            ['Presión del cabezal de vapor', 'Perturbación', 'La fija la demanda del resto de la planta'],
            ['$U$, $A$, $C_p$, volumen retenido', 'Parámetros', 'Propiedades del equipo y del fluido, constantes en operación normal'],
          ]}
        />
        <Callout kind="warn" title="El error que se cobra puntos">
          <p>
            Escribir que la manipulada es el flujo de vapor. El flujo es una <strong>consecuencia</strong> de mover la
            apertura, y además depende de la presión del cabezal, que es una perturbación. La manipulada es siempre
            aquello sobre lo que el controlador actúa de forma directa.
          </p>
        </Callout>
      </Step>

      <Step n="2" title="Grados de libertad">
        <p>
          Con una sola válvula manipulable hay un grado de libertad, así que la unidad admite <strong>un solo lazo</strong>.
          Si además se quisiera controlar el flujo de alimentación, haría falta una segunda válvula. Cualquier propuesta
          con dos lazos sobre una válvula termina con uno de los dos en manual.
        </p>
      </Step>

      <Step n="3" title="Acción de falla y etiquetas">
        <p>
          Al perder el aire de instrumentos hay que retirar el aporte de calor, porque dejar vapor entrando sin
          supervisión es la peor situación posible. La válvula es <strong>falla cerrada</strong>, es decir aire para abrir.
        </p>
        <Table
          caption="Lazo de temperatura de E-101"
          head={['Etiqueta', 'Lectura', 'Ubicación']}
          rows={[
            ['TT-203', 'Transmisor de temperatura', 'En campo, con termopozo en la línea de salida'],
            ['TIC-203', 'Indicador controlador de temperatura', 'En sala, dentro del sistema distribuido'],
            ['TV-203', 'Válvula de control del lazo 203', 'En campo, sobre la línea de vapor'],
          ]}
        />
      </Step>

      <Answer>
        <p>
          Controlada: temperatura de salida. Manipulada: apertura de TV-203. Perturbaciones: flujo y temperatura de
          alimentación, y presión del cabezal. Un grado de libertad, un lazo. Válvula falla cerrada. Lazo 203 formado
          por TT-203, TIC-203 y TV-203.
        </p>
      </Answer>

      {/* ---------------------------------------------------------- */}
      <h2>Problema 2. Del balance de energía a la función de transferencia</h2>
      <Enunciado
        pide={[
          'Escribir el balance de energía sobre el contenido del equipo.',
          'Identificar el término no lineal y linealizarlo respecto de las dos entradas.',
          'Llevar el modelo a la forma estándar de primer orden y obtener $\tau$ y las tres ganancias.',
          'Transformar a Laplace y escribir las tres funciones de transferencia.',
          'Verificar la coherencia de las ganancias con un argumento físico.',
        ]}
      >
        <p>
          Con el problema de control ya planteado, hace falta el modelo. El equipo se comporta como un volumen bien
          mezclado que recibe calor por una superficie, así que basta un balance de energía sobre el contenido.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Volumen retenido del lado de proceso <Ei>{'V = 0.85\\ \\text{m}^3'}</Ei>, constante.</li>
          <li>Flujo nominal <Ei>{'\\bar{F} = 9.5\\ \\text{m}^3/\\text{h}'}</Ei>, <Ei>{'\\rho = 965\\ \\text{kg}/\\text{m}^3'}</Ei>, <Ei>{'C_p = 4.02\\ \\text{kJ}/\\text{kg}\\cdot \\text{K}'}</Ei>.</li>
          <li>Coraza: <Ei>{'U = 810\\ \\text{W}/\\text{m}^2\\cdot \\text{K}'}</Ei>, <Ei>{'A = 5.6\\ \\text{m}^2'}</Ei>.</li>
          <li>Entrada a 28 °C, vapor saturado condensando a <Ei>{'T_v'}</Ei>, salida nominal a 78 °C.</li>
        </ul>
      </Given>

      <Step n="1" title="Balance de energía">
        <Eq>{'\\rho V C_p \\frac{dT}{dt} = \\rho F C_p (T_e - T) + U A (T_v - T)'}</Eq>
        <p>
          Acumulación a la izquierda con la masa <em>retenida</em>; a la derecha, el arrastre por la corriente que sale y
          el intercambio con la coraza. Dos vías de salida de energía en paralelo.
        </p>
      </Step>

      <Step n="2" title="El término no lineal">
        <p>
          El producto <Ei>{'F\\cdot T'}</Ei> es no lineal porque el flujo también varía. Linealizando ese producto
          alrededor del punto de operación:
        </p>
        <Eq>{"(F\\,T)' \\approx \\bar{F}\\,T' + \\bar{T}\\,F', \\qquad (F\\,T_e)' \\approx \\bar{F}\\,T_e' + \\bar{T}_e\\,F'"}</Eq>
        <p>Sustituyendo y agrupando los términos que contienen <Ei>{"T'"}</Ei>:</p>
        <Eq>{"\\rho V C_p \\frac{dT'}{dt} + (\\rho\\bar{F} C_p + UA)\\,T' = \\rho\\bar{F} C_p\\,T_e' + UA\\,T_v' + \\rho C_p(\\bar{T}_e - \\bar{T})\\,F'"}</Eq>
      </Step>

      <Step n="3" title="Poner números">
        <Eq>{'\\rho\\bar{F} C_p = 965 \\times 9.5 \\times 4.02 = 3.685\\times 10^{4}\\ \\text{kJ}/\\text{h}\\cdot \\text{K}'}</Eq>
        <Eq>{'U A = 810 \\times 5.6 = 4536\\ \\text{W/K} = 1.633\\times 10^{4}\\ \\text{kJ}/\\text{h}\\cdot \\text{K}'}</Eq>
        <Eq>{'\\rho V C_p = 965 \\times 0.85 \\times 4.02 = 3.297\\times 10^{3}\\ \\text{kJ}/\\text{K}'}</Eq>
        <Eq>{'\\tau = \\frac{3.297\\times 10^{3}}{3.685\\times 10^{4} + 1.633\\times 10^{4}} = \\frac{3.297\\times 10^{3}}{5.318\\times 10^{4}} = 0.0620\\ \\text{h} = 3.72\\ \\text{min}'}</Eq>
      </Step>

      <Step n="4" title="Las tres ganancias">
        <Eq>{'K_{T_e} = \\frac{3.685}{5.318} = 0.693, \\qquad K_{T_v} = \\frac{1.633}{5.318} = 0.307'}</Eq>
        <p>
          Las dos primeras suman uno, como exige el balance. Para la tercera hace falta la temperatura de vapor de
          operación, que sale del estado estacionario:
        </p>
        <Eq>{'\\bar{T} = 0.693\\,\\bar{T}_e + 0.307\\,\\bar{T}_v \\;\\Rightarrow\\; 78 = 0.693(28) + 0.307\\,\\bar{T}_v \\;\\Rightarrow\\; \\bar{T}_v = 191\\ \\text{°C}'}</Eq>
        <Eq>{'K_F = \\frac{\\rho C_p(\\bar{T}_e - \\bar{T})}{5.318\\times 10^{4}} = \\frac{965 \\times 4.02 \\times (28 - 78)}{5.318\\times 10^{4}} = -3.65\\ \\frac{\\text{°C}}{\\text{m}^3/\\text{h}}'}</Eq>
      </Step>

      <Step n="5" title="Funciones de transferencia y verificación">
        <Eq>{"\\frac{T'(s)}{T_v'(s)} = \\frac{0.307}{3.72\\,s + 1}, \\qquad\\frac{T'(s)}{T_e'(s)} = \\frac{0.693}{3.72\\,s + 1}, \\qquad\\frac{T'(s)}{F'(s)} = \\frac{-3.65}{3.72\\,s + 1}"}</Eq>
        <p>
          El signo negativo de <Ei>{'K_F'}</Ei> es la verificación física: si entra más alimentación fría con el mismo
          aporte de calor, la salida se enfría. Un signo positivo ahí habría delatado un error de álgebra.
        </p>
        <Callout kind="plant" title="Lo que estos tres números le dicen al ingeniero">
          <p>
            La ganancia frente a la temperatura de entrada, 0.693, más que duplica la ganancia frente al vapor, 0.307.
            Eso significa que la coraza está subdimensionada frente a la carga: para compensar 10 °C de enfriamiento en
            la entrada, el vapor tiene que subir <Ei>{'0.693 \\times 10/0.307 = 22.6'}</Ei> °C de temperatura de
            condensación. Es un argumento de diseño que sale del modelo, no del catálogo.
          </p>
        </Callout>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 3.72'}</Ei> min, <Ei>{'K_{T_v} = 0.307'}</Ei>, <Ei>{'K_{T_e} = 0.693'}</Ei> y{' '}
          <Ei>{'K_F = -3.65'}</Ei> °C por m³/h. El equipo responde en unos 19 min al 99 %, y es más sensible a la
          perturbación de entrada que a su propia manipulada.
        </p>
      </Answer>

      {/* ---------------------------------------------------------- */}
      <h2>Problema 3. Identificación desde el registro de planta</h2>
      <Enunciado
        pide={[
          'Verificar que los dos instantes reportados corresponden al 28.3 % y al 63.2 % del cambio total.',
          'Calcular la ganancia en porcentaje de rango y en unidades de ingeniería.',
          'Obtener $\tau$ y $\theta$ por el método de los dos puntos.',
          'Comparar el resultado con el modelo teórico del problema 2 y explicar la diferencia.',
          'Decidir qué conjunto de parámetros se carga en el controlador.',
        ]}
      >
        <p>
          El modelo teórico predice una constante de tiempo y ningún tiempo muerto. Antes de sintonizar hay que
          contrastar esa predicción contra la planta. Con TIC-203 en manual y la unidad estable se abrió la válvula de
          vapor de 46 % a 56 % y se registró la temperatura de salida.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Rango de TT-203: 0 a 150 °C.</li>
          <li>Temperatura inicial 78.0 °C, temperatura final 92.4 °C.</li>
          <li>Alcanza 82.1 °C a los 3.1 min y 87.1 °C a los 7.3 min.</li>
        </ul>
      </Given>

      <Step n="1" title="Verificar los dos puntos">
        <Eq>{'\\Delta y_{\\infty} = 92.4 - 78.0 = 14.4\\ \\text{°C}'}</Eq>
        <Eq>{'\\frac{82.1 - 78.0}{14.4} = 0.285 \\approx 0.283, \\qquad\\frac{87.1 - 78.0}{14.4} = 0.632'}</Eq>
        <p>Coinciden con los porcentajes del método, así que los tiempos leídos son los correctos.</p>
      </Step>

      <Step n="2" title="Ganancia en las dos escalas">
        <Eq>{'K_{\\text{ing}} = \\frac{14.4}{56 - 46} = 1.44\\ \\text{°C}/\\%'}</Eq>
        <Eq>{'K_{\\%} = \\frac{14.4/150 \\times 100}{10} = \\frac{9.60}{10} = 0.960\\ \\%/\\%'}</Eq>
        <p>
          La segunda es adimensional y es la que piden las reglas de sintonía. Reportar solo la primera obliga a
          convertir después y es la fuente más común de errores de un factor.
        </p>
      </Step>

      <Step n="3" title="Constante de tiempo y tiempo muerto">
        <Eq>{'\\tau = 1.5\\,(7.3 - 3.1) = 6.30\\ \\text{min}, \\qquad\\theta = 7.3 - 6.30 = 1.00\\ \\text{min}'}</Eq>
        <Eq>{'\\frac{\\theta}{\\tau} = 0.159'}</Eq>
      </Step>

      <Step n="4" title="Contrastar con el modelo teórico">
        <Table
          caption="Teoria frente a planta"
          head={['Fuente', '$\\tau$ (min)', '$\\theta$ (min)', '$\\tau + \\theta$ (min)', '$K$ (%/%)']}
          numeric={[1, 2, 3, 4]}
          rows={[
            ['Modelo del problema 2', '3.72', '0', '3.72', '0.307 respecto de $T_v$'],
            ['Prueba de planta', '6.30', '1.00', '7.30', '0.960 respecto de la apertura'],
          ]}
        />
        <p>
          Las dos ganancias no son comparables directamente: el modelo la expresa respecto de la temperatura de
          condensación del vapor y la prueba respecto de la apertura de la válvula. Entre ambas está la característica
          instalada de TV-203, que aporta el factor que falta.
        </p>
        <p>
          Las constantes de tiempo sí son comparables, y la planta es casi el doble de lenta. La diferencia la explican
          tres cosas que el modelo ideal ignora: la mezcla no es perfecta, la carrera del actuador tarda, y el termopozo
          agrega su propia inercia. Nótese además que la suma <Ei>{'\\tau + \\theta = 7.3'}</Ei> min es el número que
          gobierna el desempeño alcanzable, y que ese reparto entre constante y retardo es típico cuando un proceso de
          orden alto se fuerza a un modelo de primer orden.
        </p>
      </Step>

      <Step n="5" title="Decidir">
        <p>
          En el controlador se cargan los parámetros de la prueba: <Ei>{'K = 0.960'}</Ei> %/%,{' '}
          <Ei>{'\\tau = 6.30'}</Ei> min y <Ei>{'\\theta = 1.00'}</Ei> min. El modelo teórico sirvió para entender qué
          mueve a qué y para detectar que la coraza está justa; los números que se configuran salen siempre de la
          prueba.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'G(s) = 0.960\\,e^{-1.0s}/(6.30s + 1)'}</Ei> en porcentaje de rango, con el tiempo en minutos. Con{' '}
          <Ei>{'\\theta/\\tau = 0.16'}</Ei> el lazo es fácil y admite sintonías agresivas sin comprometer la
          estabilidad.
        </p>
      </Answer>

      {/* ---------------------------------------------------------- */}
      <h2>Problema 4. Qué pasa si el equipo fuera de segundo orden</h2>
      <Enunciado
        pide={[
          'Obtener la función de transferencia del conjunto proceso más sensor.',
          'Identificar $\tau$ y $\zeta$ de la forma estándar y decidir si el conjunto puede oscilar.',
          'Estimar el tiempo de asentamiento.',
          'Reducir el conjunto a un modelo de primer orden con tiempo muerto y comparar con la prueba de planta.',
        ]}
      >
        <p>
          El termopozo de TT-203 tiene su propia constante de tiempo. Tratado por separado, el conjunto proceso más
          sensor ya no es de primer orden. Se quiere saber si esa segunda capacidad basta para explicar el retardo
          medido en la prueba y si el conjunto puede llegar a oscilar por sí solo.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Proceso térmico identificado: <Ei>{'\\tau_1 = 5.4'}</Ei> min, ganancia 0.960 %/%.</li>
          <li>Termopozo de acero sin relleno: <Ei>{'\\tau_2 = 1.4'}</Ei> min, ganancia unitaria.</li>
        </ul>
      </Given>

      <Step n="1" title="Conjunto en serie">
        <Eq>{'G(s) = \\frac{0.960}{(5.4\\,s + 1)(1.4\\,s + 1)} = \\frac{0.960}{7.56\\,s^2 + 6.8\\,s + 1}'}</Eq>
      </Step>

      <Step n="2" title="Forma estándar">
        <Eq>{'\\tau = \\sqrt{\\tau_1\\tau_2} = \\sqrt{5.4 \\times 1.4} = 2.75\\ \\text{min}'}</Eq>
        <Eq>{'\\zeta = \\frac{\\tau_1 + \\tau_2}{2\\sqrt{\\tau_1\\tau_2}} = \\frac{6.8}{2(2.75)} = 1.24'}</Eq>
        <p>
          Mayor que uno, sobreamortiguado. Dos capacidades en serie sin interacción nunca dan <Ei>{'\\zeta < 1'}</Ei>,
          así que este conjunto <strong>no puede oscilar</strong>. Si en planta se observara oscilación, la causa estaría
          en el controlador o en el elemento final, nunca en el equipo.
        </p>
      </Step>

      <Step n="3" title="Tiempo de asentamiento">
        <p>
          Al ser sobreamortiguado domina el polo lento. Como referencia práctica se toman tres veces la suma de las dos
          constantes:
        </p>
        <Eq>{'t_{95\\%} \\approx 3(\\tau_1 + \\tau_2) = 3(6.8) = 20.4\\ \\text{min}'}</Eq>
      </Step>

      <Step n="4" title="Reducir a primer orden con tiempo muerto">
        <p>Aplicando la regla de la semisuma, se conserva la constante mayor más la mitad de la menor:</p>
        <Eq>{'\\tau_{eq} = 5.4 + \\frac{1.4}{2} = 6.10\\ \\text{min}, \\qquad\\theta_{eq} = \\frac{1.4}{2} = 0.70\\ \\text{min}'}</Eq>
        <Table
          caption="El modelo reducido contra la prueba de planta"
          head={['Fuente', '$\\tau$ (min)', '$\\theta$ (min)', '$\\tau + \\theta$ (min)']}
          numeric={[1, 2, 3]}
          rows={[
            ['Reducción del segundo orden', '6.10', '0.70', '6.80'],
            ['Prueba de planta del problema 3', '6.30', '1.00', '7.30'],
          ]}
        />
        <p>
          Los dos coinciden dentro del 7 %. Esa concordancia confirma la hipótesis: el retardo que aparece en la prueba
          no es un tiempo muerto verdadero sino la segunda capacidad del termopozo, disfrazada de retardo por el ajuste a
          primer orden. El resto, unos 0.3 min, lo aporta la carrera del actuador.
        </p>
      </Step>

      <Answer>
        <p>
          <Ei>{'\\tau = 2.75'}</Ei> min y <Ei>{'\\zeta = 1.24'}</Ei>: sobreamortiguado, sin oscilación posible. Se
          asienta en unos 20 min. Reducido a FOPDT da <Ei>{'\\tau_{eq} = 6.1'}</Ei> min y{' '}
          <Ei>{'\\theta_{eq} = 0.7'}</Ei> min, muy cerca de lo medido en planta, lo que identifica al termopozo como el
          origen del retardo aparente.
        </p>
      </Answer>

      <Reveal label="Problema 5, para resolver sin ayuda">
        <div className="enunciado">
          <span className="kicker">Enunciado</span>
          <p>
            El mismo precalentador se opera ahora con la mitad del flujo de alimentación, 4.75 m³/h, porque la unidad
            anterior bajó de carga. El resto de los datos del problema 2 no cambia.
          </p>
          <span className="kicker pide-t">Se pide</span>
          <ol className="pide">
            <li>Recalcular la constante de tiempo y las tres ganancias en el punto de operación nuevo.</li>
            <li>Determinar la temperatura de vapor necesaria para sostener los mismos 78 °C de salida.</li>
            <li>Calcular en cuánto cambia el producto <Ei>{'K_c K'}</Ei> si la sintonía se dejó fija.</li>
            <li>Decidir si hace falta resintonizar y con qué argumento.</li>
          </ol>
        </div>
        <p style={{ color: 'var(--ink-3)', fontSize: '.93rem', marginTop: 'var(--s4)' }}>
          Respuestas: <Ei>{'\\tau = 5.69'}</Ei> min, <Ei>{'K_{T_e} = 0.530'}</Ei>, <Ei>{'K_{T_v} = 0.470'}</Ei>,{' '}
          <Ei>{'K_F = -5.58'}</Ei> °C por m³/h, <Ei>{'\\bar{T}_v = 134'}</Ei> °C. La ganancia frente al vapor sube un
          53 % y la constante de tiempo un 53 %: como suben juntas, una regla del tipo IMC absorbe casi todo el cambio y
          basta con verificar, no con resintonizar desde cero.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'En un lazo de temperatura la medida sube cuando la salida del controlador baja. Esto significa que:',
    options: [
      'El transmisor está mal calibrado',
      'El lazo es inestable',
      'La ganancia del proceso es positiva y el controlador debe ir con acción inversa',
      'La ganancia del proceso es negativa y el controlador debe ir con acción directa'],
    answer: 3,
    why: 'Siguiendo la convención de Smith y Corripio, con ganancia de proceso negativa la acción directa invierte el signo del controlador, de modo que el producto de las ganancias del lazo queda positivo. Esa es la condición de realimentación negativa, que es lo que hace que el lazo corrija en lugar de amplificar.',
  },
  {
    q: 'Al pasar a variables de desviación, la condición inicial del sistema es:',
    options: ['El valor nominal de la variable', 'Cero, por construcción', 'El valor del punto de control', 'Indeterminada hasta conocer la entrada'],
    answer: 1,
    why: 'La variable de desviación se define como la diferencia respecto del estado estacionario, así que en el instante inicial vale cero. Eso es lo que permite usar la transformada de Laplace sin arrastrar condiciones iniciales.',
  },
  {
    q: 'Un tanque tiene $\\tau = 30$ min y opera con lazo de nivel promediante. Un cambio de 2 m³/h en la alimentación:',
    options: [
      'Puede absorberse dejando que el nivel se mueva, para no transmitir la variación aguas abajo',
      'Debe corregirse en menos de 5 min para proteger el equipo',
      'Obliga a cerrar la válvula por completo',
      'No afecta el nivel porque el lazo está cerrado'],
    answer: 0,
    why: 'El proposito del tanque pulmon es amortiguar. Un lazo agresivo trasladaría la variación de flujo intacta a la unidad siguiente, anulando la función del equipo.',
  },
  {
    q: 'La derivada de la linealización de $F_s = C_v x\\sqrt{h}$ respecto de $h$ se evalua en:',
    options: ['h = 0', 'La altura total del tanque', 'El nivel del estado estacionario nominal', 'El nivel medido en cada instante'],
    answer: 2,
    why: 'La serie de Taylor se expande alrededor del punto de operación nominal. Evaluarla en el valor instantaneo devolvería de nuevo una ecuación no lineal y perdería todo el proposito del procedimiento.',
  },
  {
    q: 'Un proceso responde a un escalon con un pico del 25 % por encima del valor final. Su razón de amortiguamiento es aproximadamente:',
    options: ['0.10', '0.22', '0.40', '0.70'],
    answer: 2,
    why: 'De la relación de sobrepaso, $\\zeta\\approx 0.40$ produce cerca de 25 %. El valor 0.215 corresponde al 50 % y 0.70 apenas al 4.6 %.',
  },
  {
    q: 'El instrumento LSHH-101 en un P&ID corresponde a:',
    options: [
      'Un transmisor de nivel con dos salidas',
      'Un interruptor por nivel muy alto, asociado a protección',
      'Un controlador de nivel con punto de control alto',
      'Un indicador local de nivel',
    ],
    answer: 1,
    why: 'L es nivel, S es interruptor y HH es el modificador de nivel muy alto. Pertenece a la capa de protección y por norma va en un sistema independiente del control regulatorio.',
  },
  {
    q: 'Dos capacidades no interactuantes en serie con constantes de tiempo distintas dan siempre:',
    options: [
      'Un sistema subamortiguado',
      'Un sistema de primer orden equivalente',
      'Un sistema con respuesta inversa',
      'Un sistema con $\\zeta > 1$, estrictamente sobreamortiguado'],
    answer: 3,
    why: 'Se cumple $\\zeta=(\\tau_1+\\tau_2)/(2\\sqrt{\\tau_1\\tau_2})$, expresión que por la desigualdad entre media aritmetica y geométrica vale al menos 1, con igualdad solo si las constantes coinciden.',
  },
  {
    q: 'La ganancia de un proceso vale 2.5 grados por punto porcentual. Un cambio permanente de 4 % en la salida del controlador produce en estado estacionario:',
    options: [ 'Un cambio de 10 grados', 'Un cambio de 6.25 grados','Un cambio de 0.625 grados', 'No se puede saber sin conocer $\\tau$'],
    answer: 0,
    why: 'La ganancia relaciona cambios en estado estacionario: $\\Delta y = K\\Delta u = 2.5\\times 4 = 10$ grados. La constante de tiempo determina cuánto tarda, no cuánto vale.',
  },
  {
    q: 'Se mide una curva de reacción y se obtiene $\\theta = 12$ min con $\\tau = 4$ min. La lectura correcta es:',
    options: [
      'Lazo fácil de controlar, admite ganancia alta',
      'Lazo dominado por tiempo muerto, la realimentación sola rendira poco',
      'Los datos están mal, porque $\\theta$ no puede superar a $\\tau$',
      'El proceso es de segundo orden',
    ],
    answer: 1,
    why: 'Con $\\theta/\\tau = 3$ el retardo domina. Es perfectamente posible físicamente, por ejemplo en un analizador con muestreo lento, y obliga a considerar acción anticipativa o compensación de tiempo muerto.',
  },
  {
    q: 'En el P&ID de un área aparece una sola válvula de control y dos transmisores, de nivel y de flujo. Los grados de libertad de control son:',
    options: ['Dos, uno por transmisor', 'Tres, contando el punto de control', 'Uno, determinado por el único elemento final', 'Cero, hasta definir la estrategia'],
    answer: 2,
    why: 'Los grados de libertad los fijan las corrientes manipulables, no la cantidad de mediciones. Con una válvula se puede fijar una sola variable; la segunda medición sirve para indicación, alarma o para un esquema de cascada donde solo hay un punto de control independiente.',
  },
];
