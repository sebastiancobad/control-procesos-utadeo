/* ===========================================================
   Persistencia opcional en Firestore.
   La app funciona completa sin configurar nada: los quices se
   califican en el navegador. Al pegar las credenciales abajo se
   habilita el registro de intentos y el panel del docente.
   =========================================================== */

const firebaseConfig = {
  apiKey: 'PEGA_AQUI_TU_API_KEY',
  authDomain: 'PEGA_AQUI.firebaseapp.com',
  projectId: 'PEGA_AQUI_TU_PROJECT_ID',
  storageBucket: 'PEGA_AQUI.appspot.com',
  messagingSenderId: 'PEGA_AQUI',
  appId: 'PEGA_AQUI',
};

/** Codigo del curso: separa cohortes dentro del mismo proyecto Firebase. */
export const COURSE = 'CP26II';

export const isConfigured = () =>
  !String(firebaseConfig.projectId).startsWith('PEGA_AQUI');

let appPromise = null;
let dbPromise = null;

async function getApp() {
  if (!isConfigured()) return null;
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp } = await import('firebase/app');
      return initializeApp(firebaseConfig);
    })();
  }
  return appPromise;
}

async function getDb() {
  const app = await getApp();
  if (!app) return null;
  if (!dbPromise) {
    dbPromise = (async () => {
      const { getFirestore } = await import('firebase/firestore');
      return getFirestore(app);
    })();
  }
  return dbPromise;
}

/** Guarda un intento de quiz. Devuelve true si quedo registrado. */
export async function saveAttempt(attempt) {
  const db = await getDb();
  if (!db) return false;
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, 'courses', COURSE, 'attempts'), {
      ...attempt,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('No se pudo registrar el intento:', err);
    return false;
  }
}

/** Lee todos los intentos del curso, mas recientes primero. */
export async function listAttempts() {
  const db = await getDb();
  if (!db) return [];
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const q = query(collection(db, 'courses', COURSE, 'attempts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------- sesión del docente ---------- */

/**
 * Autenticación por correo y contrasena. Las reglas de Firestore exigen
 * `request.auth != null` para leer, asi que el panel del docente necesita
 * iniciar sesión antes de listar intentos.
 */
export async function signInDocente(email, password) {
  const app = await getApp();
  if (!app) return { ok: false, error: 'Firebase no está configurado' };
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
  try {
    await signInWithEmailAndPassword(getAuth(app), email, password);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.code === 'auth/invalid-credential' ? 'Correo o contrasena incorrectos' : e.message };
  }
}

/** Observa la sesión. Devuelve la función para dejar de observar. */
export async function onDocente(cb) {
  const app = await getApp();
  if (!app) { cb(null); return () => {}; }
  const { getAuth, onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(getAuth(app), (u) => cb(u));
}

export async function signOutDocente() {
  const app = await getApp();
  if (!app) return;
  const { getAuth, signOut } = await import('firebase/auth');
  await signOut(getAuth(app));
}

/* ---------- identidad del estudiante, en el propio navegador ---------- */

const KEY = 'cpi.student';

export function getStudent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function setStudent(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* modo privado del navegador */
  }
}

/* ---------- avance local por modulo ---------- */

const PKEY = 'cpi.progress';

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PKEY)) || {};
  } catch {
    return {};
  }
}

export function markDone(moduleId, score) {
  const p = getProgress();
  p[moduleId] = { score, at: Date.now() };
  try {
    localStorage.setItem(PKEY, JSON.stringify(p));
  } catch {
    /* sin almacenamiento disponible */
  }
  window.dispatchEvent(new Event('cpi:progress'));
  return p;
}
