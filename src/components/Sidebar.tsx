import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as React from 'react';
import { Video, FileText, User, LogOut, Activity, Menu, X, Users, Shield, GraduationCap, BookOpen, UserCheck, Settings, ChevronDown, ChevronRight, Package, Monitor, FileCheck, BookMarked, BarChart2, ClipboardList, Newspaper, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';

type PageType =
  | 'activities'
  | 'videos'
  | 'cae'
  | 'profile'
  | 'users'
  | 'courses'
  | 'permissions'
  | 'assign-access'
  | 'plataforma'
  | 'formacao-continuada'
  | 'formacao-continuada-cursos'
  | 'trilhas'
  | 'admin-packages'
  | 'sessions'
  | 'plano-aula'
  | 'bncc-digital'
  | 'manage-bncc'
  | 'relatorios-menu'
  | 'relatorio-atividades'
  | 'relatorio-aderencia-videos'
  | 'termo-referencia'
  | 'glossario'
  | 'politica-privacidade'
  | 'gestao-interna-menu'
  | 'demandas'
  | 'admin-menu'
  | 'admin-users'
  | 'admin-reports'
  | 'admin-sessions';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  /** Controlado pelo Dashboard: estado e setter da sidebar (mobile: abre/fecha) */
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /** @deprecated use onSidebarOpenChange */
  onSidebarToggle?: (isOpen: boolean) => void;
}

