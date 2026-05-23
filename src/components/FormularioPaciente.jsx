import '../styles/forms.css';
export const FormularioPaciente = () => (
  <div className="form-card">
    <h3>Registrar Paciente</h3>
    <input className="input-field" type="text" placeholder="Nombre completo" />
    <input className="input-field" type="date" />
    <button className="btn-submit">Guardar Registro</button>
  </div>
);