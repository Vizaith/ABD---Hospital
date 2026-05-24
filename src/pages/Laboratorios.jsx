import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Laboratorios = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', id_laboratorio: '', resultado: '' });
  
  const [pacientes, setPacientes] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [pBusqueda, setPBusqueda] = useState('');
  const [lBusqueda, setLBusqueda] = useState('');

  useEffect(() => {
    loadData();
    fetchDatos();
  }, []);

  const loadData = async () => {
    const { data: p, error: errorP } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
    const { data: l, error: errorL } = await supabase.from('laboratorios').select('id, nombre');
    
    if (errorP) console.error("Error cargando pacientes para el datalist:", errorP);
    if (errorL) console.error("Error cargando laboratorios para el datalist:", errorL);
    
    setPacientes(p || []);
    setLaboratorios(l || []);
  };

  const fetchDatos = async () => {
    const { data, error } = await supabase
      .from('estudios_laboratorio')
      .select(`
        id,
        resultado,
        id_paciente,
        id_laboratorio,
        pacientes!estudios_laboratorio_id_paciente_fkey(nombre_completo),
        laboratorios!estudios_laboratorio_id_laboratorio_fkey(nombre)
      `)
      .order('id', { ascending: false }); 

    if (error) {
      console.error("Error al cargar datos principales:", error);
    } else {
      setLista(data || []);
    }
  };

  const isFormValid = form.id_paciente !== '' && form.id_laboratorio !== '' && form.resultado.trim() !== '';

  const registrar = async () => {
    if (!isFormValid) {
      alert("Por favor, completa todos los campos correctamente seleccionando opciones de la lista.");
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('estudios_laboratorio').update(form).eq('id', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Estudio actualizado");
    } else {
      const { error } = await supabase.from('estudios_laboratorio').insert([form]);
      if (error) alert("Error: " + error.message);
      else alert("Estudio registrado");
    }
    
    setForm({ id_paciente: '', id_laboratorio: '', resultado: '' });
    setPBusqueda(''); 
    setLBusqueda(''); 
    setEditingId(null); 
    setView('list'); 
    fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar estudio?")) return;
    await supabase.from('estudios_laboratorio').delete().eq('id', id); 
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ id_paciente: item.id_paciente, id_laboratorio: item.id_laboratorio, resultado: item.resultado });
    setPBusqueda(item.pacientes?.nombre_completo || '');
    setLBusqueda(item.laboratorios?.nombre || '');
    setEditingId(item.id); 
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Resultados de Laboratorio</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', id_laboratorio: '', resultado: '' }); setPBusqueda(''); setLBusqueda(''); setEditingId(null); setView('form'); }}>+ Nuevo Estudio</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Laboratorio</th>
              <th style={{ padding: '0.75rem' }}>Resultado</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{e.pacientes?.nombre_completo || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{e.laboratorios?.nombre || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>{e.resultado}</td>
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
        <h2>{editingId ? 'Editar Estudio' : 'Gestión de Laboratorios'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>

      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={pBusqueda} onChange={(e) => {
        setPBusqueda(e.target.value);
        const p = pacientes.find(x => x.nombre_completo === e.target.value);
        setForm({...form, id_paciente: p ? p.id_paciente : ''});
      }} placeholder="Buscar paciente..." />
      <datalist id="list-p">{pacientes.map(p => <option key={`p-${p.id_paciente}`} value={p.nombre_completo} />)}</datalist>

      <label>Laboratorio:</label>
      <input className="input-field" list="list-l" value={lBusqueda} onChange={(e) => {
        setLBusqueda(e.target.value);
        const l = laboratorios.find(x => x.nombre === e.target.value);
        setForm({...form, id_laboratorio: l ? l.id : ''});
      }} placeholder="Buscar laboratorio..." />
      <datalist id="list-l">{laboratorios.map(l => <option key={`l-${l.id}`} value={l.nombre} />)}</datalist>

      <label>Resultado:</label>
      <textarea className="input-field" placeholder="Resultado del estudio" value={form.resultado} onChange={e => setForm({...form, resultado: e.target.value})} />
      
      <button 
        className="btn-submit" 
        onClick={registrar}
        disabled={!isFormValid}
        style={{ 
          opacity: isFormValid ? 1 : 0.5, 
          cursor: isFormValid ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease'
        }}
      >
        {editingId ? 'Actualizar' : 'Guardar Estudio'}
      </button>
    </div>
  );
};