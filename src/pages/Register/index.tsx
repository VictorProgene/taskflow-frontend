import { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chamada POST para a rota de cadastro da sua API FastAPI
      await api.post('/auth/register', { email, password });
      
      setSuccess(true);
      // Aguarda 2 segundos para o usuário ler o sucesso e manda pro login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-slate-950 font-sans">
      
      {/* LADO ESQUERDO: Formulário */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-slate-900 text-slate-100">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sky-400 font-bold text-2xl tracking-wide">
              <UserPlus className="w-6 h-6" />
              <span>TaskFlow</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">Crie sua conta</h2>
            <p className="mt-2 text-sm text-slate-400">Comece a organizar suas tarefas hoje mesmo.</p>
          </div>

          {/* Feedback de Erro */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Feedback de Sucesso */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm text-center">
              Conta criada com sucesso! Redirecionando...
            </div>
          )}

          {/* Formulário */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* Campo de E-mail */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Cadastrando...' : 'Criar minha conta'}</span>
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-slate-400">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-sky-400 hover:underline font-medium">
                  Faça login
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* LADO DIREITO: Banner */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-12 border-l border-slate-800">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 mb-2">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Tudo começa aqui</h3>
          <p className="text-slate-400 leading-relaxed">
            Crie sua conta gratuitamente e experimente um fluxo de trabalho sem interrupções e totalmente focado em resultados.
          </p>
        </div>
      </div>

    </div>
  );
}