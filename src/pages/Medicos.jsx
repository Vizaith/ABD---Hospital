import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Medicos = () => {
  const [form, setForm] = useState({ nombre: '', id_especialidad: '' });

  const registrar = async () => {
    const { error } = await supabase.from('medicos').insert([form]);
    if (error) alert("Error al registrar médico: " + error.message);
    else alert("Médico registrado exitosamente");
  };

  return (
    <div className="form-card">
      <h2>Gestión de Médicos</h2>
      <input className="input-field" placeholder="Nombre del Médico" onChange={e => setForm({...form, nombre: e.target.value})} />
      <input className="input-field" placeholder="ID Especialidad" onChange={e => setForm({...form, id_especialidad: e.target.value})} />
      <button className="btn-submit" onClick={registrar}>Registrar Médico</button>
    </div>
  );
};