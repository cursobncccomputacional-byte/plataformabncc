import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Monitor, 
  MapPin, 
  User, 
  Calendar,
  Filter,
  RefreshCw,
  LogOut,
  Activity,
  Eye,
  Download,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { sessionService } from '../services/sessionService';

interface Session {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_email: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
  data_login: string;
  data_logout: string | null;
  tempo_sessao: number | null;
  tipo_logout: string | null;
  total_atividades: number;
}

interface SessionActivity {
  id: string;
  sessao_id: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_email: string;
  tipo_atividade: string;
  recurso_id: string | null;
  recurso_titulo: string | null;
  detalhes: string | null;
  ip_address: string;
  data_atividade: string;
}

interface SessionManagementProps {
  onBackToDashboard?: () => void;
}

export const SessionManagement = ({ onBackToDashboard }: SessionManagementProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // Filtros
  const [usuarioFiltro, setUsuarioFiltro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [tipoLogoutFiltro, setTipoLogoutFiltro] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadSessions();
  }, [usuarioFiltro, dataInicio, dataFim, tipoLogoutFiltro]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getSessions({
        usuario_id: usuarioFiltro || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        limit: 100,
        offset: 0,
      });

      let filteredSessions = data;

      // Filtrar por tipo de logout
      if (tipoLogoutFiltro !== 'all') {
        filteredSessions = filteredSessions.filter((s: Session) => {
          if (tipoLogoutFiltro === 'active') {
            return s.data_logout === null;
          }
          return s.tipo_logout === tipoLogoutFiltro;
        });
      }

      // Filtrar por termo de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredSessions = filteredSessions.filter((s: Session) =>
          s.usuario_nome.toLowerCase().includes(term) ||
          s.usuario_email.toLowerCase().includes(term) ||
          s.ip_address.includes(term)
        );
      }

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionActivities = async (sessaoId: string) => {
    setLoadingActivities(true);
    try {
      const activities = await sessionService.getActivities({
        sessao_id: sessaoId,
        limit: 100,
        offset: 0,
      });
      setSessionActivities(activities);
    } catch (error) {
      console.error('Erro ao carregar atividades da sessão:', error);
      setSessionActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    if (session.id) {
      loadSessionActivities(session.id);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'Em andamento';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Em andamento';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoLogoutLabel = (tipo: string | null): string => {
    const labels: { [key: string]: string } = {
      'manual': 'Manual',
      'inativo': 'Inatividade',
      'timeout': 'Timeout',
      'forcado': 'Forçado',
    };
    return labels[tipo || ''] || 'Em andamento';
  };

  const getTipoLogoutColor = (tipo: string | null): string => {
    if (!tipo) return 'bg-green-100 text-green-800';
    const colors: { [key: string]: string } = {
      'manual': 'bg-blue-100 text-blue-800',
      'inativo': 'bg-orange-100 text-orange-800',
      'timeout': 'bg-red-100 text-red-800',
      'forcado': 'bg-purple-100 text-purple-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getActivityLabel = (tipo: string): string => {
    const labels: { [key: string]: string } = {
      'view_page': 'Visualizou Página',
      'view_activity': 'Visualizou Atividade',
      'view_document': 'Visualizou Documento',
      'view_video': 'Visualizou Vídeo',
      'download': 'Download',
      'search': 'Pesquisa',
      'filter': 'Filtro',
      'login': 'Login',
      'logout': 'Logout',
    };
    return labels[tipo] || tipo;
  };

  if (user?.role !== 'admin' && user?.role !== 'root') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {onBackToDashboard && (
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao Dashboard
              </button>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Sessões</h1>
          <p className="mt-2 text-gray-600">Visualize e gerencie sessões de usuários</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadSessions()}
                  placeholder="Nome, email ou IP..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Logout</label>
              <select
                value={tipoLogoutFiltro}
                onChange={(e) => setTipoLogoutFiltro(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativas</option>
                <option value="manual">Manual</option>
                <option value="inativo">Inatividade</option>
                <option value="timeout">Timeout</option>
                <option value="forcado">Forçado</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadSessions}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setDataInicio('');
                setDataFim('');
                setTipoLogoutFiltro('all');
                setUsuarioFiltro('');
                loadSessions();
              }}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Sessões */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sessões ({sessions.length})
                </h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma sessão encontrada
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedSession?.id === session.id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{session.usuario_nome}</span>
                            <span className="text-sm text-gray-500">({session.usuario_email})</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Login: {formatDate(session.data_login)}</span>
                            </div>
                            {session.data_logout && (
                              <div className="flex items-center gap-2">
                                <LogOut className="h-3 w-3" />
                                <span>Logout: {formatDate(session.data_logout)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>Duração: {formatDuration(session.tempo_sessao)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3" />
                              <span>{session.total_atividades} atividades</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{session.ip_address}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoLogoutColor(session.tipo_logout)}`}>
                          {getTipoLogoutLabel(session.tipo_logout)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalhes da Sessão */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Detalhes da Sessão</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Usuário</label>
                    <p className="text-sm text-gray-900">{selectedSession.usuario_nome}</p>
                    <p className="text-xs text-gray-500">{selectedSession.usuario_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedSession.ip_address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Agent</label>
                    <p className="text-xs text-gray-500 break-words">{selectedSession.user_agent}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Login</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedSession.data_login)}</p>
                  </div>
                  {selectedSession.data_logout && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Data Logout</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedSession.data_logout)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duração</label>
                        <p className="text-sm text-gray-900">{formatDuration(selectedSession.tempo_sessao)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tipo Logout</label>
                        <p className="text-sm text-gray-900">{getTipoLogoutLabel(selectedSession.tipo_logout)}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total de Atividades</label>
                    <p className="text-sm text-gray-900">{selectedSession.total_atividades}</p>
                  </div>
                </div>

                {/* Atividades da Sessão */}
                <div className="border-t border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Atividades</h3>
                  {loadingActivities ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : sessionActivities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">Nenhuma atividade registrada</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {sessionActivities.map((activity) => (
                        <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {getActivityLabel(activity.tipo_atividade)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.data_atividade)}
                            </span>
                          </div>
                          {activity.recurso_titulo && (
                            <p className="text-xs text-gray-600 truncate">{activity.recurso_titulo}</p>
                          )}
                          {activity.detalhes && (
                            <p className="text-xs text-gray-500 mt-1">{activity.detalhes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Selecione uma sessão para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
