import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { eadApiService } from '../services/eadApiService';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface EADAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isRoot: boolean;
  isProfessor: boolean;
  hasAccess: boolean; // root ou professor
}

const EADAuthContext = createContext<EADAuthContextType | undefined>(undefined);

export const useEADAuth = () => {
  const context = useContext(EADAuthContext);
  if (!context) {
    throw new Error('useEADAuth deve ser usado dentro de EADAuthProvider');
  }
  return context;
};

export const EADAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão salva
    const savedUser = localStorage.getItem('ead_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('ead_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Usar a mesma API de autenticação do projeto principal
      // A API está em /api/auth/login (fora da pasta EAD)
      const response = await fetch('https://novaedubncc.com.br/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.error && data.user) {
        const userRole = data.user.role?.toLowerCase();
        
        // Validar se o usuário tem acesso (root, admin, professor ou professor_cursos)
        if (userRole !== 'root' && userRole !== 'admin' && userRole !== 'professor' && userRole !== 'professor_cursos') {
          // Usuário não tem permissão para acessar o sistema de cursos
          return false;
        }

        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(userData);
        localStorage.setItem('ead_user', JSON.stringify(userData));
        if (data.session_id) {
          localStorage.setItem('ead_session_id', data.session_id);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ead_user');
    localStorage.removeItem('ead_session_id');
    fetch('https://novaedubncc.com.br/api/auth/logout', { method: 'POST', credentials: 'include' });
  };

  // Verificar se é root
  const isRoot = user?.role?.toLowerCase() === 'root';
  
  // Verificar se é professor (do sistema principal)
  const isProfessor = user?.role?.toLowerCase() === 'professor';

  // Verificar se é admin (do sistema principal)
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // Verificar se é professor_cursos (acesso apenas aos cursos permitidos)
  const isProfessorCursos = user?.role?.toLowerCase() === 'professor_cursos';
  
  // Verificar se tem acesso (root, admin, professor ou professor_cursos)
  const hasAccess = isRoot || isAdmin || isProfessor || isProfessorCursos;

  return (
    <EADAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isRoot,
        isProfessor,
        hasAccess,
      }}
    >
      {children}
    </EADAuthContext.Provider>
  );
};
