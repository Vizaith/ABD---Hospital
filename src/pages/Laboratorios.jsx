import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Laboratorios = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', id_lab: '', resultado: '' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    // Asumiendo que la tabla se llama 'estudios' o cambia el nombre si es distinto en tu DB
    const { data } = await supabase.from('estudios').select('*').order('id_estudio', { ascending: false });
    if(data) setLista(data);
  };

  const registrar = async () => {
    if (editingId) {
      const { error } = await supabase.from('estudios').update({ id_paciente: form.id_paciente, id_laboratorio: form.id_lab, resultado: form.resultado }).eq('id_estudio', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Estudio actualizado");
    } else {
      const { error } = await supabase.rpc('registrar_estudio', { p_id_paciente: parseInt(form.id_paciente), p_id_laboratorio: parseInt(form.id_lab), p_resultado: form.resultado });
      if (error) alert("Error: " + error.message);
      else alert("Estudio registrado");
    }
    setForm({ id_paciente: '', id_lab: '', resultado: '' });
    setEditingId(null); setView('list'); fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar estudio?")) return;
    await supabase.from('estudios').delete().eq('id_estudio', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.id_paciente, id_lab: item.id_laboratorio, resultado: item.resultado });
    setEditingId(item.id_estudio); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Resultados de Laboratorio</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', id_lab: '', resultado: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Estudio</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>ID Paciente</th>
              <th style={{ padding: '0.75rem' }}>ID Lab</th>
              <th style={{ padding: '0.75rem' }}>Resultado</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(e => (
              <tr key={e.id_estudio} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{e.id_paciente}</td>
                <td style={{ padding: '0.75rem' }}>{e.id_laboratorio}</td>
                <td style={{ padding: '0.75rem' }}>{e.resultado}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(e)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(e.id_estudio)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
        <h2>{editingId ? 'Editar Estudio' : 'Gestión de Laboratorios'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      <input className="input-field" placeholder="ID Paciente" value={form.id_paciente} onChange={e => setForm({...form, id_paciente: e.target.value})} />
      <input className="input-field" placeholder="ID Laboratorio" value={form.id_lab} onChange={e => setForm({...form, id_lab: e.target.value})} />
      <textarea className="input-field" placeholder="Resultado" value={form.resultado} onChange={e => setForm({...form, resultado: e.target.value})} />
      <button className="btn-submit" onClick={registrar}>{editingId ? 'Actualizar' : 'Guardar Estudio'}</button>
    </div>
  );
};