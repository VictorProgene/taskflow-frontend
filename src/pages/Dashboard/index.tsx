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

  // States for the Create Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // We isolated the fetch logic so we can call it initially and refresh after adding a task
  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch all user projects
      const projectsResponse = await api.get('/projects/');
      const projectsList = projectsResponse.data;
      setProjects(projectsList);

      if (projectsList.length > 0) {
        // 2. Create an array of requests (Promises) for each project found
        const tasksPromises = projectsList.map((project: any) => 
          api.get(`/tasks/project/${project.id}`)
        );

        // 3. Execute all requests in parallel
        const responses = await Promise.all(tasksPromises);

        // 4. Merge the task arrays from each response into a single array
        const allTasks = responses.reduce((acc, response) => {
          return acc.concat(response.data);
        }, [] as Task[]);

        // 5. Update state with all tasks from all projects
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Could not load data from the server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Submits the new task payload to FastAPI POST /tasks/
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !selectedProjectId) return;

    try {
      setModalLoading(true);
      
      const payload = {
        title: newTitle,
        priority: newPriority,
        project_id: Number(selectedProjectId),
        status: 'pending' // Defaults to pending upon creation
      };

      await api.post('/tasks/', payload);

      // Reset form variables and close window
      setNewTitle('');
      setNewPriority('medium');
      setIsModalOpen(false);

      // Re-fetch everything to bring the new row to life instantly
      await loadDashboardData();

    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create the task. Make sure your FastAPI server is reachable.');
    } finally {
      setModalLoading(false);
    }
  }

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

        {/* Grid de Estatísticas */}
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
              {loading ? '...' : tasks.filter(t => t.status !== 'done').length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-400 text-sm font-medium">Concluídas</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-400">
              {loading ? '...' : tasks.filter(t => t.status === 'done').length}
            </p>
          </div>
        </div>

        {/* 📋 SEÇÃO DE TAREFAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-white">Suas Tarefas Recentes</h2>
            
            <button 
              onClick={() => {
                if (projects.length > 0) {
                  setSelectedProjectId(String(projects[0].id)); // Pre-selects the first project item
                }
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Nova Tarefa
            </button>
          </div>

          {loading && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Carregando tarefas do servidor...
            </div>
          )}

          {error && !loading && (
            <div className="p-8 text-center text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma tarefa encontrada. Comece criando uma!
            </div>
          )}

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
                      <td className="py-4 px-6 text-slate-400">
                        {task.project?.name || 'Sem projeto'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${task.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                          ${task.status === 'in_progress' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : ''}
                          ${task.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                        `}>
                          {task.status === 'done' && 'Concluído'}
                          {task.status === 'in_progress' && 'Em Progresso'}
                          {task.status === 'pending' && 'Pendente'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold capitalize
                          ${task.priority === 'high' ? 'text-rose-400' : ''}
                          ${task.priority === 'medium' ? 'text-yellow-400' : ''}
                          ${task.priority === 'low' ? 'text-sky-400' : ''}
                        `}>
                          {task.priority === 'high' && 'Alta'}
                          {task.priority === 'medium' && 'Média'}
                          {task.priority === 'low' && 'Baixa'}
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

      {/* 🖥️ DARK THEMED TASK CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Design database schemas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  {projects.length === 0 ? (
                    <option value="" disabled>No projects found. Create one first!</option>
                  ) : (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || projects.length === 0}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}