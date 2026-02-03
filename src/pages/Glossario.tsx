import { useState, useMemo } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

export interface GlossarioTermo {
  termo: string;
  definicao: string;
  categoria: 'geral' | 'pensamento-computacional' | 'mundo-digital' | 'cultura-digital' | 'estrutura' | 'pedagogico';
}

const GLOSSARIO: GlossarioTermo[] = [
  // Geral / BNCC
  {
    termo: 'BNCC',
    categoria: 'geral',
    definicao: 'Base Nacional Comum Curricular. Documento normativo que define o conjunto de aprendizagens essenciais que todos os alunos devem desenvolver ao longo das etapas da Educação Básica (Educação Infantil, Ensino Fundamental e Ensino Médio).',
  },
  {
    termo: 'BNCC Computacional',
    categoria: 'geral',
    definicao: 'Complemento à BNCC homologado pelo MEC (2022) que integra a Computação na Educação Básica. Estruturado em três eixos: Pensamento Computacional, Mundo Digital e Cultura Digital, desde a Educação Infantil até o Ensino Médio.',
  },
  {
    termo: 'Computação na Educação Básica',
    categoria: 'geral',
    definicao: 'Inserção da computação como componente formativo na Educação Infantil e no Ensino Fundamental, de forma integrada e transversal às áreas já existentes (Matemática, Ciências, Linguagens etc.), desenvolvendo competências digitais e pensamento computacional.',
  },
  // Estrutura curricular
  {
    termo: 'Eixo',
    categoria: 'estrutura',
    definicao: 'Grande área de conhecimento da BNCC Computacional. São três eixos: (1) Pensamento Computacional — o "quê" do conhecimento; (2) Mundo Digital — o "como"; (3) Cultura Digital — o "porquê" e o uso ético e cidadão.',
  },
  {
    termo: 'Habilidade',
    categoria: 'estrutura',
    definicao: 'Objetivo de aprendizagem descrito na BNCC (e no complemento computacional), geralmente identificado por um código (ex.: EF01CI01). Indica o que o estudante deve ser capaz de fazer ao final de determinada etapa/ano.',
  },
  {
    termo: 'Objeto de Conhecimento',
    categoria: 'estrutura',
    definicao: 'Conteúdo ou tema específico ao qual uma habilidade está vinculada. No Ensino Fundamental, as habilidades são organizadas em relação a objetos de conhecimento (ex.: algoritmos, dados, redes). Na Educação Infantil usa-se "Objetivo de Aprendizagem".',
  },
  {
    termo: 'Objetivo de Aprendizagem',
    categoria: 'estrutura',
    definicao: 'Formulação usada na Educação Infantil na BNCC Computacional, equivalente à noção de habilidade nos anos seguintes. Descreve o que se espera que a criança desenvolva em termos de pensamento computacional e uso consciente do digital.',
  },
  {
    termo: 'Código da Habilidade',
    categoria: 'estrutura',
    definicao: 'Identificador alfanumérico da habilidade na BNCC (ex.: EF01CI01, EF67LP01). Facilita o mapeamento de atividades, planos de aula e relatórios ao currículo oficial.',
  },
  {
    termo: 'Etapa de Ensino',
    categoria: 'estrutura',
    definicao: 'Nível ou ano escolar ao qual uma habilidade ou atividade se refere: Educação Infantil, 1º Ano a 9º Ano do Ensino Fundamental. Usado para filtrar conteúdos e planejar sequências didáticas.',
  },
  {
    termo: 'Educação Infantil',
    categoria: 'estrutura',
    definicao: 'Primeira etapa da Educação Básica (creche e pré-escola). Na BNCC Computacional, o foco é o desenvolvimento do pensamento lógico por meio de atividades lúdicas, reconhecimento de padrões e vivência de sequências e algoritmos de forma concreta e desplugada.',
  },
  {
    termo: 'Anos Iniciais',
    categoria: 'estrutura',
    definicao: '1º ao 5º ano do Ensino Fundamental. Na computação, introduz-se algoritmos simples, decomposição de problemas e representações de sequências, com atividades plugadas e desplugadas.',
  },
  {
    termo: 'Anos Finais',
    categoria: 'estrutura',
    definicao: '6º ao 9º ano do Ensino Fundamental. Aprofundamento em programação, tipos de dados, algoritmos mais complexos e temas de Mundo Digital e Cultura Digital (redes, dados, ética).',
  },
  // Pensamento Computacional
  {
    termo: 'Pensamento Computacional',
    categoria: 'pensamento-computacional',
    definicao: 'Conjunto de processos mentais e estratégias para resolver problemas de forma sistemática, usando ideias da computação: decomposição, reconhecimento de padrões, abstração e algoritmos. É o eixo que responde ao "quê" do conhecimento na BNCC Computacional.',
  },
  {
    termo: 'Decomposição',
    categoria: 'pensamento-computacional',
    definicao: 'Dividir um problema complexo em partes menores e mais simples, que podem ser resolvidas separadamente. Um dos pilares do pensamento computacional.',
  },
  {
    termo: 'Reconhecimento de Padrões',
    categoria: 'pensamento-computacional',
    definicao: 'Identificar regularidades, semelhanças e repetições em situações, dados ou sequências. Permite generalizar soluções e reutilizar estratégias em novos contextos.',
  },
  {
    termo: 'Abstração',
    categoria: 'pensamento-computacional',
    definicao: 'Focar nos aspectos essenciais de um problema ou sistema, ignorando detalhes irrelevantes. Permite criar modelos e representações que facilitam a compreensão e a solução.',
  },
  {
    termo: 'Algoritmo',
    categoria: 'pensamento-computacional',
    definicao: 'Sequência finita e ordenada de passos bem definidos para realizar uma tarefa ou resolver um problema. Pode ser executado por pessoas ou por máquinas (programas).',
  },
  {
    termo: 'Programação',
    categoria: 'pensamento-computacional',
    definicao: 'Atividade de criar algoritmos expressos em uma linguagem que o computador (ou outro agente) possa executar. Envolve lógica, estruturas de controle (condicionais, repetições) e representação de dados.',
  },
  {
    termo: 'Lógica de Programação',
    categoria: 'pensamento-computacional',
    definicao: 'Conjunto de regras e estruturas (condicionais, laços, sequência) usadas para construir algoritmos e programas corretos e compreensíveis.',
  },
  {
    termo: 'Sequência (computacional)',
    categoria: 'pensamento-computacional',
    definicao: 'Ordem determinada de passos ou instruções. A execução na ordem correta é fundamental para o resultado do algoritmo.',
  },
  {
    termo: 'Condicional',
    categoria: 'pensamento-computacional',
    definicao: 'Estrutura que executa um bloco de ações apenas se uma condição for verdadeira (e opcionalmente outro bloco se for falsa). Ex.: "se chove, leve guarda-chuva".',
  },
  {
    termo: 'Repetição (laço/loop)',
    categoria: 'pensamento-computacional',
    definicao: 'Estrutura que executa um conjunto de instruções várias vezes enquanto uma condição for verdadeira (ou até um certo número de vezes). Ex.: "repita 5 vezes: pule".',
  },
  {
    termo: 'Debugging (depuração)',
    categoria: 'pensamento-computacional',
    definicao: 'Processo de identificar e corrigir erros em um algoritmo ou programa. Envolve testes, análise de resultados e ajuste dos passos até o comportamento desejado.',
  },
  {
    termo: 'Representação de Dados',
    categoria: 'pensamento-computacional',
    definicao: 'Forma como informações são organizadas e codificadas (números, texto, listas, tabelas) para serem processadas por algoritmos ou programas.',
  },
  // Mundo Digital
  {
    termo: 'Mundo Digital',
    categoria: 'mundo-digital',
    definicao: 'Eixo da BNCC Computacional que aborda o "como" da tecnologia: meios físicos e digitais, hardware e software, armazenamento, redes, segurança da informação e tratamento de dados.',
  },
  {
    termo: 'Hardware',
    categoria: 'mundo-digital',
    definicao: 'Parte física do computador e dos dispositivos digitais (processador, memória, telas, sensores). Na escola, pode ser abordado em atividades que exploram como os dados entram e saem do dispositivo.',
  },
  {
    termo: 'Software',
    categoria: 'mundo-digital',
    definicao: 'Programas e aplicativos que rodam no computador ou em dispositivos. Inclui sistemas operacionais, editores, ambientes de programação e aplicações educacionais.',
  },
  {
    termo: 'Dados',
    categoria: 'mundo-digital',
    definicao: 'Informações em formato que pode ser processado, armazenado ou transmitido (números, textos, imagens, áudios). A BNCC aborda como os dados são gerados, armazenados e protegidos.',
  },
  {
    termo: 'Rede (redes de computadores)',
    categoria: 'mundo-digital',
    definicao: 'Conexão entre dispositivos para troca de dados e recursos. Inclui internet, Wi-Fi e conceitos como endereço (IP), domínio e navegação segura.',
  },
  {
    termo: 'Segurança Digital',
    categoria: 'mundo-digital',
    definicao: 'Práticas e conhecimentos para proteger dispositivos, dados e identidade: senhas fortes, cuidado com links e arquivos, privacidade e reconhecimento de riscos (golpes, vírus).',
  },
  {
    termo: 'Privacidade',
    categoria: 'mundo-digital',
    definicao: 'Direito de controlar quais informações pessoais são compartilhadas e com quem. Na BNCC, relaciona-se ao uso consciente de redes e aplicativos e à proteção de dados (LGPD).',
  },
  {
    termo: 'Armazenamento de Dados',
    categoria: 'mundo-digital',
    definicao: 'Guardar dados em dispositivos locais (HD, pendrive) ou em nuvem. Envolve noções de capacidade, backup e onde as informações ficam quando usamos serviços online.',
  },
  // Cultura Digital
  {
    termo: 'Cultura Digital',
    categoria: 'cultura-digital',
    definicao: 'Eixo da BNCC Computacional que enfatiza o "porquê" e o uso crítico e cidadão das tecnologias: ética, cidadania digital, impacto social, inclusão e responsabilidade no ambiente digital.',
  },
  {
    termo: 'Cidadania Digital',
    categoria: 'cultura-digital',
    definicao: 'Uso responsável, ético e seguro da tecnologia; respeito aos outros na internet, combate ao discurso de ódio e às fake news e participação democrática no espaço digital.',
  },
  {
    termo: 'Ética no Ambiente Digital',
    categoria: 'cultura-digital',
    definicao: 'Princípios de conduta no uso da internet e das redes: não praticar cyberbullying, respeitar autoria (direitos autorais), não divulgar informações falsas e zelar pelo bem-estar coletivo.',
  },
  {
    termo: 'Inclusão Digital',
    categoria: 'cultura-digital',
    definicao: 'Garantir que todas as pessoas tenham acesso às tecnologias e às competências necessárias para usá-las de forma crítica e participativa, reduzindo desigualdades.',
  },
  {
    termo: 'Impacto Social da Tecnologia',
    categoria: 'cultura-digital',
    definicao: 'Reflexão sobre como as tecnologias afetam a sociedade, o trabalho, a comunicação e o meio ambiente, e sobre a responsabilidade no desenvolvimento e no uso dessas tecnologias.',
  },
  {
    termo: 'Fake News',
    categoria: 'cultura-digital',
    definicao: 'Informações falsas divulgadas como se fossem verdadeiras. A BNCC incentiva a checagem de fontes e o pensamento crítico para identificar e não disseminar notícias falsas.',
  },
  // Pedagógico / Plataforma
  {
    termo: 'Atividade Plugada',
    categoria: 'pedagogico',
    definicao: 'Atividade que utiliza computador, tablet ou outro dispositivo digital (programação, aplicativos, jogos educativos). Complementa as atividades desplugadas no desenvolvimento do pensamento computacional.',
  },
  {
    termo: 'Atividade Desplugada',
    categoria: 'pedagogico',
    definicao: 'Atividade realizada sem uso de computador, com materiais concretos (papel, blocos, cartões, corpo). Desenvolve os mesmos conceitos (algoritmo, padrões, sequência) de forma acessível e colaborativa.',
  },
  {
    termo: 'Trilha Pedagógica',
    categoria: 'pedagogico',
    definicao: 'Sequência organizada de atividades ou conteúdos com objetivo de aprendizagem definido. Pode ser agrupada por eixo BNCC, ano, disciplina transversal ou tema.',
  },
  {
    termo: 'Plano de Aula',
    categoria: 'pedagogico',
    definicao: 'Documento de planejamento que organiza objetivos, atividades, recursos e avaliação para uma ou mais aulas, podendo vincular-se às habilidades da BNCC Computacional.',
  },
  {
    termo: 'Formação Continuada',
    categoria: 'pedagogico',
    definicao: 'Processo de formação em serviço dos professores. Na plataforma, refere-se aos cursos e materiais voltados à atualização em BNCC Computacional e uso pedagógico das atividades.',
  },
  {
    termo: 'Estrutura Pedagógica',
    categoria: 'pedagogico',
    definicao: 'Documento (geralmente PDF) que descreve a proposta da atividade: objetivos, habilidades BNCC, passo a passo, materiais e sugestões de avaliação. Anexado às atividades na plataforma.',
  },
  {
    termo: 'Material da Aula',
    categoria: 'pedagogico',
    definicao: 'Arquivo complementar (ex.: PDF para impressão, modelo de atividade) que o professor pode usar em sala junto com a atividade cadastrada na plataforma.',
  },
  {
    termo: 'Disciplina Transversal',
    categoria: 'pedagogico',
    definicao: 'Tema ou área que atravessa várias disciplinas (ex.: Matemática, Ciências, Língua Portuguesa). A computação na BNCC se integra de forma transversal a essas áreas.',
  },
  {
    termo: 'Competência (BNCC)',
    categoria: 'estrutura',
    definicao: 'Mobilização de conhecimentos, habilidades e atitudes para resolver demandas complexas. A BNCC define competências gerais e específicas por área; a computação contribui para várias delas.',
  },
  {
    termo: 'Interdisciplinaridade',
    categoria: 'pedagogico',
    definicao: 'Integração de conhecimentos de diferentes áreas em um mesmo contexto de ensino. A BNCC Computacional é trabalhada de forma integrada a Matemática, Ciências, Linguagens e outros componentes.',
  },
  {
    termo: 'LGPD',
    categoria: 'cultura-digital',
    definicao: 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Regula o tratamento de dados pessoais no Brasil. Na escola, relaciona-se ao uso consciente de dados dos alunos e à reflexão sobre privacidade no ambiente digital.',
  },
  {
    termo: 'Recursos Educacionais Digitais',
    categoria: 'pedagogico',
    definicao: 'Materiais em formato digital usados no processo de ensino e aprendizagem: vídeos, aplicativos, jogos, ambientes de programação, PDFs e plataformas. Na BNCC Computacional, incluem atividades plugadas e materiais de apoio.',
  },
  {
    termo: 'Explicação da Habilidade',
    categoria: 'estrutura',
    definicao: 'Texto descritivo que detalha o significado e o alcance de uma habilidade no Ensino Fundamental, auxiliando o professor no planejamento e na avaliação. Cadastrado no módulo BNCC Computacional Digital.',
  },
];

