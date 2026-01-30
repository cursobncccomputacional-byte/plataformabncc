import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, ArrowRight, Brain, Globe, Users, GraduationCap, Play, Sparkles, Loader2, Book, Calculator, MapPin, FlaskConical, Dumbbell, Church, Code, Languages, X, Eye, Download, Lock } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { resolvePublicAssetUrl } from '../utils/assetUrl';
import { renderMarkdown } from '../utils/markdownRenderer';
import { ActivityDuration } from '../components/ActivityDuration';
import { SecurePDFViewer } from '../components/SecurePDFViewer';

interface Trilha {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'eixo_bncc' | 'etapa' | 'ano_escolar' | 'disciplina_transversal';
  valor: string;
  thumbnail_url?: string;
  ordem: number;
  total_atividades?: number;
}

interface Atividade {
  id: string;
  nome_atividade: string;
  descricao?: string;
  tipo: string;
  etapa?: string;
  thumbnail_url?: string;
  video_url: string;
  duracao?: string;
  material_pdf_url?: string | null;
  pedagogical_pdf_url?: string | null;
  document_url?: string | null;
  anos_escolares?: string[];
  bloqueada?: boolean;
}

const svgPlaceholderDataUri = (title: string) => {
  const safe = (title || 'Atividade').slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#005a93"/>
          <stop offset="1" stop-color="#4F46E5"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="42" fill="#ffffff" opacity="0.95">
        ${safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const typeLabels: Record<string, string> = { plugada: 'Plugada', desplugada: 'Desplugada' };
const typeColors: Record<string, string> = { plugada: 'bg-blue-100 text-blue-700', desplugada: 'bg-green-100 text-green-700' };

export const TrilhasPedagogicas = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilhasEixo, setTrilhasEixo] = useState<Trilha[]>([]);
  const [trilhasEtapa, setTrilhasEtapa] = useState<Trilha[]>([]);
  const [trilhasDisciplinas, setTrilhasDisciplinas] = useState<Trilha[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrilha, setSelectedTrilha] = useState<Trilha | null>(null);
  const [atividadesTrilha, setAtividadesTrilha] = useState<Atividade[]>([]);
  const [loadingAtividades, setLoadingAtividades] = useState(false);
  const [loadingAISuggestion, setLoadingAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadTrilhas();
  }, []);

  const loadTrilhas = async () => {
    setLoading(true);
    try {
      const [responseEixo, responseEtapa, responseAnoEscolar, responseDisciplinas] = await Promise.all([
        apiService.getTrilhas('eixo_bncc'),
        apiService.getTrilhas('etapa'),
        apiService.getTrilhas('ano_escolar'),
        apiService.getTrilhas('disciplina_transversal'),
      ]);

      if (!responseEixo.error) {
        setTrilhasEixo(responseEixo.trilhas || []);
      }
      if (!responseEtapa.error) {
        // Juntar "etapa" + "ano_escolar" na seção Por Etapa (dedupe por id)
        const merged = [...(responseEtapa.trilhas || []), ...(responseAnoEscolar.trilhas || [])];
        const byId = new Map<string, Trilha>();
        merged.forEach((t: any) => {
          if (t?.id) byId.set(String(t.id), t);
        });
        setTrilhasEtapa(Array.from(byId.values()));
      }
      if (!responseDisciplinas.error) {
        setTrilhasDisciplinas(responseDisciplinas.trilhas || []);
      }

      setTrilhas([
        ...(responseEixo.trilhas || []), 
        ...(responseEtapa.trilhas || []),
        ...(responseAnoEscolar.trilhas || []),
        ...(responseDisciplinas.trilhas || [])
      ]);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrilhaClick = async (trilha: Trilha) => {
    setSelectedTrilha(trilha);
    setLoadingAtividades(true);
    try {
      const response = await apiService.getTrilha(trilha.id);
      console.log('Resposta da API getTrilha:', response);
      if (!response.error) {
        if (response.atividades && Array.isArray(response.atividades)) {
          setAtividadesTrilha(response.atividades);
        } else {
          console.warn('Resposta não contém atividades ou não é um array:', response);
          setAtividadesTrilha([]);
        }
      } else {
        console.error('Erro na resposta da API:', response.message);
        setAtividadesTrilha([]);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades da trilha:', error);
      setAtividadesTrilha([]);
    } finally {
      setLoadingAtividades(false);
    }
  };

  const filteredTrilhasEixo = trilhasEixo.filter((trilha) =>
    trilha.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTrilhasEtapa = trilhasEtapa.filter((trilha) =>
    trilha.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTrilhasDisciplinas = trilhasDisciplinas.filter((trilha) =>
    trilha.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrilhaIcon = (tipo: string, valor: string) => {
    if (tipo === 'eixo_bncc') {
      if (valor.includes('Pensamento')) return Brain;
      if (valor.includes('Mundo')) return Globe;
      if (valor.includes('Cultura')) return Users;
    } else if (tipo === 'ano_escolar') {
      return GraduationCap;
    } else if (tipo === 'disciplina_transversal') {
      if (valor.includes('Português')) return Book;
      if (valor.includes('Matemática')) return Calculator;
      if (valor.includes('História')) return BookOpen;
      if (valor.includes('Geografia')) return MapPin;
      if (valor.includes('Ciências')) return FlaskConical;
      if (valor.includes('Educação Física')) return Dumbbell;
      if (valor.includes('Ensino Religioso')) return Church;
      if (valor.includes('Computação')) return Code;
      if (valor.includes('Inglês')) return Languages;
    }
    return GraduationCap;
  };

  // Funções auxiliares para detectar e processar vídeos
  const detectVideoType = (url: string): 'vimeo' | 'youtube' | 'googledrive' | 'direct' => {
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com')) return 'googledrive';
    return 'direct';
  };

  const getVimeoId = (url: string): string => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : '';
  };

  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getGoogleDriveId = (url: string): string | null => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleViewPDF = (atividade: Atividade, url: string, label: string) => {
    if (atividade.bloqueada) return;
    if (url && user) setSelectedPDF({ url, title: `${atividade.nome_atividade} — ${label}` });
  };

  const handleDownloadPDF = (atividade: Atividade, url: string) => {
    if (atividade.bloqueada) return;
    if (!url || !(user?.role === 'admin' || user?.role === 'professor')) return;
    const filename = `${(atividade.nome_atividade || 'material').replace(/[^\w\s-]/g, '')}.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseDurationMinutes = (duracao?: string | null): number => {
    if (!duracao) return 0;
    const m = duracao.match(/(\d+)\s*min/);
    if (m) return parseInt(m[1], 10) || 0;
    const n = duracao.match(/(\d+)/);
    return n ? parseInt(n[1], 10) || 0 : 0;
  };

  if (selectedTrilha) {
    return (
      <div className="bg-transparent p-0">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedTrilha(null)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            Voltar para Trilhas
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
          >
            {selectedTrilha.thumbnail_url && (
              <img
                src={resolvePublicAssetUrl(selectedTrilha.thumbnail_url) || ''}
                alt={selectedTrilha.titulo}
                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{selectedTrilha.titulo}</h1>
            {selectedTrilha.descricao && (
              <p className="text-gray-600 mb-4">{selectedTrilha.descricao}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {selectedTrilha.tipo === 'eixo_bncc'
                  ? 'Eixo BNCC'
                  : selectedTrilha.tipo === 'etapa' || selectedTrilha.tipo === 'ano_escolar'
                    ? 'Etapa'
                    : 'Disciplina Transversal'}
              </span>
              <span>{atividadesTrilha.length} atividades</span>
            </div>
          </motion.div>

          {loadingAtividades ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#044982]"></div>
              <p className="mt-2 text-gray-600">Carregando atividades...</p>
            </div>
          ) : atividadesTrilha.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-gray-600">Esta trilha ainda não possui atividades cadastradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {atividadesTrilha.map((atividade, index) => {
                const typeKey = (atividade.tipo || '').toLowerCase().includes('plugada') ? 'plugada' : 'desplugada';
                return (
                  <motion.div
                    key={atividade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                  >
                    <div className="relative">
                      <img
                        src={resolvePublicAssetUrl(atividade.thumbnail_url) || svgPlaceholderDataUri(atividade.nome_atividade)}
                        alt={atividade.nome_atividade}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = svgPlaceholderDataUri(atividade.nome_atividade);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {atividade.bloqueada && (
                        <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/90 text-white" title="Atividade bloqueada">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm ${typeColors[typeKey] || typeColors.desplugada} border border-white/20`}>
                          {typeLabels[typeKey] || atividade.tipo || 'Desplugada'}
                        </span>
                      </div>
                      {(atividade.anos_escolares?.length ?? 0) > 0 && (
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                          {atividade.anos_escolares!.slice(0, 2).map((yearId) => (
                            <span
                              key={yearId}
                              className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium"
                            >
                              {yearId}
                            </span>
                          ))}
                          {atividade.anos_escolares!.length > 2 && (
                            <span className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                              +{atividade.anos_escolares!.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-sm leading-tight">
                        {atividade.nome_atividade}
                      </h3>
                      <div className="mb-3 text-xs text-gray-500">
                        <ActivityDuration
                          videoUrl={atividade.video_url}
                          fallbackMinutes={parseDurationMinutes(atividade.duracao)}
                          className="text-xs"
                        />
                      </div>
                      <div className={`grid grid-cols-2 gap-2 ${atividade.bloqueada ? 'opacity-60 pointer-events-none' : ''}`}>
                        {atividade.video_url && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (atividade.bloqueada) return; setSelectedVideo({ url: atividade.video_url, title: atividade.nome_atividade }); }}
                            className="w-full text-white px-3 py-2 rounded-lg transition-all text-xs font-medium hover:shadow-md flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: '#005a93' }}
                          >
                            <Play className="w-3.5 h-3.5" />
                            Vídeo
                          </button>
                        )}
                        {(atividade.pedagogical_pdf_url || atividade.document_url) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPDF(atividade, atividade.pedagogical_pdf_url || atividade.document_url || '', 'Estrutura Pedagógica');
                            }}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Estrutura
                          </button>
                        )}
                        {atividade.material_pdf_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPDF(atividade, atividade.material_pdf_url!, 'Material da Aula');
                            }}
                            className="w-full bg-sky-600 text-white px-3 py-2 rounded-lg hover:bg-sky-700 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Material
                          </button>
                        )}
                        {(user?.role === 'admin' || user?.role === 'professor') && atividade.material_pdf_url && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(atividade, atividade.material_pdf_url!); }}
                            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs flex items-center justify-center gap-1.5"
                            title="Baixar material da aula"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Baixar
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleAISuggestion = async () => {
    setLoadingAISuggestion(true);
    setAiSuggestion(null);
    setShowAISuggestion(true);
    
    try {
      const prompt = `Como assistente educacional especializado em BNCC e pensamento computacional, sugira uma atividade prática e pronta para aplicar HOJE em sala de aula. A atividade deve ser:
- Alinhada à BNCC
- Prática e fácil de implementar
- Adequada para educação básica
- Incluir objetivos, materiais necessários e passo a passo
- Ser plugada ou desplugada
- Duração: 30-60 minutos
- Focar em pensamento computacional, mundo digital ou cultura digital

Forneça uma sugestão detalhada e objetiva que o professor possa usar imediatamente.`;
      
      const response = await apiService.suggestActivitiesFromAI(prompt);
      
      if (response.error) {
        console.error('Erro na sugestão de IA:', response.message);
        setAiSuggestion(`❌ Erro ao gerar sugestão: ${response.message}\n\nPor favor, tente novamente em alguns instantes. Se o problema persistir, verifique se a chave da API está configurada corretamente.`);
      } else {
        setAiSuggestion(response.suggestions || 'Não foi possível gerar uma sugestão no momento.');
      }
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
      setAiSuggestion(`❌ Erro ao consultar a IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nTente novamente em alguns instantes.`);
    } finally {
      setLoadingAISuggestion(false);
    }
  };

  return (
    <div className="bg-transparent p-0">
      <div className="max-w-7xl mx-auto">
        {/* Seção Hero com Botão de IA */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Atividades BNCC Computacional</h1>
          <p className="text-gray-600 text-base md:text-lg mb-5">
            Atividades plugadas e desplugadas organizadas para aplicar em sala, sem complicação.
          </p>
          
          {/* Botão de IA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAISuggestion}
            disabled={loadingAISuggestion}
            className="inline-flex items-center gap-3 px-5 py-3 bg-[#044982] text-white rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#033a6b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAISuggestion ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Gerando sugestão...</span>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <img 
                    src="/icone-nova-edu-branco.png" 
                    alt="Nova Edu Logo" 
                    className="w-8 h-8 md:w-9 md:h-9 object-contain"
                  />
                </div>
                <span>Quero uma atividade pronta para hoje</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Sugestão da IA */}
        {showAISuggestion && aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-md relative"
          >
            {/* Botão de fechar no canto superior direito */}
            <button
              onClick={() => {
                setShowAISuggestion(false);
                setAiSuggestion(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow-md"
              title="Fechar sugestão"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4 pr-8">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>Sugestão de Atividade para Hoje</span>
                  <span className="text-sm font-normal text-purple-600 bg-purple-100 px-2 py-1 rounded">Powered by IA</span>
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {renderMarkdown(aiSuggestion)}
                </div>
                <button
                  onClick={() => {
                    setShowAISuggestion(false);
                    setAiSuggestion(null);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <X className="w-5 h-5" />
                  Fechar sugestão
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Título das Trilhas */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Trilhas Pedagógicas</h2>
          <p className="text-gray-600 text-base md:text-lg">
            Sequências prontas alinhadas à BNCC. Explore atividades organizadas por eixo ou etapa.
          </p>
        </motion.div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar trilhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#044982] focus:border-transparent touch-target-inline"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#044982]"></div>
            <p className="mt-2 text-gray-600">Carregando trilhas...</p>
          </div>
        ) : (
          <>
            {/* Trilhas por Eixo BNCC */}
            {filteredTrilhasEixo.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Por Eixo BNCC</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredTrilhasEixo.map((trilha) => {
                    const Icon = getTrilhaIcon(trilha.tipo, trilha.valor);
                    return (
                      <motion.div
                        key={trilha.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleTrilhaClick(trilha)}
                      >
                        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          {trilha.thumbnail_url ? (
                            <img
                              src={resolvePublicAssetUrl(trilha.thumbnail_url) || ''}
                              alt={trilha.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon className="w-16 h-16 text-white opacity-80" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg font-semibold">
                              Ver trilha
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{trilha.titulo}</h3>
                          {trilha.descricao && (
                            <p className="text-sm text-gray-600 line-clamp-2">{trilha.descricao}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{trilha.valor}</span>
                            <ArrowRight className="w-5 h-5 text-[#044982]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trilhas por Etapa */}
            {filteredTrilhasEtapa.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Por Etapa</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredTrilhasEtapa.map((trilha) => {
                    const Icon = getTrilhaIcon(trilha.tipo, trilha.valor);
                    return (
                      <motion.div
                        key={trilha.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleTrilhaClick(trilha)}
                      >
                        <div className="relative h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                          {trilha.thumbnail_url ? (
                            <img
                              src={resolvePublicAssetUrl(trilha.thumbnail_url) || ''}
                              alt={trilha.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon className="w-16 h-16 text-white opacity-80" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg font-semibold">
                              Ver trilha
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{trilha.titulo}</h3>
                          {trilha.descricao && (
                            <p className="text-sm text-gray-600 line-clamp-2">{trilha.descricao}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{trilha.valor}</span>
                            <ArrowRight className="w-5 h-5 text-[#044982]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trilhas por Disciplinas Transversais */}
            {filteredTrilhasDisciplinas.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Por Disciplina Transversal</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredTrilhasDisciplinas.map((trilha) => {
                    const Icon = getTrilhaIcon(trilha.tipo, trilha.valor);
                    return (
                      <motion.div
                        key={trilha.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleTrilhaClick(trilha)}
                      >
                        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          {trilha.thumbnail_url ? (
                            <img
                              src={resolvePublicAssetUrl(trilha.thumbnail_url) || ''}
                              alt={trilha.titulo}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Icon className="w-16 h-16 text-white opacity-80" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg font-semibold">
                              Ver trilha
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{trilha.titulo}</h3>
                          {trilha.descricao && (
                            <p className="text-sm text-gray-600 line-clamp-2">{trilha.descricao}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{trilha.valor}</span>
                            <ArrowRight className="w-5 h-5 text-[#044982]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredTrilhasEixo.length === 0 && filteredTrilhasEtapa.length === 0 && filteredTrilhasDisciplinas.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma trilha encontrada</h3>
                <p className="text-gray-600">Tente buscar por outros termos.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <SecurePDFViewer
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
          allowDownload={
            (user?.role === 'admin' || user?.role === 'professor') &&
            !selectedPDF.title.includes('Estrutura Pedagógica')
          }
        />
      )}

      {/* Modal de Player de Vídeo */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-3 sm:p-4 safe-area-top">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 gap-2 min-w-0">
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="flex-shrink-0 p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors touch-target rounded-lg"
                aria-label="Fechar vídeo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {(() => {
                const videoType = detectVideoType(selectedVideo.url);
                
                switch (videoType) {
                  case 'vimeo':
                    return (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`https://player.vimeo.com/video/${getVimeoId(selectedVideo.url)}?autoplay=1&title=0&byline=0&portrait=0`}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  
                  case 'youtube':
                    const youtubeId = getYouTubeId(selectedVideo.url);
                    if (youtubeId) {
                      return (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    break;
                  
                  case 'googledrive':
                    const driveId = getGoogleDriveId(selectedVideo.url);
                    if (driveId) {
                      return (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`https://drive.google.com/file/d/${driveId}/preview`}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="autoplay"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    break;
                  
                  case 'direct':
                  default:
                    return (
                      <video
                        controls
                        className="w-full h-auto max-h-[70vh] rounded-lg"
                        preload="metadata"
                        controlsList="nodownload"
                      >
                        <source src={selectedVideo.url} type="video/mp4" />
                        <source src={selectedVideo.url} type="video/webm" />
                        <source src={selectedVideo.url} type="video/ogg" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    );
                }
                
                // Fallback para URL direta se não detectar tipo
                return (
                  <video
                    controls
                    className="w-full h-auto max-h-[70vh] rounded-lg"
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    <source src={selectedVideo.url} type="video/webm" />
                    <source src={selectedVideo.url} type="video/ogg" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
