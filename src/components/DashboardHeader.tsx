import { useAuth } from '../contexts/LocalAuthContext';
import { LogOut, User, Shield, GraduationCap, BookOpen, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  /** Quando existe sidebar fixa no desktop, aplica offset para não ficar "atrás" dela */
  sidebarOpen?: boolean;
}

export const DashboardHeader = ({ onToggleSidebar, sidebarOpen }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    if (role === 'root') return <Shield className="h-4 w-4" />;
    if (role === 'admin') return <Shield className="h-4 w-4" />;
    if (role === 'professor' || role === 'teste_professor') return <GraduationCap className="h-4 w-4" />;
    return <User className="h-4 w-4" />; // aluno
  };

  const getRoleColor = (role: string) => {
    if (role === 'root') return 'bg-purple-100 text-purple-800';
    if (role === 'admin') return 'bg-blue-100 text-blue-800';
    if (role === 'professor') return 'bg-green-100 text-green-800';
    if (role === 'teste_professor') return 'bg-teal-100 text-teal-800';
    return 'bg-yellow-100 text-yellow-800'; // aluno
  };

  const getRoleLabel = (role: string) => {
    if (role === 'root') return 'Root';
    if (role === 'admin') return 'Administrador';
    if (role === 'professor') return 'Professor';
    if (role === 'teste_professor') return 'Teste Professor';
    return 'Aluno';
  };

  if (!user) return null;

  const desktopSidebarOffsetClass =
    sidebarOpen === undefined ? '' : (sidebarOpen ? 'md:pl-72' : 'md:pl-20');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 safe-area-top sticky top-0 z-20">
      <div className={`max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 ${desktopSidebarOffsetClass}`}>
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2 min-h-[3.5rem]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Botão menu mobile - abre a sidebar */}
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="md:hidden p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 touch-target flex-shrink-0"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            {/* Formação Continuada Link */}
            <a
            href="https://ead.novaedubncc.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#044982] hover:text-[#005a93] transition-colors font-medium touch-target-inline min-w-0"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Formação Continuada</span>
          </a>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
            <div className="text-right min-w-0 hidden xs:block">
              <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[180px]" title={user.name}>{user.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[180px]" title={user.school || 'Sistema Educacional BNCC'}>{user.school || 'Sistema Educacional BNCC'}</div>
            </div>
            <div className="text-right min-w-0 xs:hidden">
              <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]" title={user.name}>{user.name}</div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="hidden sm:inline">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
