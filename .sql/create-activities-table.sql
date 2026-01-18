-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE ATIVIDADES
-- Banco: u985723830_novaedu
-- =====================================================

-- Selecionar o banco de dados
USE u985723830_novaedu;

-- =====================================================
-- TABELA DE ATIVIDADES EDUCACIONAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da atividade',
  title VARCHAR(255) NOT NULL COMMENT 'Título da atividade',
  description TEXT COMMENT 'Descrição completa da atividade',
  type ENUM('plugada', 'desplugada') NOT NULL COMMENT 'Tipo: plugada (usa tecnologia/computador) ou desplugada (sem tecnologia)',
  school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais a atividade é adequada',
  axis_id VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'ID do eixo BNCC (primeiro eixo, para compatibilidade)',
  axis_ids JSON COMMENT 'Array de IDs dos eixos BNCC (suporta múltiplos eixos)',
  knowledge_object_id VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'ID do objeto de conhecimento',
  skill_ids JSON COMMENT 'Array de IDs das habilidades trabalhadas na atividade',
  duration INT DEFAULT NULL COMMENT 'Duração estimada da atividade em minutos',
  difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'medio' COMMENT 'Nível de dificuldade: fácil, médio ou difícil',
  materials JSON COMMENT 'Array de materiais necessários para realizar a atividade',
  objectives JSON COMMENT 'Array de objetivos de aprendizagem da atividade',
  thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura',
  video_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo explicativo (se houver)',
  document_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do documento PDF (estrutura pedagógica, para compatibilidade)',
  pedagogical_pdf_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do PDF da estrutura pedagógica',
  material_pdf_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do PDF do material da aula',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da atividade',
  
  INDEX idx_type (type),
  INDEX idx_axis (axis_id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Atividades educacionais alinhadas à BNCC';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SHOW TABLES LIKE 'activities';

-- Ver estrutura da tabela
DESCRIBE activities;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
