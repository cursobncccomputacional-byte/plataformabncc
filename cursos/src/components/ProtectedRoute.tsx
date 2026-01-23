import { Navigate } from 'react-router-dom';
import { useEADAuth } from '../contexts/EADAuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, hasAccess, loading } = useEADAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#044982]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se tem acesso (root ou professor)
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#044982]">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#044982] mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta área. Apenas usuários com perfil Root ou Professor podem acessar o sistema de cursos.
          </p>
          <button
            onClick={() => window.location.href = 'https://novaedubncc.com.br'}
            className="bg-[#044982] text-white px-6 py-2 rounded-lg hover:bg-[#005a93] transition"
          >
            Voltar para o site principal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
