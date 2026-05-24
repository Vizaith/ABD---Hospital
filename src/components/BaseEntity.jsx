import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const BaseEntity = ({ title, table, columns, idField }) => {
  const [data, setData] = useState([]);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from(table).select('*');
    if (data) setData(data);
  };

  const handleSave = async () => {
    if (form[idField]) await supabase.from(table).update(form).eq(idField, form[idField]);
    else await supabase.from(table).insert([form]);
    setView('list'); fetchData();
  };

  return (
    <div className="form-card">
      {view === 'list' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>{title}</h2>
            <button onClick={() => { setForm({}); setView('form'); }}>+ Nuevo</button>
          </div>
          <table>
          </table>
        </>
      ) : (

        <div>
           {columns.map(col => (
             <input key={col} placeholder={col} onChange={e => setForm({...form, [col]: e.target.value})} />
           ))}
           <button onClick={handleSave}>Guardar</button>
        </div>
      )}
    </div>
  );
};