-- =====================================================
-- SCRIPT PARA CRIAR TABELAS DO MÓDULO CURSOS
-- NO BANCO PRINCIPAL (supernerds3)
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no banco de dados principal (supernerds3)
-- 2. Isso permite usar o mesmo banco para sistema principal e módulo cursos
-- 3. Os usuários já estão na tabela 'usuarios' do banco principal
-- =====================================================

USE supernerds3;

-- =====================================================
-- TABELA DE CURSOS
-- =====================================================
CREATE TABLE IF NOT EXISTS cursos (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do curso',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título do curso',
  descricao TEXT COMMENT 'Descrição completa do curso',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa',
  categoria VARCHAR(100) DEFAULT NULL COMMENT 'Categoria do curso',
  nome_instrutor VARCHAR(255) DEFAULT NULL COMMENT 'Nome do instrutor',
  bio_instrutor TEXT COMMENT 'Biografia do instrutor',
  preco DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Preço do curso (0.00 = gratuito)',
  status ENUM('rascunho', 'publicado', 'arquivado') DEFAULT 'rascunho' COMMENT 'Status do curso',
  duracao_total INT DEFAULT 0 COMMENT 'Duração total em minutos',
  total_aulas INT DEFAULT 0 COMMENT 'Total de aulas',
  alunos_inscritos INT DEFAULT 0 COMMENT 'Número de alunos inscritos',
  avaliacao DECIMAL(3, 2) DEFAULT 0.00 COMMENT 'Avaliação média (0.00 a 5.00)',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_categoria (categoria),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA DE AULAS
-- =====================================================
CREATE TABLE IF NOT EXISTS aulas (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da aula',
  curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título da aula',
  descricao TEXT COMMENT 'Descrição da aula',
  video_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo',
  duracao_video INT DEFAULT 0 COMMENT 'Duração do vídeo em segundos',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da thumbnail',
  ordem INT DEFAULT 0 COMMENT 'Ordem da aula no curso',
  modulo ENUM('I', 'II') DEFAULT 'I' COMMENT 'Módulo I ou II',
  eh_preview BOOLEAN DEFAULT FALSE COMMENT 'Se é preview (gratuita)',
  recursos JSON COMMENT 'Recursos adicionais (não usado, apenas vídeos)',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_id (curso_id),
  INDEX idx_modulo (curso_id, modulo, ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA DE INSCRIÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (mesma tabela usuarios do sistema principal)',
  curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso',
  inscrito_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de inscrição',
  concluido_em TIMESTAMP NULL DEFAULT NULL COMMENT 'Data de conclusão',
  progresso_percentual DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Progresso (0.00 a 100.00)',
  ultimo_acesso_em TIMESTAMP NULL DEFAULT NULL COMMENT 'Último acesso',
  UNIQUE KEY unique_inscricao (usuario_id, curso_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_curso_id (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA DE PROGRESSO DAS AULAS
-- =====================================================
CREATE TABLE IF NOT EXISTS progresso_aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (mesma tabela usuarios do sistema principal)',
  curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso',
  aula_id VARCHAR(255) NOT NULL COMMENT 'ID da aula',
  segundos_assistidos INT DEFAULT 0 COMMENT 'Segundos assistidos',
  total_segundos INT DEFAULT 0 COMMENT 'Total de segundos do vídeo',
  esta_concluida BOOLEAN DEFAULT FALSE COMMENT 'Se completou a aula',
  concluida_em TIMESTAMP NULL DEFAULT NULL COMMENT 'Data de conclusão',
  ultima_visualizacao_em TIMESTAMP NULL DEFAULT NULL COMMENT 'Última visualização',
  UNIQUE KEY unique_progresso (usuario_id, curso_id, aula_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  INDEX idx_usuario_curso (usuario_id, curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute para verificar se as tabelas foram criadas:
-- SHOW TABLES LIKE 'cursos%';
-- SHOW TABLES LIKE 'aulas%';
-- SHOW TABLES LIKE 'inscricoes%';
-- SHOW TABLES LIKE 'progresso_aulas%';
