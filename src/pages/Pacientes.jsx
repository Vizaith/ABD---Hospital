import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Pacientes = () => {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ nombre_completo: '', fecha_nacimiento: '', tipo_sangre: '', telefono: '' });
  
  // Validaciones originales
  const esNombreValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre_completo);
  const esTelefonoValido = /^\d{10,12}$/.test(form.telefono);
  const fechaValida = () => {
    if (!form.fecha_nacimiento) return false;
    const fecha = new Date(form.fecha_nacimiento);
    const hoy = new Date();
    const hace120Anios = new Date();
    hace120Anios.setFullYear(hoy.getFullYear() - 120);
    return fecha < hoy && fecha > hace120Anios;
  };
  const isFormValid = esNombreValido && esTelefonoValido && fechaValida() && form.tipo_sangre !== '';
  const tiposSangre = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('pacientes').select('*').order('id_paciente', { ascending: false });
    if (data) setLista(data);
  };

  const registrar = async () => {
    if (!isFormValid) return;
    
    if (editingId) {
      const { error } = await supabase.from('pacientes').update(form).eq('id_paciente', editingId);
      if (error) alert("Error al actualizar: " + error.message);
      else alert("Paciente actualizado correctamente");
    } else {
      const { error } = await supabase.from('pacientes').insert([form]);
      if (error) alert("Error al registrar: " + error.message);
      else alert("Paciente registrado correctamente");
    }
    
    setForm({ nombre_completo: '', fecha_nacimiento: '', tipo_sangre: '', telefono: '' });
    setEditingId(null);
    setView('list');
    fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar este paciente?")) return;
    await supabase.from('pacientes').delete().eq('id_paciente', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ nombre_completo: item.nombre_completo, fecha_nacimiento: item.fecha_nacimiento, tipo_sangre: item.tipo_sangre, telefono: item.telefono });
    setEditingId(item.id_paciente);
    setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Directorio de Pacientes</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ nombre_completo: '', fecha_nacimiento: '', tipo_sangre: '', telefono: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Paciente</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem' }}>Teléfono</th>
              <th style={{ padding: '0.75rem' }}>Sangre</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id_paciente} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{item.nombre_completo}</td>
                <td style={{ padding: '0.75rem' }}>{item.telefono}</td>
                <td style={{ padding: '0.75rem' }}>{item.tipo_sangre}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(item)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(item.id_paciente)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
        <h2>{editingId ? 'Editar Paciente' : 'Registro de Pacientes'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      
      <label>Nombre Completo:</label>
      <input className="input-field" placeholder="Introduzca el nombre completo" value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} />
      
      <label>Fecha de Nacimiento:</label>
      <input className="input-field" type="date" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
      
      <label>Tipo de Sangre:</label>
      <select className="input-field" value={form.tipo_sangre} onChange={e => setForm({...form, tipo_sangre: e.target.value})}>
        <option value="">Seleccione...</option>
        {tiposSangre.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>Teléfono (10-12 dígitos):</label>
      <input className="input-field" type="tel" maxLength="12" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value.replace(/\D/g, '')})} />

      <button className="btn-submit" disabled={!isFormValid} onClick={registrar} style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}>
        {editingId ? 'Actualizar Paciente' : 'Guardar Paciente'}
      </button>
    </div>
  );
};