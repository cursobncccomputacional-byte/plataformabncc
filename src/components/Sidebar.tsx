import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as React from 'react';
import { Video, FileText, User, LogOut, Activity, Menu, X, Users, Shield, GraduationCap, BookOpen, UserCheck, Settings, ChevronDown, ChevronRight, Package, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';

type PageType = 'activities' | 'videos' | 'documents' | 'profile' | 'users' | 'courses' | 'permissions' | 'assign-access' | 'plataforma' | 'formacao-continuada' | 'trilhas' | 'admin-packages' | 'sessions';

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

  // Função para ler profile do localStorage de forma síncrona (executada apenas uma vez)
  // IMPORTANTE: Executar de forma síncrona ANTES de qualquer useMemo
  const getInitialProfileSync = (() => {
    try {
      const saved = localStorage.getItem('plataforma-bncc-user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          can_manage_activities: parsed.can_manage_activities ?? false,
          can_manage_courses: parsed.can_manage_courses ?? false,
        };
      }
    } catch {
      // Ignorar erros de parse
    }
    return null;
  })(); // IIFE - executa imediatamente no primeiro render

  // Estado para forçar atualização quando profile mudar
  const [profileKey, setProfileKey] = useState(0);

  // Evitar "piscar" menus: usar fallback do localStorage até a API atualizar o profile
  // Usar useMemo para recalcular quando profile ou loading mudarem
  // IMPORTANTE: Ler do localStorage de forma síncrona no primeiro render
  const effectiveProfile = React.useMemo(() => {
    // Priorizar profile do contexto (mais atualizado)
    if (profile) return profile;
    
    // Fallback: usar o profile inicial lido do localStorage
    return getInitialProfileSync;
  }, [profile, profileKey]); // Adicionar profileKey para forçar recálculo

  // Determinar role de forma síncrona (usar getRoleFromStorage como fallback)
  const currentRole = effectiveProfile?.role || getRoleFromStorage;
  const isRoot = currentRole === 'root';
  // Root sempre tem acesso a tudo, então sempre mostra os menus
  // Garantir que as permissões sejam booleanas (não undefined)
  const canManageActivities = isRoot || (effectiveProfile?.can_manage_activities === true);
  const canManageCourses = isRoot || (effectiveProfile?.can_manage_courses === true);
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

  // Forçar re-render quando o profile for carregado para atualizar os menus
  useEffect(() => {
    // Quando o profile mudar, forçar atualização do effectiveProfile
    if (profile) {
      setProfileKey(prev => prev + 1);
    }
  }, [profile]);

  // Submenu de Cursos (Plataforma, Formação Continuada e Trilhas)
  // Professores veem apenas o menu correspondente à sua permissão
  // Usar useMemo para recalcular quando as permissões mudarem
  const cursosSubMenuItems = useMemo(() => {
    const items = [];
    if (canManageActivities) {
      items.push({ id: 'plataforma' as const, icon: Activity, label: 'Plataforma' });
    }
    // Formação Continuada só aparece para quem tem can_manage_courses (root sempre tem acesso)
    if (canManageCourses) {
      items.push({ id: 'formacao-continuada' as const, icon: GraduationCap, label: 'Formação Continuada' });
    }
    // Trilhas aparecem apenas para root (gerenciamento)
    if (isRoot) {
      items.push({ id: 'trilhas' as const, icon: BookOpen, label: 'Trilhas' });
    }
    return items;
  }, [canManageActivities, canManageCourses, isRoot]);

  // Menu para Root
  // Usar useMemo para recalcular quando as permissões mudarem
  const rootMenuItems = useMemo(() => [
    { id: 'users' as const, icon: Users, label: 'Usuários' },
    { id: 'admin-packages' as const, icon: Package, label: 'Pacotes Admin' },
    { id: 'sessions' as const, icon: Monitor, label: 'Sessões' },
    { id: 'assign-access' as const, icon: Settings, label: 'Atribuir Acesso' },
    // Root sempre vê o menu Cursos expandido se tiver pelo menos uma permissão
    ...(showCursosMenu ? [{ id: 'cursos-menu' as const, icon: BookOpen, label: 'Cursos', isParent: true }] : []),
    { id: 'permissions' as const, icon: UserCheck, label: 'Atribuir Cursos' },
  ], [showCursosMenu]);

  // Menu para não-root (professores, admin, etc)
  // Professores NÃO veem menu "Cursos" nem "Plataforma" (cadastro)
  // Apenas veem "Atividades BNCC" para visualizar atividades já cadastradas
  // Formação Continuada é acessada em outro subdomínio (cursos.novaedubncc.com.br)
  // Usar useMemo para recalcular quando as permissões mudarem
  // IMPORTANTE: Sempre incluir menus básicos (videos, documents, profile) mesmo durante carregamento
  const nonRootMenuItems = useMemo(() => {
    const items = [];
    
    // Verificar role do perfil - usar fallback do localStorage se necessário
    // IMPORTANTE: Sempre tentar ler do localStorage diretamente para garantir que temos o role
    // Usar currentRole que já foi calculado acima (com fallback)
    const profileRole = currentRole;
    
    // TODOS os professores e admins veem Trilhas Pedagógicas (para visualizar)
    // Não precisa de permissão especial, apenas ser professor ou admin
    // Se não souber o role ainda, assumir que é professor (mais comum) para mostrar menus
    const isProfessorOrAdmin = profileRole === 'professor' || profileRole === 'admin';
    
    // Mostrar Trilhas se for professor/admin OU se não souber o role (assumir professor)
    // IMPORTANTE: Mostrar por padrão para evitar menu vazio no primeiro render
    if (isProfessorOrAdmin || !profileRole) {
      items.push({ id: 'trilhas' as const, icon: BookOpen, label: 'Trilhas Pedagógicas' });
    }
    
    // TODOS os professores e admins veem "Atividades BNCC" para visualizar
    // A permissão can_manage_activities é apenas para CADASTRAR/EDITAR, não para visualizar
    if (isProfessorOrAdmin || !profileRole) {
      items.push({ id: 'activities' as const, icon: Activity, label: 'Atividades BNCC' });
    }
    
    // SEMPRE adicionar menus básicos (mesmo durante carregamento)
    // Isso garante que os ícones apareçam desde o início
    items.push(
      { id: 'videos' as const, icon: Video, label: 'Vídeo Aulas' },
      { id: 'documents' as const, icon: FileText, label: 'Documentos' },
      { id: 'profile' as const, icon: User, label: 'Perfil' }
    );
    
    return items;
  }, [currentRole, effectiveProfile]);

  // Garantir que sempre haja menus para renderizar, mesmo durante carregamento
  // Se não houver effectiveProfile ainda, mostrar pelo menos os menus básicos
  const menuItems = useMemo(() => {
    if (isRoot) {
      return rootMenuItems;
    }
    
    // Sempre retornar nonRootMenuItems se não for root
    // O nonRootMenuItems já tem fallback para quando não tem role definido
    // Ele lê do localStorage diretamente se effectiveProfile não estiver disponível
    return nonRootMenuItems;
  }, [isRoot, rootMenuItems, nonRootMenuItems]);

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
            {/* Renderizar menus sempre que houver items, mesmo durante carregamento */}
            {menuItems.length === 0 ? (
              <div className="text-white text-opacity-80 text-sm px-2 py-2">
                Carregando menu...
              </div>
            ) : (
              menuItems.map((item, index) => {
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
                        {/* Garantir que o ícone seja sempre renderizado */}
                        {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
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
                              {/* Garantir que o ícone seja sempre renderizado */}
                              {SubIconComponent && <SubIconComponent size={18} className="flex-shrink-0" />}
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
                  {/* Garantir que o ícone seja sempre renderizado */}
                  {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })
            )}
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
