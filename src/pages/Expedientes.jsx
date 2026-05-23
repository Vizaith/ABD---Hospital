import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Expedientes = () => {
  const [form, setForm] = useState({ id_paciente: '', diagnostico: '', fecha_apertura: '' });
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('pacientes').select('id_paciente, nombre_completo').then(({ data }) => setPacientes(data || []));
  }, []);

  // Validación: Diagnóstico con longitud mínima de 10 caracteres
  const esDiagnosticoValido = form.diagnostico.trim().length >= 10;
  
  // Validación: Fecha no puede ser futura
  const esFechaValida = () => {
    if (!form.fecha_apertura) return false;
    const fecha = new Date(form.fecha_apertura);
    const hoy = new Date();
    return fecha <= hoy;
  };

  // Validación final
  const isFormValid = form.id_paciente !== '' && esDiagnosticoValido && esFechaValida();

  const handleGuardar = async () => {
    if (!isFormValid) return;

    setLoading(true);
    const { error } = await supabase.from('expedientes').insert([form]);
    
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Expediente guardado correctamente");
      setForm({ id_paciente: '', diagnostico: '', fecha_apertura: '' });
      setBusqueda('');
    }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h2>Apertura de Expedientes</h2>
      
      <label>Paciente:</label>
      <input 
        className="input-field" 
        list="list-p" 
        value={busqueda} 
        onChange={(e) => {
          setBusqueda(e.target.value);
          const p = pacientes.find(x => x.nombre_completo === e.target.value);
          setForm({ ...form, id_paciente: p ? p.id_paciente : '' });
        }} 
        placeholder="Escribe el nombre del paciente..." 
      />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>
      
      <label>Fecha de Apertura:</label>
      <input 
        className="input-field" 
        type="date" 
        value={form.fecha_apertura}
        onChange={e => setForm({ ...form, fecha_apertura: e.target.value })} 
      />
      
      <label>Diagnóstico:</label>
      <textarea 
        className="input-field" 
        placeholder="Diagnóstico médico..." 
        value={form.diagnostico}
        onChange={e => setForm({ ...form, diagnostico: e.target.value })}
      ></textarea>
      
      <button 
        className="btn-submit" 
        disabled={!isFormValid || loading} 
        onClick={handleGuardar}
        style={{ 
          opacity: isFormValid && !loading ? 1 : 0.5, 
          cursor: isFormValid && !loading ? 'pointer' : 'not-allowed' 
        }}
      >
        {loading ? 'Guardando...' : 'Guardar Expediente'}
      </button>
    </div>
  );
};