import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Farmacia } from './pages/Farmacia';
import { Hospitalizaciones } from './pages/Hospitalizaciones';
import { Reportes } from './pages/Reportes';
import { Usuarios } from './pages/Usuarios';
import { Registro } from './pages/Registro';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { Consultas } from './pages/Consultas';
import { Expedientes } from './pages/Expedientes';
import { Medicos } from './pages/Medicos';
import { Facturacion } from './pages/Facturacion';
import { Laboratorios } from './pages/Laboratorios';
import { Auditoria } from './pages/Auditoria';
import './styles/global.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/' || location.pathname === '/registro';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pacientes" element={<ProtectedRoute><Pacientes /></ProtectedRoute>} />
            <Route path="/medicos" element={<ProtectedRoute><Medicos /></ProtectedRoute>} />
            <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
            <Route path="/expedientes" element={<ProtectedRoute><Expedientes /></ProtectedRoute>} />
            <Route path="/facturacion" element={<ProtectedRoute><Facturacion /></ProtectedRoute>} />
            <Route path="/laboratorios" element={<ProtectedRoute><Laboratorios /></ProtectedRoute>} />
            <Route path="/auditoria" element={<ProtectedRoute><Auditoria /></ProtectedRoute>} />
            <Route path="/farmacia" element={<ProtectedRoute><Farmacia /></ProtectedRoute>} />
            <Route path="/hospitalizaciones" element={<ProtectedRoute><Hospitalizaciones /></ProtectedRoute>} />
            <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;