import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Clock, CheckCircle, LogOut, Lock, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { useEADAuth } from '../contexts/EADAuthContext';
import { Course, Enrollment } from '../types/ead';

export const Dashboard = () => {
  const { user, logout, isRoot } = useEADAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lockedCourses, setLockedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const [myResp, publicResp] = await Promise.all([
        eadApiService.getMyCourses(),
        eadApiService.getPublicCourses(),
      ]);

      if (!myResp.error && myResp.enrollments) {
        setEnrollments(myResp.enrollments);
      } else {
        setEnrollments([]);
      }

      const publicCourses = (publicResp.courses || []) as Course[];
      const enrolledIds = new Set((myResp.enrollments || []).map((e: any) => String(e.course_id)));
      const locked = publicCourses.filter((c) => !enrolledIds.has(String(c.id)));
      setLockedCourses(locked);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const totalProgress = enrollments.reduce((acc, e) => acc + e.progress_percentage, 0) / (enrollments.length || 1);
  const totalHours = enrollments.reduce((acc, e) => acc + (e.total_duration || 0), 0);
  const totalLessons = enrollments.reduce((acc, e) => acc + (e.total_lessons || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#044982]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#005a93]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#044982]/5 to-[#005a93]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header com Glassmorphism */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src="https://novaedubncc.com.br/logo/Logo Nova Edu (Oficial)-10.png"
                alt="Nova Edu"
                className="h-12 w-auto filter brightness-110"
              />
            </Link>
            <div className="flex items-center gap-4">
              {isRoot && (
                <Link
                  to="/admin/usuarios"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#044982] to-[#005a93] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <span>Gestão de Usuários</span>
                </Link>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
                <span className="text-gray-300">Olá,</span>
                <span className="font-bold text-white bg-gradient-to-r from-[#044982] to-[#005a93] bg-clip-text text-transparent">
                  {user?.name}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-12 pt-32 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center shadow-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
                Meus Cursos
              </h1>
              <p className="text-xl text-gray-300 mt-2">Continue de onde parou e alcance seus objetivos</p>
            </div>
          </div>

          {/* Stats Cards */}
          {enrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{totalProgress.toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">Progresso Médio</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{Math.floor(totalHours / 60)}h</div>
                    <div className="text-sm text-gray-400">Total de Horas</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{totalLessons}</div>
                    <div className="text-sm text-gray-400">Aulas Disponíveis</div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#044982] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl font-semibold">Carregando...</div>
          </div>
        ) : enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-3xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-[#044982] to-[#005a93] rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            <p className="text-gray-300 text-xl mb-6">Você ainda não está inscrito em nenhum curso.</p>
            <Link
              to="/cursos"
              className="inline-block bg-gradient-to-r from-[#044982] to-[#005a93] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Explorar Cursos
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Meus Cursos - Grid Moderno */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-[#044982] to-[#005a93] rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Em Andamento</h2>
                <span className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300">
                  {enrollments.length} {enrollments.length === 1 ? 'curso' : 'cursos'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#044982]/50 transition-all duration-300 shadow-2xl">
                      {/* Thumbnail */}
                      <div className="relative h-56 bg-gradient-to-br from-[#044982] to-[#005a93] overflow-hidden">
                        {enrollment.thumbnail_url ? (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            src={enrollment.thumbnail_url}
                            alt={enrollment.course_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold text-center px-4">
                            {enrollment.course_title}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        
                        {/* Progress Bar Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                          <div className="flex items-center justify-between text-xs text-white mb-2">
                            <span className="font-semibold">Progresso</span>
                            <span className="font-bold">{enrollment.progress_percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${enrollment.progress_percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-[#044982] to-[#005a93] rounded-full shadow-lg"
                            />
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                          <Link to={`/curso/${enrollment.course_id}`}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 shadow-xl"
                            >
                              <Play className="w-5 h-5 fill-black" />
                              Continuar
                            </motion.div>
                          </Link>
                        </motion.div>
                      </div>

                      {/* Info */}
                      <div className="p-6 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#044982] group-hover:to-[#005a93] transition-all">
                          {enrollment.course_title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span>{enrollment.total_duration ? Math.floor(enrollment.total_duration / 60) : 0}h</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span>{enrollment.total_lessons || 0} aulas</span>
                          </div>
                        </div>
                        <Link
                          to={`/curso/${enrollment.course_id}`}
                          className="block w-full bg-gradient-to-r from-[#044982] to-[#005a93] text-white text-center py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Continuar Curso
                        </Link>
                      </div>

                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#044982]/0 via-[#044982]/20 to-[#044982]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cursos Bloqueados - Estilo Moderno */}
            {lockedCourses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-10 bg-gradient-to-b from-[#044982] to-[#005a93] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Outros Cursos</h2>
                  <span className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300">
                    {lockedCourses.length} {lockedCourses.length === 1 ? 'curso' : 'cursos'}
                  </span>
                </div>
                <p className="text-gray-400 mb-6 text-lg">
                  Cursos publicados no sistema, mas ainda não liberados para o seu usuário.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedCourses.slice(0, 6).map((c, index) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-gray-500/50 transition-all duration-300 opacity-90 hover:opacity-100">
                        <div className="relative h-48 bg-gradient-to-br from-[#044982] to-[#005a93]">
                          {c.thumbnail_url ? (
                            <img
                              src={c.thumbnail_url}
                              alt={c.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold text-center px-4">
                              {c.title}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60"></div>
                          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold border border-white/20">
                            <Lock className="w-4 h-4" />
                            Bloqueado
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
                          <h3 className="text-xl font-bold mb-2 text-white line-clamp-2">{c.title}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {c.description || 'Solicite ao administrador para liberar este curso.'}
                          </p>
                          <button
                            type="button"
                            disabled
                            className="block w-full bg-gray-800/50 text-gray-400 text-center py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 border border-gray-700/50"
                            title="Solicite ao administrador para liberar"
                          >
                            <Lock className="w-4 h-4" />
                            Solicitar acesso
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {lockedCourses.length > 6 && (
                  <div className="mt-6 text-center">
                    <Link
                      to="/cursos"
                      className="inline-flex items-center gap-2 text-[#044982] font-bold hover:text-[#005a93] transition text-lg"
                    >
                      Ver catálogo completo
                      <Sparkles className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
