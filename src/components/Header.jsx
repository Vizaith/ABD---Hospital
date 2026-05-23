import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  // Obtenemos el usuario del localStorage
  const user = JSON.parse(localStorage.getItem('sigeh_user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.75rem 2rem', 
      background: 'var(--white)', 
      borderBottom: '1px solid #d1fae5',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      marginBottom: '1rem',
      borderRadius: '0 0 12px 12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%' }}></div>
        <h1 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary-color)', fontWeight: '700' }}>
          Panel de Control SIGEH
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block' }}>Usuario activo</span>
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {user.nombre || 'Administrador'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'transparent', 
            color: '#ef4444', 
            border: '1px solid #ef4444', 
            padding: '0.4rem 1rem', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ef4444'; }}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};