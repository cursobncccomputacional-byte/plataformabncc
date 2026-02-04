import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Users, Star, Search, ChevronLeft, ChevronRight, Play, Lock, Sparkles, Zap } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { Course } from '../types/ead';
import { useEADAuth } from '../contexts/EADAuthContext';
import { formatDurationFromMinutes } from '../utils/formatDuration';

export const Courses = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const { isAuthenticated } = useEADAuth();
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const param = searchParams.get('search') || '';
    setSearch((prev) => (prev === param ? prev : param));
  }, [searchParams]);

  const loadCourses = async () => {
    try {
      const response = await eadApiService.getPublicCourses();
      if (!response.error && response.courses) {
        setCourses(response.courses);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar cursos por categoria
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    const category = course.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {} as { [key: string]: Course[] });

  const scroll = (category: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#044982] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Carregando cursos...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#044982]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#005a93]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#044982]/5 to-[#005a93]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header com Glassmorphism */}
      <motion.header
        style={{ opacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src="https://novaedubncc.com.br/logo/Logo%20Nova%20Edu%20(Oficial)-10.png"
                alt="Nova Edu"
                className="h-12 w-auto filter brightness-110"
              />
            </Link>
            <div className="flex items-center gap-4">
              {/* Search Bar com Glassmorphism */}
              <div className="relative hidden md:block">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    type="text"
                    placeholder="Buscar cursos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 backdrop-blur-md border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#044982] focus:ring-2 focus:ring-[#044982]/50 w-80 transition-all placeholder:text-gray-500"
                  />
                </motion.div>
              </div>
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition font-medium px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 pt-32 relative z-10">
        {/* Hero Section Moderna */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Formação Continuada
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
            Explore nossa seleção completa de cursos online e transforme sua carreira profissional
          </p>

          {/* Mobile Search */}
          <div className="mt-8 md:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-[#044982] focus:ring-2 focus:ring-[#044982]/50 placeholder:text-gray-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Courses by Category - Design Ultra Moderno */}
        {Object.keys(coursesByCategory).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-2xl">Nenhum curso encontrado.</p>
          </motion.div>
        ) : (
          Object.entries(coursesByCategory).map(([category, categoryCourses], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="mb-16 group/category"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 bg-gradient-to-b from-[#044982] to-[#005a93] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">{category}</h2>
                  <span className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300">
                    {categoryCourses.length} {categoryCourses.length === 1 ? 'curso' : 'cursos'}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/category:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => scroll(category, 'left')}
                    className="p-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full transition"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => scroll(category, 'right')}
                    className="p-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full transition"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative">
                <div
                  ref={(el) => (scrollRefs.current[category] = el)}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {categoryCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0 w-72 md:w-80 group/card"
                    >
                      <Link to={`/curso/${course.id}`}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#044982]/50 transition-all duration-300 cursor-pointer shadow-2xl"
                        >
                          {/* Thumbnail com Overlay Gradiente */}
                          <div className="relative h-56 bg-gradient-to-br from-[#044982] to-[#005a93] overflow-hidden">
                            {course.thumbnail_url ? (
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold text-center px-4">
                                {course.title}
                              </div>
                            )}
                            {/* Gradiente Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            
                            {/* Badge de Destaque */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileHover={{ opacity: 1, x: 0 }}
                              className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-[#044982] to-[#005a93] rounded-full text-xs font-bold text-white backdrop-blur-md"
                            >
                              NOVO
                            </motion.div>

                            {/* Overlay com Botão no Hover */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
                            >
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 shadow-xl"
                              >
                                <Play className="w-5 h-5 fill-black" />
                                Ver Detalhes
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Info Card */}
                          <div className="p-5 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
                            <h3 className="text-lg font-bold mb-3 line-clamp-2 text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-[#044982] group-hover/card:to-[#005a93] transition-all duration-300">
                              {course.title}
                            </h3>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatDurationFromMinutes(course.total_duration)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                                <Users className="w-3.5 h-3.5" />
                                <span>{course.enrolled_count}</span>
                              </div>
                              {course.rating > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded-lg text-yellow-400">
                                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                  <span>{course.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>

                            {/* Progress Bar (se aplicável) */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Disponível</span>
                                <span className="text-[#044982] font-semibold">100%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: '100%' }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className="h-full bg-gradient-to-r from-[#044982] to-[#005a93] rounded-full"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#044982]/0 via-[#044982]/20 to-[#044982]/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Fallback Grid se não houver categorias */}
        {Object.keys(coursesByCategory).length === 0 && filteredCourses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/curso/${course.id}`}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#044982]/50 transition-all duration-300 shadow-2xl"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-[#044982] to-[#005a93]">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold text-center px-4">
                          {course.title}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="bg-white text-black px-4 py-2 rounded-full font-semibold text-center">
                            Ver Detalhes
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#044982] group-hover:to-[#005a93] transition-all">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDurationFromMinutes(course.total_duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.enrolled_count}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Inscrição Moderno */}
      {showEnrollModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEnrollModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center shadow-lg">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Solicitar Acesso</h3>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Entre em contato com a Secretaria de Educação do seu Município para liberação deste curso.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEnrollModal(false)}
              className="w-full bg-gradient-to-r from-[#044982] to-[#005a93] text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Entendi
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
