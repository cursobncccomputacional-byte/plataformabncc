import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { VideoCourses } from './VideoCourses';
import { CAE } from './CAE';
import { Profile } from './Profile';
import { Activities } from './Activities';
import { ManageActivities } from './ManageActivities';
import { ManageFormacaoContinuada } from './ManageFormacaoContinuada';
import { TrilhasPedagogicas } from './TrilhasPedagogicas';
import { PlanoAula } from './PlanoAula';
import { BnccDigital } from './BnccDigital';
import { FormacaoContinuadaCursos } from './FormacaoContinuadaCursos';
import { FloatingAIAssistant } from '../components/FloatingAIAssistant';
import { useAuth } from '../contexts/LocalAuthContext';
import UserManagement from './UserManagement';
import { Reports } from './Reports';
import { SessionManagement } from './SessionManagement';
import { Glossario } from './Glossario';
import { PoliticaPrivacidade } from './PoliticaPrivacidade';

interface DashboardProps {
  userRole: 'admin' | 'professor' | 'teste_professor' | 'professor_cursos';
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    | 'activities'
    | 'videos'
    | 'cae'
    | 'profile'
    | 'plataforma'
    | 'formacao-continuada'
    | 'formacao-continuada-cursos'
    | 'trilhas'
    | 'plano-aula'
    | 'bncc-digital'
    | 'glossario'
    | 'politica-privacidade'
    | 'admin-users'
    | 'admin-reports'
    | 'admin-sessions'
  >(() => (
    userRole === 'admin' ? 'bncc-digital' : 'trilhas'
  ));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />
      <div className="flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      />

        <main className={`flex-1 p-3 sm:p-4 transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'} ml-0`}>
        {currentPage === 'plataforma' && <ManageActivities />}
        {currentPage === 'formacao-continuada' && <ManageFormacaoContinuada />}
        {currentPage === 'formacao-continuada-cursos' && <FormacaoContinuadaCursos />}
        {currentPage === 'trilhas' && <TrilhasPedagogicas />}
        {currentPage === 'plano-aula' && <PlanoAula />}
        {currentPage === 'bncc-digital' && <BnccDigital />}
        {currentPage === 'glossario' && <Glossario />}
        {currentPage === 'politica-privacidade' && (
          <PoliticaPrivacidade onBack={() => setCurrentPage('profile')} />
        )}
        {currentPage === 'profile' && (
          <Profile onNavigateToPoliticaPrivacidade={() => setCurrentPage('politica-privacidade')} />
        )}
        {currentPage === 'admin-users' && (
          <UserManagement onBackToDashboard={() => setCurrentPage('bncc-digital')} />
        )}
        {currentPage === 'admin-reports' && (
          <Reports onBackToDashboard={() => setCurrentPage('bncc-digital')} />
        )}
        {currentPage === 'admin-sessions' && (
          <SessionManagement onBackToDashboard={() => setCurrentPage('bncc-digital')} />
        )}
        {currentPage === 'activities' && <Activities />}
        {currentPage === 'videos' && <VideoCourses />}
        {currentPage === 'cae' && <CAE />}
      </main>
      </div>

      {/* Botão flutuante Suporte Técnico - Apenas para professores */}
      {userRole === 'professor' && <FloatingAIAssistant />}
    </div>
  );
};
