// Tipos de comunidade removidos - arquivo mantido apenas para referência
// import { CommunityPost, CommunityComment, CommunityActivity } from '../types/bncc';

// Posts da comunidade - removido
export const communityPosts: any[] = [
  {
    id: 'post001',
    authorId: 'prof001',
    authorName: 'João Oliveira',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    title: 'Atividade de Sequências com LEGO - Resultados Incríveis!',
    content: 'Compartilho uma experiência fantástica que tive com meus alunos do 3º ano. Criamos uma atividade de sequências usando peças de LEGO e os resultados foram surpreendentes!\n\n**Como fizemos:**\n1. Cada aluno recebeu 10 peças de LEGO\n2. Eu criava uma sequência e eles tinham que reproduzir\n3. Depois eles criavam suas próprias sequências\n4. Trabalhamos em duplas para validar as sequências\n\n**Resultados:**\n- 100% de engajamento\n- Desenvolvimento do raciocínio lógico\n- Trabalho colaborativo\n- Muita criatividade!\n\nRecomendo muito essa abordagem!',
    type: 'experience',
    tags: ['lego', 'sequências', '3º ano', 'colaboração', 'criatividade'],
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        name: 'Atividade com LEGO'
      }
    ],
    likes: 24,
    comments: 8,
    views: 156,
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post002',
    authorId: 'prof002',
    authorName: 'Maria Santos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    title: 'Dúvida: Como avaliar pensamento computacional?',
    content: 'Olá pessoal! Estou implementando pensamento computacional na minha escola e tenho uma dúvida importante: como vocês avaliam o desenvolvimento dessa competência nos alunos?\n\nEstou trabalhando com turmas do 5º ano e queria saber:\n- Quais critérios vocês usam?\n- Como documentam o progresso?\n- Que instrumentos de avaliação funcionam melhor?\n\nAgradeço qualquer dica ou experiência que possam compartilhar!',
    type: 'question',
    tags: ['avaliação', '5º ano', 'pensamento computacional', 'dúvida'],
    likes: 12,
    comments: 15,
    views: 89,
    isPinned: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post003',
    authorId: 'prof003',
    authorName: 'Pedro Costa',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    title: 'Dica: Scratch Jr sem tablets - Use o computador!',
    content: 'Descobri uma forma genial de usar Scratch Jr mesmo sem tablets na escola!\n\n**A solução:**\n- Instalei o Scratch Jr no computador (versão web)\n- Conectei um mouse sem fio\n- Os alunos usam o mouse como se fosse o dedo\n- Funciona perfeitamente!\n\n**Vantagens:**\n- Não precisa de tablets caros\n- Funciona em qualquer computador\n- Alunos se adaptam rapidamente\n- Mesma experiência de programação\n\nTestei com 2 turmas e foi um sucesso total!',
    type: 'tip',
    tags: ['scratch jr', 'computador', 'mouse', 'dica', 'tecnologia'],
    likes: 18,
    comments: 6,
    views: 134,
    isPinned: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post004',
    authorId: 'prof004',
    authorName: 'Ana Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    title: 'Atividade: Quebra-cabeça de Algoritmos',
    content: 'Compartilho uma atividade que criei para trabalhar algoritmos com meus alunos do 4º ano:\n\n**Objetivo:** Desenvolver raciocínio lógico através de quebra-cabeças\n\n**Materiais:**\n- Quebra-cabeças simples (50-100 peças)\n- Cartões com instruções\n- Cronômetro\n\n**Como funciona:**\n1. Alunos recebem instruções passo a passo\n2. Devem seguir a sequência exata\n3. Cronometramos o tempo\n4. Discutimos estratégias eficientes\n\n**Resultados:**\n- Melhoria significativa no raciocínio\n- Trabalho em equipe\n- Compreensão de algoritmos\n\nAnexei o material que criei!',
    type: 'activity',
    tags: ['algoritmos', 'quebra-cabeça', '4º ano', 'raciocínio lógico'],
    attachments: [
      {
        type: 'document',
        url: '/pdf/PDF_Exemplo.pdf',
        name: 'Material da Atividade - Quebra-cabeça de Algoritmos.pdf'
      }
    ],
    likes: 31,
    comments: 12,
    views: 203,
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post005',
    authorId: 'prof005',
    authorName: 'Carlos Mendes',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    title: 'Recurso: Lista de Sites Gratuitos para Programação',
    content: 'Compartilho uma lista curada de sites gratuitos que uso com meus alunos:\n\n**Para Iniciantes:**\n- Code.org - Cursos estruturados\n- Scratch - Programação visual\n- Lightbot - Jogos de programação\n\n**Para Intermediários:**\n- Khan Academy - Programação\n- Codecademy - Cursos interativos\n- FreeCodeCamp - Projetos práticos\n\n**Para Robótica:**\n- Tinkercad - Simulação 3D\n- Arduino IDE - Programação de microcontroladores\n\nTodos são gratuitos e funcionam bem em computadores básicos!',
    type: 'resource',
    tags: ['recursos', 'sites gratuitos', 'programação', 'robótica'],
    likes: 27,
    comments: 9,
    views: 178,
    isPinned: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

