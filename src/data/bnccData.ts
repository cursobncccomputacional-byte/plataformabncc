import { SchoolYear, BNCCAxis, KnowledgeObject, Skill, Activity, VideoCourse, Document, User } from '../types/bncc';

// Anos escolares conforme BNCC
export const schoolYears: SchoolYear[] = [
  // Educação Infantil
  {
    id: 'ei',
    name: 'Educação Infantil',
    level: 'educacao-infantil',
    order: 1,
    description: 'Creche e Pré-escola'
  },
  
  // Anos Iniciais
  {
    id: '1ano',
    name: '1º Ano',
    level: 'anos-iniciais',
    order: 2,
    description: 'Ensino Fundamental - Anos Iniciais'
  },
  {
    id: '2ano',
    name: '2º Ano',
    level: 'anos-iniciais',
    order: 3,
    description: 'Ensino Fundamental - Anos Iniciais'
  },
  {
    id: '3ano',
    name: '3º Ano',
    level: 'anos-iniciais',
    order: 4,
    description: 'Ensino Fundamental - Anos Iniciais'
  },
  {
    id: '4ano',
    name: '4º Ano',
    level: 'anos-iniciais',
    order: 5,
    description: 'Ensino Fundamental - Anos Iniciais'
  },
  {
    id: '5ano',
    name: '5º Ano',
    level: 'anos-iniciais',
    order: 6,
    description: 'Ensino Fundamental - Anos Iniciais'
  },
  
  // Anos Finais
  {
    id: '6ano',
    name: '6º Ano',
    level: 'anos-finais',
    order: 7,
    description: 'Ensino Fundamental - Anos Finais'
  },
  {
    id: '7ano',
    name: '7º Ano',
    level: 'anos-finais',
    order: 8,
    description: 'Ensino Fundamental - Anos Finais'
  },
  {
    id: '8ano',
    name: '8º Ano',
    level: 'anos-finais',
    order: 9,
    description: 'Ensino Fundamental - Anos Finais'
  },
  {
    id: '9ano',
    name: '9º Ano',
    level: 'anos-finais',
    order: 10,
    description: 'Ensino Fundamental - Anos Finais'
  },
  
  // AEE
  {
    id: 'aee',
    name: 'AEE',
    level: 'aee',
    order: 11,
    description: 'Atendimento Educacional Especializado'
  }
];

// Eixos da BNCC Computacional
export const bnccAxes: BNCCAxis[] = [
  {
    id: 'pensamento-computacional',
    name: 'Pensamento Computacional',
    description: 'Desenvolvimento de habilidades para resolver problemas de forma sistemática',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'mundo-digital',
    name: 'Mundo Digital',
    description: 'Compreensão e interação com o ambiente digital',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'cultura-digital',
    name: 'Cultura Digital',
    description: 'Uso crítico e responsável das tecnologias digitais',
    color: 'bg-blue-100 text-blue-700'
  }
];

// Objetos do Conhecimento
export const knowledgeObjects: KnowledgeObject[] = [
  {
    id: 'algoritmos',
    name: 'Algoritmos',
    description: 'Sequência de instruções para resolver problemas',
    axisId: 'pensamento-computacional',
    schoolYears: ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'decomposicao',
    name: 'Decomposição',
    description: 'Quebrar problemas complexos em partes menores',
    axisId: 'pensamento-computacional',
    schoolYears: ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'abstracao',
    name: 'Abstração',
    description: 'Identificar padrões e características essenciais',
    axisId: 'pensamento-computacional',
    schoolYears: ['3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'programacao-visual',
    name: 'Programação Visual',
    description: 'Programação usando blocos visuais',
    axisId: 'pensamento-computacional',
    schoolYears: ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'ferramentas-digitais',
    name: 'Ferramentas Digitais',
    description: 'Uso de aplicativos e softwares educacionais',
    axisId: 'mundo-digital',
    schoolYears: ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'robotica-educacional',
    name: 'Mundo Digital',
    description: 'Construção e programação de robôs',
    axisId: 'mundo-digital',
    schoolYears: ['4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'seguranca-digital',
    name: 'Segurança Digital',
    description: 'Proteção de dados e privacidade online',
    axisId: 'cultura-digital',
    schoolYears: ['4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  },
  {
    id: 'colaboracao-digital',
    name: 'Colaboração Digital',
    description: 'Trabalho em equipe usando ferramentas digitais',
    axisId: 'cultura-digital',
    schoolYears: ['3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano']
  }
];

// Habilidades da BNCC
export const skills: Skill[] = [
  {
    id: 'ef01ci01',
    code: 'EF01CI01',
    description: 'Identificar e descrever padrões em sequências simples',
    knowledgeObjectId: 'algoritmos',
    schoolYears: ['1ano']
  },
  {
    id: 'ef02ci01',
    code: 'EF02CI01',
    description: 'Descrever sequências de ações para resolver problemas',
    knowledgeObjectId: 'algoritmos',
    schoolYears: ['2ano']
  },
  {
    id: 'ef03ci01',
    code: 'EF03CI01',
    description: 'Identificar padrões em sequências e decompor problemas',
    knowledgeObjectId: 'decomposicao',
    schoolYears: ['3ano']
  },
  {
    id: 'ef04ci01',
    code: 'EF04CI01',
    description: 'Aplicar conceitos de abstração e generalização',
    knowledgeObjectId: 'abstracao',
    schoolYears: ['4ano']
  },
  {
    id: 'ef05ci01',
    code: 'EF05CI01',
    description: 'Desenvolver algoritmos para resolver problemas complexos',
    knowledgeObjectId: 'algoritmos',
    schoolYears: ['5ano']
  },
  {
    id: 'ef06ci01',
    code: 'EF06CI01',
    description: 'Programar usando linguagens visuais',
    knowledgeObjectId: 'programacao-visual',
    schoolYears: ['6ano']
  },
  {
    id: 'ef07ci01',
    code: 'EF07CI01',
    description: 'Desenvolver projetos de robótica educacional',
    knowledgeObjectId: 'construcao-robotica',
    schoolYears: ['7ano']
  },
  {
    id: 'ef08ci01',
    code: 'EF08CI01',
    description: 'Aplicar princípios de segurança digital',
    knowledgeObjectId: 'seguranca-digital',
    schoolYears: ['8ano']
  },
  {
    id: 'ef09ci01',
    code: 'EF09CI01',
    description: 'Colaborar em projetos digitais complexos',
    knowledgeObjectId: 'colaboracao-digital',
    schoolYears: ['9ano']
  }
];

// Atividades Plugadas e Desplugadas
// Conteúdo removido para começar a cadastrar as aulas reais (mantém estrutura)
export const activities: Activity[] = [];

// Cursos de vídeo organizados por anos
// Conteúdo removido para começar a cadastrar as aulas reais (mantém estrutura)
export const videoCourses: VideoCourse[] = [];

// Documentos organizados por anos
// Conteúdo removido para começar a cadastrar as aulas reais (mantém estrutura)
export const documents: Document[] = [];
// Usuários agora vêm apenas da API - dados reais do banco de dados
// Não há mais dados fictícios locais
