import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle, LogOut } from 'lucide-react';
import { eadApiService } from '../services/eadApiService';
import { useEADAuth } from '../contexts/EADAuthContext';
import { Enrollment } from '../types/ead';

export const Dashboard = () => {
  const { user, logout, isRoot } = useEADAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const response = await eadApiService.getMyCourses();
      if (!response.error && response.enrollments) {
        setEnrollments(response.enrollments);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-4">
              {isRoot && (
                <Link
                  to="/admin/usuarios"
                  className="flex items-center gap-2 bg-[#044982] text-white px-4 py-2 rounded-lg hover:bg-[#005a93] transition"
                >
                  <span>Gestão de Usuários</span>
                </Link>
              )}
              <span className="text-gray-700">Olá, <span className="font-semibold text-[#044982]">{user?.name}</span></span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-700 hover:text-[#044982] transition px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[#044982]">Meus Cursos</h1>
          <p className="text-xl text-gray-600">Continue de onde parou e alcance seus objetivos</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-[#044982] text-xl">Carregando...</div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-xl mb-4">Você ainda não está inscrito em nenhum curso.</p>
            <Link
              to="/cursos"
              className="inline-block bg-[#044982] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a93] transition"
            >
              Explorar Cursos
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#044982] to-[#005a93]">
                  {enrollment.thumbnail_url ? (
                    <img
                      src={enrollment.thumbnail_url}
                      alt={enrollment.course_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold text-center px-4">
                      {enrollment.course_title}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#044982] h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                    <p className="text-white text-xs mt-1">
                      {enrollment.progress_percentage.toFixed(0)}% concluído
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#044982]">
                    {enrollment.course_title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{enrollment.total_duration ? Math.floor(enrollment.total_duration / 60) : 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{enrollment.total_lessons || 0} aulas</span>
                    </div>
                  </div>
                  <Link
                    to={`/curso/${enrollment.course_id}`}
                    className="block w-full bg-[#044982] text-white text-center py-2 rounded-lg font-semibold hover:bg-[#005a93] transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Continuar
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
