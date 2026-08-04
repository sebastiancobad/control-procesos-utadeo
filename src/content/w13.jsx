import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, Block, Arrow, Bubble, Sig, ControlValve, Vessel } from '../lib/isa.jsx';

export const meta = {
  id: 'w13',
  week: 14,
  code: 'CP26II-M12',
  title: 'Control selectivo, override y programación de ganancia',
  unit: 'Torre CT-301 y compresor K-301',
  lede: 'Estrategias para procesos donde el objetivo cambia según la situación: proteger un límite, elegir la medida mas crítica o adaptar la sintonía a la carga.',
  objectives: [
    'Distinguir control selectivo por medida y control override por salida.',
    'Configurar selectores de máximo y mínimo con protección contra windup.',
    'Aplicar programación de ganancia cuando la ganancia del proceso varía con la carga.',
    'Reconocer cuando conviene una medida inferida en lugar de un analizador.',
  ],
  refs: ['shinskey', 'marlin', 'astrom', 'smith', 'perry'],
};

function FigOverride() {
  return (
    <Figure vw={880} vh={296} num="11.1" caption="Control override. Dos controladores compiten por la misma válvula y un selector deja pasar al que pide la acción mas conservadora. El que pierde debe recibir realimentación para no saturar su integrador.">
      <Block cx={150} cy={70} w={200} h={64} label="FIC-301" sub="flujo, objetivo normal" />
      <Block cx={150} cy={200} w={200} h={64} label="PIC-302" sub="presión, límite a proteger" fill={C.white} stroke={C.alarm} />
      <Arrow x1={252} y1={70} x2={330} y2={110} color={C.ink} />
      <Arrow x1={252} y1={200} x2={330} y2={160} color={C.alarm} />
      <Block cx={402} cy={135} w={104} h={92} label="<" fill={C.pale} stroke={C.navy} size={46} />
      <T x={470} y={252} size={20} color={C.navy} anchor="start">selector de mínimo</T>
      <Arrow x1={460} y1={135} x2={534} y2={135} color={C.mv} head="ahm" />
      <Block cx={612} cy={135} w={140} h={64} label="Válvula" />
      <Arrow x1={684} y1={135} x2={752} y2={135} color={C.ink} />
      <Block cx={820} cy={135} w={94} h={64} label="Proceso" fill={C.pale} />
      {/* realimentación externa: la salida del selector vuelve a los dos controladores */}
      <L x1={402} y1={182} x2={402} y2={252} color={C.grey} w={1.6} dash="6,5" />
      <L x1={402} y1={252} x2={150} y2={252} color={C.grey} w={1.6} dash="6,5" />
      <Arrow x1={150} y1={252} x2={150} y2={236} color={C.grey} />
      <L x1={286} y1={252} x2={286} y2={40} color={C.grey} w={1.6} dash="6,5" />
      <L x1={286} y1={40} x2={150} y2={40} color={C.grey} w={1.6} dash="6,5" />
      <Arrow x1={150} y1={40} x2={150} y2={36} color={C.grey} />
      <T x={560} y={270} size={19} color={C.grey} anchor="end">realimentación externa contra windup, a los dos</T>
    </Figure>
  );
}

function FigGain() {
  return (
    <Figure vw={800} vh={300} num="11.2" caption="Programación de ganancia. Al subir la carga la ganancia del proceso cae, así que la del controlador debe subir por tramos para que el producto de ambas permanezca constante.">
      <L x1={80} y1={250} x2={740} y2={250} color={C.ink} w={2} />
      <L x1={80} y1={30} x2={80} y2={250} color={C.ink} w={2} />
      <T x={410} y={282} size={21} color={C.ink}>carga de la planta (%)</T>

      {/* ganancia del proceso: decrece con la carga, de 2.40 a 0.72 */}
      <path d="M80,60 C220,74 360,124 520,168 C620,192 690,204 740,210" fill="none" stroke={C.dist} strokeWidth="2.8" />
      <T x={96} y={44} size={20} color={C.dist} anchor="start">ganancia del proceso K_p</T>

      {/* ganancia del controlador: escalones crecientes, de 0.85 a 2.84 */}
      <path d="M80,214 L260,214 L260,176 L440,176 L440,132 L620,132 L620,86 L740,86" fill="none" stroke={C.navy} strokeWidth="2.8" />
      <T x={736} y={70} size={20} color={C.navy} anchor="end">ganancia del controlador K_c</T>

      <L x1={80} y1={155} x2={740} y2={155} color={C.mv} w={2} dash="8,5" />
      <T x={736} y={142} size={20} color={C.mv} anchor="end">producto K_c K_p constante</T>
      {[260, 440, 620].map((x) => (
        <L key={x} x1={x} y1={30} x2={x} y2={250} color={C.grid} w={1} />
      ))}
    </Figure>
  );
}


