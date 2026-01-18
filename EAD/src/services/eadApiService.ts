/**
 * Serviço de API para EAD
 */

const API_BASE_URL = import.meta.env.VITE_EAD_API_URL || 'https://ead.novaedubncc.com.br/api';

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
}

export const eadApiService = new EADApiService();
