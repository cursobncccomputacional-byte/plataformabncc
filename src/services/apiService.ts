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
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API retornou HTML em vez de JSON:', text.substring(0, 200));
        return {
          error: true,
          message: 'API não está retornando JSON. Verifique se a API está configurada corretamente.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro na requisição',
        };
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
    return this.request('/users');
  }

  /**
   * Verificar se a API está disponível
   */
  async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/test.php`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
