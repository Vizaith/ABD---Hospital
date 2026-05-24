import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Hospitalizaciones = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false); 
  const [form, setForm] = useState({ id_paciente: '', fecha_ingreso: '', motivo: '' });
  const [pBusqueda, setPBusqueda] = useState('');

  const esFechaValida = (fecha) => {
    if (!fecha) return false;
    const f = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const hace120Anios = new Date();
    hace120Anios.setFullYear(hoy.getFullYear() - 120);
    return f <= hoy && f >= hace120Anios;
  };

  const isFormValid = 
    form.id_paciente !== '' && 
    esFechaValida(form.fecha_ingreso) && 
    form.motivo.trim().length >= 5;

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      setPacientes(p || []);
      fetchDatos();
    };
    load();
  }, []);

  const fetchDatos = async () => {
    const { data, error } = await supabase
      .from('hospitalizaciones')
      .select('*, pacientes(nombre_completo)')
      .order('id', { ascending: false });
    
    if (error) console.error("Error al cargar:", error);
    else setLista(data || []);
  };

  const registrar = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    
    const { error } = editingId 
      ? await supabase.from('hospitalizaciones').update(form).eq('id', editingId)
      : await supabase.from('hospitalizaciones').insert([form]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editingId ? "Registro actualizado correctamente" : "Hospitalización registrada correctamente");
      setForm({ id_paciente: '', fecha_ingreso: '', motivo: '' });
      setPBusqueda(''); 
      setEditingId(null); 
      setView('list'); 
      fetchDatos();
    }
    setLoading(false);
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Dar de alta/eliminar este registro?")) return;
    await supabase.from('hospitalizaciones').delete().eq('id', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.id_paciente, fecha_ingreso: item.fecha_ingreso, motivo: item.motivo });
    setPBusqueda(item.pacientes?.nombre_completo || '');
    setEditingId(item.id); setView('form');
  };

  const listaFiltrada = lista.filter(h => 
    h.pacientes?.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Hospitalizaciones Activas</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', fecha_ingreso: '', motivo: '' }); setPBusqueda(''); setEditingId(null); setView('form'); }}>+ Nuevo Ingreso</button>
        </div>
        
        <input className="input-field" placeholder="Buscar por nombre de paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ marginBottom: '1rem' }} />

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
            {listaFiltrada.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{h.pacientes?.nombre_completo || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{h.fecha_ingreso}</td>
                <td style={{ padding: '0.75rem' }}>{h.motivo}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(h)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(h.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
      
      <label>Fecha de Ingreso:</label>
      <input className="input-field" type="date" value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} />
      
      <label>Motivo de ingreso:</label>
      <textarea className="input-field" placeholder="Mínimo 5 caracteres" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} />
      
      <button 
        className="btn-submit" 
        disabled={!isFormValid || loading} 
        onClick={registrar}
        style={{ opacity: isFormValid && !loading ? 1 : 0.5, cursor: isFormValid && !loading ? 'pointer' : 'not-allowed' }}
      >
        {loading ? 'Procesando...' : (editingId ? 'Actualizar Ingreso' : 'Guardar Ingreso')}
      </button>
    </div>
  );
};