/* ===========================================================
   Bibliografia del curso. Cada entrada lleva una nota que dice
   para que sirve ese texto, porque un listado sin criterio no
   ayuda a estudiar.
   =========================================================== */

export const REFS = {
  smith: {
    key: 'SC',
    cite: 'Smith, C. A. y Corripio, A. B. <em>Principles and Practice of Automatic Process Control</em>, 3.ª ed. Wiley, 2006.',
    note: 'Texto base del curso. Escrito por y para ingenieros quimicos: cada concepto entra por un balance de materia o energia antes de volverse una función de transferencia.',
  },
  bequette: {
    key: 'BEQ',
    cite: 'Bequette, B. W. <em>Process Control: Modeling, Design and Simulation</em>. Prentice Hall, 2003.',
    note: 'El mejor tratamiento del modelado desde los balances hasta el espacio de estados. Su capítulo 2 es la base matemática que este curso recorre antes de entrar en dinámica.',
  },
  seborg: {
    key: 'SEMD',
    cite: 'Seborg, D. E., Edgar, T. F., Mellichamp, D. A. y Doyle, F. J. <em>Process Dynamics and Control</em>, 4.ª ed. Wiley, 2016.',
    note: 'La referencia mas completa en dinámica y sintonia. Util cuando se necesita el desarrollo matematico riguroso detras de una regla práctica.',
  },
  marlin: {
    key: 'MAR',
    cite: 'Marlin, T. E. <em>Process Control: Designing Processes and Control Systems for Dynamic Performance</em>, 2.ª ed. McGraw-Hill, 2000.',
    note: 'El mejor texto para decidir estrategias. Cada capitulo arranca con una pregunta de diseño, no con una ecuación.',
  },
  steph: {
    key: 'STE',
    cite: 'Stephanopoulos, G. <em>Chemical Process Control: An Introduction to Theory and Practice</em>. Prentice Hall, 1984.',
    note: 'Clasico. Su tratamiento del modelado a partir de balances y de la eleccion de variables controladas sigue siendo insuperable.',
  },
  luyben: {
    key: 'LUY',
    cite: 'Luyben, W. L. <em>Process Modeling, Simulation and Control for Chemical Engineers</em>, 2.ª ed. McGraw-Hill, 1990.',
    note: 'Orientado a simulación y a control de plantas completas. Referencia obligada para reactores y columnas.',
  },
  cough: {
    key: 'COU',
    cite: 'Coughanowr, D. R. y LeBlanc, S. E. <em>Process Systems Analysis and Control</em>, 3.ª ed. McGraw-Hill, 2009.',
    note: 'El mas accesible de todos. Buen punto de partida cuando la transformada de Laplace todavia incomoda.',
  },
  ogun: {
    key: 'OR',
    cite: 'Ogunnaike, B. A. y Ray, W. H. <em>Process Dynamics, Modeling and Control</em>. Oxford University Press, 1994.',
    note: 'Tratamiento profundo de sistemas multivariables e identificacion. Para quien quiera ir mas alla del lazo simple.',
  },
  shinskey: {
    key: 'SHI',
    cite: 'Shinskey, F. G. <em>Process Control Systems: Application, Design and Tuning</em>, 4.ª ed. McGraw-Hill, 1996.',
    note: 'Escrito desde la planta. Las reglas practicas de cascada, relacion y control selectivo vienen de aqui.',
  },
  perry: {
    key: 'PER',
    cite: 'Green, D. W. y Southard, M. Z. (eds.) <em>Perry\'s Chemical Engineers\' Handbook</em>, 9.ª ed. McGraw-Hill, 2019, sección 8.',
    note: 'Consulta rapida de instrumentacion, valvulas y criterios de seleccion con datos reales de industria.',
  },
  isa51: {
    key: 'ISA 5.1',
    cite: 'ANSI/ISA-5.1-2022. <em>Instrumentation Symbols and Identification</em>.',
    note: 'Norma que fija letras de identificacion, burbujas y lineas de señal. Todo P&ID del curso se lee con ella.',
  },
  isa88: {
    key: 'ISA 88',
    cite: 'ANSI/ISA-88.00.01-2010. <em>Batch Control Part 1: Models and Terminology</em>.',
    note: 'Modelo fisico, de procedimiento y de receta para operación por lotes.',
  },
  isa84: {
    key: 'ISA 84',
    cite: 'ANSI/ISA-84.00.01-2004 (IEC 61511 mod). <em>Functional Safety: Safety Instrumented Systems for the Process Industry Sector</em>.',
    note: 'Ciclo de vida de seguridad funcional y asignacion de niveles SIL en planta de proceso.',
  },
  iec61508: {
    key: 'IEC 61508',
    cite: 'IEC 61508:2010. <em>Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems</em>.',
    note: 'Norma madre de seguridad funcional. Define la probabilidad de falla en demanda que sustenta cada SIL.',
  },
  ccps: {
    key: 'CCPS',
    cite: 'CCPS-AIChE. <em>Guidelines for Hazard Evaluation Procedures</em>, 3.ª ed. Wiley, 2008.',
    note: 'Metodologia de HAZOP y de análisis de capas de proteccion, con casos documentados.',
  },
  isa75: {
    key: 'ISA 75.01',
    cite: 'ANSI/ISA-75.01.01-2012. <em>Flow Equations for Sizing Control Valves</em>.',
    note: 'Ecuaciones oficiales de dimensionamiento de valvulas, incluidos los factores de correccion por flujo critico.',
  },
  astrom: {
    key: 'AH',
    cite: 'Astrom, K. J. y Hagglund, T. <em>Advanced PID Control</em>. ISA, 2006.',
    note: 'Todo lo que un PID real necesita y los libros de texto omiten: anti-windup, filtrado del derivativo, transferencia sin salto.',
  },
  rivera: {
    key: 'RMS',
    cite: 'Rivera, D. E., Morari, M. y Skogestad, S. "Internal Model Control 4: PID Controller Design". <em>Ind. Eng. Chem. Process Des. Dev.</em> 25 (1986) 252-265.',
    note: 'Articulo origen de la sintonia IMC y del parametro lambda.',
  },
  zn: {
    key: 'ZN',
    cite: 'Ziegler, J. G. y Nichols, N. B. "Optimum Settings for Automatic Controllers". <em>Trans. ASME</em> 64 (1942) 759-768.',
    note: 'El articulo fundacional de la sintonia. Vale leerlo para entender que sus reglas persiguen razon de decaimiento de un cuarto, no suavidad.',
  },
  bristol: {
    key: 'BRI',
    cite: 'Bristol, E. H. "On a New Measure of Interaction for Multivariable Process Control". <em>IEEE Trans. Automat. Contr.</em> 11 (1966) 133-134.',
    note: 'Introduce la matriz de ganancias relativas que se usa para emparejar variables en sistemas multivariables.',
  },
  skoge: {
    key: 'SKO',
    cite: 'Skogestad, S. "Simple Analytic Rules for Model Reduction and PID Controller Tuning". <em>Journal of Process Control</em> 13 (2003) 291-309.',
    note: 'Reglas SIMC: la version moderna y mas robusta de la sintonia por modelo interno.',
  },
};

/** Devuelve las referencias de un módulo en el orden declarado. */
export function pick(keys) {
  return keys.map((k) => ({ id: k, ...REFS[k] })).filter((r) => r.cite);
}
