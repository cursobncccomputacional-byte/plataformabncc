import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, CheckCircle, Lock, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { Course, Lesson } from '../types/ead';

type VideoType = 'youtube' | 'vimeo' | 'drive' | 'direct' | 'unknown';

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '') || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}

function getVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('vimeo.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last && /^\d+$/.test(last) ? last : null;
  } catch {
    return null;
  }
}

function getGoogleDriveFileId(url: string): string | null {
  const m1 = url.match(/\/file\/d\/([^/]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2?.[1]) return m2[1];
  return null;
}

function detectVideoType(url: string): VideoType {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.includes('drive.google.com')) return 'drive';
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.ogg')) return 'direct';
  return 'unknown';
}

function getEmbedUrl(url: string): { type: VideoType; embedUrl: string | null } {
  const type = detectVideoType(url);
  if (type === 'youtube') {
    const id = getYouTubeId(url);
    return { type, embedUrl: id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null };
  }
  if (type === 'vimeo') {
    const id = getVimeoId(url);
    return { type, embedUrl: id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null };
  }
  if (type === 'drive') {
    const id = getGoogleDriveFileId(url);
    return { type, embedUrl: id ? `https://drive.google.com/file/d/${id}/preview` : null };
  }
  if (type === 'direct') {
    return { type, embedUrl: url };
  }
  return { type, embedUrl: null };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export const Player = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: { watched: number; completed: boolean } }>({});
  const videoInfo = getEmbedUrl(currentLesson?.video_url || '');
  const isDirectVideo = !!currentLesson?.video_url && videoInfo.type === 'direct' && !!videoInfo.embedUrl;

  useEffect(() => {
    if (courseId && lessonId) {
      loadCourse();
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (courseId) {
      loadAllProgress();
    }
  }, [courseId]);

  useEffect(() => {
    if (currentLesson && isDirectVideo && videoRef.current) {
      loadProgress();
    }
  }, [currentLesson, isDirectVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo) return;

    const updateProgress = () => {
      const current = Math.floor(video.currentTime);
      const total = Math.floor(video.duration);
      if (total > 0) {
        setProgress((current / total) * 100);
        setWatchedSeconds(current);
        
        if (current % 10 === 0 && courseId && lessonId) {
          saveProgress(current, total, current >= total * 0.9);
        }
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', () => {
      if (courseId && lessonId) {
        saveProgress(Math.floor(video.duration), Math.floor(video.duration), true);
        if (lessonId) {
          setLessonProgress(prev => ({
            ...prev,
            [lessonId]: { watched: Math.floor(video.duration), completed: true }
          }));
        }
      }
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
    };
  }, [currentLesson, courseId, lessonId, isDirectVideo]);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      const response = await eadApiService.getCourse(courseId);
      if (!response.error && response.course) {
        setCourse(response.course);
        const sortedLessons = (response.lessons || []).sort((a: Lesson, b: Lesson) => {
          if (a.module !== b.module) {
            return a.module === 'I' ? -1 : 1;
          }
          return a.order_index - b.order_index;
        });
        setLessons(sortedLessons);
        const lesson = sortedLessons.find((l: Lesson) => l.id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProgress = async () => {
    if (!courseId) return;
    try {
      const response = await eadApiService.getProgress(courseId);
      if (!response.error && response.progress) {
        const progressMap: { [key: string]: { watched: number; completed: boolean } } = {};
        response.progress.forEach((p: any) => {
          progressMap[p.lesson_id] = {
            watched: p.watched_seconds,
            completed: p.is_completed
          };
        });
        setLessonProgress(progressMap);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const loadProgress = async () => {
    if (!courseId || !lessonId) return;
    try {
      const response = await eadApiService.getProgress(courseId);
      if (!response.error && response.progress) {
        const lp = response.progress.find((p: any) => p.lesson_id === lessonId);
        if (lp && videoRef.current) {
          videoRef.current.currentTime = lp.watched_seconds;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const saveProgress = async (watched: number, total: number, isCompleted: boolean) => {
    if (!courseId || !lessonId) return;
    try {
      await eadApiService.updateProgress(courseId, lessonId, watched, total, isCompleted);
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: { watched, completed: isCompleted }
      }));
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const togglePlay = () => {
    if (isDirectVideo && videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const nextLesson = () => {
    if (!lessons || !currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      navigate(`/curso/${courseId}/aula/${lessons[currentIndex + 1].id}`);
    }
  };

  const getLessonStatus = (lesson: Lesson) => {
    const progress = lessonProgress[lesson.id];
    if (progress?.completed) return 'completed';
    if (progress?.watched > 0) return 'started';
    if (lesson.is_preview) return 'preview';
    return 'locked';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#044982] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
        <div className="text-white text-xl">Aula não encontrada</div>
      </div>
    );
  }

  const allLessons = [...lessons].sort((a, b) => {
    if (a.module !== b.module) {
      return a.module === 'I' ? -1 : 1;
    }
    return a.order_index - b.order_index;
  });
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white">
      {/* Header Moderno */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/curso/${courseId}`}
              className="flex items-center gap-3 text-white hover:text-[#044982] transition group"
            >
              <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              <span className="font-semibold group-hover:underline">{course.title}</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
              <span className="text-sm text-gray-300">
                {currentIndex + 1} / {allLessons.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player - Lado Esquerdo */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 flex items-center justify-center relative group">
            {currentLesson.video_url ? (
              videoInfo.type === 'direct' && videoInfo.embedUrl ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={videoInfo.embedUrl}
                    className="w-full h-full"
                    controls
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  />
                </div>
              ) : videoInfo.embedUrl ? (
                <iframe
                  title={currentLesson.title}
                  src={videoInfo.embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-xl mb-3">Não foi possível carregar este vídeo</p>
                  <p className="text-gray-400 break-all mb-4">{currentLesson.video_url}</p>
                  <a
                    href={currentLesson.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-gradient-to-r from-[#044982] to-[#005a93] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Abrir em nova aba
                  </a>
                </div>
              )
            ) : (
              <div className="text-center">
                <p className="text-xl mb-4">Vídeo não disponível</p>
                <p className="text-gray-400">{currentLesson.title}</p>
              </div>
            )}
          </div>

          {/* Lesson Info - Abaixo do Player */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-t border-white/10 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#044982]/20 text-[#044982] rounded-lg text-sm font-bold border border-[#044982]/30">
                      {currentLesson.module === 'I' ? 'Módulo I' : 'Módulo II'}
                    </span>
                    {currentLesson.is_preview && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold border border-green-500/30">
                        Preview
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentLesson.title}</h2>
                  {currentLesson.description && (
                    <p className="text-gray-400 leading-relaxed">{currentLesson.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(currentLesson.video_duration)}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar - Conteúdo do Curso - Lado Direito */}
        <div className="w-96 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
          <div className="p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#044982]" />
              <h3 className="font-bold text-lg">Conteúdo do Curso</h3>
            </div>
          </div>
          
          <div className="p-4">
            {(() => {
              const moduleI = lessons.filter(l => l.module === 'I');
              const moduleII = lessons.filter(l => l.module === 'II');
              let lessonCounter = 0;

              return (
                <>
                  {/* Módulo I */}
                  {moduleI.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-[#044982] to-[#005a93] rounded-full"></div>
                          <h4 className="font-bold text-[#044982]">Módulo I</h4>
                        </div>
                        <span className="text-xs text-gray-500">
                          {moduleI.filter(l => lessonProgress[l.id]?.completed).length} / {moduleI.length} concluídas
                        </span>
                      </div>
                      <div className="space-y-2">
                        {moduleI.map((lesson) => {
                          lessonCounter++;
                          const isActive = lesson.id === lessonId;
                          const status = getLessonStatus(lesson);
                          const progress = lessonProgress[lesson.id];
                          
                          return (
                            <motion.div
                              key={lesson.id}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                to={`/curso/${courseId}/aula/${lesson.id}`}
                                className={`block p-4 rounded-xl transition-all ${
                                  isActive
                                    ? 'bg-gradient-to-r from-[#044982] to-[#005a93] text-white shadow-lg shadow-[#044982]/30'
                                    : status === 'completed'
                                    ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
                                    : status === 'started'
                                    ? 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : status === 'completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-white/10 text-gray-400'
                                  }`}>
                                    {status === 'completed' ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : (
                                      lessonCounter
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm mb-1 line-clamp-2 ${
                                      isActive ? 'text-white' : 'text-gray-200'
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className={isActive ? 'text-white/70' : 'text-gray-500'}>
                                        {formatDuration(lesson.video_duration)}
                                      </span>
                                      {progress && progress.watched > 0 && !progress.completed && (
                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-[#044982] rounded-full"
                                            style={{ width: `${(progress.watched / lesson.video_duration) * 100}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {isActive && (
                                    <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                                  )}
                                  {status === 'locked' && !lesson.is_preview && (
                                    <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Módulo II */}
                  {moduleII.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-[#005a93] to-[#044982] rounded-full"></div>
                          <h4 className="font-bold text-[#005a93]">Módulo II</h4>
                        </div>
                        <span className="text-xs text-gray-500">
                          {moduleII.filter(l => lessonProgress[l.id]?.completed).length} / {moduleII.length} concluídas
                        </span>
                      </div>
                      <div className="space-y-2">
                        {moduleII.map((lesson) => {
                          lessonCounter++;
                          const isActive = lesson.id === lessonId;
                          const status = getLessonStatus(lesson);
                          const progress = lessonProgress[lesson.id];
                          
                          return (
                            <motion.div
                              key={lesson.id}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                to={`/curso/${courseId}/aula/${lesson.id}`}
                                className={`block p-4 rounded-xl transition-all ${
                                  isActive
                                    ? 'bg-gradient-to-r from-[#005a93] to-[#044982] text-white shadow-lg shadow-[#005a93]/30'
                                    : status === 'completed'
                                    ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
                                    : status === 'started'
                                    ? 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : status === 'completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-white/10 text-gray-400'
                                  }`}>
                                    {status === 'completed' ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : (
                                      lessonCounter
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm mb-1 line-clamp-2 ${
                                      isActive ? 'text-white' : 'text-gray-200'
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className={isActive ? 'text-white/70' : 'text-gray-500'}>
                                        {formatDuration(lesson.video_duration)}
                                      </span>
                                      {progress && progress.watched > 0 && !progress.completed && (
                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-[#005a93] rounded-full"
                                            style={{ width: `${(progress.watched / lesson.video_duration) * 100}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {isActive && (
                                    <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                                  )}
                                  {status === 'locked' && !lesson.is_preview && (
                                    <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
