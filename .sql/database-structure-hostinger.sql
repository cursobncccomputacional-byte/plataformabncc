-- =====================================================
-- ESTRUTURA DO BANCO DE DADOS - PLATAFORMA BNCC
-- Banco: u985723830_novaedu
-- Hostinger
-- =====================================================

-- Selecionar o banco de dados
USE u985723830_novaedu;

-- =====================================================
-- 1. TABELA DE USUÁRIOS DO SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do usuário',
  name VARCHAR(255) NOT NULL COMMENT 'Nome completo do usuário',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email (usado para login)',
  password VARCHAR(255) NOT NULL COMMENT 'Hash da senha (gerado com password_hash do PHP)',
  role ENUM('root', 'admin', 'professor', 'aluno') NOT NULL DEFAULT 'professor' COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos)',
  school VARCHAR(255) DEFAULT NULL COMMENT 'Nome da escola ou instituição',
  subjects JSON DEFAULT NULL COMMENT 'Array de matérias que o usuário leciona (para professores) ou estuda (para alunos)',
  bio TEXT DEFAULT NULL COMMENT 'Biografia do usuário',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da conta',
  last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora do último login',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Se o usuário está ativo (TRUE) ou inativo (FALSE)',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização',
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela principal de usuários do sistema';

