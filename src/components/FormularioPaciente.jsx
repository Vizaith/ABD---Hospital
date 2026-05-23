import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const FormularioPaciente = () => {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ nombre_completo: '', fecha_nacimiento: '', id_tipo_sangre: '' });

  useEffect(() => {
    const fetchTipos = async () => {
      const { data } = await supabase.from('tipos_sangre').select('*');
      setTipos(data || []);
    };
    fetchTipos();
  }, []);

  const handleGuardar = async () => {
    const { error } = await supabase.from('pacientes').insert([form]);
    if (error) alert("Error: " + error.message);
    else alert("Paciente registrado");
  };

  return (
    <div className="form-card">
      <h3>Registrar Paciente</h3>
      <input className="input-field" type="text" placeholder="Nombre completo" 
             onChange={e => setForm({...form, nombre_completo: e.target.value})} />
      <input className="input-field" type="date" 
             onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
      <select className="input-field" onChange={e => setForm({...form, id_tipo_sangre: e.target.value})}>
        <option value="">Seleccione tipo de sangre</option>
        {tipos.map(t => <option key={t.id} value={t.id}>{t.grupo}</option>)}
      </select>
      <button className="btn-submit" onClick={handleGuardar}>Guardar Registro</button>
    </div>
  );
};