import { motion } from 'framer-motion';
import { Play, BookOpen, Award, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEADAuth } from '../contexts/EADAuthContext';

export const Home = () => {
  const { isAuthenticated } = useEADAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#044982] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Nova Edu EAD</div>
          <nav className="flex gap-6">
            <Link to="/cursos" className="hover:text-[#005a93] transition">
              Cursos
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="hover:text-[#005a93] transition">
                Meus Cursos
              </Link>
            ) : (
              <Link to="/login" className="hover:text-[#005a93] transition">
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#044982] to-[#005a93] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Ensino Online com Sua Identidade
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Aprenda no seu ritmo com cursos gravados de alta qualidade.
            Transforme seu conhecimento em resultados.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <Link
              to="/cursos"
              className="bg-white text-[#044982] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              Explorar Cursos <ArrowRight className="w-5 h-5" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#044982] transition"
              >
                Começar Agora
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#044982]">
            Por que escolher a Nova Edu EAD?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Play,
                title: 'Aulas Gravadas',
                description: 'Assista quando e onde quiser, no seu ritmo',
              },
              {
                icon: BookOpen,
                title: 'Conteúdo Completo',
                description: 'Materiais e recursos para aprofundar seu aprendizado',
              },
              {
                icon: Award,
                title: 'Certificado',
                description: 'Receba certificado ao concluir o curso',
              },
              {
                icon: Users,
                title: 'Comunidade',
                description: 'Conecte-se com outros alunos e instrutores',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-[#044982]" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#044982] text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8">
            Explore nossos cursos e transforme seu futuro hoje mesmo.
          </p>
          <Link
            to="/cursos"
            className="bg-white text-[#044982] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Ver Todos os Cursos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Nova Edu. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