-- =====================================================
-- 2. TABELA DE ANOS ESCOLARES (BNCC)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_years (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do ano escolar',
  name VARCHAR(255) NOT NULL COMMENT 'Nome do ano (ex: 1º Ano, 2º Ano, etc.)',
  level ENUM('educacao-infantil', 'anos-iniciais', 'anos-finais', 'aee') NOT NULL COMMENT 'Nível educacional: educação-infantil, anos-iniciais (1º ao 5º), anos-finais (6º ao 9º), aee (Atendimento Educacional Especializado)',
  order_number INT NOT NULL COMMENT 'Ordem de exibição (1, 2, 3...)',
  description TEXT COMMENT 'Descrição do ano escolar',
  
  INDEX idx_level (level),
  INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Anos escolares da BNCC';

-- =====================================================
-- 3. TABELA DE EIXOS DA BNCC
-- =====================================================
CREATE TABLE IF NOT EXISTS bncc_axes (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do eixo',
  name VARCHAR(255) NOT NULL COMMENT 'Nome do eixo (ex: Pensamento Computacional, Cultura Digital)',
  description TEXT COMMENT 'Descrição do eixo',
  color VARCHAR(50) DEFAULT '#4F46E5' COMMENT 'Cor para exibição visual (formato hexadecimal)',
  
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eixos temáticos da BNCC para Pensamento Computacional';

-- =====================================================
-- 4. TABELA DE OBJETOS DE CONHECIMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_objects (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do objeto de conhecimento',
  name VARCHAR(255) NOT NULL COMMENT 'Nome do objeto de conhecimento',
  description TEXT COMMENT 'Descrição detalhada do objeto',
  axis_id VARCHAR(255) NOT NULL COMMENT 'ID do eixo ao qual pertence (chave estrangeira)',
  school_years JSON COMMENT 'Array de IDs dos anos escolares onde este objeto é trabalhado',
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE,
  INDEX idx_axis (axis_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Objetos de conhecimento da BNCC';

-- =====================================================
-- 5. TABELA DE HABILIDADES (COMPETÊNCIAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da habilidade',
  code VARCHAR(50) NOT NULL COMMENT 'Código da habilidade (ex: EF01CI01, EF02CI02)',
  description TEXT NOT NULL COMMENT 'Descrição completa da habilidade',
  knowledge_object_id VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento ao qual pertence (chave estrangeira)',
  school_years JSON COMMENT 'Array de IDs dos anos escolares onde esta habilidade é desenvolvida',
  
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  INDEX idx_code (code),
  INDEX idx_knowledge_object (knowledge_object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Habilidades e competências da BNCC';

-- =====================================================
-- 6. TABELA DE ATIVIDADES EDUCACIONAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da atividade',
  title VARCHAR(255) NOT NULL COMMENT 'Título da atividade',
  description TEXT COMMENT 'Descrição completa da atividade',
  type ENUM('plugada', 'desplugada') NOT NULL COMMENT 'Tipo: plugada (usa tecnologia/computador) ou desplugada (sem tecnologia)',
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais a atividade é adequada',
  axis_id VARCHAR(255) NOT NULL COMMENT 'ID do eixo BNCC (chave estrangeira)',
  knowledge_object_id VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento (chave estrangeira)',
  skill_ids JSON COMMENT 'Array de IDs das habilidades trabalhadas na atividade',
  duration INT DEFAULT NULL COMMENT 'Duração estimada da atividade em minutos',
  difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'medio' COMMENT 'Nível de dificuldade: fácil, médio ou difícil',
  materials JSON COMMENT 'Array de materiais necessários para realizar a atividade',
  objectives JSON COMMENT 'Array de objetivos de aprendizagem da atividade',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura',
  video_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo explicativo (se houver)',
  document_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do documento PDF ou arquivo relacionado (se houver)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da atividade',
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE,
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_axis (axis_id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Atividades educacionais alinhadas à BNCC';

-- =====================================================
-- 7. TABELA DE CURSOS DE VÍDEO
-- =====================================================
CREATE TABLE IF NOT EXISTS video_courses (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do curso de vídeo',
  title VARCHAR(255) NOT NULL COMMENT 'Título do curso',
  description TEXT COMMENT 'Descrição completa do curso',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura do vídeo',
  video_url VARCHAR(500) NOT NULL COMMENT 'URL do vídeo (YouTube, Vimeo, etc.)',
  duration INT NOT NULL COMMENT 'Duração do vídeo em segundos',
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o curso é adequado',
  activities JSON COMMENT 'Array de IDs das atividades relacionadas ao curso',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação do curso',
  
  INDEX idx_created (created_at),
  INDEX idx_duration (duration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cursos de vídeo educacionais';

-- =====================================================
-- 8. TABELA DE DOCUMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do documento',
  title VARCHAR(255) NOT NULL COMMENT 'Título do documento',
  description TEXT COMMENT 'Descrição do conteúdo do documento',
  file_url VARCHAR(500) NOT NULL COMMENT 'URL do arquivo (PDF, DOCX, PPTX)',
  file_type ENUM('pdf', 'docx', 'pptx') NOT NULL COMMENT 'Tipo do arquivo: PDF, DOCX (Word) ou PPTX (PowerPoint)',
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o documento é adequado',
  activities JSON COMMENT 'Array de IDs das atividades relacionadas ao documento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação/upload do documento',
  
  INDEX idx_file_type (file_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documentos educacionais (PDFs, planos de aula, apresentações)';

-- =====================================================
-- 9. TABELA DE PROGRESSO DO USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do registro de progresso',
  user_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (chave estrangeira)',
  video_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do vídeo assistido (se aplicável)',
  activity_id VARCHAR(255) DEFAULT NULL COMMENT 'ID da atividade realizada (se aplicável)',
  completed BOOLEAN DEFAULT FALSE COMMENT 'Se o vídeo/atividade foi completado (TRUE) ou não (FALSE)',
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da última visualização',
  progress_percentage INT DEFAULT 0 COMMENT 'Percentual de conclusão (0 a 100)',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_video (video_id),
  INDEX idx_activity (activity_id),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Progresso dos usuários em vídeos e atividades';

-- =====================================================
-- 10. TABELA DE LOGS DE ATIVIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do log',
  user_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário que realizou a ação (chave estrangeira)',
  user_name VARCHAR(255) COMMENT 'Nome do usuário (armazenado para histórico)',
  user_email VARCHAR(255) COMMENT 'Email do usuário (armazenado para histórico)',
  activity ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL COMMENT 'Tipo de atividade: login, logout, visualizar atividade/documento/vídeo, download, pesquisa, filtro',
  resource_type ENUM('activity', 'document', 'video', 'page') DEFAULT NULL COMMENT 'Tipo de recurso acessado: atividade, documento, vídeo ou página',
  resource_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do recurso acessado',
  resource_title VARCHAR(255) DEFAULT NULL COMMENT 'Título do recurso (armazenado para histórico)',
  details TEXT DEFAULT NULL COMMENT 'Detalhes adicionais da ação',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da ação',
  session_id VARCHAR(255) DEFAULT NULL COMMENT 'ID da sessão do usuário',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP do usuário',
  user_agent TEXT DEFAULT NULL COMMENT 'Informações do navegador/dispositivo do usuário',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_activity (activity),
  INDEX idx_timestamp (timestamp),
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de todas as atividades dos usuários no sistema';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar estrutura da tabela users
DESCRIBE users;