export function Teoria() {
  return (
    <div className="prose">
      <h2>Cuando el objetivo cambia con la situación</h2>
      <p>
        Las estrategias anteriores suponen un objetivo fijo. Hay procesos donde eso deja de ser cierto: mientras la
        operación es normal se persigue rendimiento, y cuando aparece un límite se persigue protección. Las tres
        estrategias de este módulo responden a ese cambio de objetivo sin recurrir a la intervención del operador.
      </p>

      <h2>Control selectivo por medida</h2>
      <p>
        Varias mediciones de la misma naturaleza compiten y un selector deja pasar la mas crítica al controlador. El caso
        clasico es un reactor de lecho fijo con termopares a distintas alturas: el que interesa controlar es el punto
        caliente, y ese punto se desplaza a lo largo del lecho conforme el catalizador se desactiva.
      </p>
      <Eq n="11.1">{'T_{control} = \\max\\{T_1, T_2, \\ldots, T_n\\}'}</Eq>
      <p>
        El selector convierte un problema con posición variable en un lazo ordinario. Se usa también con temperaturas de
        motores, con presiones en distintos puntos de una línea larga y con niveles en recipientes acoplados.
      </p>

      <h2>Control override por salida</h2>
      <FigOverride />
      <p>
        Aquí compiten dos controladores con objetivos distintos sobre un mismo elemento final. Un selector de mínimo o de
        máximo deja pasar la salida mas conservadora. En un compresor K-301, el lazo de flujo opera normalmente y el lazo
        de presión de descarga toma el mando si esa presión se acerca al límite del equipo.
      </p>
      <Table
        caption="Elección del selector"
        head={['Situación', 'Selector', 'Razón']}
        rows={[
          ['La protección exige cerrar la válvula', 'Mínimo (<)', 'Pasa la salida menor, que es la mas cerrada'],
          ['La protección exige abrir la válvula', 'Máximo (>)', 'Pasa la salida mayor, que es la mas abierta'],
        ]}
      />

      <Callout kind="warn" title="El problema que define esta estrategia">
        <p>
          El controlador que no fue seleccionado sigue calculando sobre un error que nunca se corrige, así que su
          integrador se satura. Cuando la situación cambia y le toca tomar el mando, arranca desde un valor absurdo y
          produce una perturbación severa. La solución es la realimentación externa: la salida seleccionada se devuelve a
          ambos controladores para inicializar sus integradores. Sin ella, un esquema override es peor que no tenerlo.
        </p>
      </Callout>

      <h2>Programación de ganancia</h2>
      <FigGain />
      <p>
        Cuando la ganancia del proceso cambia de forma conocida con la carga, se ajusta la ganancia del controlador en
        sentido contrario para que el producto permanezca constante:
      </p>
      <Eq n="11.2">{'K_c(\\text{carga}) \\cdot K_p(\\text{carga}) = \\text{constante}'}</Eq>
      <p>
        La variable de programación debe ser medible, cambiar despacio y tener una relación conocida con la ganancia.
        Los casos habituales son el flujo de proceso en un intercambiador, el nivel en un tanque de fondo esferico y el
        pH cerca del punto de equivalencia, donde la ganancia cambia varios ordenes de magnitud.
      </p>
      <Table
        caption="Ejemplo de tabla de programación"
        head={['Carga (%)', '$K_p$ estimada', '$K_c$ programada', 'Producto']}
        numeric={[0, 1, 2, 3]}
        rows={[
          ['0 a 30', '2.40', '0.85', '2.04'],
          ['30 a 60', '1.60', '1.28', '2.05'],
          ['60 a 85', '1.05', '1.95', '2.05'],
          ['85 a 100', '0.72', '2.84', '2.04'],
        ]}
      />
      <p>
        La programación por tramos produce saltos en la salida al cruzar un límite. Se evita interpolando de forma lineal
        entre tramos, o aplicando el cambio solo al término proporcional y dejando el integral con transición suave.
      </p>

      <h2>Medida inferida</h2>
      <p>
        Los analizadores de composición son caros, lentos y requieren mantenimiento constante. Una alternativa es
        <strong> inferir</strong> la composición a partir de variables secundarias baratas y rápidas. En una columna de
        destilación la temperatura de un plato, corregida por presión, estima la composición mucho mas rápido que un
        cromatografo:
      </p>
      <Eq n="11.3">{'x_{estimada} = f(T_{plato},\\, P,\\, F_{alim})'}</Eq>
      <p>
        La estructura habitual combina las dos fuentes. El estimador controla instante a instante y el analizador, cuando
        entrega un valor válido, corrige el sesgo del estimador en una cascada lenta. Así se obtiene la rapidez de la
        medida secundaria y la exactitud del analizador.
      </p>

      <Callout kind="plant" title="Criterio de decisión">
        <p>
          Antes de instalar un analizador conviene preguntar si existe una variable secundaria correlacionada. Un lazo de
          temperatura de plato bien elegido supera en desempeño a un lazo de composición con analizador de ciclo lento,
          porque el tiempo muerto del analizador degrada mas de lo que su exactitud aporta.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Override sobre el circuito de agua de la torre CT-301</h2>
      <Enunciado
        pide={[
          'Decidir en que sentido debe actuar la protección sobre el elemento final.',
          'Elegir el tipo de selector y escribir la expresión de la salida a la válvula.',
          'Fijar el punto de control del controlador de protección y justificar el margen elegido.',
          'Verificar el sentido de acción de cada uno de los dos controladores.',
          'Definir la protección contra saturación del controlador que no tiene el mando.',
        ]}
      >
        <p>
          La bomba P-301 envía agua fría al circuito de proceso bajo control de flujo. Cuando la carga térmica sube, la
          pileta de la torre baja y la bomba corre riesgo de descebarse. Poner el lazo en manual cada vez que eso ocurre
          no es aceptable. Se quiere que el lazo de flujo ceda el mando automáticamente al de nivel cuando el inventario
          este comprometido, y lo recupere solo cuando se recupere.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>La bomba P-301 envia agua fría al circuito de proceso. El lazo normal es de flujo, FIC-311.</li>
          <li>El nivel de la pileta de la torre no debe bajar de 25 % para no descebar la bomba. Lo vigila LIC-312.</li>
          <li>La válvula de descarga FV-311 es de acción falla cerrada.</li>
          <li>Sintonias: FIC-311 con <Ei>{'K_c = 0.8'}</Ei>, <Ei>{'\\tau_I = 0.4'}</Ei> min.
            LIC-312 con <Ei>{'K_c = 1.5'}</Ei>, <Ei>{'\\tau_I = 8'}</Ei> min.</li>
        </ul>
      </Given>

      <Step n="1" title="Decidir el sentido de la protección">
        <p>
          Si el nivel de la pileta baja, la acción protectora es reducir el flujo enviado, es decir cerrar FV-311.
          Con válvula falla cerrada, cerrar corresponde a una salida menor.
        </p>
      </Step>

      <Step n="2" title="Elegir el selector">
        <p>
          Se necesita que el controlador de nivel imponga su criterio solo cuando pida <strong>menos</strong> apertura que
          el de flujo. Eso lo consigue un selector de mínimo:
        </p>
        <Eq n="11.4">{'u_{\\text{válvula}} = \\min\\{u_{FIC-311},\\ u_{LIC-312}\\}'}</Eq>
      </Step>

      <Step n="3" title="Configurar el punto de control del controlador de protección">
        <p>
          LIC-312 se configura con punto de control en 30 %, cinco puntos por encima del límite crítico. Ese margen le da tiempo
          de actuar antes de alcanzar el valor peligroso, y evita que tome el mando por oscilaciones normales del nivel.
        </p>
      </Step>

      <Step n="4" title="Verificar la acción de cada controlador">
        <Table
          caption="Sentido de acción requerido"
          head={['Controlador', 'Si la medida sube', 'La salida debe', 'Acción']}
          rows={[
            ['FIC-311', 'El flujo supera el punto de control', 'Bajar, para cerrar la válvula', 'Inversa'],
            ['LIC-312', 'El nivel sube sobre 30 %', 'Subir, para permitir mas flujo', 'Directa'],
          ]}
        />
        <p>
          Que los dos tengan acción opuesta es correcto en este esquema. Cada uno responde a una variable distinta y el
          selector se encarga de arbitrar.
        </p>
      </Step>

      <Step n="5" title="Protección contra saturación">
        <p>
          Se habilita realimentación externa en ambos controladores, alimentada con la salida del selector. Mientras
          FIC-311 tiene el mando, el integrador de LIC-312 se inicializa con esa salida y permanece listo para tomar el
          relevo sin salto. La transición entre uno y otro resulta continua.
        </p>
      </Step>

      <Answer>
        <p>
          Selector de mínimo entre FIC-311 y LIC-312, con LIC-312 en punto de control de 30 % y acción directa, FIC-311 con acción
          inversa, y realimentación externa desde la salida del selector hacia ambos controladores.
        </p>
      </Answer>

      <Reveal label="Segundo caso: programación de ganancia en el intercambiador E-101">
        <p>
          La ganancia del lazo de temperatura de E-101 varía con el flujo de proceso según
          <Ei>{'\\ K_p = 3.6/F'}</Ei>, con <Ei>{'F'}</Ei> en unidades de 10 m³/h. El lazo se sintonizo a
          <Ei>{'\\ F = 3'}</Ei> con <Ei>{'K_c = 1.5'}</Ei>.
        </p>
        <Eq>{'K_p(3) = 1.20 \\quad\\Longrightarrow\\quad K_c K_p = 1.80'}</Eq>
        <p>Para conservar ese producto en todo el rango de operación:</p>
        <Eq n="11.5">{'K_c(F) = \\frac{1.80}{K_p(F)} = \\frac{1.80\\,F}{3.6} = 0.5\\,F'}</Eq>
        <Table
          caption="Tabla de programación resultante"
          head={['$F (10 m^3/h)$', '$K_p$', '$K_c$ programada']}
          numeric={[0, 1, 2]}
          rows={[['1.5', '2.40', '0.75'], ['3.0', '1.20', '1.50'], ['4.5', '0.80', '2.25'], ['6.0', '0.60', '3.00']]}
        />
        <p>
          La ganancia del controlador resulta proporcional al flujo. Es un resultado frecuente en intercambiadores y en
          reactores continuos, y explica por que un lazo bien sintonizado a media carga oscila al subir la planta a
          capacidad plena.
        </p>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'En un reactor de lecho fijo con seis termopares se controla la temperatura del punto caliente, que se desplaza con el tiempo. La estrategia adecuada es:',
    options: [
      'Control en cascada con los seis termopares',
      'Promediar las seis medidas',
      'Rango partido entre los termopares',
      'Selector de máximo sobre las seis medidas'],
    answer: 3,
    why: 'Un selector de máximo entrega siempre la temperatura mas alta al controlador, sin importar en que punto del lecho ocurra. Promediar diluiría justamente la información crítica.',
  },
  {
    q: 'El problema central de un esquema override es:',
    options: [
      'Que el controlador no seleccionado satura su integrador y produce un salto al tomar el mando',
      'Que requiere dos válvulas',
      'Que solo funciona con controladores proporcionales',
      'Que aumenta el tiempo muerto del lazo'],
    answer: 0,
    why: 'El controlador perdedor sigue integrando un error que nunca se corrige. La realimentación externa desde la salida del selector inicializa su integrador y hace que la transición sea continua.',
  },
  {
    q: 'Una protección exige cerrar la válvula cuando se alcanza el límite. El selector correcto es:',
    options: ['De máximo', 'De mínimo', 'De promedio', 'Depende de la acción del controlador'],
    answer: 1,
    why: 'Con válvula falla cerrada, cerrar corresponde a la salida menor. El selector de mínimo deja pasar siempre la señal mas conservadora en ese sentido.',
  },
  {
    q: 'La ganancia de un proceso vale 2.0 a baja carga y 0.5 a alta carga. Con programación de ganancia, el controlador debe:',
    options: [
      'Usar la misma $K_c$ en todo el rango',
      'Usar $K_c$ alta a baja carga y baja a alta carga',
      'Usar $K_c$ baja a baja carga y alta a alta carga',
      'Cambiar solo el tiempo integral'],
    answer: 2,
    why: 'El producto $K_cK_p$ debe permanecer constante. Donde la ganancia del proceso es grande el controlador debe usar ganancia pequeña, y al reves.',
  },
  {
    q: 'Una medida inferida de composición a partir de temperatura de plato se prefiere a un cromatografo cuando:',
    options: [
      'La exactitud es el único criterio',
      'La columna opera a presión variable',
      'El tiempo muerto del analizador degrada el lazo mas de lo que su exactitud aporta',
      'No hay presupuesto para instrumentación'],
    answer: 2,
    why: 'Un analizador con ciclo de varios minutos introduce un tiempo muerto que limita severamente la ganancia utilizable. La temperatura de plato responde en segundos, y su sesgo se corrige con el analizador en una cascada lenta.',
  },
  {
    q: 'La programación de ganancia por tramos puede producir saltos en la salida al cruzar un límite. Se evita:',
    options: [
      'Interpolando de forma continua entre tramos',
      'Reduciendo el número de tramos a dos',
      'Desactivando la acción integral',
      'Usando selector de mínimo'],
    answer: 0,
    why: 'Un cambio brusco de ganancia con error distinto de cero produce un escalon en el término proporcional. La interpolación continua entre tramos elimina la discontinuidad sin perder el beneficio de la adaptación.',
  },
];