const CATEGORIA_LABEL: Record<GlossarioTermo['categoria'], string> = {
  geral: 'BNCC e Conceitos Gerais',
  estrutura: 'Estrutura Curricular',
  'pensamento-computacional': 'Pensamento Computacional',
  'mundo-digital': 'Mundo Digital',
  'cultura-digital': 'Cultura Digital',
  pedagogico: 'Prática Pedagógica e Plataforma',
};

export const Glossario = () => {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<GlossarioTermo['categoria'] | ''>('');
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  const termosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let list = GLOSSARIO;
    if (categoriaFiltro) {
      list = list.filter((t) => t.categoria === categoriaFiltro);
    }
    if (q) {
      list = list.filter(
        (t) =>
          t.termo.toLowerCase().includes(q) ||
          t.definicao.toLowerCase().includes(q)
      );
    }
    return list;
  }, [busca, categoriaFiltro]);

  const toggleExpandido = (termo: string) => {
    setExpandido((prev) => ({ ...prev, [termo]: !prev[termo] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-8 w-8" style={{ color: '#005a93' }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#044982' }}>
            Glossário — BNCC Computacional
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Termos técnicos e conceitos da Base Nacional Comum Curricular em Computação
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
        {/* Busca e filtro */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar termo ou definição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005a93] focus:border-[#005a93]"
            />
          </div>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value as GlossarioTermo['categoria'] | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005a93] focus:border-[#005a93] bg-white min-w-[200px]"
          >
            <option value="">Todas as categorias</option>
            {(Object.keys(CATEGORIA_LABEL) as GlossarioTermo['categoria'][]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIA_LABEL[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Contagem */}
        <p className="text-sm text-gray-500">
          {termosFiltrados.length} {termosFiltrados.length === 1 ? 'termo' : 'termos'}
          {busca || categoriaFiltro ? ' (filtrado)' : ''}
        </p>

        {/* Lista de termos */}
        <div className="space-y-3">
          {termosFiltrados.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              Nenhum termo encontrado. Tente outra busca ou categoria.
            </p>
          ) : (
            termosFiltrados.map((item) => {
              const isOpen = expandido[item.termo] !== false;
              return (
                <div
                  key={item.termo}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpandido(item.termo)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{item.termo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {CATEGORIA_LABEL[item.categoria]}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-0">
                      <p className="text-gray-700 text-sm leading-relaxed border-t border-gray-100 pt-3">
                        {item.definicao}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <footer className="pt-4 border-t border-gray-200 text-xs text-gray-500">
          Glossário alinhado ao complemento da BNCC em Computação (MEC). Uso pedagógico e de gestão da plataforma.
        </footer>
      </div>
    </div>
  );
};
