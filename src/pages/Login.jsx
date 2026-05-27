import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import '../styles/forms.css';

export const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*, roles(nombre_rol)')
        .eq('correo', correo)
        .single();

      if (userError || !userData) throw new Error("Credenciales incorrectas.");

      const isValidPassword = bcrypt.compareSync(password, userData.password);
      if (!isValidPassword) throw new Error("Credenciales incorrectas.");

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password, 
      });

      if (authError) {
        console.error("Error en Auth de Supabase:", authError.message);
      }

      await supabase.from('bitacora_accesos').insert([
        { 
          id_usuario: userData.id_usuario, 
          fecha_acceso: new Date().toISOString() 
        }
      ]);

      localStorage.setItem('sigeh_user', JSON.stringify(userData));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 200);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
      <form onSubmit={handleLogin} className="form-card" style={{ padding: '2.5rem', borderRadius: '15px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '2rem' }}>Acceso SIGEH</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        
        <label style={{ fontWeight: '500' }}>Correo Electrónico</label>
        <input type="email" className="input-field" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        
        <label style={{ fontWeight: '500' }}>Contraseña</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ paddingRight: '45px' }} 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0' }}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" color="#64748b">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" color="#64748b">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        </div>
        
        <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '1.5rem', padding: '0.8rem', width: '100%' }}>
          {loading ? 'Validando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};