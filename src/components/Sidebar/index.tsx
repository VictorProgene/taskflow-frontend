import { LayoutDashboard, FolderKanban, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  // Clears authentication data and logs the user out securely
  function handleLogout() {
    // 1. Remove the token from local storage
    localStorage.removeItem('@TaskFlow:token');

    // 2. Eject the user back to the login page
    navigate('/login', { replace: true });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 text-slate-300">
      {/* Topo da Sidebar: Logo e Links */}
      <div className="space-y-8">
        {/* Brand/Logo */}
        <div className="flex items-center gap-2 px-2 text-white font-bold text-xl tracking-wide">
          <div className="w-3 h-3 rounded-full bg-sky-500"></div>
          <span>TaskFlow</span>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-800 text-sky-400 font-medium rounded-lg transition-colors cursor-pointer text-left"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
        {/*
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-left">
            <FolderKanban className="w-5 h-5" />
            <span>Projetos</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer text-left">
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
        */}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Botão de Sair */}
      <button 
        onClick={handleLogout} // 👈 Ativa o fluxo real de logout
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer text-left font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Sair</span>
      </button>
    </aside>
  );
}