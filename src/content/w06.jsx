import { Eq, Ei, Figure, Callout, Table, Enunciado, Given, Step, Answer, Reveal } from '../components/ui.jsx';
import { C, T, L, ControlValve, ManualValve, CheckValve, Bubble, Sig, Arrow, Block } from '../lib/isa.jsx';
import { SimValve } from '../sims/valve.jsx';

export const meta = {
  id: 'w06',
  week: 7,
  code: 'CP26II-M06',
  title: 'Válvulas de control y elementos finales',
  unit: 'Válvula FV-102 sobre el lazo de E-101',
  lede: 'La válvula es el único componente del lazo que mueve materia. Un controlador impecable sobre una válvula mal elegida no controla nada.',
  objectives: [
    'Dimensionar una válvula a partir del coeficiente Cv y verificar el margen de operación.',
    'Distinguir característica inherente e instalada y calcular la autoridad de la válvula.',
    'Seleccionar la acción de falla a partir del análisis de consecuencias del proceso.',
    'Reconocer cavitación, flasheo y banda muerta como fuentes de mal desempeño del lazo.',
  ],
  refs: ['isa75', 'smith', 'perry', 'shinskey', 'marlin'],
};

function FigFail() {
  return (
    <Figure vw={960} vh={280} num="5.1" caption="La acción de falla se decide por consecuencia, no por costumbre. La pregunta correcta es que posición deja la planta en estado seguro cuando se pierde el aire de instrumentos.">
      <ControlValve cx={150} cy={140} s={30} />
      <T x={150} y={62} size={24} color={C.navy} bold>FC</T>
      <T x={150} y={215} size={21} color={C.ink}>falla cerrada</T>
      <T x={150} y={242} size={20} color={C.grey}>aire para abrir</T>
      <T x={150} y={266} size={19} color={C.grey}>vapor de calentamiento</T>

      <L x1={330} y1={40} x2={330} y2={262} color={C.grid} w={1} />

      <ControlValve cx={470} cy={140} s={30} />
      <T x={470} y={62} size={24} color={C.navy} bold>FO</T>
      <T x={470} y={215} size={21} color={C.ink}>falla abierta</T>
      <T x={470} y={242} size={20} color={C.grey}>aire para cerrar</T>
      <T x={470} y={266} size={19} color={C.grey}>agua de enfriamiento</T>

      <L x1={650} y1={40} x2={650} y2={262} color={C.grid} w={1} />

      <ControlValve cx={770} cy={140} s={30} />
      <T x={770} y={62} size={24} color={C.navy} bold>FL</T>
      <T x={770} y={215} size={21} color={C.ink}>falla en última posición</T>
      <T x={770} y={242} size={20} color={C.grey}>requiere actuador con bloqueo</T>
    </Figure>
  );
}

function FigValveParts() {
  return (
    <Figure vw={760} vh={300} num="5.2" caption="Cadena del elemento final. Cada bloque agrega retardo, y el posicionador es lo que evita que la fricción del vástago se convierta en banda muerta.">
      <Block cx={110} cy={80} w={160} h={66} label="Controlador" sub="4-20 mA" />
      <Arrow x1={192} y1={80} x2={256} y2={80} color={C.ink} />
      <Block cx={350} cy={80} w={170} h={66} label="Posicionador" sub="lazo local" fill={C.white} stroke={C.mv} />
      <Arrow x1={438} y1={80} x2={502} y2={80} color={C.ink} />
      <Block cx={600} cy={80} w={166} h={66} label="Actuador" sub="diafragma" />
      <Arrow x1={600} y1={116} x2={600} y2={168} color={C.ink} />
      <ControlValve cx={600} cy={228} s={28} />
      <T x={690} y={236} size={22} color={C.grey} anchor="start">flujo</T>
      <Sig x1={350} y1={116} x2={350} y2={210} kind="impulse" color={C.mv} />
      <L x1={350} y1={210} x2={565} y2={210} color={C.mv} w={1.6} />
      <T x={330} y={172} size={20} color={C.mv} anchor="end">posición real del vástago</T>
    </Figure>
  );
}

