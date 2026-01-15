import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, User, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';

interface SidebarProps {
  currentPage: 'activities' | 'videos' | 'documents' | 'profile';
  onNavigate: (page: 'activities' | 'videos' | 'documents' | 'profile') => void;
}

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: 'activities' as const, icon: Activity, label: 'Atividades BNCC' },
    { id: 'videos' as const, icon: Video, label: 'Vídeo Aulas' },
    { id: 'documents' as const, icon: FileText, label: 'Documentos' },
    { id: 'profile' as const, icon: User, label: 'Perfil' },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-16 overflow-y-auto"
    >
      <div className="p-6 flex flex-col min-h-full">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo/Logo Nova Edu (Oficial)-10.png" 
            alt="Nova Edu Logo" 
            className="h-12 w-auto"
            style={{ backgroundColor: 'transparent' }}
          />
        </div>

        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: '#e6f2ff' }}>
          <p className="text-sm text-gray-600 mb-1">Bem-vindo(a),</p>
          <p className="font-semibold text-gray-900">{profile?.name || 'Professor(a)'}</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={currentPage === item.id ? { backgroundColor: '#005a93' } : {}}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Links Úteis */}
        <div className="mt-8 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Links Úteis
          </h3>
          <div className="space-y-2">
            <a
              href="https://bncc.mec.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Base Nacional Comum Curricular</span>
            </a>
            <a
              href="https://www.gov.br/mec/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ministério da Educação</span>
            </a>
            <a
              href="https://www.capes.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>CAPES</span>
            </a>
            <a
              href="https://www.fnde.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>FNDE</span>
            </a>
            <a
              href="https://www.in.gov.br/materia/-/asset_publisher/Kujrw0TZC2Mb/content/id/51746473/do1-2020-04-17-lei-n-14-026-de-7-de-julho-de-2020-264406351"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Marco Legal da Primeira Infância</span>
            </a>
          </div>
        </div>

        {/* Botão Sair */}
        <div className="mt-auto pt-6">
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
