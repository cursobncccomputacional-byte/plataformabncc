import { useAuth } from '../contexts/LocalAuthContext';
import { LogOut, User, Shield, GraduationCap } from 'lucide-react';

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    if (role === 'root') return <Shield className="h-4 w-4" />;
    if (role === 'admin') return <Shield className="h-4 w-4" />;
    if (role === 'professor') return <GraduationCap className="h-4 w-4" />;
    return <User className="h-4 w-4" />; // aluno
  };

  const getRoleColor = (role: string) => {
    if (role === 'root') return 'bg-purple-100 text-purple-800';
    if (role === 'admin') return 'bg-blue-100 text-blue-800';
    if (role === 'professor') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800'; // aluno
  };

  const getRoleLabel = (role: string) => {
    if (role === 'root') return 'Root';
    if (role === 'admin') return 'Administrador';
    if (role === 'professor') return 'Professor';
    return 'Aluno';
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.school || 'Sistema Educacional'}</div>
            </div>
            
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              {getRoleLabel(user.role)}
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
