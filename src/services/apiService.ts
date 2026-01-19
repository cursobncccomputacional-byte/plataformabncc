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
      console.error('API retornou HTML em vez de JSON. Status:', response.status);
      console.error('Content-Type recebido:', contentType);
      console.error('Primeiros 500 caracteres da resposta:', textResponse.substring(0, 500));
      return {
        error: true,
        message: 'API não está retornando JSON. Verifique se a API está configurada corretamente.',
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
      return {
        error: true,
        message: data.message || 'Erro na requisição',
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
   * Buscar atividades do banco de dados
   */
  async getActivities(): Promise<ApiResponse> {
    return this.request('/activities/index.php');
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
}

export const apiService = new ApiService();
