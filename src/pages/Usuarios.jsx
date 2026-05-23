import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Usuarios = () => {
  const [form, setForm] = useState({ nombre: '', id_rol: '', password_hash: '' });

  const registrarUsuario = async () => {
    const { error } = await supabase.from('usuarios').insert([form]);
    if (error) alert("Error al crear usuario: " + error.message);
    else alert("Usuario creado correctamente en el sistema");
  };

  return (
    <div className="form-card">
      <h2>Administración de Usuarios y Roles</h2>
      <input className="input-field" placeholder="Nombre de Usuario" onChange={e => setForm({...form, nombre: e.target.value})} />
      <select className="input-field" onChange={e => setForm({...form, id_rol: e.target.value})}>
        <option value="">Seleccione un Rol...</option>
        <option value="1">Administrador</option>
        <option value="2">Médico</option>
        <option value="3">Recepcionista</option>
      </select>
      <input className="input-field" type="password" placeholder="Contraseña (Hash)" onChange={e => setForm({...form, password_hash: e.target.value})} />
      <button className="btn-submit" onClick={registrarUsuario}>Crear Usuario</button>
    </div>
  );
};