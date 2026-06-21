import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Busca o token que você salvou no login
  const token = localStorage.getItem('@TaskFlow:token');

  // Se NÃO existir token, joga o usuário na hora para a tela de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se existir token, deixa o usuário acessar a rota normalmente
  return <Outlet />;
}