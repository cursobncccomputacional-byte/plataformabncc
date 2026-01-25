import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Eye, 
  Download, 
  TrendingUp, 
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Video,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { UserAnalytics, UserActivityLog } from '../types/bncc';
import { sessionService } from '../services/sessionService';

interface ReportsProps {
  onBackToDashboard: () => void;
}

export const Reports = ({ onBackToDashboard }: ReportsProps) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics[]>([]);
  const [recentLogs, setRecentLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [dateFilter, selectedUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReports = async () => {
    setLoading(true);
    
    try {
      // Calcular datas para filtro
      let dataInicio: string | undefined = undefined;
      let dataFim: string | undefined = undefined;
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        dataInicio = cutoffDate.toISOString().split('T')[0];
        dataFim = now.toISOString().split('T')[0];
      }

      // Carregar analytics de usuários gerenciados
      const analyticsData = await sessionService.getAnalytics({
        data_inicio: dataInicio,
        data_fim: dataFim,
      });

      // Converter formato da API para formato UserAnalytics
      const formattedAnalytics: UserAnalytics[] = analyticsData.map((item: any) => ({
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail,
        totalSessions: item.totalSessions || 0,
        totalTimeSpent: item.totalTimeSpent || 0,
        totalActivities: item.totalActivities || 0,
        totalDocuments: item.totalDocuments || 0,
        totalVideos: item.totalVideos || 0,
        lastLogin: item.lastLogin || '',
        averageSessionDuration: 0, // Será calculado se necessário
        mostViewedActivities: [],
        mostViewedDocuments: [],
        loginFrequency: 0,
        activityFrequency: 0,
      }));

      setAnalytics(formattedAnalytics);

      // Carregar atividades recentes
      const activitiesData = await sessionService.getActivities({
        limit: 50,
        offset: 0,
      });

      // Converter formato da API para formato UserActivityLog
      const formattedLogs: UserActivityLog[] = activitiesData
        .filter((act: any) => {
          if (dateFilter === 'all') return true;
          const actDate = new Date(act.data_atividade);
          const now = new Date();
          const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
          const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
          return actDate >= cutoffDate;
        })
        .map((act: any) => ({
          id: act.id,
          userId: act.usuario_id,
          userName: act.usuario_nome,
          userEmail: act.usuario_email,
          activity: act.tipo_atividade,
          resourceType: act.recurso_id ? 'activity' : undefined,
          resourceId: act.recurso_id,
          resourceTitle: act.recurso_titulo,
          details: act.detalhes,
          timestamp: act.data_atividade,
          sessionId: act.sessao_id,
        }));

      setRecentLogs(formattedLogs);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setAnalytics([]);
      setRecentLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogsByDate = (logs: UserActivityLog[], period: string): UserActivityLog[] => {
    if (period === 'all') return logs;
    
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return logs.filter(log => new Date(log.timestamp) >= cutoffDate);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'login': return <Users className="h-4 w-4 text-green-600" />;
      case 'logout': return <Users className="h-4 w-4 text-red-600" />;
      case 'view_activity': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'view_document': return <FileText className="h-4 w-4" style={{ color: '#044982' }} />;
      case 'view_video': return <Video className="h-4 w-4 text-orange-600" />;
      case 'download': return <Download className="h-4 w-4" style={{ color: '#044982' }} />;
      case 'search': return <Filter className="h-4 w-4 text-pink-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityLabel = (activity: string): string => {
    const labels: { [key: string]: string } = {
      'login': 'Login',
      'logout': 'Logout',
      'view_activity': 'Visualizou Atividade',
      'view_document': 'Visualizou Documento',
      'view_video': 'Visualizou Vídeo',
      'download': 'Download',
      'search': 'Pesquisou',
      'filter': 'Filtrou'
    };
    return labels[activity] || activity;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="mt-2 text-gray-600">Acompanhe o uso da plataforma pelos professores</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Período:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="all">Todo o período</option>
                </select>
              </div>
            </div>
            <button
              onClick={loadReports}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(analytics.reduce((total, user) => total + user.totalTimeSpent, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atividades Visualizadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.reduce((total, user) => total + user.totalActivities, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8" style={{ color: '#044982' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos Visualizados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.reduce((total, user) => total + user.totalDocuments, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Tabela de Analytics por Usuário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analytics por Usuário</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atividades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                        <div className="text-sm text-gray-500">{user.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(user.totalTimeSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalActivities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalDocuments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma atividade registrada no período selecionado.</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(log.activity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{getActivityLabel(log.activity)}</span>
                        {log.resourceTitle && (
                          <>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600 truncate">{log.resourceTitle}</span>
                          </>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
