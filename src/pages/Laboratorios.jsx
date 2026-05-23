import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Laboratorios = () => {
  const [form, setForm] = useState({ id_paciente: '', id_lab: '', resultado: '' });

  const registrar = async () => {
    const { error } = await supabase.rpc('registrar_estudio', {
      p_id_paciente: parseInt(form.id_paciente),
      p_id_laboratorio: parseInt(form.id_lab),
      p_resultado: form.resultado
    });
    if (error) alert("Error: " + error.message);
    else alert("Estudio registrado");
  };

  return (
    <div className="form-card">
      <h2>Gestión de Laboratorios</h2>
      <input className="input-field" placeholder="ID Paciente" onChange={e => setForm({...form, id_paciente: e.target.value})} />
      <input className="input-field" placeholder="ID Laboratorio" onChange={e => setForm({...form, id_lab: e.target.value})} />
      <textarea className="input-field" placeholder="Resultado" onChange={e => setForm({...form, resultado: e.target.value})} />
      <button className="btn-submit" onClick={registrar}>Guardar Estudio</button>
    </div>
  );
};