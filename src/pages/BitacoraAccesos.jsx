import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/forms.css';

export const BitacoraAccesos = () => {
  const [accesos, setAccesos] = useState([]);

  useEffect(() => {
    fetchAccesos();
  }, []);

  const fetchAccesos = async () => {
    const { data, error } = await supabase
      .from('bitacora_accesos')
      .select('id, id_usuario, fecha_acceso, usuarios(nombre)')
      .order('fecha_acceso', { ascending: false });
    
    if (!error && data) setAccesos(data);
  };

  return (
    <div className="form-card" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Bitácora de Accesos</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0fdf4', textAlign: 'left', borderBottom: '2px solid var(--accent-color)' }}>
            <th style={{ padding: '0.75rem' }}>ID</th>
            <th style={{ padding: '0.75rem' }}>Usuario</th>
            <th style={{ padding: '0.75rem' }}>Fecha de Acceso</th>
          </tr>
        </thead>
        <tbody>
          {accesos.map((item) => {
            const fechaOriginal = new Date(item.fecha_acceso);
            
            // Ajuste manual de -6 horas para corregir el desfase UTC a hora de Morelia
            const fechaAjustada = new Date(fechaOriginal.getTime() - (6 * 60 * 60 * 1000));

            const fechaFormateada = fechaAjustada.toLocaleDateString('es-MX');
            const horaFormateada = fechaAjustada.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).toLowerCase();

            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{item.id}</td>
                <td style={{ padding: '0.75rem' }}>{item.usuarios?.nombre || 'Usuario eliminado'}</td>
                <td style={{ padding: '0.75rem' }}>{`${fechaFormateada}, ${horaFormateada}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};