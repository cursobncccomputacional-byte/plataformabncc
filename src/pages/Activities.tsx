import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Monitor, Smartphone, Filter, Search, Brain, Globe, Users, Eye, Download } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Activity, SchoolYear, BNCCAxis } from '../types/bncc';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { activityLogger } from '../services/ActivityLogger';
import { ActivityDuration } from '../components/ActivityDuration';

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
  const { 
    getSchoolYears, 
    getBNCCAxes, 
    getActivities, 
    getActivitiesByYear, 
    getActivitiesByType, 
    getActivitiesByAxis,
    activitiesSpreadsheet,
    user
  } = useAuth();
  
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAxis, setSelectedAxis] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const schoolYears = getSchoolYears();
  const axes = getBNCCAxes();
  const allActivities = getActivities();
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
    filteredActivities = filteredActivities.filter(activity => 
      activity.axisId === selectedAxis
    );
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
        
        {isEmpty ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            <div className="text-gray-700 font-medium mb-2">Nenhuma atividade/aula cadastrada ainda.</div>
            {activitiesSpreadsheet?.error && (
              <div className="text-sm text-gray-600">
                Não consegui carregar o arquivo de atividades em{' '}
                <span className="font-mono">{activitiesSpreadsheet.url || '/atividades.xlsx'}</span> (
                {activitiesSpreadsheet.error}).
                <br />
                Envie o arquivo para esse caminho (ou configure{' '}
                <span className="font-mono">VITE_ACTIVITIES_XLSX_URL</span> no build).
              </div>
            )}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Todas as Atividades</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, index) => {
            const TypeIcon = typeIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={activity.thumbnail_url || svgPlaceholderDataUri(activity.title)}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = svgPlaceholderDataUri(activity.title);
                    }}
                  />
                  {/* Anos escolares sobre a miniatura */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-1 flex-wrap">
                    {activity.schoolYears.map((yearId) => (
                      <span
                        key={yearId}
                        className="bg-white/90 text-gray-800 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium shadow-sm"
                      >
                        {getYearName(yearId)}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[activity.type]}`}>
                      {typeLabels[activity.type]}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[activity.difficulty]}`}>
                      {difficultyLabels[activity.difficulty]}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const AxisIcon = getAxisIcon(activity.axisId);
                      return <AxisIcon className="w-4 h-4 text-gray-500" />;
                    })()}
                    <span className="text-sm text-gray-500">
                      {getAxisName(activity.axisId)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Anos:</span>
                      <div className="flex flex-wrap gap-1">
                        {activity.schoolYears.map((yearId) => (
                          <span
                            key={yearId}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {getYearName(yearId)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Duração:</span>
                      <ActivityDuration
                        videoUrl={activity.video_url}
                        fallbackMinutes={activity.duration}
                        className="text-sm text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {activity.video_url && (
                      <button 
                        onClick={() => handleViewVideo(activity)}
                        className="flex-1 text-white px-4 py-2 rounded-lg transition-colors text-sm" 
                        style={{ backgroundColor: '#005a93' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004a7a'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#005a93'}
                      >
                        Ver Vídeo
                      </button>
                    )}
                    {(activity.pedagogical_pdf_url || activity.material_pdf_url || activity.document_url) && (
                      <div className="flex flex-col gap-2 flex-1">
                        {(activity.pedagogical_pdf_url || activity.document_url) && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() =>
                                handleViewPDF(
                                  activity,
                                  activity.pedagogical_pdf_url || activity.document_url || '',
                                  'Estrutura Pedagógica'
                                )
                              }
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Estrutura
                            </button>
                            {(user?.role === 'admin' || user?.role === 'professor') && (
                              <button 
                                onClick={() =>
                                  handleDownloadPDF(
                                    activity,
                                    activity.pedagogical_pdf_url || activity.document_url || ''
                                  )
                                }
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Baixar
                              </button>
                            )}
                          </div>
                        )}

                        {activity.material_pdf_url && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewPDF(activity, activity.material_pdf_url!, 'Material da Aula')}
                              className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Material
                            </button>
                            {(user?.role === 'admin' || user?.role === 'professor') && (
                              <button 
                                onClick={() => handleDownloadPDF(activity, activity.material_pdf_url!)}
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Baixar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
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
              {selectedVideo.url.includes('vimeo.com') ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${getVimeoId(selectedVideo.url)}?autoplay=1&title=0&byline=0&portrait=0`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-auto max-h-[70vh] rounded-lg"
                  preload="metadata"
                >
                  <source src={selectedVideo.url} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
