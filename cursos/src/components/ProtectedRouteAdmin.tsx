import { Navigate } from 'react-router-dom';
import { useEADAuth } from '../contexts/EADAuthContext';

/**
 * Rota protegida apenas para usuários com perfil Root
 * Usado para áreas administrativas
 */
export const ProtectedRouteAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isRoot, loading } = useEADAuth();

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

  if (!isRoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#044982]">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#044982] mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Esta área é restrita apenas para usuários com perfil Root.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#044982] text-white px-6 py-2 rounded-lg hover:bg-[#005a93] transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
