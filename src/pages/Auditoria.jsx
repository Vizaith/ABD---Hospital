import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('auditoria_cambios')
        .select('*')
        .order('fecha', { ascending: false });
      if (data) setLogs(data);
    };
    fetchLogs();
  }, []);

  const getOperacionLabel = (op) => {
    const labels = { 'INSERT': 'Nuevo registro', 'UPDATE': 'Actualización', 'DELETE': 'Eliminación' };
    return labels[op] || op;
  };

  return (
    <div className="form-card" style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1e293b' }}>Bitácora de Actividad</h2>
      
      {logs.map((log) => (
        <div key={log.id_auditoria} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
          <div 
            onClick={() => setExpandedId(expandedId === log.id_auditoria ? null : log.id_auditoria)}
            style={{ padding: '1rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div>
              <strong style={{ display: 'block', color: '#0f172a' }}>{log.tabla_afectada.toUpperCase()}</strong>
              <small style={{ color: '#64748b' }}>{getOperacionLabel(log.operacion)} • {new Date(log.fecha).toLocaleString()}</small>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 'bold' }}>
              {expandedId === log.id_auditoria ? '▲ Ocultar' : '▼ Ver detalles'}
            </button>
          </div>

          {expandedId === log.id_auditoria && (
            <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><strong>Realizado por:</strong> {log.usuario || 'Sistema'}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                {log.datos_nuevos && (
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>Información registrada:</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {Object.entries(log.datos_nuevos).map(([key, val]) => (
                        <li key={key} style={{ padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <strong>{key}:</strong> {String(val)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};