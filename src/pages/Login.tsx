import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';

interface LoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const Login = ({ onBack, onSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClearCache, setShowClearCache] = useState(false);

  const { signIn, signUp } = useAuth();

  // Limpar cache/sessões antigas ao montar o componente
  useEffect(() => {
    // Verificar se há dados antigos que podem causar problemas
    const hasOldData = localStorage.getItem('api_authenticated') || 
                      localStorage.getItem('api_session_id') ||
                      localStorage.getItem('plataforma-bncc-user');
    
    if (hasOldData) {
      // Não limpar automaticamente, mas mostrar opção se houver erro
      console.info('ℹ️ Dados de sessão antigos detectados. Se houver problemas, use o botão "Limpar Cache"');
    }
  }, []);

  const handleClearCache = () => {
    try {
      // Limpar todas as sessões e cache
      apiService.clearAllSessions();
      localStorage.clear();
      sessionStorage.clear();
      
      // Recarregar a página para garantir limpeza completa
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setError('Erro ao limpar cache. Tente fechar e abrir o navegador.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // Resetar flag de mostrar botão de limpar cache
      setShowClearCache(false);
      
      const { error } = await signIn(email, password);
      if (error) {
        // A mensagem de erro já vem melhorada do apiService
        // Adicionar informações adicionais se necessário
        let errorMessage = error.message;
        
        // Se for erro de rede, adicionar dicas de solução
        if (error.message.includes('conectar') || 
            error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError')) {
          errorMessage += '\n\n💡 Dicas:';
          errorMessage += '\n• Se funcionou na guia anônima, tente limpar o cache do navegador';
          errorMessage += '\n• Verifique se está conectado à internet';
          errorMessage += '\n• Tente desativar VPN ou proxy temporariamente';
          errorMessage += '\n• Verifique se o firewall não está bloqueando';
          errorMessage += '\n• Se estiver em rede corporativa, entre em contato com o suporte de TI';
          
          // Mostrar botão para limpar cache
          setShowClearCache(true);
        }
        
        setError(errorMessage);
        setLoading(false);
      } else {
        onSuccess();
      }
    } else {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setError('Conta criada! Faça login para continuar.');
        setIsLogin(true);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center px-4 py-6 safe-area-top">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 touch-target-inline min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center justify-center mb-8">
          <img 
            src="/logo/Logo Nova Edu (Oficial)-10.png" 
            alt="Nova Edu Logo" 
            className="h-20 w-auto"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {isLogin
            ? 'Entre para acessar os cursos e materiais'
            : 'Comece sua jornada na Nova Edu'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
                placeholder="seu.usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              error.includes('criada') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <div className="whitespace-pre-line">{error}</div>
              {showClearCache && (
                <button
                  onClick={handleClearCache}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Limpar Cache e Recarregar
                </button>
              )}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target-inline"
            style={{ backgroundColor: '#005a93' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004a7a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#005a93'}
          >
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium transition-colors"
            style={{ color: '#005a93' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#004a7a'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#005a93'}
          >
            {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
