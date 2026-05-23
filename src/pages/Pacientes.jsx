import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Pacientes = () => {
  const [form, setForm] = useState({ 
    nombre_completo: '', 
    fecha_nacimiento: '', 
    tipo_sangre: '', 
    telefono: '' 
  });
  
  // Validaciones
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

  const registrar = async () => {
    if (!isFormValid) return;

    // El SDK de Supabase utiliza automáticamente la sesión activa del usuario
    const { error } = await supabase.from('pacientes').insert([form]);
    
    if (error) {
      alert("Error al registrar: " + error.message);
    } else {
      alert("Paciente registrado correctamente");
      // Opcional: limpiar formulario tras éxito
      setForm({ nombre_completo: '', fecha_nacimiento: '', tipo_sangre: '', telefono: '' });
    }
  };

  const tiposSangre = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="form-card">
      <h2>Registro de Pacientes</h2>
      
      <label>Nombre Completo:</label>
      <input 
        className="input-field" 
        placeholder="Introduzca el nombre completo"
        value={form.nombre_completo}
        onChange={e => setForm({...form, nombre_completo: e.target.value})} 
      />
      
      <label>Fecha de Nacimiento:</label>
      <input 
        className="input-field" 
        type="date" 
        value={form.fecha_nacimiento}
        onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} 
      />
      
      <label>Tipo de Sangre:</label>
      <select 
        className="input-field" 
        value={form.tipo_sangre}
        onChange={e => setForm({...form, tipo_sangre: e.target.value})}
      >
        <option value="">Seleccione...</option>
        {tiposSangre.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>Teléfono (10-12 dígitos):</label>
      <input 
        className="input-field" 
        type="tel" 
        maxLength="12" 
        value={form.telefono}
        onChange={e => setForm({...form, telefono: e.target.value.replace(/\D/g, '')})} 
      />

      <button 
        className="btn-submit" 
        disabled={!isFormValid} 
        onClick={registrar} 
        style={{ 
          opacity: isFormValid ? 1 : 0.5, 
          cursor: isFormValid ? 'pointer' : 'not-allowed' 
        }}
      >
        Guardar Paciente
      </button>
    </div>
  );
};