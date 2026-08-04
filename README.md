# Sala de Control

Aula interactiva de **Control de Procesos Industriales** para el programa de Ingeniería Quimica de la Universidad Jorge Tadeo Lozano.

Diecisiete modulos progresivos con teoría, diagramas P&ID conformes a ANSI/ISA-5.1, siete simuladores numericos que corren en el navegador del estudiante, ejercicios resueltos paso a paso y mas de cien preguntas de evaluacion autocalificada.

---

## 1. Poner en marcha en local

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # compila a dist/
npm run preview    # sirve dist/ para verificar antes de publicar
```

Requiere Node 18 o superior.

## 2. Publicar en GitHub Pages

1. Crear el repositorio y subir el proyecto:

```bash
git init
git add .
git commit -m "Aula interactiva de Control de Procesos Industriales"
git branch -M main
git remote add origin https://github.com/USUARIO/control-procesos-utadeo.git
git push -u origin main
```

2. En GitHub: **Settings** → **Pages** → en *Source* elegir **GitHub Actions**.

3. Cada `git push` a `main` dispara el flujo de `.github/workflows/deploy.yml` y publica la version nueva. La direccion queda en `https://USUARIO.github.io/control-procesos-utadeo/`.

La aplicacion usa `HashRouter` y rutas relativas, asi que el mismo `dist/` funciona en GitHub Pages, en Vercel, en Netlify y abierto directamente desde disco.

## 3. Activar el registro de resultados (opcional)

Sin esta configuracion el sitio funciona completo: los quices se califican en el navegador y el avance se guarda localmente. Configurar Firebase agrega el registro de intentos y habilita el panel del docente.

1. Entrar a [console.firebase.google.com](https://console.firebase.google.com) y crear un proyecto.
2. **Compilacion** → **Firestore Database** → **Crear base de datos**, en modo produccion, region `southamerica-east1` o `us-central1`.
3. **Configuracion del proyecto** → **Tus apps** → icono web `</>`. Registrar la app y copiar el objeto `firebaseConfig`.
4. Pegar esos valores en `src/lib/firebase.js`, reemplazando los que empiezan por `PEGA_AQUI`.
5. En **Firestore** → **Reglas**, publicar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{course}/attempts/{doc} {
      allow create: if request.resource.data.nombre is string
                    && request.resource.data.nombre.size() > 0
                    && request.resource.data.nota is number
                    && request.resource.data.nota >= 0
                    && request.resource.data.nota <= 5;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

Un estudiante puede registrar su intento, nadie puede modificarlo ni borrarlo, y **la lectura exige
sesion iniciada**. Sin esa condicion los nombres, codigos y notas quedan expuestos a cualquiera que
conozca la direccion del proyecto.

Para que el panel del docente pueda leer hay que habilitar **Authentication** en la consola de
Firebase, activar el proveedor de correo y contrasena, y crear una unica cuenta para el docente. El
panel `/docente` pide esa sesion antes de mostrar nada.

La nota que registra el sitio es **referencial**: cualquiera puede enviar un intento con el nombre
que quiera, porque la escritura no esta autenticada. Sirve para seguimiento y para que el estudiante
compruebe su avance, no como registro calificable.

6. Volver a publicar. El panel del docente queda disponible en `#/docente`, con exportacion a Excel en tres hojas: por estudiante, por módulo y detalle de cada intento.

El codigo del curso se define en `src/lib/firebase.js` con la constante `COURSE`. Cambiarlo separa las cohortes dentro del mismo proyecto de Firebase.

## 4. Estructura del proyecto

```
src/
├─ lib/
│  ├─ ode.js         integrador RK4, retardo por transporte, metricas de desempeno
│  ├─ control.js     FOPDT, segundo orden, valvulas, PID, reglas de sintonia, Routh
│  ├─ isa.jsx        simbologia ANSI/ISA-5.1 en SVG
│  └─ firebase.js    persistencia opcional y avance local
├─ components/
│  ├─ ui.jsx         ecuaciones KaTeX, figuras, tablas, controles, cajetin
│  ├─ Recorder.jsx   registrador de banda con doble eje y cursor de lectura
│  └─ Quiz.jsx       evaluacion autocalificada
├─ sims/             siete simuladores
├─ content/
│  ├─ w01.jsx … w16.jsx    un archivo por módulo
│  ├─ wmat.jsx            herramientas matematicas del modelado
│  ├─ index.js             registro y orden del curso
│  └─ refs.js              bibliografia comentada
├─ pages/            portada, módulo, bibliografia, panel del docente
└─ styles/           tokens, base y componentes
```

## 5. Agregar o modificar contenido

Cada archivo de `src/content/` exporta siempre la misma estructura:

```jsx
export const meta = {
  id: 'w03', week: 4, code: 'CP26II-M04',
  title: '…', unit: '…', lede: '…',
  objectives: ['…'],
  refs: ['smith', 'seborg'],   // claves de refs.js
};
export function Teoría() { … }
export function Sim() { … }     // opcional
export function Ejemplo() { … }
export const quiz = [{ q, options, answer, why }];
```

El nombre del archivo y el número de semana no coinciden desde que se inserto `wmat.jsx` en la tercera
posicion: `w03.jsx` es la semana 4, `w04.jsx` la 5, y asi hasta `w16.jsx`, que es la 17. El orden de
navegacion lo fija el arreglo `MODULES` de `src/content/index.js`, no el nombre del archivo.

Para agregar un módulo basta con crear el archivo y anadirlo a `src/content/index.js`. La navegacion, el indice de la portada, el cajetin y el panel del docente lo recogen de forma automática.

## 6. Hilo conductor

Los ejemplos construyen una planta que crece módulo a módulo: tanque T-101, intercambiador E-101, reactor R-201, torre de enfriamiento CT-301 y columna T-401. El último módulo cierra con la síntesis de control de la planta completa.

## 7. Licencia

Contenido bajo CC BY 4.0. Codigo bajo MIT.
