import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/LocalAuthContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import { Reports } from './pages/Reports';
import { LoadingScreen } from './components/LoadingScreen';
import StudentHome from './pages/StudentHome';
import { WelcomeLoadingScreen } from './components/WelcomeLoadingScreen';
import { RootManagement } from './pages/RootManagement';

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'user-management' | 'reports'>('dashboard');
  const [currentView, setCurrentView] = useState<'home' | 'about'>('home');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user, loading } = useAuth();

  // Simular carregamento inicial da aplicação
  React.useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 3000); // 3 segundos de carregamento inicial
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Tela de carregamento inicial para visitantes
  if (isInitialLoad && !user) {
    return <WelcomeLoadingScreen message="Preparando sua jornada educacional..." />;
  }

  // Tela de carregamento para sistema interno (login/dashboard)
  if (loading || isLoggingIn) {
    return <LoadingScreen message={isLoggingIn ? "Entrando no sistema..." : "Carregando plataforma BNCC..."} />;
  }

  if (user) {
    // Renderizar página baseada no role e página atual
    if (user.role === 'aluno') {
      return <StudentHome />;
    }
    
    // Root: Apenas gerenciamento de usuários
    if (user.role === 'root') {
      return <RootManagement />;
    }
    
    if (user.role === 'admin' && currentPage === 'user-management') {
      return (
        <UserManagement 
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      );
    }

    if (user.role === 'admin' && currentPage === 'reports') {
      return (
        <Reports 
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      );
    }
    
    return (
      <Dashboard 
        onNavigateToUserManagement={() => setCurrentPage('user-management')}
        onNavigateToReports={() => setCurrentPage('reports')}
        userRole={user.role}
      />
    );
  }

  if (showLogin) {
    return (
      <Login
        onBack={() => setShowLogin(false)}
        onSuccess={() => {
          setIsLoggingIn(true);
          setTimeout(() => {
            setIsLoggingIn(false);
            setShowLogin(false);
          }, 4000); // 4 segundos de carregamento
        }}
      />
    );
  }

  // Renderizar página baseada na view atual
  if (currentView === 'about') {
    return <About onBackToHome={() => setCurrentView('home')} />;
  }

  return <Home onLoginClick={() => setShowLogin(true)} onNavigateToAbout={() => setCurrentView('about')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
