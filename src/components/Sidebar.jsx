import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('sigeh_user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const rol = user?.roles?.nombre_rol || '';
  
  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  return (
    <aside className="sidebar">
      <h2 style={{ 
        textAlign: 'center', 
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
        fontWeight: '700', 
        letterSpacing: '2px', 
        color: '#adadb8fb',
        margin: '1.5rem 0'
      }}>
        SIGEH
      </h2>
      
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
        
        {rol === 'Administrador' && (
          <>
            <li><Link to="/medicos" className={isActive('/medicos')}>Personal Médico</Link></li>
            <li><Link to="/laboratorios" className={isActive('/laboratorios')}>Laboratorios</Link></li>
            <li><Link to="/farmacia" className={isActive('/farmacia')}>Farmacia</Link></li>
            <li><Link to="/hospitalizaciones" className={isActive('/hospitalizaciones')}>Hospitalizaciones</Link></li>
          </>
        )}
        
        <li><Link to="/facturacion" className={isActive('/facturacion')}>Facturación</Link></li>
        
        {rol === 'Administrador' && (
          <>
            <li><Link to="/reportes" className={isActive('/reportes')}>Reportes</Link></li>
            <li><Link to="/usuarios" className={isActive('/usuarios')}>Gestión de Usuarios</Link></li>
            <li><Link to="/auditoria" className={isActive('/auditoria')}>Auditoría</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
};