import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, FileText, User, LogOut, Activity, Menu, X, Users, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';

interface SidebarProps {
  currentPage: 'activities' | 'videos' | 'documents' | 'profile';
  onNavigate: (page: 'activities' | 'videos' | 'documents' | 'profile') => void;
  onSidebarToggle?: (isOpen: boolean) => void;
}

export const Sidebar = ({ currentPage, onNavigate, onSidebarToggle }: SidebarProps) => {
  const { signOut, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isRoot = profile?.role === 'root';

  // Notificar mudanças no estado da sidebar
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(sidebarOpen);
    }
  }, [sidebarOpen, onSidebarToggle]);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = isRoot
    ? [{ id: 'profile' as const, icon: Users, label: 'Usuários' }]
    : [
        { id: 'activities' as const, icon: Activity, label: 'Atividades BNCC' },
        { id: 'videos' as const, icon: Video, label: 'Vídeo Aulas' },
        { id: 'documents' as const, icon: FileText, label: 'Documentos' },
        { id: 'profile' as const, icon: User, label: 'Perfil' },
      ];

  const handleNavigate = (page: 'activities' | 'videos' | 'documents' | 'profile') => {
    onNavigate(page);
    // Fechar sidebar no mobile após clicar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : (isMobile ? 256 : 80),
          x: sidebarOpen ? 0 : (isMobile ? -256 : 0),
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden
          ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
        `}
        style={{
          backgroundColor: '#005a93',
          color: 'white',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-opacity-20 border-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            {sidebarOpen && (
              <div className="flex-1 flex justify-center">
                <img 
                  src="/logo/Logo Nova Edu (Oficial)-10.png" 
                  alt="Nova Edu Logo" 
                  className="h-10 w-auto object-contain"
                  style={{ backgroundColor: 'transparent', filter: 'brightness(0) invert(1)' }}
                />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {sidebarOpen && (
            <p className="text-xs text-white text-opacity-70 font-medium text-center">
              Plataforma BNCC
            </p>
          )}
        </div>

        {/* Scroll Area (menus + links úteis) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-[#005a93] shadow-md' 
                      : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                    }
                  `}
                >
                  <IconComponent size={20} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer - Logout Button */}
        <div className="p-4 border-t border-opacity-20 border-white flex-shrink-0">
          {sidebarOpen ? (
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
              <LogOut size={16} />
              Sair
            </button>
          ) : (
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              title="Sair"
            >
              <LogOut size={20} className="text-white" />
            </button>
          )}
        </div>

      </motion.aside>

      {/* Overlay para mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
