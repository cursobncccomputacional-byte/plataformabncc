import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Activity } from '../types/bncc';

const svgPlaceholderDataUri = (title: string) => {
  const safe = (title || 'Vídeo Aula').slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#005a93"/>
          <stop offset="1" stop-color="#0EA5E9"/>
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

export const VideoCourses = () => {
  const { getActivities, updateUserProgress, user, getSchoolYears } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const activities = getActivities();
  const videoActivities: Activity[] = activities.filter((a) => Boolean(a.video_url));

  const schoolYears = getSchoolYears();

  const getYearName = (yearId: string) => {
    const year = schoolYears.find(y => y.id === yearId);
    return year ? year.name : yearId;
  };

  const filteredVideos = filter === 'all'
    ? videoActivities
    : videoActivities.filter(v => v.schoolYears.includes(filter));

  const formatDuration = (minutes: number) => `${minutes} min`;

  const getVimeoId = (url: string) => {
    try {
      const u = new URL(url);
      const last = u.pathname.split('/').filter(Boolean).pop() || '';
      return last.replace(/\D/g, '') || last;
    } catch {
      const last = url.split('/').pop() || '';
      return last.split('?')[0];
    }
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
            Vídeo Aulas
          </h1>
          <p className="text-gray-600">
            Assista às aulas em vídeo organizadas por anos escolares
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Ano Escolar</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filter === 'all' ? { backgroundColor: '#005a93' } : {}}
            >
              Todos
            </button>
            {schoolYears.map((year) => (
              <button
                key={year.id}
                onClick={() => setFilter(year.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === year.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filter === year.id ? { backgroundColor: '#005a93' } : {}}
              >
                {year.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lista de Vídeos - Todos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Todas as Vídeo Aulas</h2>
        </motion.div>
        
        {filteredVideos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            Nenhuma vídeo aula cadastrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={video.thumbnail_url || svgPlaceholderDataUri(video.title)}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = svgPlaceholderDataUri(video.title);
                  }}
                />
                {/* Anos escolares sobre a miniatura */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-1 flex-wrap">
                  {video.schoolYears.map((yearId) => (
                    <span
                      key={yearId}
                      className="bg-white/90 text-gray-800 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium shadow-sm"
                    >
                      {getYearName(yearId)}
                    </span>
                  ))}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {video.schoolYears.map(getYearName).join(', ')}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {video.description}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (!video.video_url) return;
                      setSelectedVideo({ url: video.video_url, title: video.title });
                      if (user) updateUserProgress(user.id, video.id, false);
                    }}
                    className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors text-sm"
                  >
                    Assistir
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Favoritar
                  </button>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma vídeo aula encontrada
            </h3>
            <p className="text-gray-500">
              Tente selecionar um ano escolar diferente.
            </p>
          </motion.div>
        )}
      </div>

      {/* Video Viewer Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
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
              ) : selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.url.includes('youtu.be') ? selectedVideo.url.split('/').pop()?.split('?')[0] : selectedVideo.url.split('v=')[1]?.split('&')[0]}?autoplay=1`}
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