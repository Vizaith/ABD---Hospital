import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState('');
  const [roles, setRoles] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabase.from('roles').select('*');
      if (data) setRoles(data);
    };
    fetchRoles();
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje('');

    const { error } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, password, id_rol: parseInt(idRol) }]);

    if (error) {
      setMensaje('Error al registrar: ' + error.message);
    } else {
      alert('Usuario registrado con éxito. Ya puedes iniciar sesión.');
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <form onSubmit={handleRegistro} className="form-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>Registro de Usuario</h2>
        
        {mensaje && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>{mensaje}</p>}

        <input 
          type="text" className="input-field" placeholder="Nombre Completo" 
          value={nombre} onChange={(e) => setNombre(e.target.value)} required 
        />
        <input 
          type="email" className="input-field" placeholder="Correo Electrónico" 
          value={correo} onChange={(e) => setCorreo(e.target.value)} required 
        />
        <input 
          type="password" className="input-field" placeholder="Contraseña" 
          value={password} onChange={(e) => setPassword(e.target.value)} required 
        />
        
        <select className="input-field" value={idRol} onChange={(e) => setIdRol(e.target.value)} required>
          <option value="">Selecciona un Rol</option>
          {roles.map((rol) => (
            <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre_rol}</option>
          ))}
        </select>

        <button type="submit" className="btn-submit" style={{ marginTop: '1rem' }}>Registrarse</button>
        
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          <p>¿Ya tienes cuenta? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Inicia sesión</Link></p>
        </div>
      </form>
    </div>
  );
};