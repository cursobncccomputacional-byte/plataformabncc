import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/LocalAuthContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { PoliticaPrivacidade } from './pages/PoliticaPrivacidade';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LoadingScreen } from './components/LoadingScreen';
import StudentHome from './pages/StudentHome';
import { WelcomeLoadingScreen } from './components/WelcomeLoadingScreen';
import { RootManagement } from './pages/RootManagement';
import { TermoAceiteFirstAccess } from './components/TermoAceiteFirstAccess';

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'politica-privacidade'>('home');
  const [showPoliticaFromTermo, setShowPoliticaFromTermo] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user, loading, updateProfile, signOut } = useAuth();

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
    // Termo de aceite no primeiro acesso (todos os perfis, inclusive root)
    const precisaAceitar = !user.data_aceite_politica_privacidade;
    if (precisaAceitar) {
      if (showPoliticaFromTermo) {
        return (
          <PoliticaPrivacidade onBack={() => setShowPoliticaFromTermo(false)} />
        );
      }
      return (
        <TermoAceiteFirstAccess
          onVerPolitica={() => setShowPoliticaFromTermo(true)}
          onAccepted={async (data) => {
            await updateProfile(data);
          }}
          onRecusarSair={signOut}
        />
      );
    }

    if (user.role === 'aluno') {
      return <StudentHome />;
    }
    if (user.role === 'root') {
      return <RootManagement />;
    }
    return <Dashboard userRole={user.role} />;
  }

  if (showLogin) {
    return (
      <Login
        onBack={() => setShowLogin(false)}
        onNavigateToPoliticaPrivacidade={() => { setShowLogin(false); setCurrentView('politica-privacidade'); }}
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

  if (currentView === 'about') {
    return <About onBackToHome={() => setCurrentView('home')} />;
  }
  if (currentView === 'politica-privacidade') {
    return <PoliticaPrivacidade onBack={() => setCurrentView('home')} />;
  }

  return (
    <Home
      onLoginClick={() => setShowLogin(true)}
      onNavigateToAbout={() => setCurrentView('about')}
      onNavigateToPoliticaPrivacidade={() => setCurrentView('politica-privacidade')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
