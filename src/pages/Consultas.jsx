import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Consultas = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '', estado: '' });
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]); 
  const [receta, setReceta] = useState({ medicamento: '', dosis: '' });
  const [loading, setLoading] = useState(false);
  const [fPaciente, setFPaciente] = useState('');
  const [fMedico, setFMedico] = useState('');
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [busquedaMedico, setBusquedaMedico] = useState('');

  const fechaValida = () => {
    if (!form.fecha_consulta) return false;
    const fecha = new Date(form.fecha_consulta);
    const hoy = new Date();
    const haceUnAnio = new Date(); haceUnAnio.setFullYear(hoy.getFullYear() - 1);
    const enUnAnio = new Date(); enUnAnio.setFullYear(hoy.getFullYear() + 1);
    return fecha >= haceUnAnio && fecha <= enUnAnio;
  };

  const isFormValid = form.id_paciente && form.id_medico && form.motivo && fechaValida() && form.estado;
  const canSave = isFormValid && receta.medicamento && receta.dosis;

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('pacientes').select('id_paciente, nombre_completo');
      const { data: m } = await supabase.from('medicos').select('id_medico, nombre_completo');
      const { data: e } = await supabase.from('estados_consulta').select('id, estado');
      const { data: meds } = await supabase.from('medicamentos').select('id, nombre'); // Carga de id y nombre
      setPacientes(p || []); 
      setMedicos(m || []); 
      setEstados(e || []);
      setMedicamentos(meds || []);
      fetchDatos();
    };
    load();
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('consultas').select('*').order('id_consulta', { ascending: false });
    if (data) setLista(data);
  };

  const listaFiltrada = lista.filter(c => {
    const pNombre = pacientes.find(p => p.id_paciente === c.id_paciente)?.nombre_completo || '';
    const mNombre = medicos.find(m => m.id_medico === c.id_medico)?.nombre_completo || '';
    return pNombre.toLowerCase().includes(fPaciente.toLowerCase()) && mNombre.toLowerCase().includes(fMedico.toLowerCase());
  });

  const handleAgendar = async () => {
    if (!canSave) return;
    setLoading(true);
    const medSeleccionado = medicamentos.find(m => m.nombre === receta.medicamento);
    
    if (editingId) {
      await supabase.from('consultas').update(form).eq('id_consulta', editingId);
      if (medSeleccionado) {
        await supabase.from('recetas').update({ id_medicamento: medSeleccionado.id, dosis: receta.dosis }).eq('id_consulta', editingId);
      }
      alert("Consulta actualizada con éxito.");
    } else {
      const { data: consulta } = await supabase.from('consultas').insert([form]).select();
      if (consulta && medSeleccionado) {
        await supabase.from('recetas').insert([{ id_consulta: consulta[0].id_consulta, id_medicamento: medSeleccionado.id, dosis: receta.dosis }]); // Inserción con id
      }
      alert("Consulta y receta creadas con éxito.");
    }
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setForm({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '', estado: '' });
    setReceta({ medicamento: '', dosis: '' });
    setBusquedaPaciente('');
    setBusquedaMedico('');
    setEditingId(null);
    setView('list');
    fetchDatos();
    setLoading(false);
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar esta consulta?")) return;
    await supabase.from('recetas').delete().eq('id_consulta', id);
    await supabase.from('consultas').delete().eq('id_consulta', id);
    fetchDatos();
  };

  const editar = async (item) => {
    const p = pacientes.find(p => p.id_paciente === item.id_paciente);
    const m = medicos.find(med => med.id_medico === item.id_medico);
    const { data: rec } = await supabase.from('recetas').select('*').eq('id_consulta', item.id_consulta).single();
    
    setForm({ 
        id_paciente: item.id_paciente || '', 
        id_medico: item.id_medico || '', 
        motivo: item.motivo || '', 
        fecha_consulta: item.fecha_consulta ? item.fecha_consulta.split('T')[0] : '', 
        estado: item.estado || '' 
    });
    
    if (rec) {
      const med = medicamentos.find(x => x.id === rec.id_medicamento);
      setReceta({ medicamento: med ? med.nombre : '', dosis: rec.dosis || '' });
    }
    
    setBusquedaPaciente(p ? p.nombre_completo : '');
    setBusquedaMedico(m ? m.nombre_completo : '');
    setEditingId(item.id_consulta); 
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Directorio de Consultas</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', id_medico: '', motivo: '', fecha_consulta: '', estado: '' }); setEditingId(null); setView('form'); }}>+ Nueva Consulta</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input className="input-field" placeholder="Buscar por paciente..." value={fPaciente} onChange={e => setFPaciente(e.target.value)} />
          <input className="input-field" placeholder="Buscar por médico..." value={fMedico} onChange={e => setFMedico(e.target.value)} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Médico</th>
              <th style={{ padding: '0.75rem' }}>Motivo</th>
              <th style={{ padding: '0.75rem' }}>Estado</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(c => (
              <tr key={c.id_consulta} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{pacientes.find(p => p.id_paciente === c.id_paciente)?.nombre_completo}</td>
                <td style={{ padding: '0.75rem' }}>{medicos.find(m => m.id_medico === c.id_medico)?.nombre_completo}</td>
                <td style={{ padding: '0.75rem' }}>{c.motivo}</td>
                <td style={{ padding: '0.75rem' }}>{c.estado}</td>
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
        <h2>{editingId ? 'Editar Consulta' : 'Nueva Consulta'}</h2>
        <button onClick={limpiarFormulario} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>

      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={busquedaPaciente} onChange={(e) => { 
        setBusquedaPaciente(e.target.value); 
        const p = pacientes.find(x => x.nombre_completo === e.target.value); 
        setForm({ ...form, id_paciente: p ? p.id_paciente : '' }); 
      }} />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>

      <label>Médico:</label>
      <input className="input-field" list="list-m" value={busquedaMedico} onChange={(e) => { 
        setBusquedaMedico(e.target.value); 
        const m = medicos.find(x => x.nombre_completo === e.target.value); 
        setForm({ ...form, id_medico: m ? m.id_medico : '' }); 
      }} />
      <datalist id="list-m">{medicos.map(m => <option key={m.id_medico} value={m.nombre_completo} />)}</datalist>

      <label>Estado:</label>
      <select className="input-field" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
        <option value="">Seleccione...</option>
        {estados.map(s => <option key={s.id} value={s.estado}>{s.estado}</option>)}
      </select>

      <label>Fecha:</label>
      <input className="input-field" type="date" value={form.fecha_consulta} onChange={e => setForm({...form, fecha_consulta: e.target.value})} />
      
      <label>Motivo:</label>
      <textarea className="input-field" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} />
      
      {/* Campos de receta siempre visibles */}
      <label>Medicamento:</label>
      <input className="input-field" list="list-meds" value={receta.medicamento} onChange={e => setReceta({...receta, medicamento: e.target.value})} placeholder="Busque o escriba el medicamento" />
      <datalist id="list-meds">{medicamentos.map(m => <option key={m.nombre} value={m.nombre} />)}</datalist>
      
      <label>Dosis:</label>
      <input className="input-field" value={receta.dosis} onChange={e => setReceta({...receta, dosis: e.target.value})} placeholder="Ej: 1 tableta cada 8 horas por 7 días" />
      
      <button className="btn-submit" onClick={handleAgendar} disabled={!canSave || loading} style={{ opacity: canSave ? 1 : 0.5 }}>
        {loading ? 'Procesando...' : (editingId ? 'Actualizar Consulta' : 'Guardar Consulta')}
      </button>
    </div>
  );
};