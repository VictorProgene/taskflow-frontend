import { useEffect, useState } from 'react'; // 1. IMPORTA O USEEFFECT E O USESTATE
import Sidebar from '../../components/Sidebar';
import api from '../../services/api'; // 2. IMPORTA A NOSSA INSTÂNCIA DO AXIOS

// Definimos a estrutura (Type) de uma tarefa para o TypeScript não reclamar
interface Task {
  id: number;
  title: string;
  project: string;
  status: string;
  priority: string;
}

export default function Dashboard() {
  // Criamos o estado que vai guardar as tarefas vindas do backend
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // 1. Busca os projetos do usuário primeiro
      const projectsResponse = await api.get('/projects/');
      const projectsList = projectsResponse.data;

      // Se o usuário tiver pelo menos um projeto, busca as tarefas dele
      if (projectsList.length > 0) {
        const firstProjectId = projectsList[0].id; // Pega o ID do primeiro projeto
        
        // 2. Bate no endpoint correto da sua documentação: /tasks/project/{project_id}
        const tasksResponse = await api.get(`/tasks/project/${firstProjectId}`);
        setTasks(tasksResponse.data);
      }
      
    } catch (err: any) {
      console.error('Erro ao carregar dados do painel:', err);
      setError('Não foi possível carregar os dados do servidor.');
    } finally {
      setLoading(false);
    }
  }

  loadDashboardData();
}, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Principal</h1>
            <p className="text-sm text-slate-400 mt-1">Bem-vindo de volta ao TaskFlow.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
              JV
            </div>
            <span className="text-sm font-medium">João Victor</span>
          </div>
        </header>

        {/* Grid de Estatísticas Baseado no tamanho real da lista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Total de Tarefas</h3>
            <p className="text-3xl font-bold mt-2 text-white">
              {loading ? '...' : tasks.length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Tarefas Pendentes</h3>
            <p className="text-3xl font-bold mt-2 text-amber-400">
              {loading ? '...' : tasks.filter(t => t.status !== 'Concluído').length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Concluídas</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">
              {loading ? '...' : tasks.filter(t => t.status === 'Concluído').length}
            </p>
          </div>
        </div>

        {/* 📋 SEÇÃO DE TAREFAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-white">Suas Tarefas Recentes</h2>
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              + Nova Tarefa
            </button>
          </div>

          {/* Feedback de Loading */}
          {loading && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Carregando tarefas do servidor...
            </div>
          )}

          {/* Feedback de Erro da API */}
          {error && !loading && (
            <div className="p-8 text-center text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Lista Vazia */}
          {!loading && !error && tasks.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma tarefa encontrada. Comece criando uma!
            </div>
          )}

          {/* Tabela Dinâmica */}
          {!loading && !error && tasks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                    <th className="py-4 px-6">Tarefa</th>
                    <th className="py-4 px-6">Projeto</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Prioridade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">{task.title}</td>
                      <td className="py-4 px-6 text-slate-400">{task.project}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${task.status === 'Concluído' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                          ${task.status === 'Em Progresso' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : ''}
                          ${task.status === 'Pendente' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                        `}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold
                          ${task.priority === 'Crítica' ? 'text-rose-400' : ''}
                          ${task.priority === 'Alta' ? 'text-orange-400' : ''}
                          ${task.priority === 'Média' ? 'text-yellow-400' : ''}
                        `}>
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}