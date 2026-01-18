/**
 * Serviço de API para comunicação com backend PHP
 */

// URL da API - ajustar conforme a estrutura do servidor
// API está na raiz: /api/ (não /novaedu/api/)
// Usar domínio sem www porque certificado SSL é válido apenas para novaedubncc.com.br
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://novaedubncc.com.br/api';

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
    // Recuperar session_id do localStorage se existir
    this.sessionId = localStorage.getItem('api_session_id');
  }

  /**
   * Fazer requisição à API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Adicionar session_id se existir
      if (this.sessionId) {
        headers['X-Session-ID'] = this.sessionId;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Incluir cookies
      });

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
      if (endpoint === '/users/index.php' && options.method === 'POST') {
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
    } catch (error) {
      console.error('Erro na requisição à API:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Login do usuário
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
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
   */
  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
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
   */
  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
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
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
      });
      // A API retorna 401 se não autenticado, mas isso significa que está funcionando
      // Retorna true se status for 200 ou 401 (API funcionando)
      return response.status === 200 || response.status === 401;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
