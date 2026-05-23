import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Hospitalizaciones = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', fecha_ingreso: '', motivo_ingreso: '' });
  const [pacientes, setPacientes] = useState([]);
  const [pBusqueda, setPBusqueda] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      setPacientes(p || []);
      fetchDatos();
    };
    load();
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('hospitalizaciones').select('*, pacientes(nombre_completo)').order('id_hospitalizacion', { ascending: false });
    if (data) setLista(data);
  };

  const registrar = async () => {
    if (editingId) {
      const { error } = await supabase.from('hospitalizaciones').update(form).eq('id_hospitalizacion', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Hospitalización actualizada");
    } else {
      const { error } = await supabase.from('hospitalizaciones').insert([form]);
      if (error) alert("Error: " + error.message);
      else alert("Paciente hospitalizado correctamente");
    }
    setForm({ id_paciente: '', fecha_ingreso: '', motivo_ingreso: '' });
    setPBusqueda(''); setEditingId(null); setView('list'); fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Dar de alta/eliminar este registro?")) return;
    await supabase.from('hospitalizaciones').delete().eq('id_hospitalizacion', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.id_paciente, fecha_ingreso: item.fecha_ingreso, motivo_ingreso: item.motivo_ingreso });
    setPBusqueda(item.pacientes?.nombre_completo || '');
    setEditingId(item.id_hospitalizacion); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Hospitalizaciones Activas</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', fecha_ingreso: '', motivo_ingreso: '' }); setPBusqueda(''); setEditingId(null); setView('form'); }}>+ Nuevo Ingreso</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Fecha</th>
              <th style={{ padding: '0.75rem' }}>Motivo</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(h => (
              <tr key={h.id_hospitalizacion} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{h.pacientes?.nombre_completo || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{h.fecha_ingreso}</td>
                <td style={{ padding: '0.75rem' }}>{h.motivo_ingreso}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(h)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(h.id_hospitalizacion)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
        <h2>{editingId ? 'Editar Ingreso' : 'Registrar Hospitalización'}</h2>
        <button onClick={() => { setView('list'); setPBusqueda(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={pBusqueda} onChange={(e) => {
        setPBusqueda(e.target.value);
        const p = pacientes.find(x => x.nombre_completo === e.target.value);
        setForm({...form, id_paciente: p ? p.id_paciente : ''});
      }} placeholder="Selecciona paciente..." />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>
      
      <input className="input-field" type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} />
      <textarea className="input-field" placeholder="Motivo de ingreso" value={form.motivo_ingreso} onChange={e => setForm({...form, motivo_ingreso: e.target.value})} />
      <button className="btn-submit" onClick={registrar}>{editingId ? 'Actualizar' : 'Guardar Ingreso'}</button>
    </div>
  );
};