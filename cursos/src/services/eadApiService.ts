/**
 * Serviço de API para EAD
 */

// URL relativa para funcionar em qualquer subdomínio
// Pode ser sobrescrita por VITE_EAD_API_URL no .env
const API_BASE_URL = import.meta.env.VITE_EAD_API_URL || '/api';

interface ApiResponse<T = any> {
  error: boolean;
  message?: string;
  data?: T;
  courses?: T[];
  course?: T;
  lessons?: T[];
  enrollments?: T[];
  progress?: T[];
  percentage?: number;
  completed_lessons?: number;
  total_lessons?: number;
}

class EADApiService {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.sessionId = localStorage.getItem('ead_session_id');
  }

  private getSavedUserForHeaders(): { id?: string; role?: string } | null {
    try {
      const raw = localStorage.getItem('ead_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return { id: parsed.id, role: parsed.role };
    } catch {
      return null;
    }
  }

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

      if (this.sessionId) {
        headers['X-Session-ID'] = this.sessionId;
      }

      // Importante: no subdomínio, o cookie de sessão do domínio principal não vale.
      // Enviar ID/Role via headers para autenticar na API do cursos.
      const savedUser = this.getSavedUserForHeaders();
      if (savedUser?.id) {
        headers['X-User-Id'] = String(savedUser.id);
      }
      if (savedUser?.role) {
        headers['X-User-Role'] = String(savedUser.role);
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      const textResponse = await response.text();
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API retornou HTML em vez de JSON. Status:', response.status);
        return {
          error: true,
          message: 'API não está retornando JSON',
        };
      }

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        return {
          error: true,
          message: 'Resposta da API não é um JSON válido',
        };
      }

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

  async getCourses(category?: string, search?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/courses/index.php${query}`);
  }

  /**
   * Lista pública de cursos publicados (catálogo).
   * Útil para exibir cursos "bloqueados" (sem expor aulas).
   */
  async getPublicCourses(category?: string, search?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append('public', '1');
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return this.request(`/courses/index.php?${params.toString()}`);
  }

  async getCourse(courseId: string): Promise<ApiResponse> {
    return this.request(`/courses/index.php?id=${courseId}`);
  }

  async enrollInCourse(courseId: string): Promise<ApiResponse> {
    return this.request('/enrollments/index.php', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  }

  async getMyCourses(): Promise<ApiResponse> {
    return this.request('/enrollments/index.php');
  }

  async getProgress(courseId: string): Promise<ApiResponse> {
    return this.request(`/progress/index.php?course_id=${courseId}`);
  }

  async updateProgress(
    courseId: string,
    lessonId: string,
    watchedSeconds: number,
    totalSeconds: number,
    isCompleted: boolean
  ): Promise<ApiResponse> {
    return this.request('/progress/index.php', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseId,
        lesson_id: lessonId,
        watched_seconds: watchedSeconds,
        total_seconds: totalSeconds,
        is_completed: isCompleted,
      }),
    });
  }

  // ============================================
  // Métodos de Gestão de Usuários (Root apenas)
  // Usa a API principal do sistema
  // ============================================

  /**
   * Listar usuários (root apenas)
   * Usa a API principal: /api/users/index.php
   */
  async getUsers(): Promise<ApiResponse> {
    // Usar URL absoluta para a API principal
    const mainApiUrl = 'https://novaedubncc.com.br/api';
    const url = `${mainApiUrl}/users/index.php`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro ao buscar usuários',
        };
      }

      return {
        error: false,
        users: data.users || [],
      };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Criar usuário (root apenas)
   */
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    school?: string;
    subjects?: string[];
  }): Promise<ApiResponse> {
    const mainApiUrl = 'https://novaedubncc.com.br/api';
    const url = `${mainApiUrl}/users/index.php`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro ao criar usuário',
        };
      }

      return {
        error: false,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Deletar usuário (root apenas)
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    const mainApiUrl = 'https://novaedubncc.com.br/api';
    const url = `${mainApiUrl}/users/index.php`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro ao deletar usuário',
        };
      }

      return {
        error: false,
        message: data.message || 'Usuário deletado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Ativar/Inativar usuário (root apenas)
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse> {
    const mainApiUrl = 'https://novaedubncc.com.br/api';
    const url = `${mainApiUrl}/users/index.php`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, is_active: isActive }),
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro ao alterar status do usuário',
        };
      }

      return {
        error: false,
        message: data.message,
      };
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Alterar senha de usuário (root apenas)
   */
  async changePassword(userId: string, newPassword: string): Promise<ApiResponse> {
    const mainApiUrl = 'https://novaedubncc.com.br/api';
    const url = `${mainApiUrl}/users/change-password.php`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      });

      const textResponse = await response.text();
      const data = JSON.parse(textResponse);

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Erro ao alterar senha',
        };
      }

      return {
        error: false,
        message: data.message || 'Senha alterada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}

export const eadApiService = new EADApiService();
