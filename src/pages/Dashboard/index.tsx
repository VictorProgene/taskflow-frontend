import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  project?: {
    id: number;
    name: string;
  } | null;
  status: string;
  priority: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('User');

  // Estado para controlar a visibilidade da coluna de prioridades
  const [showPriority, setShowPriority] = useState(false);

  // Estados dos Modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskModalLoading, setTaskModalLoading] = useState(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectModalLoading, setProjectModalLoading] = useState(false);

  // Estados de travamento para salvamento inline
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [priorityUpdatingId, setPriorityUpdatingId] = useState<number | null>(null);

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');
      
      const projectsResponse = await api.get('/projects/');
      const projectsList = projectsResponse.data;
      setProjects(projectsList);

      if (projectsList.length > 0) {
        const tasksPromises = projectsList.map((project: any) => 
          api.get(`/tasks/project/${project.id}`)
        );

        const responses = await Promise.all(tasksPromises);

        const allTasks = responses.reduce((acc, response) => {
          return acc.concat(response.data);
        }, [] as Task[]);

        setTasks(allTasks);
      } else {
        setTasks([]);
      }
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Não foi possível carregar os dados do servidor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    const savedName = localStorage.getItem('@TaskFlow:user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  async function handleUpdateStatus(taskId: number, currentTask: Task, newStatus: string) {
    try {
      setStatusUpdatingId(taskId);
      const payload = { status: newStatus };
      await api.patch(`/tasks/${taskId}/status`, payload);

      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (err) {
      console.error('Error changing task status:', err);
      alert('Falha ao atualizar o status da tarefa.');
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleUpdatePriority(taskId: number, currentTask: Task, newPriorityValue: string) {
    try {
      setPriorityUpdatingId(taskId);
      await api.patch(`/tasks/${taskId}?priority=${newPriorityValue}`);

      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? { ...t, priority: newPriorityValue } : t)
      );
    } catch (err) {
      console.error('Error changing task priority:', err);
      try {
        const payload = {
          title: currentTask.title,
          status: currentTask.status,
          priority: newPriorityValue,
          project_id: currentTask.project ? currentTask.project.id : null
        };
        await api.patch(`/tasks/${taskId}`, payload);
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? { ...t, priority: newPriorityValue } : t)
        );
      } catch (e) {
        alert('Falha ao atualizar a prioridade da tarefa.');
      }
    } finally {
      setPriorityUpdatingId(null);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !selectedProjectId) return;

    try {
      setTaskModalLoading(true);
      const payload = {
        title: newTitle,
        priority: newPriority,
        project_id: Number(selectedProjectId),
        status: 'pending'
      };

      await api.post('/tasks/', payload);
      setNewTitle('');
      setNewPriority('medium');
      setIsTaskModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Falha ao criar a tarefa.');
    } finally {
      setTaskModalLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setProjectModalLoading(true);
      const payload = { name: newProjectName.trim() };
      await api.post('/projects/', payload);
      setNewProjectName('');
      setIsProjectModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Falha ao criar o projeto.');
    } finally {
      setProjectModalLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Principal</h1>
            <p className="text-sm text-slate-400 mt-1">Bem-vindo de volta, {userName}.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm tracking-wider">
              {getInitials(userName)}
            </div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </header>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Total de Tarefas</h3>
            <p className="text-3xl font-bold mt-2 text-white">{loading ? '...' : tasks.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Tarefas Pendentes</h3>
            <p className="text-3xl font-bold mt-2 text-amber-400">{loading ? '...' : tasks.filter(t => t.status !== 'done').length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Concluídas</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">{loading ? '...' : tasks.filter(t => t.status === 'done').length}</p>
          </div>
        </div>

        {/* 📋 SEÇÃO DE TAREFAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">Suas Tarefas Recentes</h2>
              
              <button
                type="button"
                onClick={() => setShowPriority(!showPriority)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                  showPriority 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {showPriority ? 'Ocultar Prioridade' : 'Exibir Prioridade'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                type="button" 
                onClick={() => setIsProjectModalOpen(true)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                + Novo Projeto
              </button>
              <button 
                type="button" 
                onClick={() => { if (projects.length > 0) setSelectedProjectId(String(projects[0].id)); setIsTaskModalOpen(true); }} 
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                + Nova Tarefa
              </button>
            </div>
          </div>

          {loading && <div className="p-8 text-center text-slate-400 text-sm">Carregando tarefas...</div>}

          {!loading && !error && tasks.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhuma tarefa encontrada.</div>}

          {!loading && !error && tasks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                    <th className="py-4 px-6">Tarefa</th>
                    <th className="py-4 px-6">Projeto</th>
                    <th className="py-4 px-6">Status</th>
                    {showPriority && <th className="py-4 px-6">Prioridade</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">{task.title}</td>
                      <td className="py-4 px-6 text-slate-400">{task.project?.name || 'Sem projeto'}</td>
                      <td className="py-4 px-6">
                        <select
                          value={task.status}
                          disabled={statusUpdatingId === task.id}
                          onChange={(e) => handleUpdateStatus(task.id, task, e.target.value)}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border bg-slate-950 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer disabled:opacity-40
                            ${task.status === 'done' ? 'border-emerald-500/30 text-emerald-400' : ''}
                            ${task.status === 'in_progress' ? 'border-sky-500/30 text-sky-400' : ''}
                            ${task.status === 'pending' ? 'border-amber-500/30 text-amber-400' : ''}
                          `}
                        >
                          <option value="pending" className="bg-slate-900 text-amber-400">Pendente</option>
                          <option value="in_progress" className="bg-slate-900 text-sky-400">Em Progresso</option>
                          <option value="done" className="bg-slate-900 text-emerald-400">Concluído</option>
                        </select>
                      </td>

                      {showPriority && (
                        <td className="py-4 px-6">
                          <select
                            value={task.priority}
                            disabled={priorityUpdatingId === task.id}
                            onChange={(e) => handleUpdatePriority(task.id, task, e.target.value)}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border bg-slate-950 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer disabled:opacity-40 capitalize
                              ${task.priority === 'high' ? 'border-rose-500/30 text-rose-400' : ''}
                              ${task.priority === 'medium' ? 'border-yellow-500/30 text-yellow-400' : ''}
                              ${task.priority === 'low' ? 'border-sky-500/30 text-sky-400' : ''}
                            `}
                          >
                            <option value="low" className="bg-slate-900 text-sky-400">Baixa</option>
                            <option value="medium" className="bg-slate-900 text-yellow-400">Média</option>
                            <option value="high" className="bg-slate-900 text-rose-400">Alta</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 🛠️ MODAIS COMPLETOS DE VOLTA */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <h2 className="text-xl font-bold text-white mb-4">Criar Novo Projeto</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: App Dashboard"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg">Cancelar</button>
                <button type="submit" disabled={projectModalLoading} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg">{projectModalLoading ? 'Criando...' : 'Criar Projeto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <h2 className="text-xl font-bold text-white mb-4">Criar Nova Tarefa</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desenhar schemas do banco"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Projeto</label>
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm">
                  {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prioridade</label>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg">Cancelar</button>
                <button type="submit" disabled={taskModalLoading} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}