// Comentários dos posts
export const communityComments: any[] = [
  {
    id: 'comment001',
    postId: 'post001',
    authorId: 'prof002',
    authorName: 'Maria Santos',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    content: 'Que ideia genial! Vou testar com meus alunos do 2º ano. Você tem mais fotos da atividade?',
    likes: 3,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment002',
    postId: 'post001',
    authorId: 'prof003',
    authorName: 'Pedro Costa',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Excelente! Eu uso uma abordagem similar com blocos de madeira. O importante é a sequência lógica!',
    likes: 5,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment003',
    postId: 'post002',
    authorId: 'prof001',
    authorName: 'João Oliveira',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'Ótima pergunta! Eu uso uma rubrica com 4 critérios: decomposição, padrões, abstração e algoritmos. Cada um tem 3 níveis de desenvolvimento.',
    likes: 8,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comment004',
    postId: 'post002',
    authorId: 'prof004',
    authorName: 'Ana Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Documento tudo em portfólios digitais. Os alunos fazem autoavaliação e eu observo o processo. Funciona muito bem!',
    likes: 6,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
  }
];

// Atividades compartilhadas pela comunidade - removido
export const communityActivities: any[] = [
  {
    id: 'comm_act001',
    title: 'Robô Humano - Atividade Desplugada',
    description: 'Atividade para ensinar algoritmos através de comandos corporais',
    authorId: 'prof001',
    authorName: 'João Oliveira',
    schoolYear: ['2ano', '3ano', '4ano'],
    subjects: ['Matemática', 'Educação Física'],
    objectives: [
      'Desenvolver compreensão de algoritmos',
      'Trabalhar sequências lógicas',
      'Promover trabalho em equipe'
    ],
    materials: [
      'Cartões com comandos (frente, trás, esquerda, direita)',
      'Espaço amplo',
      'Objetos para criar obstáculos'
    ],
    instructions: '1. Um aluno é o "robô" e outro o "programador"\n2. O programador dá comandos usando os cartões\n3. O robô executa os comandos na sequência\n4. Objetivo: chegar ao destino sem bater em obstáculos',
    tips: 'Comece com comandos simples e vá aumentando a complexidade. Use obstáculos para tornar mais desafiador.',
    difficulty: 'facil',
    duration: 30,
    tags: ['algoritmos', 'desplugada', 'trabalho em equipe', 'comandos'],
    likes: 15,
    downloads: 23,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm_act002',
    title: 'Código Secreto com Cores',
    description: 'Atividade para trabalhar padrões e sequências usando cores',
    authorId: 'prof002',
    authorName: 'Maria Santos',
    schoolYear: ['1ano', '2ano', '3ano'],
    subjects: ['Artes', 'Matemática'],
    objectives: [
      'Identificar padrões visuais',
      'Criar sequências lógicas',
      'Desenvolver criatividade'
    ],
    materials: [
      'Cartões coloridos',
      'Papel',
      'Lápis de cor'
    ],
    instructions: '1. Crie um padrão de cores (ex: azul, vermelho, azul, vermelho)\n2. Alunos devem continuar o padrão\n3. Depois criam seus próprios padrões\n4. Desafio: decifrar códigos secretos com padrões',
    tips: 'Use padrões simples no início. Incentive os alunos a explicarem seus padrões para a turma.',
    difficulty: 'facil',
    duration: 25,
    tags: ['padrões', 'cores', 'sequências', 'criatividade'],
    likes: 12,
    downloads: 18,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];
