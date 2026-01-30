import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { VideoCourses } from './VideoCourses';
import { Documents } from './Documents';
import { Profile } from './Profile';
import { Activities } from './Activities';
import { ManageActivities } from './ManageActivities';
import { ManageFormacaoContinuada } from './ManageFormacaoContinuada';
import { TrilhasPedagogicas } from './TrilhasPedagogicas';
import { PlanoAula } from './PlanoAula';
import { BnccDigital } from './BnccDigital';
import { FormacaoContinuadaCursos } from './FormacaoContinuadaCursos';
import { Users, Settings, BarChart3, Monitor } from 'lucide-react';
import { FloatingAIAssistant } from '../components/FloatingAIAssistant';
import { useAuth } from '../contexts/LocalAuthContext';

interface DashboardProps {
  onNavigateToUserManagement: () => void;
  onNavigateToReports: () => void;
  userRole: 'admin' | 'professor';
}

export const Dashboard = ({ onNavigateToUserManagement, onNavigateToReports, onNavigateToSessions, userRole }: DashboardProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'activities' | 'videos' | 'documents' | 'profile' | 'plataforma' | 'formacao-continuada' | 'formacao-continuada-cursos' | 'trilhas' | 'plano-aula' | 'bncc-digital'>('trilhas');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      />

        <main className={`flex-1 p-3 sm:p-4 transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Admin Controls - Admin pode gerenciar professor e aluno */}
        {userRole === 'admin' && (
          <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Settings className="h-5 w-5" style={{ color: '#044982' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Painel Administrativo</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Gerencie usuários e configurações do sistema</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={onNavigateToUserManagement}
                  className="flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-md transition-colors hover:opacity-90 touch-target-inline text-sm"
                  style={{ backgroundColor: '#044982' }}
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Gerenciar Usuários</span>
                </button>
                <button
                  onClick={onNavigateToReports}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 transition-colors touch-target-inline text-sm"
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Relatórios</span>
                </button>
                {onNavigateToSessions && (
                  <button
                    onClick={onNavigateToSessions}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 transition-colors touch-target-inline text-sm"
                  >
                    <Monitor className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Sessões</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'plataforma' && <ManageActivities />}
        {currentPage === 'formacao-continuada' && <ManageFormacaoContinuada />}
        {currentPage === 'formacao-continuada-cursos' && <FormacaoContinuadaCursos />}
        {currentPage === 'trilhas' && <TrilhasPedagogicas />}
        {currentPage === 'plano-aula' && <PlanoAula />}
        {currentPage === 'bncc-digital' && <BnccDigital />}
        {currentPage === 'activities' && <Activities />}
        {currentPage === 'videos' && <VideoCourses />}
        {currentPage === 'documents' && <Documents />}
        {currentPage === 'profile' && <Profile />}
      </main>
      </div>

      {/* Assistente de IA Flutuante - Apenas para professores */}
      {userRole === 'professor' && <FloatingAIAssistant />}
    </div>
  );
};
