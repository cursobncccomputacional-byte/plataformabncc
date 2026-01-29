import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  BookOpen,
  Activity,
  FileText,
  Video,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { activityLogger } from '../services/ActivityLogger';
import { apiService } from '../services/apiService';
import { renderMarkdown } from '../utils/markdownRenderer';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o Assistente da BNCC Computacional. Posso te ajudar com dúvidas sobre pensamento computacional, atividades, recursos educacionais e muito mais! Como posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [usingAI, setUsingAI] = useState(true); // Agora usando Groq
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Usando Groq para respostas inteligentes
  useEffect(() => {
    setIsOnline(true);
    setUsingAI(true);
  }, []);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Respostas sobre pensamento computacional
    if (message.includes('pensamento computacional') || message.includes('computacional')) {
      return 'O pensamento computacional é uma habilidade fundamental do século XXI que envolve 4 pilares principais:\n\n1. **Decomposição** - Quebrar problemas complexos em partes menores\n2. **Reconhecimento de Padrões** - Identificar similaridades e tendências\n3. **Abstração** - Focar no essencial, ignorando detalhes irrelevantes\n4. **Algoritmos** - Criar sequências de passos para resolver problemas\n\nNa nossa plataforma, você encontra atividades desplugadas e plugadas para desenvolver essas habilidades com seus alunos!';
    }

    // Respostas sobre atividades
    if (message.includes('atividade') || message.includes('atividades')) {
      return 'Temos várias atividades organizadas por eixos da BNCC:\n\n**Atividades Desplugadas:**\n• Sequência de Ações - Brincadeiras\n• Decomposição de Problemas - Quebra-cabeças\n• Segurança Digital - Cidadania Online\n\n**Atividades Plugadas:**\n• Scratch Jr - Programação Visual\n• Robótica com LEGO WeDo\n• Programação com Scratch\n\nTodas as atividades incluem objetivos, materiais necessários e orientações pedagógicas. Você pode filtrar por ano escolar e eixo BNCC!';
    }

    // Respostas sobre recursos
    if (message.includes('recurso') || message.includes('material') || message.includes('documento')) {
      return 'Nossa plataforma oferece diversos recursos educacionais:\n\n**Documentos:**\n• Guias BNCC oficiais\n• Manuais de atividades\n• Orientações pedagógicas\n\n**Vídeos:**\n• Cursos de formação\n• Tutoriais de ferramentas\n• Exemplos práticos\n\n**Recursos Interativos:**\n• Atividades plugadas e desplugadas\n• Simuladores\n• Jogos educacionais\n\nTodos os recursos são organizados por anos escolares e eixos da BNCC!';
    }

    // Respostas sobre BNCC
    if (message.includes('bncc') || message.includes('base nacional')) {
      return 'A BNCC (Base Nacional Comum Curricular) inclui o pensamento computacional como uma competência geral. Os eixos trabalhados em nossa plataforma são:\n\n**Eixos da BNCC Computacional:**\n• Pensamento Computacional\n• Mundo Digital\n• Cultura Digital\n• Letramento Digital\n\nCada eixo tem habilidades específicas organizadas por anos escolares, desde a Educação Infantil até o 9º ano do Ensino Fundamental.';
    }

    // Respostas sobre programação
    if (message.includes('programação') || message.includes('programar') || message.includes('scratch')) {
      return 'A programação é uma excelente forma de desenvolver o pensamento computacional! Na nossa plataforma você encontra:\n\n**Para Educação Infantil e Anos Iniciais:**\n• Scratch Jr - Programação visual com blocos\n• Atividades desplugadas para introduzir conceitos\n\n**Para Anos Finais:**\n• Scratch - Programação mais avançada\n• Robótica com LEGO WeDo\n• Projetos interdisciplinares\n\n**Dicas pedagógicas:**\n• Comece sempre com atividades desplugadas\n• Use a programação para resolver problemas reais\n• Incentive a colaboração entre os alunos';
    }

    // Respostas sobre robótica
    if (message.includes('robótica') || message.includes('lego') || message.includes('robot')) {
      return 'A robótica educacional é uma ferramenta poderosa para ensinar pensamento computacional! Aqui na plataforma temos:\n\n**Recursos de Robótica:**\n• Atividades com LEGO WeDo\n• Projetos de automação\n• Desafios de engenharia\n\n**Benefícios pedagógicos:**\n• Desenvolve raciocínio lógico\n• Trabalha colaboração\n• Aplica conceitos de matemática e física\n• Estimula criatividade\n\n**Dicas para implementar:**\n• Comece com projetos simples\n• Relacione com problemas do cotidiano\n• Documente o processo de criação';
    }

    // Respostas sobre avaliação
    if (message.includes('avaliar') || message.includes('avaliação') || message.includes('como avaliar')) {
      return 'A avaliação do pensamento computacional deve focar no processo, não apenas no resultado:\n\n**Estratégias de Avaliação:**\n• **Observação** - Acompanhe o processo de resolução\n• **Portfólios** - Colete evidências do desenvolvimento\n• **Autoavaliação** - Peça aos alunos para refletirem\n• **Avaliação por pares** - Promova feedback entre colegas\n\n**Critérios importantes:**\n• Capacidade de decompor problemas\n• Uso de padrões e abstrações\n• Criação de algoritmos eficientes\n• Colaboração e comunicação\n\nLembre-se: o importante é o desenvolvimento do pensamento, não a perfeição técnica!';
    }

    // Respostas sobre dificuldades
    if (message.includes('dificuldade') || message.includes('problema') || message.includes('ajuda')) {
      return 'É normal encontrar desafios ao implementar o pensamento computacional! Aqui estão algumas dicas:\n\n**Desafios Comuns e Soluções:**\n\n• **"Meus alunos não conseguem programar"**\n  → Comece com atividades desplugadas e use linguagem visual\n\n• **"Não tenho recursos tecnológicos"**\n  → Foque em atividades desplugadas e use materiais simples\n\n• **"Não sei por onde começar"**\n  → Comece com um eixo específico e vá expandindo\n\n• **"Os alunos perdem o interesse"**\n  → Use projetos relevantes e permita criatividade\n\nQuer que eu detalhe alguma dessas estratégias?';
    }

    // Respostas sobre implementação
    if (message.includes('implementar') || message.includes('como começar') || message.includes('primeiros passos')) {
      return 'Para implementar o pensamento computacional na sua escola, siga estes passos:\n\n**1. Planejamento:**\n• Defina objetivos claros\n• Escolha um eixo para começar\n• Planeje atividades progressivas\n\n**2. Recursos:**\n• Use nossa plataforma como base\n• Adapte atividades para sua realidade\n• Comece com materiais simples\n\n**3. Implementação:**\n• Comece com atividades desplugadas\n• Introduza tecnologia gradualmente\n• Promova colaboração\n\n**4. Avaliação:**\n• Observe o processo\n• Colete evidências\n• Ajuste conforme necessário\n\nQuer que eu te ajude com algum passo específico?';
    }

    // Respostas sobre idade/anos
    if (message.includes('anos') || message.includes('idade') || message.includes('série') || message.includes('ano')) {
      return 'O pensamento computacional pode ser trabalhado em todas as idades! Aqui está uma sugestão por faixa etária:\n\n**Educação Infantil (3-5 anos):**\n• Atividades desplugadas\n• Sequências simples\n• Jogos e brincadeiras\n\n**Anos Iniciais (1º ao 5º ano):**\n• Scratch Jr\n• Atividades desplugadas\n• Introdução à programação visual\n\n**Anos Finais (6º ao 9º ano):**\n• Scratch avançado\n• Robótica\n• Projetos interdisciplinares\n\nCada faixa etária tem atividades específicas em nossa plataforma!';
    }

    // Respostas sobre ferramentas
    if (message.includes('ferramenta') || message.includes('software') || message.includes('aplicativo')) {
      return 'Existem várias ferramentas excelentes para ensinar pensamento computacional:\n\n**Para Iniciantes:**\n• **Scratch Jr** - Programação visual para crianças\n• **Code.org** - Cursos gratuitos online\n• **Lightbot** - Jogo de programação\n\n**Para Intermediários:**\n• **Scratch** - Programação visual avançada\n• **App Inventor** - Criação de apps\n• **LEGO WeDo** - Robótica educacional\n\n**Para Avançados:**\n• **Python** - Linguagem de programação\n• **Arduino** - Eletrônica e programação\n• **Unity** - Desenvolvimento de jogos\n\nTodas essas ferramentas podem ser integradas com as atividades da nossa plataforma!';
    }

    // Respostas sobre integração curricular
    if (message.includes('curriculo') || message.includes('matéria') || message.includes('disciplina') || message.includes('matemática') || message.includes('português')) {
      return 'O pensamento computacional pode ser integrado a todas as disciplinas! Aqui estão algumas ideias:\n\n**Matemática:**\n• Algoritmos para resolver problemas\n• Padrões e sequências\n• Geometria com programação\n\n**Português:**\n• Narrativas interativas\n• Criação de histórias digitais\n• Análise de textos com algoritmos\n\n**Ciências:**\n• Simulações e modelagem\n• Coleta e análise de dados\n• Experimentos virtuais\n\n**História/Geografia:**\n• Linha do tempo interativa\n• Mapas digitais\n• Simulações históricas\n\n**Artes:**\n• Arte generativa\n• Música programada\n• Design digital\n\nO importante é conectar com o conteúdo que você já ensina!';
    }

    // Respostas sobre dificuldades técnicas
    if (message.includes('computador') || message.includes('internet') || message.includes('tecnologia') || message.includes('equipamento')) {
      return 'Não se preocupe! O pensamento computacional pode ser ensinado mesmo com recursos limitados:\n\n**Sem Computadores:**\n• Atividades desplugadas (nossa especialidade!)\n• Jogos de tabuleiro\n• Atividades com papel e lápis\n• Brincadeiras corporais\n\n**Com Poucos Recursos:**\n• Use celulares dos alunos\n• Computadores compartilhados\n• Ferramentas gratuitas online\n• Materiais reciclados para robótica\n\n**Dicas Práticas:**\n• Comece sempre desplugado\n• Use analogias do cotidiano\n• Trabalhe em grupos pequenos\n• Foque no pensamento, não na tecnologia\n\nLembre-se: o pensamento computacional é sobre resolver problemas, não sobre usar computadores!';
    }

    // Respostas sobre motivação
    if (message.includes('motivar') || message.includes('interesse') || message.includes('engajamento') || message.includes('participação')) {
      return 'Manter os alunos motivados é fundamental! Aqui estão algumas estratégias:\n\n**Torne Relevante:**\n• Conecte com interesses dos alunos\n• Use problemas do mundo real\n• Mostre aplicações práticas\n\n**Gamificação:**\n• Crie desafios e competições\n• Use sistemas de pontuação\n• Celebre conquistas\n\n**Colaboração:**\n• Trabalho em equipe\n• Projetos colaborativos\n• Peer teaching (alunos ensinam alunos)\n\n**Criatividade:**\n• Permita personalização\n• Incentive soluções criativas\n• Mostre diferentes caminhos\n\n**Progressão:**\n• Comece fácil e aumente gradualmente\n• Celebre pequenas vitórias\n• Dê feedback positivo\n\nO segredo é mostrar que programar é como resolver quebra-cabeças divertidos!';
    }

    // Respostas padrão
    const defaultResponses = [
      'Interessante pergunta! Posso te ajudar com informações sobre pensamento computacional, atividades educacionais, recursos da BNCC, programação, robótica ou implementação pedagógica. Sobre qual desses tópicos você gostaria de saber mais?',
      'Ótima pergunta! Nossa plataforma BNCC Computacional tem muitos recursos para te ajudar. Posso falar sobre atividades desplugadas, programação visual, robótica educacional, ou como implementar o pensamento computacional na sua escola. O que te interessa mais?',
      'Posso te ajudar com várias questões sobre educação computacional! Você pode me perguntar sobre:\n\n• Conceitos de pensamento computacional\n• Atividades para diferentes idades\n• Recursos educacionais\n• Estratégias de implementação\n• Dicas pedagógicas\n\nSobre o que você gostaria de conversar?'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Log da interação com o assistente
    if (user) {
      activityLogger.logActivity(
        user.id, 
        user.name, 
        user.email, 
        'search', 
        'assistant', 
        'ai-assistant', 
        'Assistente BNCC', 
        `Pergunta: "${inputValue}"`
      );
    }
    
    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);
    setApiError(false);
    setUsingAI(true);
    setIsOnline(true);

    try {
      // Verificar se é uma pergunta sobre sugestão de atividades do dia
      const isActivitySuggestion = messageContent.toLowerCase().includes('atividade') && 
                                   (messageContent.toLowerCase().includes('hoje') || 
                                    messageContent.toLowerCase().includes('sugerir') ||
                                    messageContent.toLowerCase().includes('sugestão') ||
                                    messageContent.toLowerCase().includes('dia'));

      let response: string;
      
      if (isActivitySuggestion) {
        // Usar Groq para sugestões de atividades
        const prompt = `Como assistente educacional especializado em BNCC e pensamento computacional, sugira atividades práticas para o professor aplicar hoje em sala de aula. ${messageContent}. Forneça sugestões detalhadas, práticas e alinhadas à BNCC.`;
        
        const aiResponse = await apiService.suggestActivitiesFromAI(prompt);
        
        if (aiResponse.error) {
          // Fallback para resposta pré-definida se houver erro
          response = generateResponse(messageContent);
          setApiError(true);
        } else {
          response = aiResponse.suggestions || generateResponse(messageContent);
        }
      } else {
        // Para TODAS as outras perguntas, usar Groq (API real)
        const prompt = `Você é um assistente educacional especializado em BNCC (Base Nacional Comum Curricular) e pensamento computacional. Responda de forma clara, prática e objetiva, sempre relacionando com a BNCC quando relevante. Seja conciso mas completo. ${messageContent}`;
        
        try {
          const aiResponse = await apiService.suggestActivitiesFromAI(prompt);
          
          if (aiResponse.error || !aiResponse.suggestions) {
            // Fallback para resposta pré-definida apenas se houver erro na API
            console.warn('Erro na API Groq, usando fallback:', aiResponse.message);
            response = generateResponse(messageContent);
            setApiError(true);
            setUsingAI(false);
          } else {
            response = aiResponse.suggestions;
            setUsingAI(true);
            setApiError(false);
          }
        } catch (error) {
          // Fallback para resposta pré-definida em caso de erro
          console.error('Erro ao chamar API Groq:', error);
          response = generateResponse(messageContent);
          setApiError(true);
          setUsingAI(false);
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Em caso de erro, usar resposta pré-definida
      const response = generateResponse(messageContent);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setApiError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Olá! Sou o Assistente da BNCC Computacional. Posso te ajudar com dúvidas sobre pensamento computacional, atividades, recursos educacionais e muito mais! Como posso te ajudar hoje?',
        timestamp: new Date()
      }
    ]);
    setApiError(false);
    setUsingAI(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: BookOpen, label: 'Atividades', action: 'Quais atividades posso usar com meus alunos?' },
    { icon: Activity, label: 'Pensamento Computacional', action: 'Explique o que é pensamento computacional' },
    { icon: FileText, label: 'Recursos', action: 'Quais recursos educacionais vocês oferecem?' },
    { icon: Video, label: 'Programação', action: 'Como ensinar programação para crianças?' },
    { icon: HelpCircle, label: 'Implementação', action: 'Como implementar na minha escola?' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 text-white rounded-t-2xl" style={{ backgroundColor: '#044982' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Assistente BNCC</h3>
                    {usingAI && (
                      <span className="px-2 py-0.5 bg-green-500 rounded-full text-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs opacity-90">Pensamento Computacional</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-xs opacity-75">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearConversation}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Limpar conversa"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'assistant' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm leading-relaxed">
                          {message.type === 'assistant' ? renderMarkdown(message.content) : message.content}
                        </div>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-4 py-3 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bot className="h-5 w-5 text-purple-600 animate-pulse" />
                        <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-spin" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-purple-600 font-medium">IA está pensando...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {apiError && messages.length > 1 && (
                <div className="flex justify-center">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span>Usando respostas locais. A API de IA não está disponível.</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2 font-medium">💡 Sugestões rápidas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        const userMessage: Message = {
                          id: Date.now().toString(),
                          type: 'user',
                          content: action.action,
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                        
                        if (user) {
                          activityLogger.logActivity(
                            user.id, 
                            user.name, 
                            user.email, 
                            'search', 
                            'assistant', 
                            'ai-assistant', 
                            'Assistente BNCC', 
                            `Pergunta: "${action.action}"`
                          );
                        }
                        
                        setIsTyping(true);
                        setApiError(false);
                        setUsingAI(false);
                        setIsOnline(false);

                        // Simular delay de resposta
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Usar apenas respostas pré-definidas
                        // Enviar ação como mensagem normal (será processada pelo handleSendMessage)
                        setInputValue(action.action);
                        setTimeout(() => {
                          handleSendMessage();
                        }, 100);
                        const assistantMessage: Message = {
                          id: (Date.now() + 1).toString(),
                          type: 'assistant',
                          content: response,
                          timestamp: new Date()
                        };

                        setMessages(prev => [...prev, assistantMessage]);
                        setIsTyping(false);
                      }}
                      className="flex items-center gap-2 p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all shadow-sm hover:shadow"
                    >
                      <action.icon className="h-3 w-3 text-blue-600 flex-shrink-0" />
                      <span className="truncate text-left">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta sobre BNCC Computacional..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {usingAI && (
                <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Powered by Groq AI
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
