/* ===========================================================
   Registro del curso. El orden de este arreglo es el orden del
   curso y el que usa la navegacion, el indice y el avance.
   =========================================================== */

import * as w01 from './w01.jsx';
import * as w02 from './w02.jsx';
import * as wmat from './wmat.jsx';
import * as w03 from './w03.jsx';
import * as w04 from './w04.jsx';
import * as w05 from './w05.jsx';
import * as w06 from './w06.jsx';
import * as w07 from './w07.jsx';
import * as w08 from './w08.jsx';
import * as w09 from './w09.jsx';
import * as w10 from './w10.jsx';
import * as w11 from './w11.jsx';
import * as w12 from './w12.jsx';
import * as w13 from './w13.jsx';
import * as w14 from './w14.jsx';
import * as w15 from './w15.jsx';
import * as w16 from './w16.jsx';

export const MODULES = [w01, w02, wmat, w03, w04, w05, w06, w07, w08, w09, w10, w11, w12, w13, w14, w15, w16];

export const byId = (id) => MODULES.find((m) => m.meta.id === id);

export const indexOfId = (id) => MODULES.findIndex((m) => m.meta.id === id);

/** Bloques tematicos, para agrupar el indice de navegacion. */
export const BLOCKS = [
  { title: 'Fundamentos', weeks: [1, 2, 3, 4, 5, 6] },
  { title: 'El lazo cerrado', weeks: [7, 8, 9, 10, 11] },
  { title: 'Estrategias y cierre', weeks: [12, 13, 14, 15, 16, 17] },
];

export const COURSE_INFO = {
  code: 'CP26II',
  name: 'Control de Procesos Industriales',
  program: 'Ingenieria Quimica',
  school: 'Universidad Jorge Tadeo Lozano',
  modules: 17,
};
