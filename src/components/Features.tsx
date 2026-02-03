import { motion } from 'framer-motion';
import { Brain, Globe, Bot, Code, Users, BookOpen, Zap, Target, Lightbulb, Star, GraduationCap, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { AxisDetailsModal } from './AxisDetailsModal';
import { apiService } from '../services/apiService';

const features = [
  {
    id: 'pensamento-computacional',
    icon: Brain,
    title: 'Pensamento Computacional',
    description:
      'Desenvolva habilidades de resolução de problemas através de decomposição, reconhecimento de padrões e algoritmos.',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    stats: '500+ Atividades',
    color: 'text-blue-600'
  },
  {
    id: 'mundo-digital',
    icon: Globe,
    title: 'Mundo Digital',
    description:
      'Explore conceitos de mundo digital e programação de forma prática e alinhada com a BNCC.',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    stats: 'IA Assistente',
    color: 'text-blue-600'
  },
  {
    id: 'cultura-digital',
    icon: Users,
    title: 'Cultura Digital',
    description:
      'Compreenda o impacto das tecnologias digitais na sociedade e desenvolva cidadania digital com seus alunos.',
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    stats: '100% BNCC',
    color: 'text-green-600'
  },
];

const benefits = [
  { icon: Code, text: 'Atividades Prontas para Uso', color: 'text-blue-500' },
  { icon: Users, text: 'Comunidade Ativa de Professores', color: 'text-green-500' },
  { icon: BookOpen, text: 'Material Alinhado com a BNCC Computacional', color: 'text-blue-500' },
  { icon: Zap, text: 'Implementação Rápida e Eficaz', color: 'text-yellow-500' },
  { icon: Target, text: 'Resultados Comprovados na Prática', color: 'text-red-500' },
  { icon: Lightbulb, text: 'Inovação Constante em Educação', color: 'text-blue-500' }
];

const CARGO_OPCOES = [
  { value: '', label: 'Selecione' },
  { value: 'professor', label: 'Professor' },
  { value: 'coordenador', label: 'Coordenador Pedagógico' },
  { value: 'diretor', label: 'Diretor' },
  { value: 'vice-diretor', label: 'Vice-Diretor' },
  { value: 'orientador', label: 'Orientador Educacional' },
  { value: 'supervisor', label: 'Supervisor Escolar' },
  { value: 'secretario', label: 'Secretário (a) de Educação' },
  { value: 'pedagogo', label: 'Pedagogo (a)' },
  { value: 'outro', label: 'Outro' },
];

const TIPO_ESCOLA_OPCOES = [
  { value: '', label: 'Selecione' },
  { value: 'municipal', label: 'Escola Municipal' },
  { value: 'estadual', label: 'Escola Estadual' },
  { value: 'federal', label: 'Escola Federal' },
  { value: 'particular', label: 'Escola Particular' },
  { value: 'outro', label: 'Outro' },
];

export const Features = () => {
  const [selectedAxis, setSelectedAxis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    celular: '',
    cidade: '',
    nome_escola: '',
    cargo: '',
    tipo_escola: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const scrollToForm = () => {
    const formElement = document.getElementById('formulario-inscricao');
    if (formElement) {
      formElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLearnMore = (feature: any) => {
    setSelectedAxis(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAxis(null);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    if (!formData.nome.trim() || !formData.email.trim() || !formData.celular.trim() || !formData.cidade.trim() || !formData.nome_escola.trim() || !formData.cargo || !formData.tipo_escola) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }
    setFormLoading(true);
    try {
      const res = await apiService.submitContactForm({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        celular: formData.celular.trim(),
        cidade: formData.cidade.trim(),
        nome_escola: formData.nome_escola.trim(),
        cargo: formData.cargo,
        tipo_escola: formData.tipo_escola,
      });
      if (res.error) {
        setFormError(res.message || 'Não foi possível enviar. Tente novamente.');
      } else {
        setFormSuccess(true);
        setFormData({ nome: '', email: '', celular: '', cidade: '', nome_escola: '', cargo: '', tipo_escola: '' });
      }
    } catch {
      setFormError('Erro ao enviar. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <section id="cursos" className="py-24 px-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 10% 20%, rgba(156, 163, 175, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 90% 80%, rgba(107, 114, 128, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 10% 20%, rgba(156, 163, 175, 0.05) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Target className="w-4 h-4" />
            <span>Áreas de Conhecimento</span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Transforme sua
            </span>
            <br />
            <span className="text-gray-900">Prática Pedagógica</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conteúdo especializado e alinhado com a BNCC para implementar pensamento computacional 
            e competências digitais de forma eficaz
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon with Gradient Background */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>

                {/* Stats Badge */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${feature.bgGradient} ${feature.color} px-3 py-1 rounded-full text-sm font-semibold mb-4`}>
                  <span>{feature.stats}</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <button
                  onClick={() => handleLearnMore(feature)}
                  className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all hover:text-blue-700"
                >
                  <span>Saiba mais</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </button>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher nossa plataforma?
            </h3>
            <p className="text-lg text-gray-600">
              Benefícios que fazem a diferença na sua prática educacional
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors leading-tight">
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Networks Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4" />
              <span>Atendimento Completo</span>
            </motion.div>

            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Atendemos <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Rede Pública</span> e <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Rede Privada</span>
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida para atender todas as instituições de ensino, 
              oferecendo soluções personalizadas para diferentes realidades educacionais.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Rede Pública */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Rede Pública</h4>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Escolas municipais e estaduais
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Implementação gradual e sustentável
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Atividades adaptáveis a diferentes recursos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Suporte pedagógico especializado
                  </li>
                </ul>
              </motion.div>

              {/* Rede Privada */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-green-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Rede Privada</h4>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Colégios e escolas particulares
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Implementação completa e rápida
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Recursos tecnológicos avançados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Diferenciação competitiva
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-l-6 border-emerald-500 p-6 rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-emerald-800 text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full text-sm font-semibold">
                        ⚡ FLEXIBILIDADE
                      </span>
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed font-medium">
                      Adaptamos nossa solução às necessidades específicas de cada instituição, 
                      independentemente do porte ou recursos disponíveis.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4" />
              <span>Depoimentos</span>
            </motion.div>

            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">educadores</span>
            </h3>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conheça as experiências de diretores, coordenadores e professores que já transformaram 
              suas práticas pedagógicas com nossa plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Depoimento 1 - Diretor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "A plataforma revolucionou nossa escola. Os professores agora têm acesso a atividades 
                prontas e alinhadas com a BNCC. A implementação foi simples e os resultados são visíveis 
                no engajamento dos alunos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face" 
                    alt="Maria Regina Santos"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Maria+Regina&background=3b82f6&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Maria Regina Santos</h4>
                  <p className="text-sm text-gray-500">Diretora - Escola Municipal São José</p>
                </div>
              </div>
            </motion.div>

            {/* Depoimento 2 - Professor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Como professora de 3º ano, sempre tive dificuldade para encontrar atividades de 
                pensamento computacional adequadas. Agora tenho tudo organizado por eixos e anos. 
                Meus alunos adoram as atividades!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-200">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                    alt="Ana Carolina Lima"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Ana+Carolina&background=10b981&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ana Carolina Lima</h4>
                  <p className="text-sm text-gray-500">Professora - Colégio Dom Pedro II</p>
                </div>
              </div>
            </motion.div>

            {/* Depoimento 3 - Coordenador */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "A coordenação pedagógica ficou muito mais fácil. Temos relatórios detalhados, 
                atividades organizadas por competências e o suporte é excepcional. Recomendo para 
                qualquer escola que queira inovar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                    alt="Roberto Carlos Silva"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Roberto+Carlos&background=8b5cf6&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Roberto Carlos Silva</h4>
                  <p className="text-sm text-gray-500">Coordenador - Escola Estadual Central</p>
                </div>
              </div>
            </motion.div>

            {/* Depoimento 4 - Professor de Tecnologia */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Finalmente uma plataforma que entende as necessidades reais dos professores. 
                As atividades plugadas e desplugadas são perfeitas para diferentes contextos. 
                O assistente de IA é um diferencial incrível!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                    alt="Pedro Lima"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Pedro+Lima&background=f97316&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pedro Lima</h4>
                  <p className="text-sm text-gray-500">Professor de Tecnologia - Escola Inovação</p>
                </div>
              </div>
            </motion.div>

            {/* Depoimento 5 - Diretora de Rede */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Implementamos em toda nossa rede municipal. A plataforma nos ajudou a padronizar 
                o ensino de pensamento computacional. Os resultados nos surpreenderam positivamente."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-200">
                  <img 
                    src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face" 
                    alt="Carla Mendes"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Carla+Mendes&background=14b8a6&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Carla Mendes</h4>
                  <p className="text-sm text-gray-500">Secretária de Educação - Prefeitura Municipal</p>
                </div>
              </div>
            </motion.div>

            {/* Depoimento 6 - Professor de Educação Infantil */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Trabalho com educação infantil e as atividades desplugadas são perfeitas para 
                meus pequenos. Eles aprendem conceitos de programação brincando. A plataforma 
                tornou meu trabalho muito mais prazeroso!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-200">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" 
                    alt="Fernanda Martins"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Fernanda+Martins&background=ec4899&color=fff&size=100';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Fernanda Martins</h4>
                  <p className="text-sm text-gray-500">Professora - Educação Infantil</p>
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>

        {/* Educação Digital em Ação Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Educação Digital em Ação
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como professores e alunos estão transformando a educação com tecnologia
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold mb-2 text-blue-600">10.000+</div>
              <div className="text-gray-600 font-medium">Professores Ativos</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold mb-2 text-green-600">50.000+</div>
              <div className="text-gray-600 font-medium">Alunos Beneficiados</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-purple-100">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold mb-2 text-purple-600">500+</div>
              <div className="text-gray-600 font-medium">Escolas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold mb-2 text-orange-600">98%</div>
              <div className="text-gray-600 font-medium">Satisfação dos Usuários</div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop" 
                alt="Alunos usando tablets"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Aprendizado Interativo</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop" 
                alt="Professores colaborando"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Colaboração em Equipe</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop" 
                alt="Crianças programando"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Pensamento Computacional</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" 
                alt="Aula com tecnologia"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">Educação Moderna</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
                >
                  <Users className="w-4 h-4" />
                  <span>Junte-se a nós</span>
                </motion.div>

                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Faça parte desta <span className="text-yellow-300">transformação</span>
                </h3>
                
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  Milhares de educadores já transformaram suas práticas pedagógicas e estão 
                  preparando seus alunos para o futuro digital. Seja você também um agente 
                  de mudança na educação brasileira.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                    <span className="text-white/90">Implementação gratuita e sem complicações</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                    <span className="text-white/90">Suporte pedagógico especializado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </div>
                    <span className="text-white/90">Comunidade ativa de educadores</span>
                  </div>
                </div>

                <motion.button
                  onClick={scrollToForm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-600 font-bold px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  Testar Agora
                </motion.button>
              </motion.div>

              {/* Image Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <motion.div
                  initial={{ scale: 0.9, rotateY: -10 }}
                  whileInView={{ scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop&crop=center"
                    alt="Criança feliz aprendendo com professora"
                    className="w-full h-80 md:h-96 object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Floating Elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-green-600 p-3 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      <span className="text-sm font-semibold">Aprendizado Ativo</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 p-3 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-semibold">Educação Colaborativa</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Background Glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-white/30 rounded-3xl blur-2xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Formulário de Inscrição */}
        <motion.div
          id="formulario-inscricao"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 md:p-12 text-white" style={{ background: 'linear-gradient(135deg, #044982 0%, #1e40af 50%, #1e3a8a 100%)' }}>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Leve a Nova Edu para sua escola
                </h2>
                <p className="text-lg text-blue-100">
                  Preencha o formulário abaixo e comece sua jornada na educação digital
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleContactSubmit}>
                {formSuccess && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/20 text-green-100 border border-green-400/40">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-medium">Mensagem enviada com sucesso! Em breve entraremos em contato.</p>
                  </div>
                )}
                {formError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 text-red-100 border border-red-400/40">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Nome <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Celular <span className="text-red-400">*</span>
                  </label>
                  <div className="flex">
                    <div className="flex items-center bg-white rounded-l-xl px-4 py-3 border-r border-gray-200">
                      <img 
                        src="https://flagcdn.com/w20/br.png" 
                        alt="Brasil" 
                        className="w-5 h-3 mr-2"
                      />
                      <span className="text-gray-700 font-medium">+55</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.celular}
                      onChange={(e) => setFormData((p) => ({ ...p, celular: e.target.value }))}
                      className="flex-1 px-4 py-3 rounded-r-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Cidade <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cidade}
                    onChange={(e) => setFormData((p) => ({ ...p, cidade: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900"
                    placeholder="Digite sua cidade"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Nome da escola <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_escola}
                    onChange={(e) => setFormData((p) => ({ ...p, nome_escola: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900"
                    placeholder="Nome da sua instituição de ensino"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Cargo na escola <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData((p) => ({ ...p, cargo: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900 bg-white"
                    >
                      {CARGO_OPCOES.map((o) => (
                        <option key={o.value || 'v'} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Tipo de escola <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.tipo_escola}
                      onChange={(e) => setFormData((p) => ({ ...p, tipo_escola: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 focus:outline-none text-gray-900 bg-white"
                    >
                      {TIPO_ESCOLA_OPCOES.map((o) => (
                        <option key={o.value || 'v'} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={formLoading}
                  whileHover={!formLoading ? { scale: 1.05 } : undefined}
                  whileTap={!formLoading ? { scale: 0.95 } : undefined}
                  className="w-full bg-green-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Enviando...' : 'Enviar'}
                </motion.button>
                
                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => window.location.href = '/sobre'}
                    className="text-blue-200 hover:text-white transition-colors underline text-sm bg-transparent border-none cursor-pointer"
                  >
                    Saiba mais sobre nossa missão e equipe →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Axis Details Modal */}
      {selectedAxis && (
        <AxisDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          axis={selectedAxis}
        />
      )}
    </section>
  );
};
