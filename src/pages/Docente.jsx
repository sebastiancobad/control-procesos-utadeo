import { useEffect, useState } from 'react';
import { listAttempts, isConfigured, COURSE, signInDocente, onDocente, signOutDocente } from '../lib/firebase.js';
import { MODULES } from '../content/index.js';
import { Cajetin, Table } from '../components/ui.jsx';

/* ===========================================================
   Panel del docente. Lee los intentos registrados en Firestore
   y los exporta a Excel con una hoja de resumen y una de detalle.
   =========================================================== */

export default function Docente() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState(isConfigured() ? 'auth' : 'off');
  const [err, setErr] = useState('');
  const [user, setUser] = useState(null);
  const [cred, setCred] = useState({ email: '', pass: '' });

  // Las reglas de Firestore exigen sesión iniciada para leer los intentos.
  useEffect(() => {
    if (!isConfigured()) return undefined;
    let stop = () => {};
    onDocente((u) => { setUser(u); if (!u) setState('auth'); }).then((f) => { stop = f; });
    return () => stop();
  }, []);

  useEffect(() => {
    if (!isConfigured() || !user) return undefined;
    let alive = true;
    setState('loading');
    listAttempts()
      .then((r) => {
        if (!alive) return;
        setRows(r);
        setState('ready');
      })
      .catch((e) => {
        if (!alive) return;
        setErr(String(e.message || e));
        setState('error');
      });
    return () => { alive = false; };
  }, [user]);

  async function entrar() {
    setErr('');
    const r = await signInDocente(cred.email.trim(), cred.pass);
    if (!r.ok) setErr(r.error);
  }

  async function exportar() {
    const XLSX = await import('xlsx');

    const detalle = rows.map((r) => ({
      Fecha: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('es-CO') : '',
      Nombre: r.nombre || '',
      Codigo: r.codigo || '',
      Módulo: r.moduleId || '',
      Tema: r.moduleTitle || '',
      Correctas: r.correctas ?? '',
      Total: r.total ?? '',
      Nota: r.nota ?? '',
    }));

    const porEstudiante = {};
    for (const r of rows) {
      const k = `${r.codigo || 's/c'}|${r.nombre || 's/n'}`;
      porEstudiante[k] = porEstudiante[k] || { Nombre: r.nombre, Codigo: r.codigo, intentos: 0, suma: 0, módulos: new Set() };
      porEstudiante[k].intentos += 1;
      porEstudiante[k].suma += Number(r.nota) || 0;
      porEstudiante[k].módulos.add(r.moduleId);
    }
    const resumen = Object.values(porEstudiante).map((v) => ({
      Nombre: v.Nombre,
      Codigo: v.Codigo,
      'Módulos resueltos': v.módulos.size,
      Intentos: v.intentos,
      'Nota promedio': +(v.suma / v.intentos).toFixed(2),
    }));

    const porModulo = MODULES.map((m) => {
      const rs = rows.filter((r) => r.moduleId === m.meta.id);
      const notas = rs.map((r) => Number(r.nota) || 0);
      return {
        Semana: m.meta.week,
        Módulo: m.meta.id,
        Tema: m.meta.title,
        Intentos: rs.length,
        'Nota promedio': notas.length ? +(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : '',
        'Nota mínima': notas.length ? Math.min(...notas) : '',
      };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), 'Por estudiante');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(porModulo), 'Por módulo');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalle), 'Detalle');
    XLSX.writeFile(wb, `${COURSE}_resultados_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const porModuloTabla = MODULES.map((m) => {
    const rs = rows.filter((r) => r.moduleId === m.meta.id);
    const notas = rs.map((r) => Number(r.nota) || 0);
    return [
      String(m.meta.week).padStart(2, '0'),
      m.meta.title,
      String(rs.length),
      notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2) : 'n/a',
    ];
  });

  return (
    <div className="sheet">
      <header className="mod-head">
        <div className="row">
          <p className="eyebrow">Uso interno del curso</p>
          <span className="tag">{COURSE}</span>
        </div>
        <h1>Panel del docente</h1>
        <p className="lede">
          Resultados de los quices por estudiante y por módulo, con exportación a Excel en tres hojas.
        </p>
      </header>

      {state === 'off' && (
        <div className="callout warn">
          <span className="kicker">Registro desactivado</span>
          <p>
            Este panel necesita credenciales de Firebase. Abre <code>src/lib/firebase.js</code>, reemplaza los valores que
            empiezan por <code>PEGA_AQUI</code> con los de tu proyecto y vuelve a publicar el sitio.
            Mientras tanto los quices siguen funcionando: se califican en el navegador del estudiante y no se registran.
          </p>
        </div>
      )}

      {state === 'auth' && (
        <div className="callout note" style={{ maxWidth: '46ch' }}>
          <span className="kicker">Acceso del docente</span>
          <p>
            Los intentos solo se pueden leer con sesión iniciada. Usa la cuenta creada en Firebase Authentication
            para este curso.
          </p>
          <div className="quiz-id">
            <label>
              Correo
              <input
                type="email"
                value={cred.email}
                onChange={(e) => setCred({ ...cred, email: e.target.value })}
                placeholder="docente@utadeo.edu.co"
              />
            </label>
            <label>
              Contrasena
              <input
                type="password"
                value={cred.pass}
                onChange={(e) => setCred({ ...cred, pass: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') entrar(); }}
              />
            </label>
          </div>
          <button type="button" className="btn" onClick={entrar} style={{ marginTop: 'var(--s3)' }}>
            Entrar
          </button>
          {err && <p style={{ color: 'var(--alarm)', marginTop: 'var(--s3)' }}>{err}</p>}
          <p style={{ marginTop: 'var(--s4)', fontSize: 'var(--t-sm)', color: 'var(--ink-3)' }}>
            La nota registrada es referencial: la escritura no está autenticada, así que sirve para seguimiento y no
            como registro calificable.
          </p>
        </div>
      )}

      {state === 'loading' && <p style={{ color: 'var(--ink-2)' }}>Cargando intentos registrados.</p>}

      {state === 'error' && (
        <div className="callout risk">
          <span className="kicker">No se pudieron leer los datos</span>
          <p>{err}</p>
          <p>
            Revisa que las reglas de Firestore permitan lectura en la colección
            <code> courses/{COURSE}/attempts</code>.
          </p>
        </div>
      )}

      {state === 'ready' && (
        <>
          <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--s5)' }}>
            <button type="button" className="btn ghost" onClick={() => { signOutDocente(); setRows([]); }}>
              Cerrar sesión
            </button>
            <button className="btn" onClick={exportar} disabled={!rows.length}>Exportar a Excel</button>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--t-sm)', color: 'var(--ink-3)' }}>
              {rows.length} intento(s) registrados
            </span>
          </div>

          <Table
            caption="Resultados por módulo"
            head={['Módulo', 'Tema', 'Intentos', 'Nota promedio']}
            numeric={[2, 3]}
            rows={porModuloTabla}
          />

          {rows.length > 0 && (
            <Table
              caption="Últimos 20 intentos"
              head={['Estudiante', 'Código', 'Módulo', 'Nota']}
              numeric={[3]}
              rows={rows.slice(0, 20).map((r) => [r.nombre, r.codigo, r.moduleId, String(r.nota)])}
            />
          )}
        </>
      )}

      <Cajetin code="CP26II-D00" sheet="D" total={null} />
    </div>
  );
}
