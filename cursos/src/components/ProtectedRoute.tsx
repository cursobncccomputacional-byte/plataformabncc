import { Navigate } from 'react-router-dom';
import { useEADAuth } from '../contexts/EADAuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useEADAuth();

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

  return <>{children}</>;
};
