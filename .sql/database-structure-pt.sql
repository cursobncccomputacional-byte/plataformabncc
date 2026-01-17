-- =====================================================
-- ESTRUTURA DO BANCO DE DADOS - PLATAFORMA BNCC
-- Banco: supernerds3
-- Versão com comentários em Português
-- =====================================================

-- Selecionar o banco de dados
USE supernerds3;

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
  
  INDEX idx_email (email) COMMENT 'Índice para busca rápida por email',
  INDEX idx_role (role) COMMENT 'Índice para filtro por nível de acesso',
  INDEX idx_active (is_active) COMMENT 'Índice para filtrar usuários ativos/inativos',
  INDEX idx_created (created_at) COMMENT 'Índice para ordenação por data de criação'
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
  
  INDEX idx_level (level) COMMENT 'Índice para filtro por nível educacional',
  INDEX idx_order (order_number) COMMENT 'Índice para ordenação'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Anos escolares da BNCC';

-- =====================================================
-- 3. TABELA DE EIXOS DA BNCC
-- =====================================================
CREATE TABLE IF NOT EXISTS bncc_axes (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do eixo',
  name VARCHAR(255) NOT NULL COMMENT 'Nome do eixo (ex: Pensamento Computacional, Cultura Digital)',
  description TEXT COMMENT 'Descrição do eixo',
  color VARCHAR(50) DEFAULT '#4F46E5' COMMENT 'Cor para exibição visual (formato hexadecimal)',
  
  INDEX idx_name (name) COMMENT 'Índice para busca por nome'
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
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE COMMENT 'Relacionamento com tabela de eixos',
  INDEX idx_axis (axis_id) COMMENT 'Índice para busca por eixo',
  INDEX idx_name (name) COMMENT 'Índice para busca por nome'
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
  
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE COMMENT 'Relacionamento com objetos de conhecimento',
  INDEX idx_code (code) COMMENT 'Índice para busca rápida por código',
  INDEX idx_knowledge_object (knowledge_object_id) COMMENT 'Índice para busca por objeto de conhecimento'
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
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE COMMENT 'Relacionamento com eixos BNCC',
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE COMMENT 'Relacionamento com objetos de conhecimento',
  INDEX idx_type (type) COMMENT 'Índice para filtro por tipo (plugada/desplugada)',
  INDEX idx_axis (axis_id) COMMENT 'Índice para busca por eixo',
  INDEX idx_difficulty (difficulty) COMMENT 'Índice para filtro por dificuldade',
  INDEX idx_created (created_at) COMMENT 'Índice para ordenação por data'
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
  
  INDEX idx_created (created_at) COMMENT 'Índice para ordenação por data',
  INDEX idx_duration (duration) COMMENT 'Índice para filtro por duração'
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
  
  INDEX idx_file_type (file_type) COMMENT 'Índice para filtro por tipo de arquivo',
  INDEX idx_created (created_at) COMMENT 'Índice para ordenação por data'
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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT 'Relacionamento com usuários',
  INDEX idx_user (user_id) COMMENT 'Índice para busca por usuário',
  INDEX idx_video (video_id) COMMENT 'Índice para busca por vídeo',
  INDEX idx_activity (activity_id) COMMENT 'Índice para busca por atividade',
  INDEX idx_completed (completed) COMMENT 'Índice para filtrar atividades completadas'
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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT 'Relacionamento com usuários',
  INDEX idx_user (user_id) COMMENT 'Índice para busca por usuário',
  INDEX idx_activity (activity) COMMENT 'Índice para filtro por tipo de atividade',
  INDEX idx_timestamp (timestamp) COMMENT 'Índice para ordenação e filtro por data',
  INDEX idx_session (session_id) COMMENT 'Índice para busca por sessão'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de todas as atividades dos usuários no sistema';

-- =====================================================
-- 11. INSERIR DADOS INICIAIS
-- =====================================================

-- Usuário Root Inicial (Acesso total ao sistema)
-- IMPORTANTE: A senha precisa ser hasheada com password_hash() do PHP
-- Exemplo: password_hash('root123', PASSWORD_DEFAULT)
-- Por enquanto, vamos usar um placeholder que será substituído
INSERT INTO users (id, name, email, password, role, school, is_active, created_at) VALUES
('root001', 'Root Administrator', 'root@plataformabncc.com', 'PLACEHOLDER_PASSWORD_HASH', 'root', 'Sistema Educacional BNCC', TRUE, NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Usuário Admin Inicial (Gerencia professores e alunos)
INSERT INTO users (id, name, email, password, role, school, subjects, is_active, created_at) VALUES
('admin001', 'Raphael Silva de Vasconcelos', 'admin@plataformabncc.com', 'PLACEHOLDER_PASSWORD_HASH', 'admin', 'Sistema Educacional BNCC', '["Administração", "Gestão Educacional"]', TRUE, NOW())
ON DUPLICATE KEY UPDATE name=name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar estrutura da tabela users
DESCRIBE users;
