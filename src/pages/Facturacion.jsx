import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Facturacion = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id_paciente: '', total: '', metodo: '' });
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtros
  const [fPaciente, setFPaciente] = useState('');

  const metodosPago = ["Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia"];

  useEffect(() => { 
    supabase.from('pacientes').select('id_paciente, nombre_completo').then(({ data }) => setPacientes(data || []));
    fetchDatos(); 
  }, []);

  const fetchDatos = async () => {
    const { data } = await supabase.from('facturas').select('id, id_paciente, total, metodo').order('id', { ascending: false });
    if (data) setLista(data);
  };

  // Filtrado
  const listaFiltrada = lista.filter(f => {
    const nombre = pacientes.find(p => p.id_paciente === f.id_paciente)?.nombre_completo || '';
    return nombre.toLowerCase().includes(fPaciente.toLowerCase());
  });

  const isFormValid = form.id_paciente !== '' && parseFloat(form.total) > 0 && form.metodo !== '';

  const handleGenerarFactura = async () => {
    if (!isFormValid) return;
    setLoading(true);
    if (editingId) {
      await supabase.from('facturas').update({ id_paciente: parseInt(form.id_paciente), total: parseFloat(form.total), metodo: form.metodo }).eq('id', editingId);
    } else {
      await supabase.rpc('fn_registrar_factura', { p_id_paciente: parseInt(form.id_paciente), p_total: parseFloat(form.total), p_metodo_pago: form.metodo });
    }
    setForm({ id_paciente: '', total: '', metodo: '' });
    setBusqueda(''); setEditingId(null); setView('list'); await fetchDatos(); setLoading(false);
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar factura?")) return;
    await supabase.from('facturas').delete().eq('id', id);
    fetchDatos();
  };

  const editar = (item) => {
    const p = pacientes.find(p => p.id_paciente === item.id_paciente);
    setForm({ id_paciente: item.id_paciente, total: item.total, metodo: item.metodo });
    setBusqueda(p ? p.nombre_completo : '');
    setEditingId(item.id); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Historial de Facturación</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ id_paciente: '', total: '', metodo: '' }); setBusqueda(''); setEditingId(null); setView('form'); }}>+ Nueva Factura</button>
        </div>

        {/* Filtro */}
        <input className="input-field" placeholder="Buscar factura por paciente..." value={fPaciente} onChange={e => setFPaciente(e.target.value)} style={{ marginBottom: '1rem' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Paciente</th>
              <th style={{ padding: '0.75rem' }}>Total</th>
              <th style={{ padding: '0.75rem' }}>Método</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{pacientes.find(p => p.id_paciente === f.id_paciente)?.nombre_completo || f.id_paciente}</td>
                <td style={{ padding: '0.75rem' }}>${f.total}</td>
                <td style={{ padding: '0.75rem' }}>{f.metodo}</td>
                <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                  <button onClick={() => editar(f)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                  <button onClick={() => eliminar(f.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
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
        <h2>{editingId ? 'Editar Factura' : 'Módulo de Facturación'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      <label>Paciente:</label>
      <input className="input-field" list="list-p" value={busqueda} onChange={(e) => {
        setBusqueda(e.target.value);
        const p = pacientes.find(x => x.nombre_completo === e.target.value);
        setForm({ ...form, id_paciente: p ? p.id_paciente : '' });
      }} placeholder="Buscar paciente..." />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>
      <label>Total:</label>
      <input className="input-field" type="number" placeholder="0.00" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} />
      <label>Método de Pago:</label>
      <select className="input-field" value={form.metodo} onChange={e => setForm({ ...form, metodo: e.target.value })}>
        <option value="">Seleccione un método...</option>
        {metodosPago.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <button className="btn-submit" disabled={!isFormValid || loading} onClick={handleGenerarFactura} style={{ opacity: isFormValid && !loading ? 1 : 0.5 }}>
        {loading ? 'Procesando...' : (editingId ? 'Actualizar Factura' : 'Generar Factura')}
      </button>
    </div>
  );
};