export const Sidebar = ({
  currentPage,
  onNavigate,
  sidebarOpen: controlledOpen,
  onSidebarOpenChange,
  onSidebarToggle,
}: SidebarProps) => {
  const { signOut, profile, loading } = useAuth();
  const [internalOpen, setInternalOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setSidebarOpen = onSidebarOpenChange ?? ((v: boolean) => setInternalOpen(v));
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

  // Notificar mudanças no estado da sidebar (compatibilidade)
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(sidebarOpen);
    }
  }, [sidebarOpen, onSidebarToggle]);

  // Detectar se é mobile e sincronizar estado (desktop: sempre aberta)
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

  // Expandir menu BNCC quando navegar para cadastro ou consulta
  const [bnccMenuOpen, setBnccMenuOpen] = useState(
    currentPage === 'bncc-digital' || currentPage === 'manage-bncc'
  );

  // Expandir menu Relatórios quando navegar para relatório de atividades
  const [relatoriosMenuOpen, setRelatoriosMenuOpen] = useState(
    currentPage === 'relatorio-atividades'
  );

  // Expandir menu Painel Administrativo (admin)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  // Expandir menu Gestão Interna (root)
  const [gestaoInternaMenuOpen, setGestaoInternaMenuOpen] = useState(
    currentPage === 'demandas'
  );

  // Expandir menu Cursos quando navegar para plataforma, formacao-continuada ou trilhas
  useEffect(() => {
    if (currentPage === 'plataforma' || currentPage === 'formacao-continuada' || currentPage === 'trilhas') {
      setCursosMenuOpen(true);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'bncc-digital' || currentPage === 'manage-bncc') {
      setBnccMenuOpen(true);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'relatorio-atividades' || currentPage === 'relatorio-aderencia-videos') {
      setRelatoriosMenuOpen(true);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'demandas') {
      setGestaoInternaMenuOpen(true);
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

  // Submenu BNCC Computacional Digital: Cadastro (root) e Consulta (todos)
  const bnccSubMenuItems = useMemo(() => {
    const items: { id: 'manage-bncc' | 'bncc-digital'; icon: typeof BookOpen; label: string }[] = [];
    if (isRoot) {
      items.push({ id: 'manage-bncc' as const, icon: BookOpen, label: 'Cadastro' });
    }
    items.push({ id: 'bncc-digital' as const, icon: BookMarked, label: 'Consulta' });
    return items;
  }, [isRoot]);

  // Submenu Relatórios (apenas root)
  const relatoriosSubMenuItems = useMemo(() => [
    { id: 'relatorio-atividades' as const, icon: Activity, label: 'Relatório de Atividades' },
    { id: 'relatorio-aderencia-videos' as const, icon: Video, label: 'Aderência aos Vídeos' },
  ], []);

  // Submenu Gestão Interna (apenas root)
  const gestaoInternaSubMenuItems = useMemo(() => [
    { id: 'demandas' as const, icon: ClipboardList, label: 'Demandas' },
  ], []);

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
    { id: 'plano-aula' as const, icon: FileCheck, label: 'Plano de Aula' },
    { id: 'bncc-menu' as const, icon: BookMarked, label: 'BNCC Computacional Digital', isParent: true },
    { id: 'relatorios-menu' as const, icon: BarChart2, label: 'Relatórios', isParent: true },
    { id: 'gestao-interna-menu' as const, icon: ClipboardList, label: 'Gestão Interna', isParent: true },
    { id: 'termo-referencia' as const, icon: FileText, label: 'Termo de Referência' },
    { id: 'glossario' as const, icon: BookOpen, label: 'Glossário BNCC' },
    { id: 'cae' as const, icon: Newspaper, label: 'CAE' },
  ], [showCursosMenu]);

  // Menu para não-root (professores, admin, etc)
  // Professores NÃO veem menu "Cursos" nem "Plataforma" (cadastro)
  // Apenas veem "Atividades BNCC" para visualizar atividades já cadastradas
  // Formação Continuada é acessada em outro subdomínio (cursos.novaedubncc.com.br)
  // Usar useMemo para recalcular quando as permissões mudarem
  // IMPORTANTE: Sempre incluir menus básicos (videos, cae, profile) mesmo durante carregamento
  const nonRootMenuItems = useMemo(() => {
    const items = [];
    
    // Verificar role do perfil - usar fallback do localStorage se necessário
    // IMPORTANTE: Sempre tentar ler do localStorage diretamente para garantir que temos o role
    // Usar currentRole que já foi calculado acima (com fallback)
    const profileRole = currentRole;
    
    const isAdmin = profileRole === 'admin';
    const isProfessor = profileRole === 'professor' || profileRole === 'teste_professor';

    // ADMIN: menu conforme solicitado
    if (isAdmin) {
      items.push({ id: 'admin-menu' as const, icon: Settings, label: 'Painel Administrativo', isParent: true });
      items.push({ id: 'bncc-menu' as const, icon: BookMarked, label: 'BNCC Comput', isParent: true });
      items.push({ id: 'glossario' as const, icon: BookOpen, label: 'Glossário BNCC' });
      items.push({ id: 'formacao-continuada-cursos' as const, icon: GraduationCap, label: 'Formação Continuada' });
      items.push({ id: 'cae' as const, icon: Newspaper, label: 'CAE' });
      items.push({ id: 'politica-privacidade' as const, icon: ShieldCheck, label: 'Política de Privacidade' });
      items.push({ id: 'profile' as const, icon: User, label: 'Perfil' });
      return items;
    }

    // PROFESSOR (ou role indefinido no primeiro render): manter experiência atual
    const assumeProfessor = isProfessor || !profileRole;
    if (assumeProfessor) {
      items.push({ id: 'trilhas' as const, icon: BookOpen, label: 'Trilhas Pedagógicas' });
      items.push({ id: 'activities' as const, icon: Activity, label: 'Atividades BNCC' });
      items.push({ id: 'plano-aula' as const, icon: FileCheck, label: 'Plano de Aula' });
      items.push({ id: 'bncc-menu' as const, icon: BookMarked, label: 'BNCC Computacional Digital', isParent: true });
      items.push({ id: 'glossario' as const, icon: BookOpen, label: 'Glossário BNCC' });
      items.push({ id: 'formacao-continuada-cursos' as const, icon: GraduationCap, label: 'Formação Continuada' });
      items.push(
        { id: 'cae' as const, icon: Newspaper, label: 'CAE' },
        { id: 'politica-privacidade' as const, icon: ShieldCheck, label: 'Política de Privacidade' },
        { id: 'profile' as const, icon: User, label: 'Perfil' }
      );
      return items;
    }
    
    // fallback mínimo
    items.push(
      { id: 'cae' as const, icon: Newspaper, label: 'CAE' },
      { id: 'politica-privacidade' as const, icon: ShieldCheck, label: 'Política de Privacidade' },
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

  const handleBnccMenuClick = () => {
    setBnccMenuOpen(!bnccMenuOpen);
  };

  const handleAdminMenuClick = () => {
    setAdminMenuOpen(!adminMenuOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 288 : (isMobile ? 288 : 80),
          x: sidebarOpen ? 0 : (isMobile ? -288 : 0),
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
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
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

              if (isParent && item.id === 'bncc-menu') {
                // Menu BNCC Computacional Digital: submenu Cadastro (root) e Consulta — alinhado à esquerda
                return (
                  <div key={item.id} className="space-y-1 text-left">
                    <button
                      onClick={handleBnccMenuClick}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                        ${bnccMenuOpen || currentPage === 'bncc-digital' || currentPage === 'manage-bncc'
                          ? 'bg-white text-[#005a93] shadow-md' 
                          : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-start">
                        {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                        {sidebarOpen && (
                          <span className="font-medium truncate">{item.label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        bnccMenuOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />
                      )}
                    </button>
                    {bnccMenuOpen && sidebarOpen && (
                      <div className="ml-4 space-y-1">
                        {bnccSubMenuItems.map((subItem) => {
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

              if (isParent && item.id === 'admin-menu') {
                return (
                  <div key={item.id} className="space-y-1 text-left">
                    <button
                      onClick={handleAdminMenuClick}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                        ${adminMenuOpen
                          ? 'bg-white text-[#005a93] shadow-md'
                          : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-start">
                        {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                        {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        adminMenuOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />
                      )}
                    </button>

                    {adminMenuOpen && sidebarOpen && (
                      <div className="ml-4 space-y-1">
                        <button
                          type="button"
                          onClick={() => handleNavigate('admin-users')}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:bg-white hover:bg-opacity-10 text-white text-opacity-80"
                        >
                          <Users size={18} className="flex-shrink-0" />
                          <span>Gerenciar Usuários</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigate('admin-reports')}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:bg-white hover:bg-opacity-10 text-white text-opacity-80"
                        >
                          <BarChart2 size={18} className="flex-shrink-0" />
                          <span>Relatórios</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigate('admin-sessions')}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:bg-white hover:bg-opacity-10 text-white text-opacity-80"
                        >
                          <Monitor size={18} className="flex-shrink-0" />
                          <span>Sessões</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (isParent && item.id === 'relatorios-menu') {
                // Menu Relatórios: submenu Relatório de Atividades (apenas root)
                return (
                  <div key={item.id} className="space-y-1 text-left">
                    <button
                      onClick={() => setRelatoriosMenuOpen(!relatoriosMenuOpen)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                        ${relatoriosMenuOpen || currentPage === 'relatorio-atividades' || currentPage === 'relatorio-aderencia-videos'
                          ? 'bg-white text-[#005a93] shadow-md' 
                          : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-start">
                        {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                        {sidebarOpen && (
                          <span className="font-medium truncate">{item.label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        relatoriosMenuOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />
                      )}
                    </button>
                    {relatoriosMenuOpen && sidebarOpen && (
                      <div className="ml-4 space-y-1">
                        {relatoriosSubMenuItems.map((subItem) => {
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

              if (isParent && item.id === 'gestao-interna-menu') {
                return (
                  <div key={item.id} className="space-y-1 text-left">
                    <button
                      onClick={() => setGestaoInternaMenuOpen(!gestaoInternaMenuOpen)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                        ${gestaoInternaMenuOpen || currentPage === 'demandas'
                          ? 'bg-white text-[#005a93] shadow-md' 
                          : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-90'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-start">
                        {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                        {sidebarOpen && (
                          <span className="font-medium truncate">{item.label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        gestaoInternaMenuOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />
                      )}
                    </button>
                    {gestaoInternaMenuOpen && sidebarOpen && (
                      <div className="ml-4 space-y-1">
                        {gestaoInternaSubMenuItems.map((subItem) => {
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
