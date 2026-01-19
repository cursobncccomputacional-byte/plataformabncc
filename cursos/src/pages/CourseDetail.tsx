import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star, Play, CheckCircle, Lock } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { useEADAuth } from '../contexts/EADAuthContext';
import { Course, Lesson } from '../types/ead';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useEADAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
      if (isAuthenticated) {
        checkEnrollment();
      }
    }
  }, [id, isAuthenticated]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const response = await eadApiService.getCourse(id);
      if (!response.error && response.course) {
        setCourse(response.course);
        setLessons(response.lessons || []);
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await eadApiService.getMyCourses();
      if (!response.error && response.enrollments) {
        const isEnrolled = response.enrollments.some(
          (e: any) => e.course_id === id
        );
        setEnrolled(isEnrolled);
      }
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id) return;
    setEnrolling(true);
    try {
      const response = await eadApiService.enrollInCourse(id);
      if (!response.error) {
        setEnrolled(true);
        navigate(`/curso/${id}/aula/${lessons[0]?.id}`);
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#044982] text-xl">Carregando...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#044982] text-xl">Curso não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://novaedubncc.com.br/logo/Logo Nova Edu (Oficial)-10.png" 
                alt="Nova Edu" 
                className="h-12 w-auto"
              />
            </Link>
            <Link
              to="/cursos"
              className="text-[#044982] hover:text-[#005a93] transition font-medium"
            >
              ← Voltar aos Cursos
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-[#044982] to-[#005a93]">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold text-center px-4">
                  {course.title}
                </div>
              )}
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-4 text-[#044982]">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(course.total_duration / 60)} horas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled_count} alunos</span>
                </div>
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {course.instructor_name && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Instrutor</p>
                  <p className="font-semibold text-[#044982]">{course.instructor_name}</p>
                </div>
              )}

              <div className="flex gap-4">
                {enrolled ? (
                  <Link
                    to={`/curso/${id}/aula/${lessons[0]?.id}`}
                    className="bg-[#044982] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a93] transition flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Continuar Curso
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-[#044982] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a93] transition disabled:opacity-50"
                  >
                    {enrolling ? 'Inscrevendo...' : course.price > 0 ? `Inscrever-se - R$ ${course.price.toFixed(2)}` : 'Inscrever-se Gratuitamente'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-[#044982]">Conteúdo do Curso</h2>
          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const canAccess = enrolled || lesson.is_preview;
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    canAccess
                      ? 'border-[#044982] hover:bg-gray-50 cursor-pointer'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  {canAccess ? (
                    <Link
                      to={`/curso/${id}/aula/${lesson.id}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#044982] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#044982]">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {Math.floor(lesson.video_duration / 60)}:
                          {String(lesson.video_duration % 60).padStart(2, '0')}
                        </span>
                        {lesson.is_preview && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Preview
                          </span>
                        )}
                        <Play className="w-5 h-5 text-[#044982]" />
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">{lesson.title}</h3>
                        </div>
                      </div>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
