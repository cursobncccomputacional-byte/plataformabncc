-- =====================================================
-- ESTRUTURA DO BANCO DE DADOS - PLATAFORMA BNCC
-- Banco: supernerds3
-- =====================================================

-- Selecionar o banco de dados
USE supernerds3;

-- =====================================================
-- 1. TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Hash da senha (password_hash do PHP)',
  role ENUM('root', 'admin', 'professor', 'aluno') NOT NULL DEFAULT 'professor',
  school VARCHAR(255) DEFAULT NULL,
  subjects JSON DEFAULT NULL COMMENT 'Array de matérias em JSON',
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABELA DE ANOS ESCOLARES (BNCC)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_years (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level ENUM('educacao-infantil', 'anos-iniciais', 'anos-finais', 'aee') NOT NULL,
  order_number INT NOT NULL,
  description TEXT,
  
  INDEX idx_level (level),
  INDEX idx_order (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABELA DE EIXOS BNCC
-- =====================================================
CREATE TABLE IF NOT EXISTS bncc_axes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#4F46E5'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABELA DE OBJETOS DE CONHECIMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_objects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  axis_id VARCHAR(255) NOT NULL,
  school_years JSON COMMENT 'Array de IDs dos anos escolares',
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE,
  INDEX idx_axis (axis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABELA DE HABILIDADES
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) NOT NULL COMMENT 'Ex: EF01CI01',
  description TEXT NOT NULL,
  knowledge_object_id VARCHAR(255) NOT NULL,
  school_years JSON COMMENT 'Array de IDs dos anos escolares',
  
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  INDEX idx_code (code),
  INDEX idx_knowledge_object (knowledge_object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABELA DE ATIVIDADES
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('plugada', 'desplugada') NOT NULL,
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares',
  axis_id VARCHAR(255) NOT NULL,
  knowledge_object_id VARCHAR(255) NOT NULL,
  skill_ids JSON COMMENT 'Array de IDs de habilidades',
  duration INT DEFAULT NULL COMMENT 'Duração em minutos',
  difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'medio',
  materials JSON COMMENT 'Array de materiais necessários',
  objectives JSON COMMENT 'Array de objetivos',
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  document_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (axis_id) REFERENCES bncc_axes(id) ON DELETE CASCADE,
  FOREIGN KEY (knowledge_object_id) REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_axis (axis_id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABELA DE CURSOS DE VÍDEO
-- =====================================================
CREATE TABLE IF NOT EXISTS video_courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  video_url VARCHAR(500) NOT NULL,
  duration INT NOT NULL COMMENT 'Duração em segundos',
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares',
  activities JSON COMMENT 'Array de IDs de atividades relacionadas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABELA DE DOCUMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type ENUM('pdf', 'docx', 'pptx') NOT NULL,
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares',
  activities JSON COMMENT 'Array de IDs de atividades relacionadas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_file_type (file_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABELA DE PROGRESSO DO USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  video_id VARCHAR(255) DEFAULT NULL,
  activity_id VARCHAR(255) DEFAULT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_percentage INT DEFAULT 0 COMMENT 'Percentual de conclusão (0-100)',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_video (video_id),
  INDEX idx_activity (activity_id),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABELA DE LOGS DE ATIVIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  activity ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL,
  resource_type ENUM('activity', 'document', 'video', 'page') DEFAULT NULL,
  resource_id VARCHAR(255) DEFAULT NULL,
  resource_title VARCHAR(255) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_activity (activity),
  INDEX idx_timestamp (timestamp),
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. INSERIR DADOS INICIAIS
-- =====================================================

-- Usuário Root Inicial
-- IMPORTANTE: A senha precisa ser hasheada com password_hash() do PHP
-- Exemplo: password_hash('root123', PASSWORD_DEFAULT)
-- Por enquanto, vamos usar um placeholder que será substituído
INSERT INTO users (id, name, email, password, role, school, is_active, created_at) VALUES
('root001', 'Root Administrator', 'root@plataformabncc.com', 'PLACEHOLDER_PASSWORD_HASH', 'root', 'Sistema Educacional BNCC', TRUE, NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Usuário Admin Inicial
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
