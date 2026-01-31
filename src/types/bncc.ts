// Estrutura baseada na BNCC Computacional

export interface SchoolYear {
  id: string;
  name: string;
  level: 'educacao-infantil' | 'anos-iniciais' | 'anos-finais' | 'aee';
  order: number;
  description: string;
}

export interface BNCCAxis {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface KnowledgeObject {
  id: string;
  name: string;
  description: string;
  axisId: string;
  schoolYears: string[];
}

export interface Skill {
  id: string;
  code: string; // Ex: EF01CI01
  description: string;
  knowledgeObjectId: string;
  schoolYears: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'plugada' | 'desplugada';
  schoolYears: string[];
  axisId: string; // Mantido para compatibilidade, mas deprecated - usar axisIds
  axisIds: string[]; // Múltiplos eixos suportados
  knowledgeObjectId: string;
  skillIds: string[];
  duration: number; // em minutos
  difficulty?: 'facil' | 'medio' | 'dificil'; // Opcional: não usamos mais na plataforma
  materials: string[];
  objectives: string[];
  thumbnail_url: string;
  video_url?: string;
  document_url?: string;
  // PDFs: Estrutura Pedagógica (obrigatório na prática) e Material da Aula (opcional)
  pedagogical_pdf_url?: string;
  material_pdf_url?: string;
  created_at: string;
  /** Atividade bloqueada: aparece na lista mas não pode ser acessada (vídeo/PDF) */
  bloqueada?: boolean;
}

export interface VideoCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  schoolYears: string[];
  activities: string[]; // IDs das atividades relacionadas
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: 'pdf' | 'docx' | 'pptx';
  schoolYears: string[];
  activities: string[]; // IDs das atividades relacionadas
  created_at: string;
}

// Tipos para sistema de usuários e autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'root' | 'admin' | 'professor' | 'teste_professor' | 'aluno' | 'professor_cursos';
  school?: string;
  subjects?: string[];
  created_at: string;
  last_login?: string;
  is_active: boolean;
  can_manage_activities?: boolean;
  can_manage_courses?: boolean;
  // Campos de limite para admins
  max_professores?: number | null;
  max_alunos?: number | null;
  professores_criados?: number;
  alunos_criados?: number;
  pacote?: string | null;
  data_contratacao?: string | null;
  data_expiracao?: string | null;
  criado_por?: string | null;
}

export interface AdminPackage {
  id: string;
  name: string;
  max_professores: number;
  max_alunos: number;
  price?: number;
  description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'root' | 'admin' | 'professor' | 'teste_professor' | 'aluno' | 'professor_cursos';
  school?: string;
  subjects?: string[];
}

// Tipos para sistema de logs e analytics
export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  activity: 'login' | 'logout' | 'view_activity' | 'view_document' | 'view_video' | 'download' | 'search' | 'filter';
  resourceType?: 'activity' | 'document' | 'video' | 'page';
  resourceId?: string;
  resourceTitle?: string;
  details?: string;
  timestamp: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // em minutos
  activitiesCount: number;
  pagesVisited: string[];
  lastActivity: string;
}

export interface UserAnalytics {
  userId: string;
  userName: string;
  userEmail: string;
  totalSessions: number;
  totalTimeSpent: number; // em minutos
  totalActivities: number;
  totalDocuments: number;
  totalVideos: number;
  lastLogin: string;
  averageSessionDuration: number;
  mostViewedActivities: string[];
  mostViewedDocuments: string[];
  loginFrequency: number; // logins por semana
  activityFrequency: number; // atividades por dia
}

// Tipos de comunidade removidos - funcionalidade não utilizada