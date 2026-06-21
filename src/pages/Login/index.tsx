import { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. FastAPI padrão (OAuth2) exige formato Form Data em vez de JSON para o login.
      // Se a sua rota receber JSON puro, basta reverter para: await api.post('/auth/login', { email, password });
      const formData = new URLSearchParams();
      formData.append('username', email); // O OAuth2 do FastAPI usa 'username' como chave para o e-mail
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // 2. O FastAPI retorna o token como 'access_token'
      const token = response.data.access_token || response.data.token;

      if (token) {
        // Salva o token no navegador
        localStorage.setItem('@TaskFlow:token', token);

        // Navega automaticamente para o Dashboard após o login com sucesso
        navigate('/dashboard');
      } else {
        setError('Erro ao ler a chave de acesso enviada pelo servidor.');
      }
    } catch (err: any) {
      console.error(err);
      
      // Captura mensagens amigáveis retornadas pelo seu backend
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-slate-950 font-sans">
      
      {/* LADO ESQUERDO: Formulário */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-slate-900 text-slate-100">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Header do Form */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 font-bold text-2xl tracking-wide">
              <LogIn className="w-6 h-6" />
              <span>TaskFlow</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">Gerencie seus projetos</h2>
            <p className="mt-2 text-sm text-slate-400">Entre com as suas credenciais para acessar o painel.</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Campo de E-mail */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Campo de Senha */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/40 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Carregando...' : 'Acessar o Painel'}</span>
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-slate-400">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-sky-400 hover:underline font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* LADO DIREITO: Banner Visual */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-12 border-l border-slate-800">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 mb-2">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Produtividade sem fricção</h3>
          <p className="text-slate-400 leading-relaxed">
            Centralize suas sprints, distribua tarefas e acompanhe o progresso da sua equipe em tempo real.
          </p>
        </div>
      </div>

    </div>
  );
}