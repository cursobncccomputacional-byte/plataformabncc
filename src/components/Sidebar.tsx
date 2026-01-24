import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, FileText, User, LogOut, Activity, Menu, X, Users, Shield, GraduationCap, BookOpen, UserCheck, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';

type PageType = 'activities' | 'videos' | 'documents' | 'profile' | 'users' | 'courses' | 'permissions' | 'assign-access' | 'plataforma' | 'formacao-continuada' | 'trilhas';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onSidebarToggle?: (isOpen: boolean) => void;
}

export const Sidebar = ({ currentPage, onNavigate, onSidebarToggle }: SidebarProps) => {
  const { signOut, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Expandir menu Cursos se estiver em plataforma ou formacao-continuada
  const [cursosMenuOpen, setCursosMenuOpen] = useState(
    currentPage === 'plataforma' || currentPage === 'formacao-continuada' || currentPage === 'trilhas'
  );

  // Evitar "piscar" menus: usar fallback do localStorage até a API atualizar o profile
  const effectiveProfile = profile ?? (() => {
    try {
      const saved = localStorage.getItem('plataforma-bncc-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isRoot = effectiveProfile?.role === 'root';
  // Root sempre tem acesso a tudo, então sempre mostra os menus
  const canManageActivities = isRoot || (effectiveProfile?.can_manage_activities ?? false);
  const canManageCourses = isRoot || (effectiveProfile?.can_manage_courses ?? false);
  const showCursosMenu = canManageActivities || canManageCourses;

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

  // Expandir menu Cursos quando navegar para plataforma, formacao-continuada ou trilhas
  useEffect(() => {
    if (currentPage === 'plataforma' || currentPage === 'formacao-continuada' || currentPage === 'trilhas') {
      setCursosMenuOpen(true);
    }
  }, [currentPage]);

  // Submenu de Cursos (Plataforma, Formação Continuada e Trilhas)
  // Professores veem apenas o menu correspondente à sua permissão
  const cursosSubMenuItems = [];
  if (canManageActivities) {
    cursosSubMenuItems.push({ id: 'plataforma' as const, icon: Activity, label: 'Plataforma' });
  }
  // Formação Continuada só aparece para quem tem can_manage_courses (root sempre tem acesso)
  if (canManageCourses) {
    cursosSubMenuItems.push({ id: 'formacao-continuada' as const, icon: GraduationCap, label: 'Formação Continuada' });
  }
  // Trilhas aparecem apenas para root (gerenciamento)
  if (isRoot) {
    cursosSubMenuItems.push({ id: 'trilhas' as const, icon: BookOpen, label: 'Trilhas' });
  }

  // Menu para Root
  const rootMenuItems = [
    { id: 'users' as const, icon: Users, label: 'Usuários' },
    { id: 'assign-access' as const, icon: Settings, label: 'Atribuir Acesso' },
    // Root sempre vê o menu Cursos expandido se tiver pelo menos uma permissão
    ...(showCursosMenu ? [{ id: 'cursos-menu' as const, icon: BookOpen, label: 'Cursos', isParent: true }] : []),
    { id: 'permissions' as const, icon: UserCheck, label: 'Atribuir Cursos' },
  ];

  // Menu para não-root (professores, admin, etc)
  // Professores NÃO veem menu "Cursos" nem "Plataforma" (cadastro)
  // Apenas veem "Atividades BNCC" para visualizar atividades já cadastradas
  // Formação Continuada é acessada em outro subdomínio (cursos.novaedubncc.com.br)
  const nonRootMenuItems = [];
  
  // Professores e admins veem Trilhas Pedagógicas (primeiro no menu)
  if (canManageActivities || (effectiveProfile?.role === 'admin')) {
    nonRootMenuItems.push({ id: 'trilhas' as const, icon: BookOpen, label: 'Trilhas Pedagógicas' });
  }
  
  // Professores veem apenas "Atividades BNCC" para visualizar (não cadastrar)
  if (canManageActivities) {
    nonRootMenuItems.push({ id: 'activities' as const, icon: Activity, label: 'Atividades BNCC' });
  }
  
  // Adicionar outros menus
  nonRootMenuItems.push(
    { id: 'videos' as const, icon: Video, label: 'Vídeo Aulas' },
    { id: 'documents' as const, icon: FileText, label: 'Documentos' },
    { id: 'profile' as const, icon: User, label: 'Perfil' }
  );

  const menuItems = isRoot ? rootMenuItems : nonRootMenuItems;

  const handleNavigate = (page: PageType) => {
    onNavigate(page);
    // Fechar sidebar no mobile após clicar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCursosMenuClick = () => {
    setCursosMenuOpen(!cursosMenuOpen);
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
              <div className="flex items-center justify-start">
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
        </div>

        {/* Scroll Area (menus + links úteis) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {/* Durante carregamento inicial, evita mudar/“sumir” itens */}
            {loading && !effectiveProfile && (
              <div className="text-white text-opacity-80 text-sm px-2 py-2">
                Carregando menu...
              </div>
            )}
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              const isParent = (item as any).isParent;

              if (isParent && item.id === 'cursos-menu') {
                // Menu Cursos expandido (apenas para root ou quem tem ambas as permissões)
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={handleCursosMenuClick}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${cursosMenuOpen || currentPage === 'plataforma' || currentPage === 'formacao-continuada'
                          ? 'bg-white text-[#005a93] shadow-md' 
                          : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={20} />
                        {sidebarOpen && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        cursosMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>
                    {cursosMenuOpen && sidebarOpen && (
                      <div className="ml-4 space-y-1">
                        {cursosSubMenuItems.map((subItem) => {
                          const SubIconComponent = subItem.icon;
                          const isSubActive = currentPage === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleNavigate(subItem.id)}
                              className={`
                                w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                                ${isSubActive 
                                  ? 'bg-white bg-opacity-30 text-white font-semibold' 
                                  : 'hover:bg-white hover:bg-opacity-10 text-white text-opacity-80'
                                }
                              `}
                            >
                              <SubIconComponent size={18} />
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              

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
