import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, CheckCircle, Lock, Clock, BookOpen, ChevronRight, FileQuestion, Link2, FileDown } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { Course, Lesson, ContentItem } from '../types/ead';

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
  const isAvaliacao = !!lessonId && lessonId.startsWith('avaliacao-');

  type PerguntaAv = { id: number; ordem: number; enunciado: string; opcoes: Record<string, string>; resposta_correta: string };
  const [avaliacaoPerguntas, setAvaliacaoPerguntas] = useState<PerguntaAv[]>([]);
  const [avaliacaoLoading, setAvaliacaoLoading] = useState(false);
  const [avaliacaoRespostas, setAvaliacaoRespostas] = useState<Record<number, string>>({});
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const [avaliacaoPontos, setAvaliacaoPontos] = useState<number | null>(null);

  // Estrutura agrupada: Módulo → Aula → (vídeos + avaliação quando M1, aulas 1-10)
  const { groupedByModuleAula, allContentItems } = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => {
      if (a.module !== b.module) return a.module === 'I' ? -1 : 1;
      const aOrd = (a as any).aula_ordem ?? 0;
      const bOrd = (b as any).aula_ordem ?? 0;
      if (aOrd !== bOrd) return aOrd - bOrd;
      return a.order_index - b.order_index;
    });
    type AulaGroup = { aula_id: string; aula_titulo: string; aula_ordem: number; items: ContentItem[] };
    type ModuloGroup = { moduloLabel: string; module: 'I' | 'II'; aulas: AulaGroup[] };
    const byMod: Record<string, Record<string, Lesson[]>> = { I: {}, II: {} };
    for (const l of sorted) {
      const aid = (l as any).aula_id || `legacy-${(l as any).aula_ordem ?? l.order_index}`;
      const mod = l.module || 'I';
      if (!byMod[mod][aid]) byMod[mod][aid] = [];
      byMod[mod][aid].push(l);
    }
    const grouped: ModuloGroup[] = [];
    const flat: ContentItem[] = [];
    (['I', 'II'] as const).forEach((mod) => {
      const aulas = Object.entries(byMod[mod] || {})
        .map(([aula_id, less]) => {
          const first = less[0] as any;
          const aula_ordem = first?.aula_ordem ?? 0;
          const aula_titulo = first?.aula_titulo || first?.title?.replace(/\s*\.?\s*$/, '') || 'Aula';
          const items: ContentItem[] = less.map((lesson) => ({ type: 'video', lesson }));
          // Incluir avaliação para as primeiras 10 aulas do Módulo I (ordem 0 a 9 no cadastro = Aula 01 a 10)
          const isM1Aulas1to10 = mod === 'I' && aula_ordem >= 0 && aula_ordem <= 9;
          if (isM1Aulas1to10) {
            items.push({
              type: 'avaliacao',
              aula_id,
              aula_titulo,
              id: `avaliacao-${aula_id}`,
            });
          }
          less.forEach((l) => flat.push({ type: 'video', lesson: l }));
          if (isM1Aulas1to10) flat.push({ type: 'avaliacao', aula_id, aula_titulo, id: `avaliacao-${aula_id}` });
          return { aula_id, aula_titulo, aula_ordem, items };
        })
        .sort((x, y) => x.aula_ordem - y.aula_ordem);
      const moduloLabel = mod === 'I' ? 'Módulo I' : 'Módulo II';
      grouped.push({ moduloLabel, module: mod, aulas });
    });
    return { groupedByModuleAula: grouped, allContentItems: flat };
  }, [lessons]);

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
    if (isAvaliacao && lessonId) {
      const aulaId = lessonId.replace(/^avaliacao-/, '');
      setAvaliacaoPerguntas([]);
      setAvaliacaoRespostas({});
      setAvaliacaoEnviada(false);
      setAvaliacaoPontos(null);
      setAvaliacaoLoading(true);
      eadApiService
        .getAvaliacao(aulaId)
        .then((r) => {
          if (!r.error && r.perguntas) {
            setAvaliacaoPerguntas(r.perguntas as PerguntaAv[]);
          }
        })
        .catch(() => setAvaliacaoPerguntas([]))
        .finally(() => setAvaliacaoLoading(false));
    }
  }, [isAvaliacao, lessonId]);

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
          const aOrd = (a as any).aula_ordem ?? 0;
          const bOrd = (b as any).aula_ordem ?? 0;
          if (aOrd !== bOrd) return aOrd - bOrd;
          return a.order_index - b.order_index;
        });
        setLessons(sortedLessons);
        // Pode ser um vídeo ou uma avaliação (id começando com "avaliacao-")
        if (lessonId?.startsWith('avaliacao-')) {
          const aulaId = lessonId.replace(/^avaliacao-/, '');
          const aulaNum = aulaId.match(/aula-0?(\d+)$/)?.[1] || '';
          setCurrentLesson({
            id: lessonId,
            title: `Avaliação - Aula ${aulaNum}`,
            description: null,
            video_url: null,
            video_duration: 0,
            thumbnail_url: null,
            order_index: -1,
            is_preview: false,
            module: 'I',
            resources: [],
            aula_id: aulaId,
            aula_titulo: `Aula ${aulaNum}`,
          } as Lesson);
        } else {
          let lesson = sortedLessons.find((l: Lesson) => l.id === lessonId);
          // Se não achou por id, pode ser que lessonId seja um aula_id (link antigo ou entrada por aula)
          if (!lesson && lessonId) {
            const firstVideoOfAula = sortedLessons.find((l: any) => l.aula_id === lessonId);
            if (firstVideoOfAula) {
              setLoading(false);
              navigate(`/curso/${courseId}/aula/${firstVideoOfAula.id}`, { replace: true });
              return;
            }
          }
          if (lesson) {
            setCurrentLesson(lesson);
            // Se este vídeo não tem URL mas existe outro no curso com URL, redirecionar para o primeiro disponível
            if (!lesson.video_url?.trim() && sortedLessons.length > 0) {
              const firstWithUrl = sortedLessons.find((l: any) => l.video_url?.trim());
              if (firstWithUrl && firstWithUrl.id !== lesson.id) {
                setLoading(false);
                navigate(`/curso/${courseId}/aula/${firstWithUrl.id}`, { replace: true });
                return;
              }
            }
          }
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
    if (currentIndex < 0 || currentIndex >= allContentItems.length - 1) return;
    const next = allContentItems[currentIndex + 1];
    const nextId = next.type === 'video' ? next.lesson.id : next.id;
    navigate(`/curso/${courseId}/aula/${nextId}`);
  };

  const getLessonStatus = (lesson: Lesson) => {
    const progress = lessonProgress[lesson.id];
    if (progress?.completed) return 'completed';
    if (progress?.watched > 0) return 'started';
    if (lesson.is_preview) return 'preview';
    return 'locked';
  };

  const getItemStatus = (item: ContentItem): 'completed' | 'started' | 'preview' | 'locked' => {
    if (item.type === 'avaliacao') {
      return lessonProgress[item.id]?.completed ? 'completed' : 'locked';
    }
    return getLessonStatus(item.lesson);
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

  const currentIndex = allContentItems.findIndex(
    (item) => (item.type === 'video' ? item.lesson.id : item.id) === lessonId
  );
  const currentItem = lessonId
    ? allContentItems.find((item) => (item.type === 'video' ? item.lesson.id : item.id) === lessonId)
    : null;

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
                {currentIndex >= 0 ? currentIndex + 1 : 0} / {allContentItems.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player - Lado Esquerdo */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 flex items-center justify-center relative group">
            {isAvaliacao ? (
              <div className="w-full max-w-2xl p-8 overflow-y-auto max-h-[calc(100vh-120px)]">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#044982]/20 text-[#044982] mb-6">
                  <FileQuestion className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {avaliacaoPerguntas.length > 0
                    ? (currentLesson?.aula_titulo === 'Aula 01'
                        ? 'Avaliação – Aula 01: Introdução e Contextualização da BNCC Computacional'
                        : `Avaliação – ${currentLesson?.aula_titulo || 'Aula'}`)
                    : 'Avaliação da Aula'}
                </h2>

                {avaliacaoLoading ? (
                  <p className="text-gray-400">Carregando avaliação...</p>
                ) : avaliacaoEnviada && avaliacaoPontos !== null ? (
                  <div className="text-left space-y-4">
                    <p className="text-lg text-gray-300">
                      Você acertou <strong className="text-white">{avaliacaoPontos}</strong> de{' '}
                      <strong className="text-white">{avaliacaoPerguntas.length}</strong> questões (
                      {avaliacaoPerguntas.length ? Math.round((avaliacaoPontos / avaliacaoPerguntas.length) * 100) : 0}%).
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        if (courseId && lessonId?.startsWith('avaliacao-')) {
                          try {
                            await eadApiService.updateProgress(courseId, lessonId, 0, 0, true);
                            setLessonProgress((prev) => ({ ...prev, [lessonId]: { watched: 0, completed: true } }));
                          } catch (e) {
                            console.error('Erro ao marcar avaliação:', e);
                          }
                        }
                        nextLesson();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#044982] to-[#005a93] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Continuar para o próximo
                    </button>
                  </div>
                ) : avaliacaoPerguntas.length > 0 ? (
                  <form
                    className="text-left space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      let acertos = 0;
                      avaliacaoPerguntas.forEach((p) => {
                        if (avaliacaoRespostas[p.id] === p.resposta_correta) acertos++;
                      });
                      setAvaliacaoPontos(acertos);
                      setAvaliacaoEnviada(true);
                    }}
                  >
                    {avaliacaoPerguntas.map((p, idx) => (
                      <div key={p.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <p className="font-medium text-white mb-3">
                          {idx + 1}. {p.enunciado}
                        </p>
                        <div className="space-y-2">
                          {(['A', 'B', 'C', 'D'] as const).map((letra) => (
                            <label
                              key={letra}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                                avaliacaoRespostas[p.id] === letra ? 'bg-[#044982]/30 border border-[#044982]' : 'hover:bg-white/5'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`pergunta-${p.id}`}
                                value={letra}
                                checked={avaliacaoRespostas[p.id] === letra}
                                onChange={() => setAvaliacaoRespostas((prev) => ({ ...prev, [p.id]: letra }))}
                                className="w-4 h-4 text-[#044982]"
                              />
                              <span className="text-gray-300">
                                ({letra}) {p.opcoes[letra]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#044982] to-[#005a93] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Enviar respostas
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="text-gray-400 mb-6">
                      Esta avaliação corresponde ao conteúdo assistido. Em breve você poderá responder às perguntas aqui.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        if (courseId && lessonId?.startsWith('avaliacao-')) {
                          try {
                            await eadApiService.updateProgress(courseId, lessonId, 0, 0, true);
                            setLessonProgress((prev) => ({ ...prev, [lessonId]: { watched: 0, completed: true } }));
                          } catch (e) {
                            console.error('Erro ao marcar avaliação:', e);
                          }
                        }
                        nextLesson();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#044982] to-[#005a93] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Continuar para o próximo
                    </button>
                  </>
                )}
              </div>
            ) : currentLesson.video_url ? (
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
              <div className="text-center p-8 max-w-md mx-auto">
                <p className="text-xl mb-2">Vídeo não disponível</p>
                <p className="text-gray-400 mb-4">{currentLesson?.title}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Este item ainda não tem link de vídeo. Cadastre a URL na gestão do curso (Formação Continuada) ou escolha outro vídeo na lista ao lado.
                </p>
                {(() => {
                  const aulaId = (currentLesson as any)?.aula_id;
                  const firstInAulaWithUrl = aulaId && lessons.find((l: any) => l.aula_id === aulaId && l.video_url?.trim());
                  const firstInCourseWithUrl = lessons.find((l: any) => l.video_url?.trim());
                  if (firstInAulaWithUrl) {
                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/curso/${courseId}/aula/${firstInAulaWithUrl.id}`)}
                        className="px-4 py-2 bg-[#044982]/80 text-white rounded-lg hover:bg-[#044982] transition text-sm"
                      >
                        Abrir primeiro vídeo desta aula
                      </button>
                    );
                  }
                  if (firstInCourseWithUrl) {
                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/curso/${courseId}/aula/${firstInCourseWithUrl.id}`)}
                        className="px-4 py-2 bg-[#044982]/80 text-white rounded-lg hover:bg-[#044982] transition text-sm"
                      >
                        Ir para o primeiro vídeo disponível do curso
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          {/* Lesson Info - Abaixo do Player (oculto na tela de avaliação) */}
          {!isAvaliacao && currentLesson && (
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
                {/* Links úteis e PDFs para download */}
                {(() => {
                  const links = (currentLesson as any).links_uteis as { label: string; url: string }[] | undefined;
                  const pdfs = (currentLesson as any).pdfs_download as { label: string; url: string }[] | undefined;
                  const hasLinks = Array.isArray(links) && links.length > 0;
                  const hasPdfs = Array.isArray(pdfs) && pdfs.length > 0;
                  if (!hasLinks && !hasPdfs) return null;
                  return (
                    <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {hasLinks && (
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#044982] mb-2">
                            <Link2 className="w-4 h-4" />
                            Links úteis
                          </div>
                          <ul className="space-y-1">
                            {links!.map((item, i) => (
                              <li key={i}>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-300 hover:text-blue-200 hover:underline truncate block"
                                >
                                  {item.label || item.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hasPdfs && (
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#044982] mb-2">
                            <FileDown className="w-4 h-4" />
                            Materiais para download
                          </div>
                          <ul className="space-y-1">
                            {pdfs!.map((item, i) => (
                              <li key={i}>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 hover:underline"
                                >
                                  {item.label || 'PDF'}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          )}
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
            {groupedByModuleAula.map((mod) => {
              const isModI = mod.module === 'I';
              const accent = isModI ? '#044982' : '#005a93';
              const totalInMod = mod.aulas.reduce((s, a) => s + a.items.length, 0);
              const completedInMod = mod.aulas.reduce(
                (s, a) =>
                  s +
                  a.items.filter((it) =>
                    it.type === 'video' ? lessonProgress[it.lesson.id]?.completed : lessonProgress[it.id]?.completed
                  ).length,
                0
              );
              return (
                <div key={mod.module} className={isModI ? 'mb-6' : ''}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1 h-6 rounded-full"
                        style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}99)` }}
                      />
                      <h4 className="font-bold" style={{ color: accent }}>
                        {mod.moduloLabel}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      {completedInMod} / {totalInMod} concluídas
                    </span>
                  </div>
                  {mod.aulas.map((aula) => {
                    const videoCount = aula.items.filter((i) => i.type === 'video').length;
                    const avaliacaoCount = aula.items.filter((i) => i.type === 'avaliacao').length;
                    return (
                    <div key={aula.aula_id} className="mb-4">
                      <div className="flex items-center justify-between mb-2 pl-1">
                        <span className="text-sm font-bold text-gray-300">{aula.aula_titulo}</span>
                        <span className="text-xs text-gray-500">
                          {videoCount} vídeo{videoCount !== 1 ? 's' : ''}
                          {avaliacaoCount > 0 ? ` · ${avaliacaoCount} avaliação` : ''}
                        </span>
                      </div>
                      <div className="space-y-2 pl-2 border-l-2 border-white/10">
                        {aula.items.map((item, idx) => {
                          const id = item.type === 'video' ? item.lesson.id : item.id;
                          const isActive = id === lessonId;
                          const status = getItemStatus(item);
                          const progress =
                            item.type === 'video' ? lessonProgress[item.lesson.id] : lessonProgress[item.id];
                          const title = item.type === 'video' ? item.lesson.title : `Avaliação - ${aula.aula_titulo}`;
                          const duration =
                            item.type === 'video' ? item.lesson.video_duration : 0;
                          return (
                            <motion.div key={id} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                              <Link
                                to={`/curso/${courseId}/aula/${id}`}
                                className={`block p-3 rounded-xl transition-all ${
                                  isActive
                                    ? 'bg-gradient-to-r from-[#044982] to-[#005a93] text-white shadow-lg shadow-[#044982]/30'
                                    : status === 'completed'
                                    ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/15'
                                    : status === 'started'
                                    ? 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : status === 'completed'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/10 text-gray-400'
                                    }`}
                                  >
                                    {item.type === 'avaliacao' ? (
                                      <FileQuestion className="w-4 h-4" />
                                    ) : status === 'completed' ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-medium text-sm line-clamp-1 ${
                                        isActive ? 'text-white' : 'text-gray-200'
                                      }`}
                                    >
                                      {title}
                                    </p>
                                    {item.type === 'video' && (
                                      <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className={isActive ? 'text-white/70' : 'text-gray-500'}>
                                          {duration > 0 ? formatDuration(duration) : '—'}
                                        </span>
                                        {progress && progress.watched > 0 && !progress.completed && duration > 0 && (
                                          <div className="flex-1 max-w-[80px] h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full"
                                              style={{
                                                width: `${Math.min(100, (progress.watched / duration) * 100)}%`,
                                                backgroundColor: accent,
                                              }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {isActive && <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />}
                                  {status === 'locked' && item.type === 'video' && !item.lesson.is_preview && (
                                    <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
