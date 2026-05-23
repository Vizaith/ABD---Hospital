import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Farmacia = () => {
  const [view, setView] = useState('list');
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: '', stock: '' });
  const [loading, setLoading] = useState(false); // Estado para evitar doble envío

  // Validación: el botón solo se activa si hay nombre y stock mayor a 0
  const isFormValid = form.nombre.trim() !== '' && form.stock !== '' && parseInt(form.stock) > 0;

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    const { data, error } = await supabase.from('medicamentos').select('*').order('id', { ascending: false });
    if (data) setLista(data);
    else console.error("Error al cargar:", error);
  };

  const listaFiltrada = lista.filter(item => 
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const registrar = async () => {
    // Protección adicional por si intentan forzar el click
    if (!isFormValid) return;

    setLoading(true);

    if (editingId) {
      const { error } = await supabase.from('medicamentos').update({ nombre: form.nombre, stock: parseInt(form.stock) }).eq('id', editingId);
      if (error) alert("Error: " + error.message);
      else alert("Medicamento actualizado");
    } else {
      const { data: existente } = await supabase.from('medicamentos').select('*').eq('nombre', form.nombre).single();

      if (existente) {
        const nuevoStock = existente.stock + parseInt(form.stock);
        const { error } = await supabase.from('medicamentos').update({ stock: nuevoStock }).eq('id', existente.id);
        if (error) alert("Error al sumar stock: " + error.message);
        else alert("Stock sumado al medicamento existente");
      } else {
        const { error } = await supabase.from('medicamentos').insert([{ nombre: form.nombre, stock: parseInt(form.stock) }]);
        if (error) alert("Error al crear: " + error.message);
        else alert("Medicamento registrado");
      }
    }
    setLoading(false);
    setForm({ nombre: '', stock: '' });
    setEditingId(null); 
    setView('list'); 
    fetchDatos();
  };

  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar medicamento?")) return;
    await supabase.from('medicamentos').delete().eq('id', id);
    fetchDatos();
  };

  const editar = (item) => {
    setForm({ nombre: item.nombre, stock: item.stock });
    setEditingId(item.id); setView('form');
  };

  if (view === 'list') {
    return (
      <div className="form-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Inventario de Farmacia</h2>
          <button className="btn-submit" style={{ width: 'auto' }} onClick={() => { setForm({ nombre: '', stock: '' }); setEditingId(null); setView('form'); }}>+ Nuevo Producto</button>
        </div>

        <input 
          className="input-field" 
          placeholder="Buscar medicamento..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
              <th style={{ padding: '0.75rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem' }}>Stock</th>
              <th style={{ padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length > 0 ? (
              listaFiltrada.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>{f.nombre}</td>
                  <td style={{ padding: '0.75rem' }}>{f.stock}</td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '10px' }}>
                    <button onClick={() => editar(f)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✏️</button>
                    <button onClick={() => eliminar(f.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No se encontraron medicamentos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="form-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{editingId ? 'Editar Medicamento' : 'Registro de Farmacia'}</h2>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }}>✕ Cancelar</button>
      </div>
      
      <label>Nombre del Medicamento:</label>
      <input 
        className="input-field" 
        list="medicamentos-list" 
        placeholder="Nombre del medicamento" 
        value={form.nombre} 
        onChange={e => setForm({...form, nombre: e.target.value})} 
        disabled={!!editingId}
      />
      <datalist id="medicamentos-list">
        {lista.map(m => <option key={m.id} value={m.nombre} />)}
      </datalist>

      <label>Cantidad en Stock:</label>
      <input 
        className="input-field" 
        type="number" 
        placeholder="Cantidad" 
        value={form.stock} 
        onChange={e => setForm({...form, stock: e.target.value})} 
      />
      
      {/* Botón condicional según validación */}
      <button 
        className="btn-submit" 
        onClick={registrar} 
        disabled={!isFormValid || loading}
        style={{ opacity: !isFormValid || loading ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Procesando...' : (editingId ? 'Actualizar' : 'Guardar Producto')}
      </button>
    </div>
  );
};