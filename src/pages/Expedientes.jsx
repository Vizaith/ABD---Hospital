import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Expedientes = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', diagnostico: '', fecha_apertura: '' });
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [fPaciente, setFPaciente] = useState('');

  const esDiagnosticoValido = form.diagnostico.trim().length >= 10;
  const esFechaValida = () => {
    if (!form.fecha_apertura) return false;
    const fecha = new Date(form.fecha_apertura);
    const hoy = new Date();
    return fecha <= hoy;
  };
  const isFormValid = form.id_paciente !== '' && esDiagnosticoValido && esFechaValida();

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      setPacientes(p || []);
      fetchDatos();
    };
    load();
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('expedientes').select('*').order('id', { ascending: false });
    setLista(data || []);
  };

  const getNombrePaciente = (id) => {
    const p = pacientes.find(pac => pac.id_paciente === id);
    return p ? p.nombre_completo : 'Desconocido';
  };

  const listaFiltrada = lista.filter(e => 
    getNombrePaciente(e.id_paciente).toLowerCase().includes(fPaciente.toLowerCase())
  );

  const handleGuardar = async () => {
    if (!isFormValid) return;
    setLoading(true);
    
    if (editingId) {
      const { error } = await supabase.from('expedientes').update(form).eq('id', editingId);
      if (error) alert("Error al actualizar: " + error.message);
      else { alert("Expediente actualizado correctamente"); resetForm(); }
    } else {
      const { error } = await supabase.from('expedientes').insert([form]);
      if (error) alert("Error al guardar: " + error.message);
      else { alert("Expediente guardado correctamente"); resetForm(); }
    }
    
    setLoading(false);
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar este expediente?")) return;
    const { error } = await supabase.from('expedientes').delete().eq('id', id);
    if (error) alert("Error al eliminar: " + error.message);
    else { alert("Expediente eliminado"); fetchDatos(); }
  };

  const resetForm = () => {
    setForm({ id_paciente: '', diagnostico: '', fecha_apertura: '' });
    setBusqueda('');
    setEditingId(null);
    setView('list');
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.id_paciente, diagnostico: item.diagnostico, fecha_apertura: item.fecha_apertura });
    setBusqueda(getNombrePaciente(item.id_paciente));
    setEditingId(item.id);
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Expedientes</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', diagnostico: '', fecha_apertura: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Expediente</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input className="input-field" placeholder="Buscar expediente por nombre de paciente..." value={fPaciente} onChange={e => setFPaciente(e.target.value)} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Fecha</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{getNombrePaciente(e.id_paciente)}</td>
                <td style={{ padding: '0.75rem' }}>{e.fecha_apertura}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(e)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(e.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="form-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{editingId ? 'Editar Expediente' : 'Nuevo Expediente'}</h2>
        <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      
      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={busqueda} onChange={(e) => {
        setBusqueda(e.target.value);
        const p = pacientes.find(x => x.nombre_completo === e.target.value);
        setForm({...form, id_paciente: p ? p.id_paciente : ''});
      }} placeholder="Selecciona un paciente..." />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>
      
      <label>Fecha de Apertura:</label>
      <input className="input-field" type="date" value={form.fecha_apertura} onChange={e => setForm({...form, fecha_apertura: e.target.value})} />
      
      <label>Diagnóstico (mín. 10 caracteres):</label>
      <textarea className="input-field" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})}></textarea>
      
      <button className="btn-submit" disabled={!isFormValid || loading} onClick={handleGuardar} style={{ opacity: isFormValid && !loading ? 1 : 0.5 }}>
        {loading ? 'Procesando...' : (editingId ? 'Actualizar' : 'Guardar')}
      </button>
    </div>
  );
};