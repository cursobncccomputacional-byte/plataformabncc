import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Monitor, Smartphone, Filter, Search, Brain, Globe, Users, Eye, Download } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Activity, SchoolYear, BNCCAxis } from '../types/bncc';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { activityLogger } from '../services/ActivityLogger';
import { ActivityDuration } from '../components/ActivityDuration';
import { resolvePublicAssetUrl } from '../utils/assetUrl';
import { apiService } from '../services/apiService';

const typeIcons = {
  plugada: Monitor,
  desplugada: BookOpen,
};

const typeLabels = {
  plugada: 'Plugada',
  desplugada: 'Desplugada',
};

const typeColors = {
  plugada: 'bg-blue-100 text-blue-700',
  desplugada: 'bg-green-100 text-green-700',
};

const difficultyColors = {
  facil: 'bg-green-100 text-green-700',
  medio: 'bg-yellow-100 text-yellow-700',
  dificil: 'bg-red-100 text-red-700',
};

const difficultyLabels = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const svgPlaceholderDataUri = (title: string) => {
  const safe = (title || 'Atividade').slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#005a93"/>
          <stop offset="1" stop-color="#4F46E5"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="42" fill="#ffffff" opacity="0.95">
        ${safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const Activities = () => {
  const { user } = useAuth();
  
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAxis, setSelectedAxis] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);

  const [userPermissions, setUserPermissions] = useState<{
    can_manage_activities: boolean;
    can_manage_courses: boolean;
  } | null>(null);

  // Buscar permissões atualizadas da API sempre que a página carregar
  useEffect(() => {
    const fetchUpdatedPermissions = async () => {
      try {
        const apiResponse = await apiService.getCurrentUser();
        console.log('API Response:', apiResponse);
        
        if (!apiResponse.error && apiResponse.user) {
          const updatedPermissions = {
            can_manage_activities: apiResponse.user.can_manage_activities === true,
            can_manage_courses: apiResponse.user.can_manage_courses === true,
          };
          
          console.log('Permissões atualizadas da API:', updatedPermissions);
          
          // Atualizar localStorage
          const savedUser = localStorage.getItem('plataforma-bncc-user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            const updatedUser = {
              ...userData,
              ...updatedPermissions,
            };
            localStorage.setItem('plataforma-bncc-user', JSON.stringify(updatedUser));
            console.log('LocalStorage atualizado:', updatedUser);
          }
          
          // Atualizar estado local
          setUserPermissions(updatedPermissions);
        } else {
          console.warn('Erro na resposta da API ou usuário não encontrado:', apiResponse);
          // Se falhar, usar permissões do usuário atual
          if (user) {
            setUserPermissions({
              can_manage_activities: user.can_manage_activities === true,
              can_manage_courses: user.can_manage_courses === true,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar permissões atualizadas:', error);
        // Se falhar, usar permissões do usuário atual
        if (user) {
          setUserPermissions({
            can_manage_activities: user.can_manage_activities === true,
            can_manage_courses: user.can_manage_courses === true,
          });
        } else {
          setUserPermissions({
            can_manage_activities: false,
            can_manage_courses: false,
          });
        }
      }
    };
    
    fetchUpdatedPermissions();
  }, []); // Executar apenas uma vez ao montar

  // Verificar permissão para ver atividades (usar permissões atualizadas se disponível)
  const canViewActivities = user?.role === 'root' || 
    (userPermissions?.can_manage_activities === true);
  
  // Debug log
  useEffect(() => {
    console.log('Verificação de permissões:', {
      userRole: user?.role,
      userCanManageActivities: user?.can_manage_activities,
      userPermissionsCanManageActivities: userPermissions?.can_manage_activities,
      canViewActivities: canViewActivities,
    });
  }, [user, userPermissions, canViewActivities]);

  // Carregar atividades da nova API apenas se tiver permissão
  useEffect(() => {
    // Aguardar permissões serem carregadas antes de decidir
    if (userPermissions === null) {
      return; // Ainda carregando permissões
    }
    
    if (canViewActivities) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [canViewActivities, userPermissions]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await apiService.getActivities();
      if (response.error) {
        console.error('Erro ao carregar atividades:', response.message);
        setAllActivities([]);
      } else {
        // Converter atividades da API para o formato esperado
        const activities = (response.activities || []).map((act: any) => {
          // Converter tipo: "Plugada" -> "plugada", "Desplugada" -> "desplugada"
          const type = act.tipo === 'Plugada' ? 'plugada' : 'desplugada';
          
          // Converter dificuldade: "Fácil" -> "facil", "Médio" -> "medio", "Difícil" -> "dificil"
          let difficulty = 'medio';
          if (act.nivel_dificuldade === 'Fácil') difficulty = 'facil';
          else if (act.nivel_dificuldade === 'Médio') difficulty = 'medio';
          else if (act.nivel_dificuldade === 'Difícil') difficulty = 'dificil';
          
          // Converter duração (pode ser string como "15 minutos" ou número)
          let duration = 0;
          if (act.duracao) {
            const durStr = String(act.duracao).toLowerCase();
            const minutesMatch = durStr.match(/(\d+)\s*min/);
            if (minutesMatch) {
              duration = parseInt(minutesMatch[1]) || 0;
            } else {
              duration = parseInt(act.duracao) || 0;
            }
          }
          
          return {
            id: act.id,
            title: act.nome_atividade,
            description: act.descricao || '',
            type: type,
            schoolYears: act.anos_escolares || [],
            axisIds: act.eixos_bncc || [],
            difficulty: difficulty,
            duration: duration,
            video_url: act.video_url,
            pedagogical_pdf_url: act.pdf_estrutura_pedagogica_url,
            material_pdf_url: act.material_apoio_url,
            document_url: act.link_video,
            thumbnail_url: act.thumbnail_url,
            etapa: act.etapa,
          };
        });
        setAllActivities(activities);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Gerar anos escolares e eixos a partir das atividades
  const schoolYears: SchoolYear[] = Array.from(
    new Set(allActivities.flatMap(a => a.schoolYears))
  ).map((year, index) => ({
    id: year,
    name: year,
    order: index,
  }));

  const axes: BNCCAxis[] = Array.from(
    new Set(allActivities.flatMap(a => a.axisIds || []))
  ).map((axis, index) => ({
    id: axis,
    name: axis,
    order: index,
  }));

  const isEmpty = allActivities.length === 0;

  // Filtrar atividades
  let filteredActivities = allActivities;

  if (selectedYear !== 'all') {
    filteredActivities = filteredActivities.filter(activity => 
      activity.schoolYears.includes(selectedYear)
    );
  }

  if (selectedType !== 'all') {
    filteredActivities = filteredActivities.filter(activity => 
      activity.type === selectedType
    );
  }

  if (selectedAxis !== 'all') {
    filteredActivities = filteredActivities.filter(activity => {
      // Suportar tanto axisId (legado) quanto axisIds (novo)
      const axisIds = activity.axisIds || (activity.axisId ? [activity.axisId] : []);
      return axisIds.includes(selectedAxis);
    });
  }

  if (searchTerm) {
    filteredActivities = filteredActivities.filter(activity =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleViewPDF = (activity: Activity, url: string, label: string) => {
    if (url && user) {
      setSelectedPDF({ url, title: `${activity.title} — ${label}` });
      // Log da visualização da atividade
      activityLogger.logViewActivity(user.id, user.name, user.email, activity.id, activity.title);
    }
  };

  const handleViewVideo = (activity: Activity) => {
    if (activity.video_url && user) {
      setSelectedVideo({ url: activity.video_url, title: activity.title });
      // Log da visualização do vídeo
      activityLogger.logViewActivity(user.id, user.name, user.email, activity.id, activity.title);
    }
  };

  const getVimeoId = (url: string) => {
    try {
      const u = new URL(url);
      const last = u.pathname.split('/').filter(Boolean).pop() || '';
      return last.replace(/\D/g, '') || last;
    } catch {
      // fallback simples
      const last = url.split('/').pop() || '';
      return last.split('?')[0];
    }
  };

  const getYouTubeId = (url: string) => {
    try {
      const u = new URL(url);
      // Suporta: youtube.com/watch?v=ID ou youtu.be/ID
      if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
        return u.searchParams.get('v');
      }
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/').filter(Boolean).pop();
      }
      return null;
    } catch {
      return null;
    }
  };

  const getGoogleDriveId = (url: string) => {
    try {
      const u = new URL(url);
      // Suporta: drive.google.com/file/d/ID/view ou drive.google.com/open?id=ID
      if (u.hostname.includes('drive.google.com')) {
        if (u.pathname.includes('/file/d/')) {
          const parts = u.pathname.split('/file/d/');
          if (parts[1]) {
            return parts[1].split('/')[0];
          }
        }
        if (u.searchParams.has('id')) {
          return u.searchParams.get('id');
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const detectVideoType = (url: string): 'vimeo' | 'youtube' | 'googledrive' | 'direct' => {
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com')) return 'googledrive';
    return 'direct';
  };

  const handleDownloadPDF = (activity: Activity, url: string) => {
    if (url && (user?.role === 'admin' || user?.role === 'professor')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = activity.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log do download
      activityLogger.logDownload(user.id, user.name, user.email, 'activity', activity.id, activity.title);
    }
  };

  const getAxisName = (axisId: string) => {
    const axis = axes.find(a => a.id === axisId);
    return axis ? axis.name : axisId;
  };

  // Log de pesquisa com debounce
  useEffect(() => {
    if (searchTerm && user) {
      const timeoutId = setTimeout(() => {
        activityLogger.logSearch(user.id, user.name, user.email, searchTerm);
      }, 1000); // Debounce de 1 segundo
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, user]);

  // Log de filtros
  useEffect(() => {
    if (selectedYear && user) {
      activityLogger.logFilter(user.id, user.name, user.email, 'Ano Escolar', selectedYear);
    }
  }, [selectedYear, user]);

  useEffect(() => {
    if (selectedAxis && user) {
      activityLogger.logFilter(user.id, user.name, user.email, 'Eixo BNCC', getAxisName(selectedAxis));
    }
  }, [selectedAxis, user]);

  const getAxisIcon = (axisId: string) => {
    const axisIcons = {
      'pensamento-computacional': Brain,
      'mundo-digital': Globe,
      'cultura-digital': Users,
    };
    return axisIcons[axisId as keyof typeof axisIcons] || Brain;
  };

  const getYearName = (yearId: string) => {
    const year = schoolYears.find(y => y.id === yearId);
    return year ? year.name : yearId;
  };

  // Se ainda estiver carregando permissões, mostrar loading
  if (userPermissions === null) {
    return (
      <div className="bg-transparent p-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#005a93] mb-4"></div>
            <div className="text-gray-700 font-medium">Verificando permissões...</div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tiver permissão, mostrar mensagem de acesso negado
  if (!canViewActivities) {
    return (
      <div className="bg-transparent p-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para visualizar as atividades da plataforma.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Para ter acesso, solicite ao administrador que habilite a permissão "Plataforma (Atividades)" 
              na tela "Atribuir Acesso".
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#005a93] text-white rounded-lg hover:bg-[#004a7a] transition-colors"
            >
              Atualizar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Atividades BNCC
          </h1>
          <p className="text-gray-600">
            Explore atividades plugadas e desplugadas organizadas por anos escolares
          </p>
        </motion.div>
        
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#005a93] mb-4"></div>
            <div className="text-gray-700 font-medium">Carregando atividades...</div>
          </div>
        ) : isEmpty ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            <div className="text-gray-700 font-medium mb-2">Nenhuma atividade cadastrada ainda.</div>
            <div className="text-sm text-gray-500">
              As atividades serão exibidas aqui após serem criadas através do menu "Cursos" → "Plataforma".
            </div>
          </div>
        ) : (
          <>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar atividades..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ano Escolar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Escolar
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os anos</option>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Atividade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os tipos</option>
                <option value="plugada">Plugada</option>
                <option value="desplugada">Desplugada</option>
              </select>
            </div>

            {/* Eixo BNCC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eixo BNCC
              </label>
              <select
                value={selectedAxis}
                onChange={(e) => setSelectedAxis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os eixos</option>
                {axes.map((axis) => (
                  <option key={axis.id} value={axis.id}>
                    {axis.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Resultados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <p className="text-gray-600">
            {filteredActivities.length} atividade(s) encontrada(s)
          </p>
        </motion.div>

        {/* Lista de Atividades - Todas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividades da Plataforma</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredActivities.map((activity, index) => {
            const TypeIcon = typeIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="relative">
                  <img
                    src={resolvePublicAssetUrl(activity.thumbnail_url) || svgPlaceholderDataUri(activity.title)}
                    alt={activity.title}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = svgPlaceholderDataUri(activity.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badges compactos no topo */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm ${typeColors[activity.type]} border border-white/20`}>
                      {typeLabels[activity.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm ${difficultyColors[activity.difficulty]} border border-white/20`}>
                      {difficultyLabels[activity.difficulty]}
                    </span>
                  </div>
                  
                  {/* Anos escolares compactos no rodapé da imagem */}
                  {activity.schoolYears.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                      {activity.schoolYears.slice(0, 2).map((yearId) => (
                        <span
                          key={yearId}
                          className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          {getYearName(yearId)}
                        </span>
                      ))}
                      {activity.schoolYears.length > 2 && (
                        <span className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                          +{activity.schoolYears.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-sm leading-tight">
                    {activity.title}
                  </h3>
                  
                  {/* Duração e eixo em linha compacta */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <ActivityDuration
                      videoUrl={activity.video_url}
                      fallbackMinutes={activity.duration}
                      className="text-xs"
                    />
                    <span>•</span>
                    <span className="truncate">
                      {(activity.axisIds || (activity.axisId ? [activity.axisId] : []))
                        .map(id => getAxisName(id))
                        .join(', ')}
                    </span>
                  </div>

                  {/* Botões de ação compactos */}
                  <div className="flex gap-1.5">
                    {activity.video_url && (
                      <button 
                        onClick={() => handleViewVideo(activity)}
                        className="flex-1 text-white px-3 py-1.5 rounded-lg transition-all text-xs font-medium hover:shadow-md" 
                        style={{ backgroundColor: '#005a93' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004a7a'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#005a93'}
                      >
                        Vídeo
                      </button>
                    )}
                    {(activity.pedagogical_pdf_url || activity.document_url) && (
                      <button 
                        onClick={() =>
                          handleViewPDF(
                            activity,
                            activity.pedagogical_pdf_url || activity.document_url || '',
                            'Estrutura Pedagógica'
                          )
                        }
                        className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Estrutura
                      </button>
                    )}
                    {activity.material_pdf_url && (
                      <button 
                        onClick={() => handleViewPDF(activity, activity.material_pdf_url!, 'Material da Aula')}
                        className="flex-1 bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Material
                      </button>
                    )}
                    {((user?.role === 'admin' || user?.role === 'professor') && (activity.pedagogical_pdf_url || activity.material_pdf_url || activity.document_url)) && (
                      <button 
                        onClick={() => {
                          const url = activity.pedagogical_pdf_url || activity.material_pdf_url || activity.document_url || '';
                          if (url) handleDownloadPDF(activity, url);
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs flex items-center justify-center"
                        title="Baixar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#005a93] mb-4"></div>
            <p>Carregando atividades...</p>
          </div>
        ) : filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar mais atividades.
            </p>
          </motion.div>
        )}
          </>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <SecurePDFViewer
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
          allowDownload={user?.role === 'admin' || user?.role === 'professor'}
        />
      )}

      {/* Video Viewer Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {(() => {
                const videoType = detectVideoType(selectedVideo.url);
                
                switch (videoType) {
                  case 'vimeo':
                    return (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`https://player.vimeo.com/video/${getVimeoId(selectedVideo.url)}?autoplay=1&title=0&byline=0&portrait=0`}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  
                  case 'youtube':
                    const youtubeId = getYouTubeId(selectedVideo.url);
                    if (youtubeId) {
                      return (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    break;
                  
                  case 'googledrive':
                    const driveId = getGoogleDriveId(selectedVideo.url);
                    if (driveId) {
                      return (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`https://drive.google.com/file/d/${driveId}/preview`}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="autoplay"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    break;
                  
                  case 'direct':
                  default:
                    return (
                      <video
                        controls
                        className="w-full h-auto max-h-[70vh] rounded-lg"
                        preload="metadata"
                        controlsList="nodownload"
                      >
                        <source src={selectedVideo.url} type="video/mp4" />
                        <source src={selectedVideo.url} type="video/webm" />
                        <source src={selectedVideo.url} type="video/ogg" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    );
                }
                
                // Fallback para URL direta se não detectar tipo
                return (
                  <video
                    controls
                    className="w-full h-auto max-h-[70vh] rounded-lg"
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    <source src={selectedVideo.url} type="video/webm" />
                    <source src={selectedVideo.url} type="video/ogg" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
