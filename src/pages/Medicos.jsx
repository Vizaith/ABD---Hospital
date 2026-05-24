import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Medicos = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre_completo: '', id_especialidad: '', cedula: '' });
  const [loading, setLoading] = useState(false);

  const isFormValid = form.nombre_completo.trim() !== '' && form.id_especialidad !== '' && form.cedula.trim() !== '';

  const [fNombre, setFNombre] = useState('');
  const [fEspecialidad, setFEspecialidad] = useState('');

  useEffect(() => { fetchDatos(); fetchEspecialidades(); }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('medicos').select('*').order('id_medico', { ascending: false });
    if(data) setLista(data);
  };

  const fetchEspecialidades = async () => {
    const { data } = await supabase.from('especialidades').select('id_especialidad, nombre');
    if(data) setEspecialidades(data);
  };

  const listaFiltrada = lista.filter(m => 
    m.nombre_completo.toLowerCase().includes(fNombre.toLowerCase()) &&
    (fEspecialidad === '' || m.id_especialidad.toString() === fEspecialidad)
  );

  const registrar = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    const dataToSend = { nombre_completo: form.nombre_completo, id_especialidad: parseInt(form.id_especialidad), cedula: form.cedula };
    
    if (editingId) {
      await supabase.from('medicos').update(dataToSend).eq('id_medico', editingId);
    } else {
      await supabase.from('medicos').insert([dataToSend]);
    }
    
    setLoading(false);
    setForm({ nombre_completo: '', id_especialidad: '', cedula: '' });
    setEditingId(null); setView('list'); fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar médico?")) return;
    await supabase.from('medicos').delete().eq('id_medico', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ nombre_completo: item.nombre_completo, id_especialidad: item.id_especialidad, cedula: item.cedula });
    setEditingId(item.id_medico); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Personal Médico</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ nombre_completo: '', id_especialidad: '', cedula: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Médico</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input className="input-field" placeholder="Buscar por nombre..." value={fNombre} onChange={e => setFNombre(e.target.value)} />
          <select className="input-field" value={fEspecialidad} onChange={e => setFEspecialidad(e.target.value)}>
            <option value="">Todas las especialidades</option>
            {especialidades.map(e => <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>)}
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem' }}>Cédula</th>
              <th style={{ padding: '0.75rem' }}>Especialidad</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(m => (
              <tr key={m.id_medico} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{m.nombre_completo}</td>
                <td style={{ padding: '0.75rem' }}>{m.cedula}</td>
                <td style={{ padding: '0.75rem' }}>{especialidades.find(e => e.id_especialidad === m.id_especialidad)?.nombre || m.id_especialidad}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(m)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(m.id_medico)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{editingId ? 'Editar Médico' : 'Registro de Médico'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      <label>Nombre Completo:</label>
      <input className="input-field" value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} />
      <label>Cédula:</label>
      <input className="input-field" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} />
      <label>Especialidad:</label>
      <select className="input-field" value={form.id_especialidad} onChange={e => setForm({...form, id_especialidad: e.target.value})}>
        <option value="">Seleccione...</option>
        {especialidades.map(esp => <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>)}
      </select>
      
      <button 
        className="btn-submit" 
        style={{ width: '100%', marginTop: '1rem', opacity: (!isFormValid || loading) ? 0.5 : 1 }} 
        disabled={!isFormValid || loading}
        onClick={registrar}
      >
        {loading ? 'Procesando...' : (editingId ? 'Actualizar' : 'Registrar')}
      </button>
    </div>
  );
};