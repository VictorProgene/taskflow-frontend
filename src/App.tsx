import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial redireciona direto para o Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Nossas telas principais */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} /> {/* 2. ADICIONA A ROTA */}
      </Routes>
    </BrowserRouter>
  );
}