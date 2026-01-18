import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, CheckCircle } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { Course, Lesson } from '../types/ead';

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

  useEffect(() => {
    if (courseId && lessonId) {
      loadCourse();
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (currentLesson && videoRef.current) {
      loadProgress();
    }
  }, [currentLesson]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const current = Math.floor(video.currentTime);
      const total = Math.floor(video.duration);
      if (total > 0) {
        setProgress((current / total) * 100);
        setWatchedSeconds(current);
        
        // Salvar progresso a cada 10 segundos
        if (current % 10 === 0 && courseId && lessonId) {
          saveProgress(current, total, current >= total * 0.9);
        }
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', () => {
      if (courseId && lessonId) {
        saveProgress(Math.floor(video.duration), Math.floor(video.duration), true);
      }
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
    };
  }, [currentLesson, courseId, lessonId]);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      const response = await eadApiService.getCourse(courseId);
      if (!response.error && response.course) {
        setCourse(response.course);
        setLessons(response.lessons || []);
        const lesson = response.lessons?.find((l: Lesson) => l.id === lessonId);
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

  const loadProgress = async () => {
    if (!courseId || !lessonId) return;
    try {
      const response = await eadApiService.getProgress(courseId);
      if (!response.error && response.progress) {
        const lessonProgress = response.progress.find(
          (p: any) => p.lesson_id === lessonId
        );
        if (lessonProgress && videoRef.current) {
          videoRef.current.currentTime = lessonProgress.watched_seconds;
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
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Aula não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 p-4 flex items-center justify-between">
        <Link
          to={`/curso/${courseId}`}
          className="flex items-center gap-2 text-white hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{course.title}</span>
        </Link>
        <div className="text-sm text-gray-400">
          {lessons.findIndex(l => l.id === lessonId) + 1} / {lessons.length}
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {currentLesson.video_url ? (
              <video
                ref={videoRef}
                src={currentLesson.video_url}
                className="w-full h-full"
                controls
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <div className="text-center">
                <p className="text-xl mb-4">Vídeo não disponível</p>
                <p className="text-gray-400">{currentLesson.title}</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
            {currentLesson.description && (
              <p className="text-gray-400">{currentLesson.description}</p>
            )}
          </div>
        </div>

        {/* Sidebar - Lessons List */}
        <div className="w-80 bg-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Conteúdo do Curso</h3>
          </div>
          <div className="p-2">
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === lessonId;
              return (
                <Link
                  key={lesson.id}
                  to={`/curso/${courseId}/aula/${lesson.id}`}
                  className={`block p-3 rounded-lg mb-2 transition ${
                    isActive
                      ? 'bg-[#044982] text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lesson.title}</p>
                        <p className="text-xs opacity-75">
                          {Math.floor(lesson.video_duration / 60)}:
                          {String(lesson.video_duration % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
