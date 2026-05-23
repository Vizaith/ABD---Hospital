import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Medicos = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [editingId, setEditingId] = useState(null);
  // Agregado campo 'cedula' aquí
  const [form, setForm] = useState({ nombre_completo: '', id_especialidad: '', cedula: '' });

  useEffect(() => { 
    fetchDatos(); 
    fetchEspecialidades();
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('medicos').select('*').order('id_medico', { ascending: false });
    if(data) setLista(data);
  };

  const fetchEspecialidades = async () => {
    const { data } = await supabase.from('especialidades').select('id_especialidad, nombre');
    if(data) setEspecialidades(data);
  };

  const registrar = async () => {
    // Validamos que todos los campos, incluyendo cedula, existan
    if (!form.nombre_completo || !form.id_especialidad || !form.cedula) {
      return alert("Por favor completa todos los campos, incluyendo la cédula.");
    }

    const dataToSend = {
      nombre_completo: form.nombre_completo,
      id_especialidad: parseInt(form.id_especialidad),
      cedula: form.cedula
    };

    if (editingId) {
      const { error } = await supabase.from('medicos').update(dataToSend).eq('id_medico', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Médico actualizado");
    } else {
      const { error } = await supabase.from('medicos').insert([dataToSend]);
      if (error) alert("Error: " + error.message);
      else alert("Médico registrado");
    }
    setForm({ nombre_completo: '', id_especialidad: '', cedula: '' });
    setEditingId(null); setView('list'); fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar médico?")) return;
    await supabase.from('medicos').delete().eq('id_medico', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ 
      nombre_completo: item.nombre_completo, 
      id_especialidad: item.id_especialidad,
      cedula: item.cedula 
    });
    setEditingId(item.id_medico); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Personal Médico</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ nombre_completo: '', id_especialidad: '', cedula: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Médico</button>
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
            {lista.map(m => (
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
        <option value="">Seleccione una especialidad...</option>
        {especialidades.map(esp => (
          <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
        ))}
      </select>

      {/* Botón con ancho 100% para igualar los campos */}
      <button className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} onClick={registrar}>
        {editingId ? 'Actualizar' : 'Registrar'}
      </button>
    </div>
  );
};