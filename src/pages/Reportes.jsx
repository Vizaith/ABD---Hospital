import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const Reportes = () => {
  const [metricas, setMetricas] = useState({ totalPacientes: 0, totalConsultas: 0 });

  const cargarReporteGeneral = async () => {
    // Estas consultas utilizan count para sacar métricas básicas
    const { count: countPacientes } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
    const { count: countConsultas } = await supabase.from('consultas').select('*', { count: 'exact', head: true });
    
    setMetricas({
      totalPacientes: countPacientes || 0,
      totalConsultas: countConsultas || 0
    });
  };

  return (
    <div className="form-card">
      <h2>Reportes Gerenciales</h2>
      <button className="btn-submit" onClick={cargarReporteGeneral} style={{ marginBottom: '2rem' }}>Generar Resumen Actual</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Total Pacientes Registrados</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0', color: '#1e293b' }}>{metricas.totalPacientes}</p>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Total Consultas Históricas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0', color: '#1e293b' }}>{metricas.totalConsultas}</p>
        </div>
      </div>
    </div>
  );
};