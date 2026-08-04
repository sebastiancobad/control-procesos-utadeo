import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { MODULES, BLOCKS, COURSE_INFO } from './content/index.js';
import { getProgress } from './lib/firebase.js';
import Home from './pages/Home.jsx';
import Module from './pages/Module.jsx';
import Biblio from './pages/Biblio.jsx';
import Docente from './pages/Docente.jsx';

function Rail({ open, close }) {
  const [prog, setProg] = useState(getProgress());
  useEffect(() => {
    const h = () => setProg(getProgress());
    window.addEventListener('cpi:progress', h);
    return () => window.removeEventListener('cpi:progress', h);
  }, []);

  return (
    <nav className={open ? 'rail open' : 'rail'} aria-label="Indice del curso">
      <div className="rail-head">
        <Link className="mark" to="/" onClick={close}>Sala de Control</Link>
        <span className="sub">{COURSE_INFO.program} · {COURSE_INFO.school.split(' ').slice(-2).join(' ')}</span>
      </div>

      {BLOCKS.map((b) => (
        <div key={b.title}>
          <p className="rail-section">{b.title}</p>
          <ul className="rail-list">
            {MODULES.filter((m) => b.weeks.includes(m.meta.week)).map((m) => (
              <li key={m.meta.id}>
                <NavLink
                  to={`/m/${m.meta.id}`}
                  onClick={close}
                  className={({ isActive }) =>
                    `rail-link${isActive ? ' on' : ''}${prog[m.meta.id] ? ' done' : ''}`
                  }
                >
                  <span className="n">{String(m.meta.week).padStart(2, '0')}</span>
                  <span>{m.meta.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="rail-section">Recursos</p>
      <ul className="rail-list">
        <li>
          <NavLink to="/biblio" onClick={close} className={({ isActive }) => `rail-link${isActive ? ' on' : ''}`}>
            <span className="n">B</span><span>Bibliografía</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/docente" onClick={close} className={({ isActive }) => `rail-link${isActive ? ' on' : ''}`}>
            <span className="n">D</span><span>Panel del docente</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function Shell() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <>
      <div className="topbar">
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Abrir el indice del curso" aria-expanded={open}>
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </button>
        <Link className="mark" to="/">Sala de Control</Link>
      </div>

      <div className="shell">
        <Rail open={open} close={() => setOpen(false)} />
        {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Cerrar el indice" />}
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/m/:id" element={<Module />} />
            <Route path="/biblio" element={<Biblio />} />
            <Route path="/docente" element={<Docente />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
