import Sidebar from '../../components/Sidebar';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Nossa Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Principal</h1>
            <p className="text-sm text-slate-400 mt-1">Bem-vindo de volta ao TaskFlow.</p>
          </div>
          
          {/* Mock de Usuário */}
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
              JV
            </div>
            <span className="text-sm font-medium">João Victor</span>
          </div>
        </header>

        {/* Grid de Estatísticas (Próximo passo) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Projetos Ativos</h3>
            <p className="text-3xl font-bold mt-2 text-white">5</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Tarefas Pendentes</h3>
            <p className="text-3xl font-bold mt-2 text-amber-400">12</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Concluídas (Esta semana)</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">8</p>
          </div>
        </div>
      </main>
    </div>
  );
}