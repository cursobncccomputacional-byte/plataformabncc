/**
 * Serviço para gerenciar sessões e atividades no backend
 */

interface RegisterActivityParams {
  tipo: 'login' | 'activity';
  usuario_id?: string;
  sessao_id?: string;
  tipo_atividade?: string;
  recurso_id?: string;
  recurso_titulo?: string;
  detalhes?: string;
}

interface RegisterLogoutParams {
  sessao_id?: string;
  usuario_id?: string;
  tipo_logout?: 'manual' | 'inativo' | 'timeout' | 'forcado';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://novaedubncc.com.br/api';

class SessionService {
  private currentSessaoId: string | null = null;

  /**
   * Registrar login de um usuário
   */
  async registerLogin(usuarioId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tipo: 'login',
          usuario_id: usuarioId,
        }),
      });

      const data = await response.json();
      if (!data.error && data.sessao_id) {
        this.currentSessaoId = data.sessao_id;
        localStorage.setItem('plataforma-bncc-sessao-id', data.sessao_id);
        return data.sessao_id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao registrar login:', error);
      return null;
    }
  }

  /**
   * Registrar logout de um usuário
   */
  async registerLogout(params?: RegisterLogoutParams): Promise<boolean> {
    try {
      const sessaoId = params?.sessao_id || this.currentSessaoId || localStorage.getItem('plataforma-bncc-sessao-id');
      
      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessao_id: sessaoId,
          tipo_logout: params?.tipo_logout || 'manual',
        }),
      });

      const data = await response.json();
      if (!data.error) {
        this.currentSessaoId = null;
        localStorage.removeItem('plataforma-bncc-sessao-id');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao registrar logout:', error);
      return false;
    }
  }

  /**
   * Registrar uma atividade durante a sessão
   */
  async registerActivity(params: Omit<RegisterActivityParams, 'tipo'>): Promise<boolean> {
    try {
      const sessaoId = params.sessao_id || this.currentSessaoId || localStorage.getItem('plataforma-bncc-sessao-id');
      
      if (!sessaoId && !params.usuario_id) {
        console.warn('Nenhuma sessão ativa encontrada para registrar atividade');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tipo: 'activity',
          sessao_id: sessaoId,
          usuario_id: params.usuario_id,
          tipo_atividade: params.tipo_atividade || 'view_page',
          recurso_id: params.recurso_id,
          recurso_titulo: params.recurso_titulo,
          detalhes: params.detalhes,
        }),
      });

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      return false;
    }
  }

  /**
   * Buscar sessões
   */
  async getSessions(params?: {
    usuario_id?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario_id) queryParams.append('usuario_id', params.usuario_id);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=list&${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (!data.error) {
        return data.sessoes || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      return [];
    }
  }

  /**
   * Buscar atividades
   */
  async getActivities(params?: {
    sessao_id?: string;
    usuario_id?: string;
    tipo_atividade?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.sessao_id) queryParams.append('sessao_id', params.sessao_id);
      if (params?.usuario_id) queryParams.append('usuario_id', params.usuario_id);
      if (params?.tipo_atividade) queryParams.append('tipo_atividade', params.tipo_atividade);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=activities&${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (!data.error) {
        return data.atividades || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  }

  /**
   * Buscar analytics de usuários
   */
  async getAnalytics(params?: {
    usuario_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.usuario_id) queryParams.append('usuario_id', params.usuario_id);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);

      const response = await fetch(`${API_BASE_URL}/sessions/index.php?action=analytics&${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (!data.error) {
        return data.analytics || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      return [];
    }
  }

  /**
   * Obter sessão atual
   */
  getCurrentSessaoId(): string | null {
    return this.currentSessaoId || localStorage.getItem('plataforma-bncc-sessao-id');
  }

  /**
   * Definir sessão atual
   */
  setCurrentSessaoId(sessaoId: string): void {
    this.currentSessaoId = sessaoId;
    localStorage.setItem('plataforma-bncc-sessao-id', sessaoId);
  }
}

export const sessionService = new SessionService();
