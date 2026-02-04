import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronDown,
  Cpu,
  GraduationCap,
  Menu,
  Search,
  Sparkles,
  X,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useEADAuth } from '../contexts/EADAuthContext';
import { eadApiService } from '../services/eadApiService';
import { Course } from '../types/ead';
import { formatDurationFromMinutes } from '../utils/formatDuration';

export const Home = () => {
  const { isAuthenticated } = useEADAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lockedCourses, setLockedCourses] = useState<Course[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const trilhas = [
    {
      key: 'bncc',
      title: 'BNCC Computacional',
      description: 'Entenda a BNCC e transforme em prática de sala.',
      icon: Cpu,
      search: 'BNCC',
    },
    {
      key: 'ferramentas',
      title: 'Ferramentas Digitais',
      description: 'Padlet, Kahoot, Genially e mais.',
      icon: BookOpen,
      search: 'Ferramentas',
    },
    {
      key: 'windows-office',
      title: 'Produtividade (Windows/Office)',
      description: 'Domine recursos para o dia a dia do professor.',
      icon: GraduationCap,
      search: 'Office',
    },
    {
      key: 'google',
      title: 'Google para Educação',
      description: 'Drive, Docs, Classroom e rotinas de sala.',
      icon: BookOpen,
      search: 'Google',
    },
    {
      key: 'scratch',
      title: 'Scratch para Educadores',
      description: 'Criatividade e lógica com programação visual.',
      icon: Brain,
      search: 'Scratch',
    },
    {
      key: 'ia',
      title: 'IA para Professores',
      description: 'Planejamento, materiais e produtividade com IA.',
      icon: Sparkles,
      search: 'IA',
    },
  ] as const;

  const launchTitles = [
    'Windows para Professores',
    'Domine o Office: Word, Excel e PowerPoint na Educação',
    'Ferramentas Google para Educação',
    'Lógica de Programação Descomplicada para Professores',
    'Scratch para Educadores: Criatividade e Lógica em Sala de Aula',
    'Canva Educacional: Design e Criatividade na Sala de Aula',
    'Ferramentas Digitais para Sala de Aula (Padlet, Kahoot, Genially)',
    'IA para Professores',
  ] as const;

  const isPublished = (status: unknown) => {
    const s = String(status || '').toLowerCase();
    return s === 'publicado' || s === 'published';
  };

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await eadApiService.getPublicCourses();
        const list = (resp.courses || []) as Course[];
        const published = list.filter((c) => isPublished((c as any).status));
        setCourses(published);

        // Se o usuário estiver autenticado, buscar cursos bloqueados
        if (isAuthenticated) {
          const myResp = await eadApiService.getMyCourses();
          const enrolledIds = new Set(
            (myResp.enrollments || []).map((e: any) => String(e.course_id))
          );
          const locked = published.filter(
            (c) => !enrolledIds.has(String(c.id))
          );
          setLockedCourses(locked);
        } else {
          // Se não autenticado, todos os cursos estão bloqueados
          setLockedCourses(published);
        }
      } finally {
        setLoadingCourses(false);
      }
    };
    void load();
  }, [isAuthenticated]);

  const featuredCourses = useMemo(() => {
    const list = [...(courses || [])];
    list.sort((a, b) => {
      const ea = Number((a as any).enrolled_count ?? 0);
      const eb = Number((b as any).enrolled_count ?? 0);
      return eb - ea;
    });
    return list.slice(0, 6);
  }, [courses]);

  const launchCourses = useMemo(() => {
    return launchTitles.map((t) => {
      const norm = normalize(t);
      const match =
        courses.find((c) => normalize(c.title || '') === norm) ||
        courses.find((c) => normalize(c.title || '').includes(norm) || norm.includes(normalize(c.title || '')));
      return { title: t, course: match || null };
    });
  }, [courses]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://novaedubncc.com.br/logo/Logo%20Nova%20Edu%20(Oficial)-10.png" 
                alt="Nova Edu" 
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-[#044982] transition font-medium">
                Início
              </Link>
              <a href="#trilhas" className="text-gray-700 hover:text-[#044982] transition font-medium">
                Trilhas
              </a>
              <a href="#lancamentos" className="text-gray-700 hover:text-[#044982] transition font-medium">
                Lançamentos
              </a>
              <Link to="/cursos" className="text-gray-700 hover:text-[#044982] transition font-medium">
                Todos os cursos
              </Link>
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
              <Link to="/" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Início
              </Link>
              <a href="#trilhas" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Trilhas
              </a>
              <a href="#lancamentos" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Lançamentos
              </a>
              <Link to="/cursos" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Todos os cursos
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="block py-2 text-[#044982] font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Meus Cursos
                </Link>
              ) : (
                <Link to="/login" className="block py-2 text-[#044982] font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Entrar
                </Link>
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
                Cursos práticos de Computação e BNCC para Professores
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                BNCC Computacional, ferramentas digitais, produtividade e IA — com foco em aplicação real na sala de aula.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/cursos"
                  className="bg-white text-[#044982] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
                >
                  Explorar cursos <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#trilhas"
                  className="px-6 py-4 rounded-lg bg-white/15 border border-white/30 hover:bg-white/20 transition flex items-center gap-2"
                >
                  Ver trilhas <ChevronDown className="w-5 h-5" />
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Cpu, title: 'BNCC Computacional', desc: 'Do conceito à prática' },
                  { icon: BookOpen, title: 'Ferramentas', desc: 'Aulas mais engajadoras' },
                  { icon: Sparkles, title: 'IA para Professores', desc: 'Produtividade e criatividade' },
                ].map((it) => (
                  <div key={it.title} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <it.icon className="w-5 h-5" />
                      <span>{it.title}</span>
                    </div>
                    <div className="text-sm text-gray-200 mt-1">{it.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl border border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm p-6">
                <div className="text-white/90 font-semibold">Comece pelo que você precisa agora</div>
                <div className="mt-4 space-y-3">
                  {trilhas.slice(0, 4).map((t) => (
                    <Link
                      key={t.key}
                      to={`/cursos?search=${encodeURIComponent(t.search)}`}
                      className="flex items-center justify-between bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-4 py-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <t.icon className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{t.title}</div>
                          <div className="text-xs text-white/80">{t.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-sm text-white/80">Sem complicação: escolha uma trilha e avance aula a aula.</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trilhas */}
      <section id="trilhas" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-bold text-[#044982]">Trilhas pedagógicas</h2>
              <p className="text-gray-600 mt-2">Escolha uma trilha por objetivo e avance com segurança.</p>
            </div>
            <Link to="/cursos" className="hidden sm:inline-flex items-center gap-2 text-[#044982] font-semibold hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trilhas.map((t, idx) => (
              <motion.div
                key={t.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  to={`/cursos?search=${encodeURIComponent(t.search)}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#044982] to-[#005a93] flex items-center justify-center text-white mb-4">
                    <t.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xl font-semibold text-[#044982]">{t.title}</div>
                  <div className="text-gray-600 mt-2">{t.description}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-[#044982] font-semibold">
                    Explorar <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mais procurados */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-bold text-[#044982]">Mais procurados</h2>
              <p className="text-gray-600 mt-2">Cursos com maior interesse dos professores.</p>
            </div>
            <Link to="/cursos" className="hidden sm:inline-flex items-center gap-2 text-[#044982] font-semibold hover:underline">
              Explorar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="text-center py-8 text-gray-500">Carregando cursos...</div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum curso publicado ainda.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/curso/${c.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative h-44 bg-gradient-to-br from-[#044982] to-[#005a93]">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-center px-4">
                        {c.title}
                      </div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/10" />
                  </div>
                  <div className="p-5">
                    <div className="text-lg font-semibold text-[#044982] leading-snug line-clamp-2">{c.title}</div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">{c.description || 'Curso prático com foco em aplicação.'}</div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDurationFromMinutes(c.total_duration)}</span>
                      <span>{(c.enrolled_count || 0) as any} inscritos</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lançamentos */}
      <section id="lancamentos" className="py-20 bg-gradient-to-br from-[#044982] to-[#005a93] text-white">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-4xl font-bold">Lançamentos</h2>
            <p className="text-white/80 mt-2">Cursos focados em ferramentas e computação para professores.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {launchCourses.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden"
              >
                {item.course ? (
                  <Link to={`/curso/${item.course.id}`} className="block p-5 hover:bg-white/5 transition">
                    <div className="font-semibold">{item.course.title}</div>
                    <div className="text-sm text-white/80 mt-2 line-clamp-2">
                      {item.course.description || 'Curso prático com foco em sala de aula.'}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 font-semibold">
                      Ver detalhes <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ) : (
                  <div className="p-5">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-white/80 mt-2">Em breve — em produção.</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é / O que você leva */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-[#044982]">Para quem é</h3>
              <div className="mt-6 space-y-4">
                {[
                  { title: 'Professores iniciantes', desc: 'Querem começar do zero e aplicar rapidamente.' },
                  { title: 'Professores de Computação', desc: 'Buscam repertório, BNCC e práticas com ferramentas.' },
                  { title: 'Coordenação e gestão', desc: 'Querem formar equipes e organizar trilhas na escola.' },
                ].map((it) => (
                  <div key={it.title} className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[#044982] text-white flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{it.title}</div>
                      <div className="text-gray-600">{it.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#044982] to-[#005a93] text-white rounded-3xl p-8">
              <h3 className="text-2xl font-bold">O que você leva para a sala</h3>
              <div className="mt-6 space-y-4">
                {[
                  'Ideias práticas de atividades e sequências didáticas',
                  'Ferramentas digitais para engajar os alunos',
                  'Passo a passo para planejar aulas com BNCC Computacional',
                  'Produtividade (Windows, Office e Google)',
                  'Boas práticas de uso de IA na educação',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-white" />
                    <div className="text-white/90">{t}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/cursos"
                  className="inline-flex items-center gap-2 bg-white text-[#044982] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                >
                  Ver cursos <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos + FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-4xl font-bold text-[#044982]">O que professores dizem</h2>
              <p className="text-gray-600 mt-2">Depoimentos curtos (você pode substituir depois por reais).</p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    quote: 'Finalmente consegui entender a BNCC Computacional e transformar em atividade prática.',
                    role: 'Anos Iniciais',
                  },
                  {
                    quote: 'As ferramentas digitais deixaram minhas aulas muito mais dinâmicas.',
                    role: 'Educação Básica',
                  },
                  {
                    quote: 'O módulo de IA me economiza tempo no planejamento e na produção de materiais.',
                    role: 'Coordenação',
                  },
                ].map((t, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="text-gray-800">“{t.quote}”</div>
                    <div className="mt-3 text-sm text-gray-500">Professor(a) — {t.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#044982]">Perguntas frequentes</h2>
              <p className="text-gray-600 mt-2">Respostas rápidas para reduzir dúvidas.</p>
              <div className="mt-6 space-y-3">
                {[
                  { q: 'Preciso saber computação para começar?', a: 'Não. Temos trilhas introdutórias e passo a passo.' },
                  { q: 'Posso assistir no celular?', a: 'Sim. A plataforma é responsiva e funciona no celular.' },
                  { q: 'Os cursos têm certificado?', a: 'Se você usar certificados, podemos exibir isso em cada curso.' },
                  { q: 'Como escolho o curso certo?', a: 'Comece por uma trilha (BNCC, Ferramentas, IA) e avance.' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-semibold text-gray-900">{item.q}</div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </div>
                    {openFaq === idx && <div className="mt-3 text-gray-600">{item.a}</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cursos Bloqueados */}
      {lockedCourses.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-4xl font-bold text-[#044982]">Cursos Disponíveis</h2>
                <p className="text-gray-600 mt-2">
                  Entre em contato com a Secretaria de Educação do seu Município para liberação.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedCourses.slice(0, 6).map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative h-44 bg-gradient-to-br from-[#044982] to-[#005a93]">
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-center px-4">
                        {c.title}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-3 right-3 bg-white/90 text-gray-900 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold">
                      <Lock className="w-4 h-4" />
                      Bloqueado
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-lg font-semibold text-[#044982] leading-snug line-clamp-2">
                      {c.title}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {c.description || 'Curso prático com foco em aplicação.'}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{formatDurationFromMinutes(c.total_duration)}</span>
                      <span>{(c.enrolled_count || 0) as any} inscritos</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowEnrollModal(true);
                      }}
                      className="w-full bg-[#044982] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#005a93] transition flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Inscrever
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {lockedCourses.length > 6 && (
              <div className="mt-6 text-center">
                <Link
                  to="/cursos"
                  className="inline-flex items-center gap-2 text-[#044982] font-semibold hover:underline"
                >
                  Ver todos os cursos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal de Inscrição */}
      {showEnrollModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEnrollModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#044982]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#044982]" />
              </div>
              <h3 className="text-2xl font-bold text-[#044982]">Solicitar Acesso</h3>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Entre em contato com a Secretaria de Educação do seu Município para liberação deste curso.
            </p>
            <button
              onClick={() => setShowEnrollModal(false)}
              className="w-full bg-[#044982] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a93] transition"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#044982] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 420 90"
                  role="img"
                  aria-label="BNCC"
                  className="h-10 w-auto"
                >
                  <title>BNCC</title>
                  <g fill="#ffffff">
                    <g transform="translate(18,18)">
                      <path d="M8 6c10 0 18 3 24 8 6-5 14-8 24-8 4 0 8 .5 12 1.5v42.5c-4-1-8-1.5-12-1.5-10 0-18 3-24 8-6-5-14-8-24-8-4 0-8 .5-12 1.5V7.5C0 6.5 4 6 8 6zm0 6c-1.9 0-3.8.2-5.7.5v31.2c1.9-.3 3.8-.5 5.7-.5 9.2 0 16.9 2.4 22.9 7V19.2C24.9 14.4 17.2 12 8 12zm48 0c-9.2 0-16.9 2.4-22.9 7v31c6-4.6 13.7-7 22.9-7 1.9 0 3.8.2 5.7.5V12.5c-1.9-.3-3.8-.5-5.7-.5z" />
                    </g>
                    <text
                      x="110"
                      y="58"
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize="44"
                      fontWeight="800"
                      letterSpacing="2"
                    >
                      BNCC
                    </text>
                  </g>
                </svg>
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
