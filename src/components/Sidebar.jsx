import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('sigeh_user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const rol = user?.roles?.nombre_rol || '';
  
  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  return (
    <aside className="sidebar">
      <h2>SIGEH</h2>
      <ul>
        <li><Link to="/dashboard" className={isActive('/dashboard')}>Panel Principal</Link></li>
        
        {(rol === 'Médico' || rol === 'Administrador') && (
          <>
            <li><Link to="/consultas" className={isActive('/consultas')}>Agenda Consultas</Link></li>
            <li><Link to="/expedientes" className={isActive('/expedientes')}>Expedientes Clínicos</Link></li>
          </>
        )}
        
        {(rol === 'Recepcionista' || rol === 'Administrador') && (
          <li><Link to="/pacientes" className={isActive('/pacientes')}>Pacientes</Link></li>
        )}
        
        <li><Link to="/facturacion" className={isActive('/facturacion')}>Facturación</Link></li>
        
        {rol === 'Administrador' && (
          <li><Link to="/auditoria" className={isActive('/auditoria')}>Auditoría</Link></li>
        )}
      </ul>
    </aside>
  );
};