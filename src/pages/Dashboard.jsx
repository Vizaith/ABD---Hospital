import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Dashboard = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultas = async () => {
      // Corregido: se usa 'fecha_consulta' según imagen_52.png
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id_consulta, 
          motivo, 
          fecha_consulta, 
          pacientes!fk_consultas_paciente(nombre_completo),
          medicos!fk_consultas_medico(nombre_completo)
        `)
        .order('id_consulta', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error al cargar consultas:", error);
      } else {
        setConsultas(data || []);
      }
      setLoading(false);
    };
    fetchConsultas();
  }, []);

  const totalConsultas = consultas.length;
  const pacientesUnicos = new Set(consultas.map(c => c.pacientes?.nombre_completo)).size;

  if (loading) return <div className="form-card" style={{ textAlign: 'center' }}>Cargando...</div>;

  return (
    <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#065f46' }}>Total Consultas</h3>
          <p style={{ margin: '5px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{totalConsultas}</p>
        </div>
        <div style={{ flex: 1, padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>Pacientes Atendidos</h3>
          <p style={{ margin: '5px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{pacientesUnicos}</p>
        </div>
      </div>

      <h2 style={{ color: 'var(--primary-color)' }}>Consultas Recientes</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
            <th style={{ padding: '0.75rem' }}>Paciente</th>
            <th style={{ padding: '0.75rem' }}>Médico</th>
            <th style={{ padding: '0.75rem' }}>Motivo</th>
            <th style={{ padding: '0.75rem' }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {consultas.map((c) => (
            <tr key={c.id_consulta} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem' }}>{c.pacientes?.nombre_completo || 'Sin nombre'}</td>
              <td style={{ padding: '0.75rem' }}>{c.medicos?.nombre_completo || 'Sin médico'}</td>
              <td style={{ padding: '0.75rem' }}>{c.motivo}</td>
              {/* Actualizado para usar c.fecha_consulta */}
              <td style={{ padding: '0.75rem' }}>{c.fecha_consulta ? new Date(c.fecha_consulta).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};