export function Teoria() {
  return (
    <div className="prose">
      <h2>Dimensionamiento: el coeficiente Cv</h2>
      <p>
        El coeficiente de flujo <Ei>{'C_v'}</Ei> se define como el número de galones por minuto de agua a 60 °F que pasan
        por la válvula completamente abierta con una caida de presión de 1 psi. Para liquido sin flujo crítico:
      </p>
      <Eq n="5.1">{'q = C_v\\,f(x)\\,\\sqrt{\\frac{\\Delta P_v}{G_f}}'}</Eq>
      <p>
        con <Ei>{'q'}</Ei> en gpm, <Ei>{'\\Delta P_v'}</Ei> en psi y <Ei>{'G_f'}</Ei> la gravedad específica.
        La norma ANSI/ISA-75.01.01 agrega factores de corrección por geometría de tubería y por flujo crítico, que es
        cuando aumentar la caida de presión ya no aumenta el flujo.
      </p>

      <Callout kind="note" title="Criterio de selección">
        <p>
          Se elige el <Ei>{'C_v'}</Ei> de catalogo inmediatamente superior al calculado para el flujo máximo, de modo que
          ese flujo se alcance entre el 70 % y el 85 % de apertura. Una válvula sobredimensionada trabaja siempre casi
          cerrada, donde su característica es peor y su ganancia mas incierta.
        </p>
      </Callout>

      <h2>Característica inherente</h2>
      <p>
        La característica inherente describe la relación entre apertura y flujo <em>con caida de presión constante</em>.
        Es una propiedad del obturador, y el fabricante la publica.
      </p>
      <Table
        caption="Características inherentes"
        head={['Tipo', 'Expresión', 'Ganancia', 'Aplicación típica']}
        rows={[
          ['Lineal', '$f(x) = x$', 'Constante', 'Lazos de nivel, $\\text{sistemas} \\text{con} \\Delta P \\text{casi} \\text{constante}$'],
          ['Isoporcentual', '$f(x) = R^{x-1}$', 'Proporcional al flujo', 'Lazos de temperatura y presión, $\\Delta P \\text{variable}$'],
          ['Apertura rápida', '$f(x) = \\sqrt{x}$', 'Alta al inicio, decreciente', 'Servicio de todo o nada, alivio'],
        ]}
      />
      <p>
        La isoporcentual recibe ese nombre porque un incremento fijo de apertura produce un incremento porcentual fijo del
        flujo. La rangeabilidad <Ei>{'R'}</Ei> es la relación entre el flujo máximo y el mínimo controlable, típicamente
        entre 30 y 50.
      </p>

      <h2>Característica instalada y autoridad</h2>
      <p>
        En una instalación real la caida de presión no es constante: cuando la válvula abre, el flujo sube, las perdidas
        por fricción en la tubería crecen y a la válvula le queda menos presión disponible. Definiendo la autoridad
      </p>
      <Eq n="5.2">{'\\psi = \\frac{\\Delta P_{v,\\text{abierta}}}{\\Delta P_{\\text{total}}}'}</Eq>
      <p>la característica instalada resulta</p>
      <Eq n="5.3">{'\\frac{q}{q_{max}} = \\frac{f(x)}{\\sqrt{\\psi + (1-\\psi)\\,f(x)^2}}'}</Eq>
      <p>
        Con <Ei>{'\\psi = 1'}</Ei> la instalada coincide con la inherente. A medida que <Ei>{'\\psi'}</Ei> disminuye, la
        curva se aplana en la zona alta: la válvula abre y el flujo casi no crece.
      </p>

      <Callout kind="warn" title="Regla de diseño">
        <p>
          Se recomienda <Ei>{'\\psi\\geq 0.25'}</Ei>, y preferiblemente entre 0.3 y 0.5. Por debajo de 0.25 la válvula
          pierde autoridad sobre el flujo y el lazo se vuelve ingobernable en la zona superior de carga. La combinación
          clasica es característica isoporcentual con <Ei>{'\\psi\\approx 0.3'}</Ei>, que entrega una instalada casi lineal.
        </p>
      </Callout>

      <h2>Acción de falla</h2>
      <FigFail />
      <p>
        Se define por lo que ocurre al perder la señal o el aire de instrumentos. En una válvula de aire para abrir
        el resorte la cierra al fallar: es <strong>falla cerrada</strong> o FC. En una de aire para cerrar, falla abierta o FO.
        La decisión se toma preguntando cual posición deja la planta en estado seguro, no cual es mas comoda para operar.
      </p>
      <p>
        La acción de falla también determina el signo del lazo. Un controlador con salida creciente sobre una válvula FC
        aumenta el flujo; sobre una FO lo reduce. Ese cambio de signo se compensa configurando acción directa o inversa
        en el controlador, y equivocarlo produce un lazo que se dispara al ponerse en automático.
      </p>

      <h2>Actuador, posicionador y banda muerta</h2>
      <FigValveParts />
      <p>
        El actuador de diafragma con resorte es el mas común por su simplicidad y por su falla segura definida.
        El <strong>posicionador</strong> es un lazo de control local que compara la posición real del vástago con la
        solicitada, y corrige. Sin el, la fricción del empaque produce <strong>banda muerta</strong>: la señal cambia y
        el vástago no se mueve hasta vencerla.
      </p>
      <p>
        La banda muerta es una de las causas mas frecuentes de ciclado permanente en lazos con acción integral. El
        controlador acumula error, la válvula no responde, el controlador sigue acumulando, la válvula finalmente salta y
        el error cambia de signo. El resultado es una oscilación de forma cuadrada que no se corrige con sintonía.
      </p>

      <h2>Cavitación y flasheo</h2>
      <p>
        En la vena contracta la presión cae por debajo de la de entrada. Si baja de la presión de vapor del liquido se
        forman burbujas. Si aguas abajo la presión recupera por encima de la de vapor, las burbujas implosionan:
        eso es <strong>cavitación</strong>, y destruye el obturador y el cuerpo con rapidez. Si la presión de salida
        permanece por debajo de la de vapor, las burbujas persisten: es <strong>flasheo</strong>, que erosiona pero no
        implosiona.
      </p>
      <Eq n="5.4">{'\\Delta P_{\\text{max}} = F_L^2\\,(P_1 - F_F\\,P_v)'}</Eq>
      <p>
        Si la caida de presión de servicio supera ese límite, la válvula opera en flujo crítico y hay que recurrir a
        trim anticavitación, a válvulas en serie o a un cambio de ubicación en la línea.
      </p>
    </div>
  );
}

