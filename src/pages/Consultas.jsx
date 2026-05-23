import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Consultas = () => {
  // Corrección: Cambiado 'fecha' a 'fecha_consulta' según imagen_18.png
  const [form, setForm] = useState({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '' });
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pBusqueda, setPBusqueda] = useState('');
  const [mBusqueda, setMBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  // Validación: Todos los campos deben estar llenos
  const isFormValid = form.id_paciente && form.id_medico && form.motivo && form.fecha_consulta;

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      const { data: m } = await supabase.from('medicos').select('id_medico, nombre_completo');
      setPacientes(p || []); setMedicos(m || []);
    };
    load();
  }, []);

  const handleAgendar = async () => {
    if (!isFormValid) return;
    setLoading(true);
    const { error } = await supabase.from('consultas').insert([form]);
    setLoading(false);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Consulta agendada correctamente");
      // Limpiar formulario con el nombre correcto de la columna
      setForm({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '' });
      setPBusqueda('');
      setMBusqueda('');
    }
  };

  return (
    <div className="form-card">
      <h2>Agenda de Consultas</h2>
      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={pBusqueda} onChange={(e) => {
        setPBusqueda(e.target.value);
        const p = pacientes.find(x => x.nombre_completo === e.target.value);
        setForm({...form, id_paciente: p ? p.id_paciente : ''});
      }} placeholder="Selecciona paciente..." />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>

      <label>Médico:</label>
      <input className="input-field" list="list-m" value={mBusqueda} onChange={(e) => {
        setMBusqueda(e.target.value);
        const m = medicos.find(x => x.nombre_completo === e.target.value);
        setForm({...form, id_medico: m ? m.id_medico : ''});
      }} placeholder="Selecciona médico..." />
      <datalist id="list-m">{medicos.map(m => <option key={m.id_medico} value={m.nombre_completo} />)}</datalist>

      <label>Fecha:</label>
      <input 
        className="input-field" 
        type="date" 
        value={form.fecha_consulta} 
        onChange={e => setForm({...form, fecha_consulta: e.target.value})} 
      />
      
      <label>Motivo:</label>
      <textarea 
        className="input-field" 
        value={form.motivo} 
        placeholder="Motivo de la consulta" 
        onChange={e => setForm({...form, motivo: e.target.value})}
      ></textarea>
      
      <button 
        className="btn-submit" 
        disabled={!isFormValid || loading} 
        onClick={handleAgendar}
        style={{ opacity: (!isFormValid || loading) ? 0.5 : 1 }}
      >
        {loading ? 'Procesando...' : 'Agendar Consulta'}
      </button>
    </div>
  );
};