import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Usuarios = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: '', id_rol: '', password: '', correo: '' });
  
  // Estados para filtros
  const [fNombre, setFNombre] = useState('');
  const [fCorreo, setFCorreo] = useState('');
  const [fRol, setFRol] = useState('');

  const rolesMap = { 1: 'Administrador', 2: 'Médico', 3: 'Recepcionista' };

  const isFormValid = form.nombre && form.id_rol && form.password && form.correo;

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id_usuario', { ascending: false });

    if (error) console.error("Error cargando usuarios:", error);
    else setLista(data || []);
  };

  // Lógica de filtrado
  const listaFiltrada = lista.filter(u => 
    u.nombre.toLowerCase().includes(fNombre.toLowerCase()) &&
    u.correo.toLowerCase().includes(fCorreo.toLowerCase()) &&
    (fRol === '' || u.id_rol.toString() === fRol)
  );

  const registrarUsuario = async () => {
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(form.nombre)) {
      alert("El nombre solo debe contener letras, espacios y ñ.");
      return;
    }

    const { data: duplicado } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', form.correo)
      .neq('id_usuario', editingId || 0);

    if (duplicado && duplicado.length > 0) {
      alert("Este correo ya está registrado por otro usuario.");
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('usuarios').update(form).eq('id_usuario', editingId);
      if (error) alert("Error al actualizar: " + error.message);
      else alert("Usuario actualizado correctamente");
    } else {
      const { error } = await supabase.from('usuarios').insert([form]);
      if (error) alert("Error al crear usuario: " + error.message);
      else alert("Usuario creado correctamente");
    }
    
    setForm({ nombre: '', id_rol: '', password: '', correo: '' });
    setEditingId(null);
    setView('list');
    fetchUsuarios();
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id);
    if (error) alert("Error al eliminar: " + error.message);
    else fetchUsuarios();
  };

  const editarUsuario = (usuario) => {
    setForm({ nombre: usuario.nombre, id_rol: usuario.id_rol, password: usuario.password, correo: usuario.correo });
    setEditingId(usuario.id_usuario);
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Gestión de Usuarios</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ nombre: '', id_rol: '', password: '', correo: '' }); setEditingId(null); setView('form'); }}>+ Nuevo</button>
        </div>

        {/* Sección de Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input className="input-field" placeholder="Buscar por nombre..." value={fNombre} onChange={e => setFNombre(e.target.value)} />
          <input className="input-field" placeholder="Buscar por correo..." value={fCorreo} onChange={e => setFCorreo(e.target.value)} />
          <select className="input-field" value={fRol} onChange={e => setFRol(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="1">Administrador</option>
            <option value="2">Médico</option>
            <option value="3">Recepcionista</option>
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem' }}>Correo</th>
              <th style={{ padding: '0.75rem' }}>Rol</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(u => (
              <tr key={u.id_usuario} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{u.nombre}</td>
                <td style={{ padding: '0.75rem' }}>{u.correo}</td>
                <td style={{ padding: '0.75rem' }}>{rolesMap[u.id_rol] || 'Desconocido'}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editarUsuario(u)} style={{ background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminarUsuario(u.id_usuario)} style={{ background: 'none', border: 'none', color: 'red' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    // ... (El formulario de creación/edición permanece igual)
    <div className="form-card">
      <h2>{editingId ? 'Editar Usuario' : 'Crear Usuario'}</h2>
      <input className="input-field" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
      <input className="input-field" type="email" placeholder="Correo electrónico" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
      <select className="input-field" value={form.id_rol} onChange={e => setForm({...form, id_rol: e.target.value})}>
        <option value="">Seleccione un Rol...</option>
        <option value="1">Administrador</option>
        <option value="2">Médico</option>
        <option value="3">Recepcionista</option>
      </select>
      <input className="input-field" type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      
      <button 
        className="btn-submit" 
        onClick={registrarUsuario}
        disabled={!isFormValid}
        style={{ opacity: !isFormValid ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
      >
        {editingId ? 'Actualizar' : 'Guardar'}
      </button>
    </div>
  );
};