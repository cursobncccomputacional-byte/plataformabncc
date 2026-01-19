import { motion } from 'framer-motion';
import { Play, BookOpen, Award, Users, ArrowRight, TrendingUp, Star, CheckCircle, Menu, X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useEADAuth } from '../contexts/EADAuthContext';

export const Home = () => {
  const { isAuthenticated } = useEADAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats = [
    { number: '5K+', label: 'Cursos Online' },
    { number: '7K+', label: 'Estudantes por Ano' },
    { number: '24+', label: 'Prêmios Conquistados' },
  ];

  const testimonials = [
    {
      quote: 'A plataforma transformou completamente minha forma de aprender. Os cursos são completos e os professores excelentes.',
      name: 'Maria Silva',
      role: 'Professora de Tecnologia',
      rating: 5,
    },
    {
      quote: 'Consegui me especializar e crescer na minha carreira graças aos cursos disponíveis aqui.',
      name: 'João Santos',
      role: 'Desenvolvedor',
      rating: 5,
    },
  ];

  const categories = [
    { name: 'Tecnologia', courses: '120+ Cursos', color: 'from-blue-500 to-cyan-500' },
    { name: 'Educação', courses: '85+ Cursos', color: 'from-green-500 to-emerald-500' },
    { name: 'Negócios', courses: '65+ Cursos', color: 'from-purple-500 to-pink-500' },
    { name: 'Design', courses: '45+ Cursos', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-[#044982] transition font-medium">Início</Link>
              <Link to="/cursos" className="text-gray-700 hover:text-[#044982] transition font-medium">Cursos</Link>
              <Link to="/cursos" className="text-gray-700 hover:text-[#044982] transition font-medium">Sobre</Link>
              <Link to="/cursos" className="text-gray-700 hover:text-[#044982] transition font-medium">Blog</Link>
              <Link to="/cursos" className="text-gray-700 hover:text-[#044982] transition font-medium">Contato</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-[#044982] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#005a93] transition"
                >
                  Meus Cursos
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#044982] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#005a93] transition"
                >
                  Entrar / Cadastrar
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pb-4 space-y-2"
            >
              <Link to="/" className="block py-2 text-gray-700">Início</Link>
              <Link to="/cursos" className="block py-2 text-gray-700">Cursos</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="block py-2 text-[#044982] font-semibold">Meus Cursos</Link>
              ) : (
                <Link to="/login" className="block py-2 text-[#044982] font-semibold">Entrar</Link>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#044982] via-[#005a93] to-[#044982] text-white py-20 overflow-hidden min-h-[600px] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/video-ead-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#044982]/70 via-[#005a93]/60 to-[#044982]/70"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Desenvolvendo Pensamentos para o Futuro
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Transforme sua carreira com nossos cursos online de alta qualidade. 
                Aprenda no seu ritmo, com professores especialistas e conteúdo atualizado.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/cursos"
                  className="bg-white text-[#044982] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
                >
                  Explorar Cursos <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center hover:bg-white/30 transition">
                  <Play className="w-6 h-6 ml-1" />
                </button>
              </div>
              
              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold">120+</p>
                  <p className="text-gray-300">Instrutores</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/video-ead-hero.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-8 font-medium">Confiado por Instituições em Todo o Brasil</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Nova Edu', 'BNCC', 'Educação', 'Tecnologia', 'Inovação'].map((name, i) => (
              <div key={i} className="text-2xl font-bold text-gray-400">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-[#044982]">
                Potencialize Sua Jornada de Aprendizado
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Oferecemos uma plataforma completa de ensino a distância com cursos de alta qualidade, 
                professores especialistas e suporte dedicado. Nossa missão é democratizar o acesso à 
                educação de qualidade.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-4xl font-bold text-[#044982] mb-2">{stat.number}</p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/cursos"
                className="inline-block bg-[#044982] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#005a93] transition"
              >
                Ver Mais Detalhes
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#044982] to-[#005a93] rounded-2xl p-6 text-white">
                  <Award className="w-12 h-12 mb-4" />
                  <p className="text-2xl font-bold mb-2">25 Anos</p>
                  <p className="text-gray-200">de Experiência</p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-6">
                  <Users className="w-12 h-12 mb-4 text-[#044982]" />
                  <p className="text-2xl font-bold mb-2 text-[#044982]">10K+</p>
                  <p className="text-gray-600">Alunos Ativos</p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-6 col-span-2">
                  <TrendingUp className="w-12 h-12 mb-4 text-[#044982]" />
                  <p className="text-2xl font-bold mb-2 text-[#044982]">98%</p>
                  <p className="text-gray-600">Taxa de Satisfação</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#044982]">
            O Que Nossos Estudantes Dizem
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="text-6xl text-[#044982] opacity-20 mb-4">"</div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#044982]">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#044982]">
            Por Que Escolher a Nova Edu EAD?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Play, title: 'Aulas Gravadas', description: 'Assista quando e onde quiser, no seu ritmo' },
              { icon: BookOpen, title: 'Conteúdo Completo', description: 'Materiais e recursos para aprofundar seu aprendizado' },
              { icon: Award, title: 'Certificado', description: 'Receba certificado ao concluir o curso' },
              { icon: Users, title: 'Comunidade', description: 'Conecte-se com outros alunos e instrutores' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#044982] to-[#005a93] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#044982]">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-gradient-to-br from-[#044982] to-[#005a93] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Nossas Categorias Populares
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white hover:scale-105 transition cursor-pointer`}
              >
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-white/80 mb-4">{category.courses}</p>
                <Link
                  to="/cursos"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
                >
                  Explorar <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-[#044982]">
            Pronto para Começar Sua Jornada?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore nossos cursos e transforme seu futuro hoje mesmo.
          </p>
          <Link
            to="/cursos"
            className="inline-block bg-[#044982] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#005a93] transition text-lg"
          >
            Ver Todos os Cursos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#044982] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/nova-edu-ead-branco.png" 
                  alt="Nova Edu EAD Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-300">
                Transformando vidas através da educação online de qualidade.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/" className="hover:text-white transition">Início</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">Cursos</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">Sobre</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/cursos" className="hover:text-white transition">Central de Ajuda</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">Política de Privacidade</Link></li>
                <li><Link to="/cursos" className="hover:text-white transition">Termos de Uso</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Email: contato@novaedu.com.br</li>
                <li>Telefone: (00) 0000-0000</li>
                <li>Endereço: Brasil</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Nova Edu EAD. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
