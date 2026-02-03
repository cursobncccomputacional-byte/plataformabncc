import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  SchoolYear, 
  BNCCAxis, 
  KnowledgeObject, 
  Skill, 
  Activity, 
  VideoCourse, 
  Document,
  User,
  CreateUserData
} from '../types/bncc';
import { 
  schoolYears, 
  bnccAxes, 
  knowledgeObjects, 
  skills, 
  activities, 
  videoCourses, 
  documents
} from '../data/bnccData';
import { activityLogger } from '../services/ActivityLogger';
import { sessionService } from '../services/sessionService';
import { apiService } from '../services/apiService';
import { loadActivitiesFromXlsxUrl } from '../services/activitiesXlsxLoader';

export interface Profile extends User {
  bio?: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  last_watched_at: string;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  session: { user: Profile } | null;
  loading: boolean;
  activitiesSpreadsheet: {
    loaded: boolean;
    url: string | null;
    error: string | null;
  };
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  
  // User Management (Admin only)
  getAllUsers: () => Promise<User[]>;
  createUser: (userData: CreateUserData) => Promise<{ error: Error | null }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ error: Error | null }>;
  deleteUser: (userId: string) => Promise<{ error: Error | null }>;
  toggleUserStatus: (userId: string) => Promise<{ error: Error | null }>;
  changePassword: (userId: string, newPassword: string) => Promise<{ error: Error | null }>;
  
  // BNCC Data
  getSchoolYears: () => SchoolYear[];
  getBNCCAxes: () => BNCCAxis[];
  getKnowledgeObjects: () => KnowledgeObject[];
  getSkills: () => Skill[];
  getActivities: () => Activity[];
  getVideoCourses: () => VideoCourse[];
  getDocuments: () => Document[];
  
  // Filtered data
  getActivitiesByYear: (yearId: string) => Activity[];
  getActivitiesByType: (type: 'plugada' | 'desplugada') => Activity[];
  getActivitiesByAxis: (axisId: string) => Activity[];
  getVideoCoursesByYear: (yearId: string) => VideoCourse[];
  getDocumentsByYear: (yearId: string) => Document[];
  
  // User progress
  getUserProgress: (userId: string) => UserProgress[];
  updateUserProgress: (userId: string, videoId: string, completed: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Dados BNCC já importados do arquivo bnccData.ts

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar profile do localStorage de forma síncrona para evitar delay no primeiro render
  const getInitialProfile = (): Profile | null => {
    try {
      const saved = localStorage.getItem('plataforma-bncc-user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garantir que as permissões sempre existam (mesmo que false)
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
  };

  const [user, setUser] = useState<Profile | null>(getInitialProfile());
  const [profile, setProfile] = useState<Profile | null>(getInitialProfile());
  const [session, setSession] = useState<{ user: Profile } | null>(() => {
    const initial = getInitialProfile();
    return initial ? { user: initial } : null;
  });
  const [loading, setLoading] = useState(true);
  const [spreadsheetActivities, setSpreadsheetActivities] = useState<Activity[]>([]);
  const [activitiesSpreadsheet, setActivitiesSpreadsheet] = useState<{
    loaded: boolean;
    url: string | null;
    error: string | null;
  }>({ loaded: false, url: null, error: null });

  useEffect(() => {
    // Verificar se há sessão ativa na API (apenas dados reais)
    const checkApiSession = async () => {
      const apiAuthenticated = localStorage.getItem('api_authenticated') === 'true';
      const sessionId = localStorage.getItem('api_session_id');
      
      if (apiAuthenticated && sessionId) {
        try {
          const apiResponse = await apiService.getCurrentUser();
          if (!apiResponse.error && apiResponse.user) {
            const userData: Profile = {
              id: apiResponse.user.id,
              name: apiResponse.user.name,
              email: apiResponse.user.email,
              role: apiResponse.user.role,
              school: apiResponse.user.school || '',
              subjects: apiResponse.user.subjects || [],
              created_at: apiResponse.user.created_at,
              last_login: apiResponse.user.last_login || new Date().toISOString(),
              is_active: apiResponse.user.is_active ?? true,
              can_manage_activities: apiResponse.user.can_manage_activities ?? false,
              can_manage_courses: apiResponse.user.can_manage_courses ?? false,
              bio: `Usuário ${apiResponse.user.role}`,
              updated_at: new Date().toISOString(),
            };
            
            setUser(userData);
            setProfile(userData);
            setSession({ user: userData });
            localStorage.setItem('plataforma-bncc-user', JSON.stringify(userData));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Erro ao verificar sessão na API:', error);
          // Se falhar, limpar flags da API
          localStorage.removeItem('api_authenticated');
          localStorage.removeItem('api_session_id');
        }
      }
      
      // Fallback: verificar se há usuário logado no localStorage
      const savedUser = localStorage.getItem('plataforma-bncc-user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Sempre tentar atualizar os dados do usuário da API para garantir permissões atualizadas
        try {
          const apiResponse = await apiService.getCurrentUser();
          if (!apiResponse.error && apiResponse.user) {
            // Atualizar com dados mais recentes da API (incluindo permissões)
            const updatedUserData: Profile = {
              ...userData,
              id: apiResponse.user.id,
              name: apiResponse.user.name,
              email: apiResponse.user.email,
              role: apiResponse.user.role,
              school: apiResponse.user.school || userData.school || '',
              subjects: apiResponse.user.subjects || userData.subjects || [],
              created_at: apiResponse.user.created_at || userData.created_at,
              last_login: apiResponse.user.last_login || userData.last_login || new Date().toISOString(),
              is_active: apiResponse.user.is_active ?? userData.is_active ?? true,
              can_manage_activities: apiResponse.user.can_manage_activities ?? false,
              can_manage_courses: apiResponse.user.can_manage_courses ?? false,
              bio: userData.bio || `Usuário ${apiResponse.user.role}`,
              updated_at: new Date().toISOString(),
            };
            
            setUser(updatedUserData);
            setProfile(updatedUserData);
            setSession({ user: updatedUserData });
            localStorage.setItem('plataforma-bncc-user', JSON.stringify(updatedUserData));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Erro ao atualizar dados do usuário da API:', error);
          // Se falhar, usar dados do localStorage mesmo assim
        }
        
        // Se a API falhar, usar dados do localStorage
        setUser(userData);
        setProfile(userData);
        setSession({ user: userData });
      }
      
      // Simular carregamento inicial mais longo
      setTimeout(() => {
        setLoading(false);
      }, 3000); // 3 segundos de carregamento inicial
    };

    checkApiSession();
  }, []);

  // Carregar atividades do banco (com fallback para Excel)
  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      try {
        // 1. Tentar carregar do banco de dados primeiro
        try {
          const apiResponse = await apiService.getActivities();
          if (!apiResponse.error && apiResponse.activities && Array.isArray(apiResponse.activities)) {
            // Converter formato da API para formato Activity
            const activities: Activity[] = apiResponse.activities.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description || 'Sem descrição',
              type: a.type,
              schoolYears: a.schoolYears || [],
              axisId: a.axisId || '',
              axisIds: a.axisIds || (a.axisId ? [a.axisId] : []),
              knowledgeObjectId: a.knowledgeObjectId || '',
              skillIds: a.skillIds || [],
              duration: a.duration || 0,
              materials: a.materials || [],
              objectives: a.objectives || [],
              thumbnail_url: a.thumbnail_url || '',
              video_url: a.video_url || undefined,
              document_url: a.document_url || undefined,
              pedagogical_pdf_url: a.pedagogical_pdf_url || undefined,
              material_pdf_url: a.material_pdf_url || undefined,
              created_at: a.created_at || new Date().toISOString(),
            }));
            
            setSpreadsheetActivities(activities);
            setActivitiesSpreadsheet({ loaded: true, url: 'database', error: null });
            return; // Sucesso ao carregar do banco
          }
        } catch (dbError) {
          console.warn('Erro ao carregar atividades do banco, tentando Excel...', dbError);
        }

        // 2. Fallback: carregar do Excel
        const configuredUrl = import.meta.env.VITE_ACTIVITIES_XLSX_URL as string | undefined;
        const candidates = configuredUrl
          ? [configuredUrl]
          : [
              `${import.meta.env.BASE_URL}atividades.xlsx`,
              '/atividades.xlsx',
            ];

        let lastError: unknown = null;
        for (const candidate of Array.from(new Set(candidates))) {
          try {
            setActivitiesSpreadsheet({ loaded: false, url: candidate, error: null });
            const loaded = await loadActivitiesFromXlsxUrl(candidate);
            setSpreadsheetActivities(loaded);
            setActivitiesSpreadsheet({ loaded: true, url: candidate, error: null });
            return;
          } catch (e) {
            lastError = e;
          }
        }

        const msg = lastError instanceof Error ? lastError.message : 'Erro desconhecido ao carregar XLSX';
        setSpreadsheetActivities([]);
        setActivitiesSpreadsheet({ loaded: false, url: candidates[0] ?? null, error: msg });
      } catch (e) {
        setSpreadsheetActivities([]);
        const msg = e instanceof Error ? e.message : 'Erro desconhecido ao carregar atividades';
        setActivitiesSpreadsheet({ loaded: false, url: null, error: msg });
      }
    };
    loadActivities();
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      // Login apenas via API PHP (dados reais)
      const apiResponse = await apiService.login(email, password);
      
      if (!apiResponse.error && apiResponse.user) {
        // Login bem-sucedido via API
        const userData: Profile = {
          id: apiResponse.user.id,
          name: apiResponse.user.name,
          email: apiResponse.user.email,
          role: apiResponse.user.role,
          school: apiResponse.user.school || '',
          subjects: apiResponse.user.subjects || [],
          created_at: apiResponse.user.created_at,
          last_login: apiResponse.user.last_login || new Date().toISOString(),
          is_active: apiResponse.user.is_active ?? true,
          bio: `Usuário ${apiResponse.user.role}`,
          updated_at: new Date().toISOString(),
        };
        
        setUser(userData);
        setProfile(userData);
        setSession({ user: userData });
        
        // Salvar no localStorage apenas para cache da sessão
        localStorage.setItem('plataforma-bncc-user', JSON.stringify(userData));
        localStorage.setItem('api_authenticated', 'true');
        
        // Log do login (localStorage)
        activityLogger.logLogin(userData.id, userData.name, userData.email);
        
        // Registrar sessão no backend (fallback se o login.php não registrou)
        try {
          const sessaoId = await sessionService.registerLogin(userData.id);
          if (sessaoId) {
            sessionService.setCurrentSessaoId(sessaoId);
          }
        } catch (error) {
          console.warn('Erro ao registrar sessão no backend (pode ser normal se já foi registrado):', error);
        }
        
        return { error: null };
      }
      
      // Se a API retornou erro, retornar a mensagem de erro
      return { 
        error: new Error(apiResponse.message || 'Email ou senha incorretos') 
      };
    } catch (error) {
      return { 
        error: new Error(error instanceof Error ? error.message : 'Erro ao fazer login. Verifique sua conexão.') 
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Cadastro de novos usuários deve ser feito apenas por administradores via API
    // Usuários não podem se auto-cadastrar - apenas login é permitido
    return { 
      error: new Error('Cadastro de novos usuários deve ser feito por um administrador. Entre em contato com o suporte.') 
    };
  };

  const signOut = async () => {
    // Log do logout antes de limpar os dados
    if (user) {
      activityLogger.logLogout(user.id, user.name, user.email);
      
      // Registrar logout no backend
      try {
        await sessionService.registerLogout({ tipo_logout: 'manual' });
      } catch (error) {
        console.warn('Erro ao registrar logout no backend:', error);
      }
    }
    
    // Tentar fazer logout na API se estiver autenticado via API
    const apiAuthenticated = localStorage.getItem('api_authenticated') === 'true';
    if (apiAuthenticated) {
      try {
        await apiService.logout();
      } catch (error) {
        console.warn('Erro ao fazer logout na API:', error);
      }
    }
    
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('plataforma-bncc-user');
    localStorage.removeItem('api_authenticated');
    localStorage.removeItem('plataforma-bncc-sessao-id');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Atualizar apenas no estado local (cache)
      // TODO: Implementar endpoint PUT /api/auth/me na API PHP para atualizar perfil
      const updatedProfile = { ...user, ...updates, updated_at: new Date().toISOString() };
      
      setUser(updatedProfile);
      setProfile(updatedProfile);
      setSession({ user: updatedProfile });
      
      // Salvar apenas no cache local
      localStorage.setItem('plataforma-bncc-user', JSON.stringify(updatedProfile));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // User Management Functions (Admin only) - Usando apenas API
  const getAllUsers = async (): Promise<User[]> => {
    try {
      const apiResponse = await apiService.getUsers();
      
      console.log('Resposta da API getUsers:', apiResponse);
      
      if (!apiResponse.error && apiResponse.users) {
        // Converter dados da API para formato User[]
        const usersList = apiResponse.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          school: u.school || '',
          subjects: u.subjects || [],
          created_at: u.created_at,
          last_login: u.last_login,
          is_active: u.is_active ?? true
        }));
        
        console.log('Usuários convertidos:', usersList);
        return usersList;
      }
      
      // Se houver erro, retornar array vazio
      console.warn('Erro ao buscar usuários:', apiResponse.message);
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários da API:', error);
      return [];
    }
  };

  const createUser = async (userData: CreateUserData) => {
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return { error: new Error('Apenas administradores e root podem criar usuários') };
    }
    
    // Admin só pode criar professor e aluno
    if (user.role === 'admin' && (userData.role === 'root' || userData.role === 'admin')) {
      return { error: new Error('Administradores só podem criar professores e alunos') };
    }

    // Validar campos obrigatórios
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      return { error: new Error('Todos os campos obrigatórios devem ser preenchidos') };
    }

    // Validar senha
    if (userData.password.length < 6) {
      return { error: new Error('A senha deve ter pelo menos 6 caracteres') };
    }

    // Escola é obrigatória para professor, teste professor e aluno
    if ((userData.role === 'professor' || userData.role === 'teste_professor' || userData.role === 'aluno') && !userData.school) {
      return { error: new Error('Escola é obrigatória para professores e alunos') };
    }

    // VALIDAÇÃO DE LIMITES PARA ADMINS (frontend - validação prévia)
    if (user.role === 'admin') {
      // Verificar limites antes de enviar para API
      const maxProf = user.max_professores;
      const maxAlunos = user.max_alunos;
      const profCriados = user.professores_criados || 0;
      const alunosCriados = user.alunos_criados || 0;

      // Verificar expiração do pacote
      if (user.data_expiracao) {
        const dataExpiracao = new Date(user.data_expiracao);
        const hoje = new Date();
        if (dataExpiracao < hoje) {
          return { error: new Error('Seu pacote expirou. Entre em contato para renovar.') };
        }
      }

      // Validar limite de professores (inclui Teste Professor)
      if ((userData.role === 'professor' || userData.role === 'teste_professor') && maxProf !== null && maxProf !== undefined) {
        if (profCriados >= maxProf) {
          return {
            error: new Error(
              `Limite de professores atingido. Você pode criar até ${maxProf} professores. (${profCriados}/${maxProf} utilizados)`
            ),
          };
        }
      }

      // Validar limite de alunos
      if (userData.role === 'aluno' && maxAlunos !== null && maxAlunos !== undefined) {
        if (alunosCriados >= maxAlunos) {
          return {
            error: new Error(
              `Limite de alunos atingido. Você pode criar até ${maxAlunos} alunos. (${alunosCriados}/${maxAlunos} utilizados)`
            ),
          };
        }
      }
    }

    try {
      console.log('LocalAuthContext: Enviando dados para API:', {
        name: userData.name,
        email: userData.email,
        password: '***',
        role: userData.role,
        school: userData.school || undefined,
        subjects: userData.subjects || []
      });
      
      const apiResponse = await apiService.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        school: userData.school || undefined,
        subjects: userData.subjects || []
      });
      
      console.log('=== LocalAuthContext: Resposta completa da API ===');
      console.log('Objeto completo:', JSON.stringify(apiResponse, null, 2));
      console.log('apiResponse.error:', apiResponse.error);
      console.log('apiResponse.user:', apiResponse.user);
      console.log('apiResponse.users:', apiResponse.users);
      console.log('apiResponse.message:', apiResponse.message);
      console.log('Todas as chaves:', Object.keys(apiResponse));
      console.log('================================================');
      
      // Verificar se foi criado com sucesso
      // A API retorna 'user' (singular) quando bem-sucedida
      if (!apiResponse.error) {
        // CRITÉRIO PRINCIPAL: Deve ter o campo 'user' com dados válidos
        if (apiResponse.user && apiResponse.user.id) {
          console.log('LocalAuthContext: Usuário criado com sucesso na API');
          console.log('LocalAuthContext: Dados do usuário criado:', apiResponse.user);
          
          // ATUALIZAR CONTADORES DO ADMIN APÓS CRIAR USUÁRIO
          if (user.role === 'admin' && (userData.role === 'professor' || userData.role === 'teste_professor' || userData.role === 'aluno')) {
            const updatedUser = {
              ...user,
              professores_criados: (userData.role === 'professor' || userData.role === 'teste_professor')
                ? (user.professores_criados || 0) + 1
                : user.professores_criados,
              alunos_criados: userData.role === 'aluno'
                ? (user.alunos_criados || 0) + 1
                : user.alunos_criados,
            };
            setUser(updatedUser);
            setProfile(updatedUser);
            setSession({ user: updatedUser });
            localStorage.setItem('plataforma-bncc-user', JSON.stringify(updatedUser));
          }
          
          return { error: null };
        }
        
        // Se não tem user, mas tem mensagem de sucesso, ainda assim considerar erro
        // porque a API sempre retorna 'user' quando bem-sucedida
        if (apiResponse.message && (apiResponse.message.includes('sucesso') || apiResponse.message.includes('criado'))) {
          console.warn('LocalAuthContext: AVISO - Mensagem de sucesso mas sem campo user!');
          console.warn('LocalAuthContext: Resposta completa:', apiResponse);
          return { 
            error: new Error('Usuário aparentemente criado, mas dados não retornados. Verifique se foi realmente inserido no banco.') 
          };
        }
        
        // Se não tem erro mas também não tem user nem mensagem clara, considerar erro
        console.error('LocalAuthContext: ERRO - Resposta sem erro mas também sem dados do usuário!');
        console.error('LocalAuthContext: Resposta completa:', apiResponse);
        return { 
          error: new Error('Resposta da API incompleta. Usuário pode não ter sido criado.') 
        };
      }
      
      // Se chegou aqui, houve erro
      const errorMessage = apiResponse.message || 'Erro desconhecido ao criar usuário';
      console.error('LocalAuthContext: Erro na resposta da API:', errorMessage);
      return { 
        error: new Error(apiResponse.message || 'Erro ao criar usuário') 
      };
    } catch (error) {
      console.error('LocalAuthContext: Exceção ao criar usuário:', error);
      return { 
        error: new Error(error instanceof Error ? error.message : 'Erro ao criar usuário') 
      };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return { error: new Error('Apenas administradores e root podem editar usuários') };
    }
    
    // Admin só pode editar professor e aluno
    if (user.role === 'admin' && updates.role && (updates.role === 'root' || updates.role === 'admin')) {
      return { error: new Error('Administradores só podem editar professores e alunos') };
    }

    // TODO: Implementar endpoint PUT /api/users/:id na API PHP
    return { 
      error: new Error('Funcionalidade de editar usuário via API ainda não implementada. Endpoint necessário: PUT /api/users/:id') 
    };
  };

  const deleteUser = async (userId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return { error: new Error('Apenas administradores e root podem deletar usuários') };
    }

    if (userId === user.id) {
      return { error: new Error('Você não pode deletar sua própria conta') };
    }

    try {
      const apiResponse = await apiService.deleteUser(userId);
      
      if (!apiResponse.error) {
        return { error: null };
      }
      
      return { 
        error: new Error(apiResponse.message || 'Erro ao deletar usuário') 
      };
    } catch (error) {
      return { 
        error: new Error(error instanceof Error ? error.message : 'Erro ao deletar usuário') 
      };
    }
  };

  const toggleUserStatus = async (userId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return { error: new Error('Apenas administradores e root podem alterar status de usuários') };
    }

    if (userId === user.id) {
      return { error: new Error('Você não pode desativar sua própria conta') };
    }

    try {
      // Buscar usuário atual para saber o status
      const allUsers = await getAllUsers();
      const targetUser = allUsers.find(u => u.id === userId);
      
      if (!targetUser) {
        return { error: new Error('Usuário não encontrado') };
      }

      // Alternar status (se está ativo, inativar; se está inativo, ativar)
      const newStatus = !targetUser.is_active;
      const apiResponse = await apiService.toggleUserStatus(userId, newStatus);
      
      if (!apiResponse.error) {
        return { error: null };
      }
      
      return { error: new Error(apiResponse.message || 'Erro ao alterar status do usuário') };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Erro ao alterar status do usuário') };
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return { error: new Error('Apenas administradores e root podem alterar senhas') };
    }

    if (newPassword.length < 6) {
      return { error: new Error('A senha deve ter pelo menos 6 caracteres') };
    }

    try {
      const apiResponse = await apiService.changePassword(userId, newPassword);
      
      if (!apiResponse.error) {
        return { error: null };
      }
      
      return { 
        error: new Error(apiResponse.message || 'Erro ao alterar senha') 
      };
    } catch (error) {
      return { 
        error: new Error(error instanceof Error ? error.message : 'Erro ao alterar senha') 
      };
    }
  };

  // BNCC Data functions
  const getSchoolYears = () => {
    return schoolYears;
  };

  const getBNCCAxes = () => {
    return bnccAxes;
  };

  const getKnowledgeObjects = () => {
    return knowledgeObjects;
  };

  const getSkills = () => {
    return skills;
  };

  const getActivities = () => {
    return spreadsheetActivities.length > 0 ? spreadsheetActivities : activities;
  };

  const getVideoCourses = () => {
    return videoCourses;
  };

  const getDocuments = () => {
    return documents;
  };

  // Filtered data functions
  const getActivitiesByYear = (yearId: string) => {
    const list = spreadsheetActivities.length > 0 ? spreadsheetActivities : activities;
    return list.filter(activity => activity.schoolYears.includes(yearId));
  };

  const getActivitiesByType = (type: 'plugada' | 'desplugada') => {
    const list = spreadsheetActivities.length > 0 ? spreadsheetActivities : activities;
    return list.filter(activity => activity.type === type);
  };

  const getActivitiesByAxis = (axisId: string) => {
    const list = spreadsheetActivities.length > 0 ? spreadsheetActivities : activities;
    return list.filter(activity => {
      // Suportar tanto axisId (legado) quanto axisIds (novo)
      const axisIds = activity.axisIds || (activity.axisId ? [activity.axisId] : []);
      return axisIds.includes(axisId);
    });
  };

  const getVideoCoursesByYear = (yearId: string) => {
    return videoCourses.filter(course => course.schoolYears.includes(yearId));
  };

  const getDocumentsByYear = (yearId: string) => {
    return documents.filter(doc => doc.schoolYears.includes(yearId));
  };

  const getUserProgress = (userId: string) => {
    const progress = JSON.parse(localStorage.getItem(`plataforma-bncc-progress-${userId}`) || '[]');
    return progress;
  };

  const updateUserProgress = (userId: string, videoId: string, completed: boolean) => {
    const progress = getUserProgress(userId);
    const existingIndex = progress.findIndex((p: UserProgress) => p.video_id === videoId);
    
    const progressItem: UserProgress = {
      id: existingIndex !== -1 ? progress[existingIndex].id : Date.now().toString(),
      user_id: userId,
      video_id: videoId,
      completed,
      last_watched_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      progress[existingIndex] = progressItem;
    } else {
      progress.push(progressItem);
    }

    localStorage.setItem(`plataforma-bncc-progress-${userId}`, JSON.stringify(progress));
  };

  const value = {
    user,
    profile,
    session,
    loading,
    activitiesSpreadsheet,
    signIn,
    signUp,
    signOut,
    updateProfile,
    
    // User Management (Admin only)
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changePassword,
    
    // BNCC Data
    getSchoolYears,
    getBNCCAxes,
    getKnowledgeObjects,
    getSkills,
    getActivities,
    getVideoCourses,
    getDocuments,
    
    // Filtered data
    getActivitiesByYear,
    getActivitiesByType,
    getActivitiesByAxis,
    getVideoCoursesByYear,
    getDocumentsByYear,
    
    // User progress
    getUserProgress,
    updateUserProgress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
