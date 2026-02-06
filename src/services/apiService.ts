/**
 * Serviço de API para comunicação com backend PHP
 */

/**
 * Configuração da URL base da API
 * Seguindo padrão do LandingGrupoRaca (projeto que funciona):
 * - URL relativa '/api' como padrão (funciona em qualquer domínio/rede)
 * - Variável de ambiente VITE_API_URL para override manual
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T = any> {
  error: boolean;
  message?: string;
  data?: T;
  user?: T;
  users?: T[];
  session_id?: string;
}

class ApiService {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Limpar sessões antigas/inválidas na inicialização
    this.cleanupOldSessions();
    // Recuperar session_id do localStorage se existir
    this.sessionId = localStorage.getItem('api_session_id');
    
    // Log da URL configurada (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log('🔧 API Service inicializado:', {
        baseUrl: this.baseUrl,
        currentHost: window.location.hostname,
        currentOrigin: window.location.origin,
        envVar: import.meta.env.VITE_API_URL || 'não definida (usando padrão /api)',
      });
    }
  }

  /**
   * Limpa sessões antigas e dados inválidos do localStorage
   * Isso resolve problemas quando usuário tem cache/cookies antigos
   */
  private cleanupOldSessions(): void {
    try {
      // Verificar se há sessão antiga que pode estar causando conflito
      const apiAuthenticated = localStorage.getItem('api_authenticated');
      const sessionId = localStorage.getItem('api_session_id');
      const savedUser = localStorage.getItem('plataforma-bncc-user');

      // Se há flags de autenticação mas não há session_id válido, limpar
      if (apiAuthenticated === 'true' && !sessionId) {
        console.warn('🧹 Limpando sessão inválida: api_authenticated sem session_id');
        localStorage.removeItem('api_authenticated');
      }

      // Se há usuário salvo mas não há flags de API, pode ser sessão antiga
      // Não limpar automaticamente, mas logar para debug
      if (savedUser && !apiAuthenticated) {
        console.info('ℹ️ Usuário salvo encontrado sem flag de API (pode ser sessão antiga)');
      }
    } catch (error) {
      console.warn('Erro ao limpar sessões antigas:', error);
    }
  }

  /**
   * Limpa completamente todas as sessões e cache
   * Útil quando há problemas de autenticação
   */
  clearAllSessions(): void {
    try {
      localStorage.removeItem('api_session_id');
      localStorage.removeItem('api_authenticated');
      localStorage.removeItem('plataforma-bncc-user');
      this.sessionId = null;
      console.log('🧹 Todas as sessões foram limpas');
    } catch (error) {
      console.warn('Erro ao limpar sessões:', error);
    }
  }

  /**
   * Fazer requisição à API
   * SIMPLIFICADO para seguir exatamente o padrão do projeto que funciona
   * Sem timeout, sem retry, sem headers customizados - apenas o essencial
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Headers mínimos - igual ao projeto que funciona
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // REMOVIDO: X-Session-ID header (não usado no projeto que funciona)
    // Isso evita problemas de CORS preflight

    try {
      // Requisição SIMPLES - igual ao projeto que funciona
      // SEM timeout, SEM retry, SEM AbortController
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Incluir cookies
      });
      
      // Processar resposta
      return await this.processResponse<T>(response, endpoint);
    } catch (error) {
      // Tratar erro de forma simples
      return this.handleNetworkError(error, url);
    }
  }

  /**
   * Processa a resposta da API
   */
  private async processResponse<T>(
    response: Response,
    endpoint: string
  ): Promise<ApiResponse<T>> {
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    const textResponse = await response.text();
    
    if (!contentType || !contentType.includes('application/json')) {
      const is404 = response.status === 404;
      const isBncc = endpoint.includes('/bncc/');
      const message = is404 && isBncc
        ? 'Endpoint BNCC não encontrado (404). Verifique se a pasta api/bncc foi implantada no servidor e se o script create-bncc-computacional.sql foi executado.'
        : 'API não está retornando JSON. Verifique se a API está configurada corretamente.';
      if (!is404) {
        console.error('API retornou HTML em vez de JSON. Status:', response.status);
        console.error('Content-Type recebido:', contentType);
        console.error('Primeiros 500 caracteres da resposta:', textResponse.substring(0, 500));
      }
      return {
        error: true,
        message,
      };
    }

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Resposta recebida:', textResponse.substring(0, 500));
      return {
        error: true,
        message: 'Resposta da API não é um JSON válido.',
      };
    }

    if (!response.ok) {
      const is404 = response.status === 404;
      const isBncc = endpoint.includes('/bncc/');
      const message = is404 && isBncc
        ? 'Endpoint BNCC não encontrado (404). Verifique se a pasta api/bncc foi implantada no servidor.'
        : (data?.message || 'Erro na requisição');
      return {
        error: true,
        message,
      };
    }

    // Log da resposta para debug
    if (endpoint === '/users/index.php' && response.status === 200) {
      console.log('=== apiService: Resposta RAW do POST /users/index.php ===');
      console.log('Status:', response.status);
      console.log('Content-Type:', contentType);
      console.log('Texto completo (primeiros 500 chars):', textResponse.substring(0, 500));
      console.log('Data parseado:', data);
      console.log('Data.error:', data?.error);
      console.log('Data.user:', data?.user);
      console.log('Data.users:', data?.users);
      console.log('Data.message:', data?.message);
      console.log('Todas as chaves do data:', Object.keys(data || {}));
      console.log('==========================================');
    }
    
    return {
      error: false,
      ...data,
    };
  }

  /**
   * Trata erros de rede
   */
  private handleNetworkError(fetchError: unknown, url: string): ApiResponse {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Erro desconhecido';
    console.error('Erro de rede ao fazer requisição:', {
      url,
      error: errorMessage,
      type: fetchError instanceof TypeError ? 'TypeError' : 'Unknown',
      baseUrl: this.baseUrl,
      currentHost: window.location.hostname,
    });

    // Mensagens mais específicas baseadas no tipo de erro
    let userMessage = 'Erro ao conectar com o servidor. ';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('aborted')) {
      userMessage += 'Verifique sua conexão com a internet e se o servidor está acessível. ';
      userMessage += 'Se você está em uma rede corporativa ou usando VPN, pode haver bloqueio de firewall. ';
      userMessage += `Tentando conectar em: ${url}`;
    } else if (errorMessage.includes('CORS')) {
      userMessage += 'Erro de CORS. O servidor pode não estar permitindo requisições da sua origem. ';
      userMessage += `Origem atual: ${window.location.origin}`;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      userMessage += 'A requisição demorou muito para responder. O servidor pode estar sobrecarregado ou inacessível.';
    } else {
      userMessage += `Detalhes: ${errorMessage}`;
    }

    return {
      error: true,
      message: userMessage,
    };
  }

  /**
   * Login do usuário
   * SEGUINDO EXATAMENTE o padrão do projeto que funciona:
   * - URL: /api/auth.php?action=login (com query parameter)
   * - Método: POST
   * - Headers: apenas Content-Type
   * - Body: { email, password }
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    // Usar query parameter como no projeto que funciona
    const response = await this.request('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Salvar session_id se o login foi bem-sucedido
    if (!response.error && response.session_id) {
      this.sessionId = response.session_id;
      localStorage.setItem('api_session_id', response.session_id);
    }

    return response;
  }

  /**
   * Logout do usuário
   * SEGUINDO EXATAMENTE o padrão do projeto que funciona
   */
  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth.php?action=logout', {
      method: 'POST',
    });

    // Limpar session_id
    if (!response.error) {
      this.sessionId = null;
      localStorage.removeItem('api_session_id');
    }

    return response;
  }

  /**
   * Obter usuário atual
   * SEGUINDO EXATAMENTE o padrão do projeto que funciona
   */
  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth.php?action=me');
  }

  /**
   * Listar usuários (admin/root apenas)
   */
  async getUsers(): Promise<ApiResponse> {
    // Chamar diretamente o arquivo PHP para não depender de rewrite (/api/users/)
    return this.request('/users/index.php');
  }

  /**
   * Criar usuário (admin/root apenas)
   */
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    school?: string;
    subjects?: string[];
    aceite_politica_privacidade?: boolean;
    versao_politica_privacidade?: string;
  }): Promise<ApiResponse> {
    // Chamar diretamente o arquivo PHP para não depender de rewrite (/api/users/)
    return this.request('/users/index.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Trocar senha de usuário (admin/root apenas)
   */
  async changePassword(userId: string, newPassword: string): Promise<ApiResponse> {
    // Chamar diretamente o arquivo PHP para não depender de rewrite (/api/users/change-password)
    return this.request(`/users/change-password.php`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    });
  }

  /** LGPD: exportar dados do titular (portabilidade) */
  async getMeDados(): Promise<ApiResponse<{ exportado_em: string; dados_pessoais: Record<string, unknown> }>> {
    return this.request('/users/me-dados.php', { method: 'GET' });
  }

  /** LGPD: solicitar exclusão dos dados (Art. 18) */
  async solicitarExclusaoDados(): Promise<ApiResponse> {
    return this.request('/users/me-solicitar-exclusao.php', { method: 'POST' });
  }

  /** LGPD: registrar aceite da Política de Privacidade (primeiro acesso) */
  async aceitarPoliticaPrivacidade(versao?: string): Promise<ApiResponse & { data_aceite_politica_privacidade?: string; versao_politica_privacidade?: string }> {
    return this.request('/users/me-aceitar-politica.php', {
      method: 'POST',
      body: JSON.stringify({ aceite: true, versao: versao || '1.0' }),
    });
  }

  /**
   * Ativar/Inativar usuário (admin/root apenas)
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse> {
    return this.request('/users/index.php', {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, is_active: isActive }),
    });
  }

  /**
   * Deletar usuário (admin/root apenas)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    // Chamar diretamente o arquivo PHP para não depender de rewrite (/api/users/:id)
    // O backend já aceita user_id no body/query.
    return this.request(`/users/index.php`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Habilitar/desabilitar Formação Continuada para o professor (root apenas)
   */
  async toggleFormacaoContinuada(userId: string, enable: boolean): Promise<ApiResponse> {
    return this.request('/users/formacao-continuada.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, enable }),
    });
  }

  /**
   * Obter permissões de um usuário (root apenas)
   */
  async getUserPermissions(userId: string): Promise<ApiResponse> {
    return this.request(`/users/permissions.php?user_id=${encodeURIComponent(userId)}`);
  }

  /**
   * Atualizar limites de admin (root apenas)
   */
  async updateAdminLimits(
    userId: string,
    limits: {
      max_professores?: number | null;
      max_alunos?: number | null;
      pacote?: string | null;
      data_contratacao?: string | null;
      data_expiracao?: string | null;
    }
  ): Promise<ApiResponse> {
    return this.request('/users/index.php', {
      method: 'PATCH',
      body: JSON.stringify({
        user_id: userId,
        update_limits: true,
        ...limits,
      }),
    });
  }

  /**
   * Atualizar permissões de um usuário (root apenas)
   */
  async updateUserPermissions(
    userId: string,
    permissions: {
      can_manage_activities?: boolean;
      can_manage_courses?: boolean;
    }
  ): Promise<ApiResponse> {
    return this.request('/users/permissions.php', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...permissions,
      }),
    });
  }

  /**
   * Demandas (Gestão Interna - root apenas)
   */
  async getDemandas(semana?: string): Promise<ApiResponse> {
    const url = semana ? `/demandas/index.php?semana=${encodeURIComponent(semana)}` : '/demandas/index.php';
    return this.request(url);
  }

  async createDemanda(data: {
    nome: string;
    descricao?: string;
    responsavel_id?: string | null;
    data_prevista?: string | null;
  }): Promise<ApiResponse> {
    return this.request('/demandas/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDemanda(
    id: number,
    data: { nome?: string; descricao?: string; responsavel_id?: string | null; data_prevista?: string | null }
  ): Promise<ApiResponse> {
    return this.request('/demandas/index.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async concluirDemanda(id: number): Promise<ApiResponse> {
    return this.request('/demandas/index.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, concluir: true }),
    });
  }

  async reabrirDemanda(id: number): Promise<ApiResponse> {
    return this.request('/demandas/index.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, reabrir: true }),
    });
  }

  /**
   * Buscar atividades do banco de dados
   */
  async getActivities(filters?: {
    tipo?: string;
    etapa?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.etapa) params.append('etapa', filters.etapa);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request(`/activities/index.php${query ? '?' + query : ''}`);
  }

  /**
   * Teste Professor: buscar lista de atividades liberadas (whitelist)
   * Requer root ou can_manage_activities
   */
  async getTesteProfessorAllowedActivities(): Promise<ApiResponse & { allowed_activity_ids?: string[]; table_exists?: boolean }> {
    // enviar headers (fallback) no mesmo padrão de create/update activity
    const currentUser = await this.getCurrentUser();
    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch {
        // ignore
      }
    }

    return this.request('/activities/teste-professor-access.php', { headers });
  }

  /**
   * Teste Professor: salvar lista de atividades liberadas (substitui whitelist)
   * Requer root ou can_manage_activities
   */
  async setTesteProfessorAllowedActivities(activityIds: string[]): Promise<ApiResponse & { allowed_activity_ids?: string[] }> {
    const currentUser = await this.getCurrentUser();
    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch {
        // ignore
      }
    }

    return this.request('/activities/teste-professor-access.php', {
      method: 'POST',
      headers,
      body: JSON.stringify({ activity_ids: activityIds }),
    });
  }

  /**
   * Obter atividade específica por ID
   */
  async getActivity(activityId: string): Promise<ApiResponse> {
    return this.request(`/activities/index.php?id=${encodeURIComponent(activityId)}`);
  }

  /**
   * Criar atividade (requer can_manage_activities)
   */
  async createActivity(activityData: {
    id: string;
    nome_atividade: string;
    descricao?: string;
    tipo: 'Plugada' | 'Desplugada';
    etapa: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais';
    anos_escolares?: string[];
    eixos_bncc?: string[];
    duracao?: string;
    nivel_dificuldade: 'Fácil' | 'Médio' | 'Difícil';
    thumbnail_url?: string;
    video_url: string;
    pdf_estrutura_pedagogica_url?: string;
    material_apoio_url?: string;
    aee?: boolean;
    /** Para AEE: múltiplas etapas (ex.: ["Educação Infantil", "Anos Iniciais", "Anos Finais"]) */
    etapas?: string[];
  }): Promise<ApiResponse> {
    // Obter usuário atual para enviar nos headers
    const currentUser = await this.getCurrentUser();
    
    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      // Fallback: tentar do localStorage
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch (e) {
        console.warn('Não foi possível obter usuário do localStorage:', e);
      }
    }
    
    return this.request('/activities/index.php', {
      method: 'POST',
      headers,
      body: JSON.stringify(activityData),
    });
  }

  /**
   * Atualizar atividade (requer can_manage_activities)
   */
  async updateActivity(
    activityId: string,
    updates: Partial<{
      nome_atividade: string;
      descricao: string;
      tipo: 'Plugada' | 'Desplugada';
      etapa: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais';
      anos_escolares: string[];
      eixos_bncc: string[];
      duracao: string;
      thumbnail_url: string;
      video_url: string;
      pdf_estrutura_pedagogica_url: string;
      material_apoio_url: string;
      aee: boolean;
      etapas: string[];
    }>
  ): Promise<ApiResponse> {
    // Obter usuário atual para enviar nos headers
    const currentUser = await this.getCurrentUser();
    
    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      // Fallback: tentar do localStorage
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch (e) {
        console.warn('Não foi possível obter usuário do localStorage:', e);
      }
    }
    
    return this.request('/activities/index.php', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id: activityId, ...updates }),
    });
  }

  /**
   * Planos de Aula
   */
  async getLessonPlans(filters?: { atividade_id?: string }): Promise<ApiResponse & { planos?: any[] }> {
    const params = new URLSearchParams();
    if (filters?.atividade_id) params.append('atividade_id', filters.atividade_id);
    const query = params.toString();
    return this.request(`/planos-aula/index.php${query ? '?' + query : ''}`);
  }

  async getLessonPlan(id: number): Promise<ApiResponse & { plano?: any }> {
    return this.request(`/planos-aula/index.php?id=${encodeURIComponent(String(id))}`);
  }

  async createLessonPlan(data: {
    atividade_id: string;
    titulo: string;
    descricao?: string;
    pdf_url: string;
    thumb_url?: string;
  }): Promise<ApiResponse & { plano?: any }> {
    // Obter usuário atual para enviar nos headers (compatível com requireAuth)
    const currentUser = await this.getCurrentUser();

    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch {
        // ignore
      }
    }

    return this.request('/planos-aula/index.php', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async updateLessonPlan(
    id: number,
    updates: Partial<{
      atividade_id: string;
      titulo: string;
      descricao: string;
      pdf_url: string;
      thumb_url: string;
    }>
  ): Promise<ApiResponse & { plano?: any }> {
    const currentUser = await this.getCurrentUser();

    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch {
        // ignore
      }
    }

    return this.request('/planos-aula/index.php', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deleteLessonPlan(id: number): Promise<ApiResponse> {
    const currentUser = await this.getCurrentUser();

    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch {
        // ignore
      }
    }

    return this.request('/planos-aula/index.php', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Upload de imagem (thumbnail)
   */
  /**
   * Upload de imagem (thumbnail)
   */
  async uploadImage(file: File): Promise<ApiResponse & { url?: string }> {
    const url = `${this.baseUrl}/upload/index.php`;
    
    // Obter usuário atual para autenticação
    const currentUser = await this.getCurrentUserForCursosApi();
    if (!currentUser) {
      return {
        error: true,
        message: 'Usuário não autenticado',
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-User-Id': String(currentUser.id),
          'X-User-Role': currentUser.role || '',
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          error: true,
          message: data.message || 'Erro ao fazer upload da imagem',
        };
      }

      return {
        error: false,
        message: data.message || 'Upload realizado com sucesso',
        url: data.url,
      };
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro ao fazer upload da imagem',
      };
    }
  }

  /**
   * Trilhas Pedagógicas
   */
  async getTrilhas(tipo?: 'eixo_bncc' | 'etapa' | 'disciplina_transversal' | 'ano_escolar' | 'aee'): Promise<ApiResponse & { trilhas?: any[] }> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.request(`/trilhas/index.php${query}`);
  }

  async getTrilha(trilhaId: string): Promise<ApiResponse & { trilha?: any; atividades?: any[] }> {
    return this.request(`/trilhas/index.php?id=${encodeURIComponent(trilhaId)}`);
  }

  async createTrilha(trilhaData: {
    id: string;
    titulo: string;
    descricao?: string;
    tipo: 'eixo_bncc' | 'etapa' | 'disciplina_transversal' | 'ano_escolar' | 'aee';
    valor: string;
    criterios_agrupamento?: { tipo: 'eixo_bncc' | 'etapa' | 'disciplina_transversal' | 'ano_escolar' | 'aee'; valor: string }[];
    thumbnail_url?: string;
    ordem?: number;
  }): Promise<ApiResponse> {
    return this.request('/trilhas/index.php', {
      method: 'POST',
      body: JSON.stringify(trilhaData),
    });
  }

  async updateTrilha(trilhaId: string, updates: Partial<{
    titulo: string;
    descricao: string;
    tipo: 'eixo_bncc' | 'etapa' | 'disciplina_transversal' | 'ano_escolar' | 'aee';
    valor: string;
    criterios_agrupamento: { tipo: 'eixo_bncc' | 'etapa' | 'disciplina_transversal' | 'ano_escolar' | 'aee'; valor: string }[];
    thumbnail_url: string;
    ordem: number;
    ativo: boolean;
  }>): Promise<ApiResponse> {
    return this.request('/trilhas/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id: trilhaId, ...updates }),
    });
  }

  async deleteTrilha(trilhaId: string): Promise<ApiResponse> {
    return this.request('/trilhas/index.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: trilhaId }),
    });
  }

  /**
   * BNCC Computacional Digital
   */
  async getBnccHabilidades(params?: {
    tipo_nivel?: 'educacao_infantil' | 'fundamental';
    ano_etapa?: string;
    eixo?: string;
    search?: string;
  }): Promise<ApiResponse & { habilidades?: any[]; total?: number }> {
    const searchParams = new URLSearchParams();
    if (params?.tipo_nivel) searchParams.set('tipo_nivel', params.tipo_nivel);
    if (params?.ano_etapa) searchParams.set('ano_etapa', params.ano_etapa);
    if (params?.eixo) searchParams.set('eixo', params.eixo);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/bncc/index.php${query}`);
  }

  async getBnccHabilidade(id: string): Promise<ApiResponse & { habilidade?: any }> {
    return this.request(`/bncc/index.php?id=${encodeURIComponent(id)}`);
  }

  async createBnccHabilidade(data: {
    id?: string;
    tipo_nivel: 'educacao_infantil' | 'fundamental';
    ano_etapa: string;
    codigo_habilidade?: string;
    habilidade: string;
    eixo: string;
    objetivo_aprendizagem?: string;
    objeto_conhecimento?: string;
    explicacao_habilidade?: string;
    exemplos?: string;
    ordem?: number;
  }): Promise<ApiResponse & { id?: string }> {
    return this.request('/bncc/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBnccHabilidade(id: string, data: Partial<{
    tipo_nivel: 'educacao_infantil' | 'fundamental';
    ano_etapa: string;
    codigo_habilidade: string;
    habilidade: string;
    eixo: string;
    objetivo_aprendizagem: string;
    objeto_conhecimento: string;
    explicacao_habilidade: string;
    exemplos: string;
    ordem: number;
  }>): Promise<ApiResponse> {
    return this.request('/bncc/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async deleteBnccHabilidade(id: string): Promise<ApiResponse> {
    return this.request(`/bncc/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Currículo BNCC (tabelas curriculo_* – Educação Infantil com eixos e exemplos/materiais)
   */
  async getCurriculoBnccHabilidades(params?: {
    etapa_id?: number;
    eixo?: string;
    search?: string;
  }): Promise<ApiResponse & { habilidades?: any[]; etapas?: { id: number; nome: string }[]; total?: number }> {
    const searchParams = new URLSearchParams();
    if (params?.etapa_id != null) searchParams.set('etapa_id', String(params.etapa_id));
    if (params?.eixo) searchParams.set('eixo', params.eixo);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/curriculo-bncc/index.php${query}`);
  }

  async getCurriculoBnccHabilidade(id: number): Promise<ApiResponse & { habilidade?: any }> {
    return this.request(`/curriculo-bncc/index.php?id=${id}`);
  }

  async createCurriculoBnccHabilidade(data: {
    etapa_id: number;
    codigo: string;
    eixo: string;
    descricao: string;
    explicacao?: string;
    exemplos?: { tipo: string; conteudo: string }[];
    materiais?: { descricao?: string; link?: string }[];
  }): Promise<ApiResponse & { id?: number }> {
    return this.request('/curriculo-bncc/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCurriculoBnccHabilidade(id: number, data: {
    etapa_id: number;
    codigo: string;
    eixo: string;
    descricao: string;
    explicacao?: string;
    exemplos?: { tipo: string; conteudo: string }[];
    materiais?: { descricao?: string; link?: string }[];
  }): Promise<ApiResponse> {
    return this.request('/curriculo-bncc/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async deleteCurriculoBnccHabilidade(id: number): Promise<ApiResponse> {
    return this.request(`/curriculo-bncc/index.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Agente IA - Sugerir atividades do dia (Groq)
   * Usa a API do Groq para gerar sugestões de atividades pedagógicas.
   * Opcionalmente recebe contexto BNCC (habilidades do banco) para alinhar a sugestão aos códigos e descrições reais.
   */
  async suggestActivitiesFromAI(
    prompt: string,
    groqToken?: string,
    bnccContext?: string
  ): Promise<ApiResponse & { suggestions?: string }> {
    // Token deve ser configurado via variável de ambiente VITE_GROQ_API_KEY
    const token = groqToken || import.meta.env.VITE_GROQ_API_KEY;
    
    if (!token) {
      return {
        error: true,
        message: 'Chave da API Groq não configurada. Configure a variável de ambiente VITE_GROQ_API_KEY.',
      };
    }
    
    // Validar token
    if (!token || token.length < 10) {
      return {
        error: true,
        message: 'Token da API não configurado corretamente',
      };
    }
    
    const systemBase = 'Você é um assistente educacional especializado em sugerir atividades pedagógicas alinhadas à BNCC (Base Nacional Comum Curricular) para pensamento computacional. Forneça sugestões práticas, objetivas e detalhadas, incluindo objetivos, materiais necessários e passo a passo quando relevante. Foque em atividades plugadas e desplugadas para Educação Infantil, Anos Iniciais e Anos Finais.';
    const systemWithBncc = bnccContext
      ? `${systemBase}\n\n---\nContexto BNCC Computacional (habilidades reais do currículo - use para alinhar a sugestão a códigos e descrições oficiais):\n${bnccContext}`
      : systemBase;
    
    try {
      // Modelos válidos (2026): https://console.groq.com/docs/models
      const candidateModels = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'openai/gpt-oss-20b',
      ] as const;

      const tryCall = async (model: string) => {
        const requestBody = {
          model,
          messages: [
            {
              role: 'system',
              content: systemWithBncc
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        };

        console.log('🔍 Debug - Requisição para Groq API:', {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          model: requestBody.model,
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 10) + '...',
        });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        return { response, requestBody };
      };

      let lastErrorMessage: string | null = null;
      for (const model of candidateModels) {
        const { response } = await tryCall(model);

        if (response.ok) {
          const data = await response.json();
          const suggestions = data.choices?.[0]?.message?.content || '';
          return {
            error: false,
            message: 'Sugestões geradas com sucesso',
            suggestions: suggestions,
          };
        }

        // Capturar erro e tentar próximo modelo se for descontinuação
        try {
          const errorData = await response.json();
          const msg = errorData.error?.message || errorData.message || `Erro ao consultar IA: ${response.status}`;
          lastErrorMessage = msg;
          console.error('Erro na API Groq:', errorData);
          if (typeof msg === 'string' && msg.toLowerCase().includes('decommissioned')) {
            continue;
          }
          // Se não for descontinuação, parar aqui
          return { error: true, message: msg };
        } catch {
          const errorText = await response.text().catch(() => '');
          lastErrorMessage = errorText || `Erro ao consultar IA: ${response.status}`;
          return { error: true, message: lastErrorMessage };
        }
      }

      return {
        error: true,
        message: lastErrorMessage || 'Não foi possível consultar a IA (modelos indisponíveis).',
      };

      /*
      const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente educacional especializado em sugerir atividades pedagógicas alinhadas à BNCC (Base Nacional Comum Curricular) para pensamento computacional. Forneça sugestões práticas, objetivas e detalhadas, incluindo objetivos, materiais necessários e passo a passo quando relevante. Foque em atividades plugadas e desplugadas para Educação Infantil, Anos Iniciais e Anos Finais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      };

      console.log('🔍 Debug - Requisição para Groq API:', {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: requestBody.model,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...',
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Erro ao consultar IA: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
          console.error('Erro na API Groq:', errorData);
        } catch (e) {
          const errorText = await response.text().catch(() => '');
          console.error('Erro na API Groq (texto):', errorText);
          errorMessage = errorText || errorMessage;
        }
        return {
          error: true,
          message: errorMessage,
        };
      }

      const data = await response.json();
      const suggestions = data.choices?.[0]?.message?.content || '';
      
      return {
        error: false,
        message: 'Sugestões geradas com sucesso',
        suggestions: suggestions,
      };
      */
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro ao consultar IA',
      };
    }
  }

  async deleteActivity(activityId: string): Promise<ApiResponse> {
    // Obter usuário atual para enviar nos headers
    const currentUser = await this.getCurrentUser();
    
    const headers: HeadersInit = {};
    if (currentUser && !currentUser.error && currentUser.user) {
      headers['X-User-Id'] = currentUser.user.id;
      headers['X-User-Role'] = currentUser.user.role || '';
    } else if (currentUser && !currentUser.error && (currentUser as any).data) {
      headers['X-User-Id'] = (currentUser as any).data.id;
      headers['X-User-Role'] = (currentUser as any).data.role || '';
    } else {
      // Fallback: tentar do localStorage
      try {
        const savedUser = localStorage.getItem('plataforma-bncc-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          headers['X-User-Id'] = user.id;
          headers['X-User-Role'] = user.role || '';
        }
      } catch (e) {
        console.warn('Não foi possível obter usuário do localStorage:', e);
      }
    }
    
    return this.request('/activities/index.php', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id: activityId }),
    });
  }

  /**
   * Gerar thumbnails (server-side) para atividades.
   * Requer root (endpoint protegido no backend).
   */
  async generateActivityThumbnails(params?: {
    blocked_only?: boolean;
    limit?: number;
    overwrite?: boolean;
    activity_ids?: string[];
  }): Promise<ApiResponse & { results?: Array<{ id: string; ok: boolean; thumbnail_url?: string; message?: string }> }> {
    return this.request('/activities/generate-thumbnails.php', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  // ============================================
  // Métodos de Gestão de Cursos (Root apenas)
  // Usa a API do subdomínio cursos
  // ============================================

  /**
   * Obter usuário atual para autenticação cross-domain
   * Tenta múltiplas fontes: API, localStorage
   */
  private async getCurrentUserForCursosApi(): Promise<any> {
    // Tentar via API primeiro
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        return userResponse.user;
      } else if (!userResponse.error && (userResponse as any).data) {
        return (userResponse as any).data;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual via API:', e);
    }

    // Fallback: localStorage
    try {
      const savedUser = localStorage.getItem('plataforma-bncc-user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário do localStorage:', e);
    }

    return null;
  }

  /**
   * Listar todos os cursos (root apenas)
   */
  async getCourses(): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      // Se tiver usuário, enviar informações no header para autenticação cross-domain
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id); // Garantir que é string
        headers['X-User-Role'] = String(currentUser.role || '');
        
        // Debug log (remover em produção se necessário)
        console.log('🔍 Debug - Enviando requisição para API de cursos:', {
          userId: currentUser.id,
          userRole: currentUser.role,
          canManageCourses: currentUser.can_manage_courses,
          headers: { 'X-User-Id': String(currentUser.id), 'X-User-Role': String(currentUser.role || '') }
        });
      } else {
        console.warn('⚠️ Usuário não encontrado para autenticação na API de cursos');
      }

      const response = await fetch(`${cursosApiUrl}/courses/index.php`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      // Se for 401, verificar se é problema de autenticação
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro 401 na API de cursos:', {
          message: errorData.message || 'Não autenticado',
          currentUser: currentUser ? { id: currentUser.id, role: currentUser.role } : null,
          headersSent: currentUser && currentUser.id ? 'Sim' : 'Não'
        });
        
        // Se for root ou tiver can_manage_courses, não deve retornar vazio - é um erro real
        if (currentUser && (currentUser.role === 'root' || currentUser.can_manage_courses)) {
          return { 
            error: true, 
            message: errorData.message || 'Erro de autenticação. Verifique se você está logado como root.' 
          };
        }
        
        // Para outros usuários, retornar vazio é normal
        return { error: false, courses: [], count: 0 };
      }

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API retornou não-JSON:', text.substring(0, 200));
        return { 
          error: true, 
          message: `Erro na API: ${response.status} ${response.statusText}. Resposta não é JSON.` 
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          error: true, 
          message: data.message || `Erro ${response.status}: ${response.statusText}` 
        };
      }
      
      return { error: false, ...data };
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      return { 
        error: true, 
        message: error instanceof Error ? error.message : 'Erro ao conectar com a API de cursos' 
      };
    }
  }

  /**
   * Criar curso (root apenas)
   */
  async createCourse(courseData: {
    id: string;
    titulo: string;
    descricao?: string;
    status?: string;
    categoria?: string;
    nome_instrutor?: string;
    bio_instrutor?: string;
    preco?: number;
    thumbnail_url?: string;
  }): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    
    // Obter usuário atual para autenticação cross-domain
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/courses/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(courseData),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualizar curso (root apenas)
   */
  async updateCourse(courseId: string, updates: Partial<{
    titulo: string;
    descricao: string;
    status: string;
    categoria: string;
    nome_instrutor: string;
    bio_instrutor: string;
    preco: number;
    thumbnail_url: string;
  }>): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    
    let currentUser = null;
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        currentUser = userResponse.user;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual:', e);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/courses/index.php`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: courseId, ...updates }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Deletar curso (root apenas)
   */
  async deleteCourse(courseId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    
    let currentUser = null;
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        currentUser = userResponse.user;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual:', e);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/courses/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: courseId }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Listar permissões de curso (root apenas)
   */
  async getCoursePermissions(userId?: string, courseId?: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (courseId) params.append('course_id', courseId);
    
    let currentUser = null;
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        currentUser = userResponse.user;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual:', e);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/permissions/index.php?${params.toString()}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Criar permissão de curso (root apenas)
   */
  async createCoursePermission(userId: string, courseId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    
    let currentUser = null;
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        currentUser = userResponse.user;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual:', e);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/permissions/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, course_id: courseId }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Remover permissão de curso (root apenas)
   */
  async deleteCoursePermission(userId: string, courseId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    
    let currentUser = null;
    try {
      const userResponse = await this.getCurrentUser();
      if (!userResponse.error && userResponse.user) {
        currentUser = userResponse.user;
      }
    } catch (e) {
      console.warn('Não foi possível obter usuário atual:', e);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/permissions/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, course_id: courseId }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Inscrever um usuário em um curso (root)
   * Usado para o curso aparecer em "Meus Cursos" no subdomínio.
   */
  async enrollUserInCourse(userId: string, courseId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }

      const response = await fetch(`${cursosApiUrl}/enrollments/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, course_id: courseId }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  // ============================================
  // Métodos de Módulos e Aulas (Formação Continuada)
  // ============================================

  /**
   * Listar módulos de um curso
   */
  async getModulos(cursoId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/modulos/index.php?curso_id=${encodeURIComponent(cursoId)}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Criar módulo
   */
  async createModulo(moduloData: {
    id: string;
    curso_id: string;
    titulo_modulo: string;
    descricao?: string;
    ordem?: number;
  }): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/modulos/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(moduloData),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualizar módulo
   */
  async updateModulo(
    moduloId: string,
    updates: Partial<{
      titulo_modulo: string;
      descricao: string;
      ordem: number;
    }>
  ): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/modulos/index.php`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: moduloId, ...updates }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Deletar módulo
   */
  async deleteModulo(moduloId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/modulos/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: moduloId }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Listar aulas de um módulo
   */
  async getAulas(moduloId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/aulas/index.php?modulo_id=${encodeURIComponent(moduloId)}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Vídeos (partes) de uma Aula
   */
  async getAulaVideos(aulaId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/aula-videos/index.php?aula_id=${encodeURIComponent(aulaId)}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async createAulaVideo(videoData: {
    id: string;
    aula_id: string;
    titulo: string;
    descricao?: string;
    video_url: string;
    duracao_video?: number;
    thumbnail_url?: string;
    ordem?: number;
  }): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/aula-videos/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(videoData),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async updateAulaVideo(videoId: string, updates: Partial<{
    titulo: string;
    descricao: string;
    video_url: string;
    duracao_video: number;
    thumbnail_url: string;
    ordem: number;
    ativo: boolean;
  }>): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/aula-videos/index.php`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: videoId, ...updates }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async deleteAulaVideo(videoId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/aula-videos/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: videoId }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }
      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Avaliação (prova) da aula: listar perguntas
   */
  async getAvaliacaoPerguntas(aulaId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/avaliacao/index.php?aula_id=${encodeURIComponent(aulaId)}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: text?.substring(0, 100) || 'Erro' };
      }
      const data = await response.json();
      return { error: !!data.error, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Criar pergunta da avaliação
   */
  async createAvaliacaoPergunta(payload: {
    aula_id: string;
    ordem: number;
    enunciado: string;
    opcao_a: string;
    opcao_b: string;
    opcao_c: string;
    opcao_d: string;
    resposta_correta: 'A' | 'B' | 'C' | 'D';
  }): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/avaliacao/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: text?.substring(0, 100) || 'Erro' };
      }
      const data = await response.json();
      return { error: !!data.error, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualizar pergunta da avaliação
   */
  async updateAvaliacaoPergunta(
    id: number,
    updates: Partial<{
      ordem: number;
      enunciado: string;
      opcao_a: string;
      opcao_b: string;
      opcao_c: string;
      opcao_d: string;
      resposta_correta: string;
    }>
  ): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/avaliacao/index.php`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id, ...updates }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: text?.substring(0, 100) || 'Erro' };
      }
      const data = await response.json();
      return { error: !!data.error, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Deletar pergunta da avaliação
   */
  async deleteAvaliacaoPergunta(id: number): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }
      const response = await fetch(`${cursosApiUrl}/avaliacao/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: text?.substring(0, 100) || 'Erro' };
      }
      const data = await response.json();
      return { error: !!data.error, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Criar aula
   */
  async createAula(aulaData: {
    id: string;
    modulo_id: string;
    titulo: string;
    descricao?: string;
    video_url?: string;
    duracao_video?: number;
    thumbnail_url?: string;
    ordem?: number;
  }): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      // Enviar apenas campos relevantes (legados só se vierem preenchidos)
      const payload: any = {
        id: aulaData.id,
        modulo_id: aulaData.modulo_id,
        titulo: aulaData.titulo,
        descricao: aulaData.descricao,
        ordem: aulaData.ordem,
      };
      if (aulaData.video_url && String(aulaData.video_url).trim() !== '') {
        payload.video_url = aulaData.video_url;
        payload.duracao_video = aulaData.duracao_video ?? 0;
        payload.thumbnail_url = aulaData.thumbnail_url ?? '';
      }

      const response = await fetch(`${cursosApiUrl}/aulas/index.php`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Atualizar aula
   */
  async updateAula(
    aulaId: string,
    updates: Partial<{
      modulo_id: string;
      titulo: string;
      descricao: string;
      video_url: string;
      duracao_video: number;
      thumbnail_url: string;
      ordem: number;
    }>
  ): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/aulas/index.php`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: aulaId, ...updates }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Deletar aula
   */
  async deleteAula(aulaId: string): Promise<ApiResponse> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = currentUser.id;
        headers['X-User-Role'] = currentUser.role || '';
      }

      const response = await fetch(`${cursosApiUrl}/aulas/index.php`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: aulaId }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      return { error: !response.ok, ...data };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Relatório de aderência aos vídeos (Formação Continuada)
   * Retorna por usuário/curso: % assistido, % concluído, vídeos concluídos, segundos assistidos.
   * Apenas root ou can_manage_courses.
   */
  async getRelatorioAderenciaVideos(courseId?: string): Promise<ApiResponse & { relatorio?: any[]; total_linhas?: number }> {
    const cursosApiUrl = 'https://cursos.novaedubncc.com.br/api';
    const currentUser = await this.getCurrentUserForCursosApi();

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (currentUser && currentUser.id) {
        headers['X-User-Id'] = String(currentUser.id);
        headers['X-User-Role'] = String(currentUser.role || '');
      }

      const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
      const response = await fetch(`${cursosApiUrl}/reports/aderencia-videos.php${query}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return { error: true, message: `Erro: ${text.substring(0, 100)}` };
      }

      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: data.message || 'Erro ao gerar relatório' };
      }
      return { error: false, relatorio: data.relatorio || [], total_linhas: data.total_linhas ?? 0 };
    } catch (error) {
      return { error: true, message: error instanceof Error ? error.message : 'Erro ao conectar com a API de cursos' };
    }
  }

  /**
   * Relatório de aderência às atividades da plataforma (vídeos, documentos, downloads)
   * Dados de atividades_sessao (view_activity, view_document, view_video, download).
   * Apenas root ou admin. API principal (sessions).
   */
  async getRelatorioAderenciaAtividades(params?: {
    usuario_id?: string;
    detalhes?: boolean;
    limite_detalhes?: number;
  }): Promise<ApiResponse & { relatorio?: any[]; total_linhas?: number }> {
    const q = new URLSearchParams();
    q.set('action', 'aderencia-atividades');
    if (params?.usuario_id) q.set('usuario_id', params.usuario_id);
    if (params?.detalhes) q.set('detalhes', '1');
    if (params?.limite_detalhes != null) q.set('limite_detalhes', String(params.limite_detalhes));
    return this.request(`/sessions/index.php?${q.toString()}`);
  }

  /**
   * Verificar se a API está disponível
   * Usa o endpoint /auth/me para verificar se a API está respondendo
   */
  async checkApiAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
      
      try {
        const response = await fetch(`${this.baseUrl}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        // A API retorna 401 se não autenticado, mas isso significa que está funcionando
        // Retorna true se status for 200 ou 401 (API funcionando)
        return response.status === 200 || response.status === 401;
      } catch (e) {
        clearTimeout(timeoutId);
        throw e;
      }
    } catch {
      return false;
    }
  }

  /**
   * Diagnosticar problemas de conectividade com a API
   * Retorna informações detalhadas sobre o problema
   */
  async diagnoseConnection(): Promise<{
    success: boolean;
    url: string;
    baseUrl: string;
    currentOrigin: string;
    error?: string;
    details?: string;
    suggestions?: string[];
    corsIssue?: boolean;
    networkIssue?: boolean;
    timeoutIssue?: boolean;
  }> {
    const url = `${this.baseUrl}/auth/me`;
    const suggestions: string[] = [];
    let corsIssue = false;
    let networkIssue = false;
    let timeoutIssue = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Verificar se há problema de CORS mesmo com resposta
        const corsHeader = response.headers.get('Access-Control-Allow-Origin');
        if (!corsHeader || corsHeader === 'null') {
          corsIssue = true;
          suggestions.push('Problema de CORS detectado. O servidor não está retornando o header correto.');
        }

        // Se chegou aqui, a conexão funcionou
        return {
          success: true,
          url,
          baseUrl: this.baseUrl,
          currentOrigin: window.location.origin,
          details: `API está acessível. Status: ${response.status}`,
          corsIssue,
        };
      } catch (e) {
        clearTimeout(timeoutId);
        throw e;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Diagnóstico baseado no tipo de erro
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        networkIssue = true;
        suggestions.push('Verifique sua conexão com a internet');
        suggestions.push('Se estiver em rede corporativa, verifique se há firewall bloqueando');
        suggestions.push('Tente desativar VPN se estiver usando');
        suggestions.push(`Teste acessar diretamente no navegador: ${url}`);
        
        // Verificar se é problema de DNS
        if (this.baseUrl.includes('novaedubncc.com.br')) {
          suggestions.push('Verifique se o domínio novaedubncc.com.br está acessível');
          suggestions.push('Tente fazer ping ou acessar o domínio diretamente');
        }
        
        // Verificar se é problema de protocolo
        if (this.baseUrl.startsWith('https://') && window.location.protocol === 'http:') {
          suggestions.push('A API está configurada para HTTPS, mas você está acessando via HTTP');
        }
      } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        corsIssue = true;
        suggestions.push('O servidor pode não estar configurado para aceitar requisições do seu domínio');
        suggestions.push('Verifique as configurações de CORS no servidor');
        suggestions.push(`Origem atual: ${window.location.origin}`);
        suggestions.push(`URL da API: ${this.baseUrl}`);
      } else if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
        timeoutIssue = true;
        suggestions.push('O servidor pode estar sobrecarregado ou inacessível');
        suggestions.push('Tente novamente em alguns instantes');
        suggestions.push('Verifique se há problemas de rede ou firewall');
      } else {
        suggestions.push(`Erro: ${errorMessage}`);
        suggestions.push('Entre em contato com o suporte técnico');
      }

      return {
        success: false,
        url,
        baseUrl: this.baseUrl,
        currentOrigin: window.location.origin,
        error: errorMessage,
        details: `Não foi possível conectar com a API em ${url}`,
        suggestions,
        corsIssue,
        networkIssue,
        timeoutIssue,
      };
    }
  }

  /**
   * Testar conectividade antes de fazer login
   * Retorna true se a API estiver acessível
   */
  async testConnectionBeforeLogin(): Promise<{
    available: boolean;
    message: string;
    diagnosis?: ReturnType<typeof this.diagnoseConnection> extends Promise<infer T> ? T : never;
  }> {
    const isAvailable = await this.checkApiAvailability();
    
    if (isAvailable) {
      return {
        available: true,
        message: 'API está acessível',
      };
    }

    // Se não estiver disponível, fazer diagnóstico completo
    const diagnosis = await this.diagnoseConnection();
    
    return {
      available: false,
      message: 'API não está acessível. Verifique sua conexão.',
      diagnosis: diagnosis as any,
    };
  }

  /**
   * Envia o formulário de contato/inscrição para contato@novaedubncc.com.br
   */
  async submitContactForm(data: {
    nome: string;
    email: string;
    celular: string;
    cidade: string;
    nome_escola: string;
    cargo: string;
    tipo_escola: string;
  }): Promise<ApiResponse> {
    const url = `${this.baseUrl}/contact/index.php`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({ error: true, message: 'Resposta inválida' }));
      if (!response.ok) {
        return { error: true, message: result.message || 'Erro ao enviar' };
      }
      return { error: result.error ?? false, message: result.message };
    } catch (e) {
      return {
        error: true,
        message: e instanceof Error ? e.message : 'Não foi possível enviar. Tente novamente.',
      };
    }
  }
}

export const apiService = new ApiService();