export function Sim() {
  return (
    <div className="prose">
      <h2>Ver como la instalación deforma el catalogo</h2>
      <p>
        Este panel dibuja simultaneamente la característica inherente, la instalada y la ganancia local del elemento final.
        Empieza con característica lineal y <Ei>{'\\psi = 1'}</Ei>: las dos curvas coinciden y la ganancia es constante.
        Luego baja la autoridad y observa como la instalada se dobla mientras la ganancia se desploma en la zona alta.
      </p>
      <SimValve />
      <Callout kind="note" title="El resultado que hay que llevarse">
        <p>
          Con característica isoporcentual y autoridad cercana a 0.3 la curva instalada se aproxima a una recta y la
          relación entre ganancia máxima y mínima cae por debajo de 2. Esa es la razón técnica por la que la isoporcentual
          domina en lazos de temperatura y presión, donde la caida de presión disponible varía mucho con la carga.
        </p>
      </Callout>
    </div>
  );
}

export function Ejemplo() {
  return (
    <div className="prose">
      <h2>Selección de FV-102</h2>
      <Enunciado
        pide={[
          'Determinar la caída de presión disponible para la válvula en condiciones nominales.',
          'Calcular la autoridad de la válvula y juzgar si es aceptable.',
          'Corregir el reparto de presiones si la autoridad resulta insuficiente.',
          'Calcular el Cv requerido y elegir la válvula de catálogo.',
          'Verificar que no haya cavitación ni flujo critico, y comprobar la apertura de operación.',
          'Decidir la acción de falla y justificarla por consecuencia.',
        ]}
      >
        <p>
          Hay que especificar la válvula de agua de enfriamiento hacia la coraza de E-101 para enviarla a compra. El
          diseño hidráulico de la línea ya esta hecho por el grupo de tuberías, y la sospecha del ingeniero de control es
          que esa línea no deja presión suficiente en la válvula. Una válvula sin autoridad convierte cualquier sintonía
          en un ejercicio inútil.
        </p>
      </Enunciado>
      <Given>
        <ul>
          <li>Servicio: agua de enfriamiento hacia la coraza de E-101. <Ei>{'G_f = 1.0'}</Ei>.</li>
          <li>Flujos: mínimo 40 gpm, nominal 120 gpm, máximo 165 gpm.</li>
          <li>Presión de bomba a la salida: 92 psig, constante. Presión en el retorno: 18 psig.</li>
          <li>Perdidas por fricción en tubería e intercambiador al flujo nominal: 34 psi.</li>
          <li>Presión de vapor del agua a 30 °C: 0.61 psia. Presión atmosférica local en Bogota: 10.9 psia.</li>
        </ul>
      </Given>

      <Step n="1" title="Caida de presión disponible para la válvula">
        <p>La presión total disponible se reparte entre la fricción del sistema y la válvula:</p>
        <Eq>{'\\Delta P_{total} = 92 - 18 = 74\\ \\text{psi}'}</Eq>
        <Eq>{'\\Delta P_v = 74 - 34 = 40\\ \\text{psi} \\quad\\text{al flujo nominal}'}</Eq>
      </Step>

      <Step n="2" title="Autoridad de la válvula">
        <p>
          La fricción escala con el cuadrado del flujo. Al flujo máximo de 165 gpm:
        </p>
        <Eq>{'\\Delta P_{fricc} = 34\\left(\\frac{165}{120}\\right)^2 = 34 \\times 1.891 = 64.3\\ \\text{psi}'}</Eq>
        <Eq>{'\\Delta P_{v,max\\ abierta} = 74 - 64.3 = 9.7\\ \\text{psi}'}</Eq>
        <Eq n="5.5">{'\\psi = \\frac{9.7}{74} = 0.131'}</Eq>
        <p>
          Autoridad de 0.13, muy por debajo del mínimo recomendado. La válvula tendra poca influencia sobre el flujo cuando
          el sistema opere cerca del máximo.
        </p>
      </Step>

      <Step n="3" title="Corregir el reparto de presiones">
        <p>
          Se busca <Ei>{'\\psi\\approx 0.30'}</Ei>. Eso exige que la fricción del sistema al flujo máximo no supere el 70 %
          de la presión disponible, es decir 51.8 psi. Aumentando un diámetro nominal la tubería, la fricción cae con la
          quinta potencia del diámetro. Pasando de 3 a 4 pulgadas:
        </p>
        <Eq>{'\\Delta P_{fricc,4"} = 64.3\\left(\\frac{3}{4}\\right)^{5} = 64.3 \\times 0.2373 = 15.3\\ \\text{psi}'}</Eq>
        <Eq>{'\\psi = \\frac{74 - 15.3}{74} = 0.79'}</Eq>
        <p>
          Ahora la autoridad quedó muy alta, lo que indica que 4 pulgadas es excesivo y encarece la línea. Un compromiso
          razonable es dejar el tramo largo en 4 pulgadas y el tramo corto en 3, o instalar una restricción fija.
          Para el ejercicio se adopta <Ei>{'\\Delta P_v \\approx 26'}</Ei> psi al flujo máximo, con <Ei>{'\\psi = 0.35'}</Ei>.
          Como la fricción crece con el cuadrado del flujo, al flujo nominal queda <Ei>{'\\Delta P_v \\approx 49'}</Ei> psi.
        </p>
      </Step>

      <Step n="4" title="Calcular el Cv requerido">
        <Eq>{'C_v = \\frac{q_{max}}{\\sqrt{\\Delta P_v/G_f}} = \\frac{165}{\\sqrt{26}} = \\frac{165}{5.10} = 32.4'}</Eq>
        <p>
          Se toma <Ei>{'\\Delta P_v = 26'}</Ei> psi porque a flujo máximo la fricción ya consumio mas presión.
          Con la exigencia de que el máximo se alcance al 80 % de apertura y característica isoporcentual con
          <Ei>{'\\ R = 50'}</Ei>:
        </p>
        <Eq>{'f(0.80) = 50^{0.80-1} = 50^{-0.2} = 0.457'}</Eq>
        <Eq n="5.6">{'C_{v,\\text{válvula}} = \\frac{32.4}{0.457} = 70.9'}</Eq>
        <p>Se selecciona del catalogo la válvula de <Ei>{'C_v = 75'}</Ei>, la inmediatamente superior.</p>
      </Step>

      <Step n="5" title="Verificar cavitación">
        <p>Presión aguas abajo de la válvula en condiciones nominales, en absoluto:</p>
        <Eq>{'P_2 = 92 - 49 + 10.9 = 53.9\\ \\text{psia} \\qquad P_1 = 92 + 10.9 = 102.9\\ \\text{psia}'}</Eq>
        <p>Con <Ei>{'F_L = 0.90'}</Ei> y <Ei>{'F_F \\approx 0.96'}</Ei> para agua a esta temperatura:</p>
        <Eq>{'\\Delta P_{max} = 0.90^2\\,(102.9 - 0.96 \\times 0.61) = 0.81 \\times 102.3 = 82.9\\ \\text{psi}'}</Eq>
        <p>
          La caida de servicio, 49 psi, sigue por debajo del límite de 82.9 psi. No hay riesgo de flujo crítico ni de
          cavitación en este servicio.
        </p>
      </Step>

      <Step n="6" title="Verificar la apertura de operación">
        <Eq>{'f(x) = \\frac{q}{C_v\\sqrt{\\Delta P_v}} = \\frac{120}{75\\sqrt{48.6}} = \\frac{120}{522.8} = 0.230'}</Eq>
        <Eq>{'x = 1 + \\frac{\\ln 0.230}{\\ln 50} = 1 + \\frac{-1.470}{3.912} = 0.624'}</Eq>
        <p>Apertura nominal cercana al 62 %, dentro de la banda útil de trabajo, con margen en ambos sentidos.</p>
      </Step>

      <Answer>
        <p>
          Válvula isoporcentual de <Ei>{'C_v = 75'}</Ei>, acción falla abierta porque el servicio es agua de enfriamiento,
          con posicionador. Apertura nominal 62 %, autoridad 0.35, sin riesgo de cavitación. La línea debe repartirse
          entre 3 y 4 pulgadas para que la fricción no consuma la autoridad de la válvula.
        </p>
      </Answer>

      <Reveal label="Por que la acción de falla es FO en este caso">
        <div className="callout risk">
          <span className="kicker">Riesgo de operación</span>
          <p>
            Al perder el aire de instrumentos, el agua de enfriamiento debe seguir circulando. Si la válvula cerrara,
            el proceso caliente en los tubos quedaría sin remoción de calor justo cuando nadie puede actuar sobre el.
            Por eso el agua de enfriamiento va siempre falla abierta y el vapor de calentamiento, falla cerrada.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export const quiz = [
  {
    q: 'Una válvula tiene autoridad $\\psi = 0.12$. La consecuencia práctica es:',
    options: [
      'La válvula es demasiado pequeña y no pasa el flujo requerido',
      'La válvula cavitara con certeza',
      'La característica instalada se aplana y la válvula pierde influencia a alta carga',
      'La banda muerta del actuador aumenta'],
    answer: 2,
    why: 'Con autoridad baja, la fricción del sistema domina la caida de presión. Al abrir, el flujo casi no crece porque la presión disponible en la válvula se agota. El sintoma en planta es un lazo que responde bien a baja carga y deja de responder a alta carga.',
  },
  {
    q: 'Para el vapor de calentamiento de un reactor exotérmico, la acción de falla correcta es:',
    options: [
      'Falla cerrada, para retirar el aporte de calor al perder el aire',
      'Falla abierta, para no interrumpir la operación',
      'Falla en última posición, para mantener el estado actual',
      'Depende del costo del actuador'],
    answer: 0,
    why: 'La pregunta es que posición deja la planta segura. En un reactor exotérmico, seguir aportando calor sin supervisión es la peor situación posible, así que el vapor va falla cerrada.',
  },
  {
    q: 'La característica isoporcentual se prefiere en lazos de temperatura porque:',
    options: [
      'Tiene mayor rangeabilidad que cualquier otra',
      'Evita la cavitación',
      'Es la única que admite posicionador',
      'Su ganancia creciente compensa la caida de presión variable y da una instalada casi lineal'],
    answer: 3,
    why: 'La ganancia de la isoporcentual crece con el flujo, justo cuando la autoridad de la válvula cae. Los dos efectos se compensan y la característica instalada resulta cercana a una recta, con ganancia de lazo estable en todo el rango de carga.',
  },
  {
    q: 'Un lazo con controlador PI presenta una oscilación de forma cuadrada y amplitud constante que no cambia al reducir $K_c$. La causa mas probable es:',
    options: [
      'Sintonía demasiado agresiva',
      'Banda muerta o fricción en el vástago de la válvula',
      'Tiempo muerto excesivo en el proceso',
      'Ruido en el transmisor',
    ],
    answer: 1,
    why: 'La oscilación por sintonía se atenua al bajar la ganancia y tiene forma sinusoidal. Un ciclo cuadrado que persiste apunta a fricción en el elemento final: el integrador acumula, la válvula salta y el error cambia de signo. Se corrige con mantenimiento o con posicionador, no con sintonía.',
  },
  {
    q: 'Se calcula $C_v = 40$ para el flujo máximo. Del catalogo se debe elegir:',
    options: [
      'Una válvula cuyo $C_v$ permita alcanzar el flujo máximo cerca del 80 % de apertura',
      'La válvula de $C_v = 40$ exacto, para no sobredimensionar',
      'La válvula de $C_v$ mas grande disponible, por margen de seguridad',
      'Una válvula de $C_v = 20$, ya que el flujo nominal es menor'],
    answer: 0,
    why: 'Se busca que el flujo máximo caiga entre 70 % y 85 % de apertura, dejando recorrido en ambos sentidos. Una válvula muy grande opera casi cerrada, donde la característica es peor y la ganancia menos predecible.',
  },
  {
    q: 'La cavitación en una válvula se produce cuando:',
    options: [
      'El flujo excede la capacidad nominal de la válvula',
      'La temperatura del liquido supera su punto de ebullición normal',
      'La presión en la vena contracta baja de la presión de vapor y después recupera por encima de ella',
      'La válvula opera por debajo del 10 % de apertura'],
    answer: 2,
    why: 'Se forman burbujas en la vena contracta, donde la presión es mínima, y colapsan al recuperarse la presión aguas abajo. Ese colapso es lo que erosiona el material. Si la presión de salida queda por debajo de la de vapor, las burbujas persisten y el fenomeno es flasheo, no cavitación.',
  },
];
