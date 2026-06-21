import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute'; // 1. IMPORTA O BLOQUEADOR

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial agora joga para o Dashboard (que decide se deixa entrar ou manda pro login) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Nossas telas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. GRUPO DE ROTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Rota de escape para qualquer link digitado errado */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}