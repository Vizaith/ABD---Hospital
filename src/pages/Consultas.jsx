import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Consultas = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '' });
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pBusqueda, setPBusqueda] = useState('');
  const [mBusqueda, setMBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = form.id_paciente && form.id_medico && form.motivo && form.fecha_consulta;

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      const { data: m } = await supabase.from('medicos').select('id_medico, nombre_completo');
      setPacientes(p || []); setMedicos(m || []);
      fetchDatos();
    };
    load();
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('consultas').select(`id_consulta, motivo, fecha_consulta, pacientes(nombre_completo), medicos(nombre_completo)`).order('id_consulta', { ascending: false });
    if(data) setLista(data);
  };

  const handleAgendar = async () => {
    if (!isFormValid) return;
    setLoading(true);
    
    if (editingId) {
      const { error } = await supabase.from('consultas').update(form).eq('id_consulta', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Consulta actualizada");
    } else {
      const { error } = await supabase.from('consultas').insert([form]);
      if (error) alert("Error: " + error.message);
      else alert("Consulta agendada correctamente");
    }
    
    setLoading(false);
    setForm({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '' });
    setPBusqueda(''); setMBusqueda(''); setEditingId(null); setView('list');
    fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar consulta?")) return;
    await supabase.from('consultas').delete().eq('id_consulta', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.pacientes?.id_paciente || '', id_medico: item.medicos?.id_medico || '', motivo: item.motivo, fecha_consulta: item.fecha_consulta });
    setPBusqueda(item.pacientes?.nombre_completo || '');
    setMBusqueda(item.medicos?.nombre_completo || '');
    setEditingId(item.id_consulta);
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Consultas Recientes</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '' }); setPBusqueda(''); setMBusqueda(''); setEditingId(null); setView('form'); }}>+ Nueva Consulta</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Fecha</th>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Médico</th>
              <th style={{ padding: '0.75rem' }}>Motivo</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(c => (
              <tr key={c.id_consulta} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{c.fecha_consulta ? new Date(c.fecha_consulta).toLocaleDateString() : 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{c.pacientes?.nombre_completo || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{c.medicos?.nombre_completo || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{c.motivo}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(c)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(c.id_consulta)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
        <h2>{editingId ? 'Editar Consulta' : 'Agenda de Consultas'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      
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
      <input className="input-field" type="date" value={form.fecha_consulta} onChange={e => setForm({...form, fecha_consulta: e.target.value})} />
      
      <label>Motivo:</label>
      <textarea className="input-field" value={form.motivo} placeholder="Motivo de la consulta" onChange={e => setForm({...form, motivo: e.target.value})}></textarea>
      
      <button className="btn-submit" disabled={!isFormValid || loading} onClick={handleAgendar} style={{ opacity: (!isFormValid || loading) ? 0.5 : 1 }}>
        {loading ? 'Procesando...' : (editingId ? 'Actualizar Consulta' : 'Agendar Consulta')}
      </button>
    </div>
  );
};