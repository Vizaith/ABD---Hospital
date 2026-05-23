import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Facturacion = () => {
  const [form, setForm] = useState({ id_paciente: '', total: '', metodo: '' });
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const metodosPago = ["Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia"];

  useEffect(() => {
    supabase.from('pacientes').select('id_paciente, nombre_completo').then(({ data }) => setPacientes(data || []));
  }, []);

  const isFormValid = form.id_paciente !== '' && parseFloat(form.total) > 0 && form.metodo !== '';

  const handleGenerarFactura = async () => {
    if (!isFormValid) return;

    setLoading(true);
    
    // Llamada actualizada al nuevo nombre de función
    const { error } = await supabase.rpc('fn_registrar_factura', { 
      p_id_paciente: parseInt(form.id_paciente), 
      p_total: parseFloat(form.total), 
      p_metodo_pago: form.metodo 
    });

    if (error) {
      alert("Error al generar factura: " + error.message);
    } else {
      alert("Factura generada correctamente");
      setForm({ id_paciente: '', total: '', metodo: '' });
      setBusqueda('');
    }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h2>Módulo de Facturación</h2>
      
      <label>Paciente:</label>
      <input 
        className="input-field" 
        list="list-p" 
        value={busqueda} 
        onChange={(e) => {
          setBusqueda(e.target.value);
          const p = pacientes.find(x => x.nombre_completo === e.target.value);
          setForm({ ...form, id_paciente: p ? p.id_paciente : '' });
        }} 
        placeholder="Buscar paciente..." 
      />
      <datalist id="list-p">{pacientes.map(p => <option key={p.id_paciente} value={p.nombre_completo} />)}</datalist>

      <label>Total:</label>
      <input 
        className="input-field" 
        type="number" 
        placeholder="0.00" 
        value={form.total}
        onChange={e => setForm({ ...form, total: e.target.value })} 
      />
      
      <label>Método de Pago:</label>
      <select 
        className="input-field" 
        value={form.metodo}
        onChange={e => setForm({ ...form, metodo: e.target.value })}
      >
        <option value="">Seleccione un método...</option>
        {metodosPago.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <button 
        className="btn-submit" 
        disabled={!isFormValid || loading} 
        onClick={handleGenerarFactura}
        style={{ 
          opacity: isFormValid && !loading ? 1 : 0.5, 
          cursor: isFormValid && !loading ? 'pointer' : 'not-allowed' 
        }}
      >
        {loading ? 'Procesando...' : 'Generar Factura'}
      </button>
    </div>
  );
};