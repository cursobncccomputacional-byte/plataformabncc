-- =====================================================
-- SCRIPT COMPLETO DE ATUALIZAÇÃO DO BANCO DE DADOS
-- Banco: u985723830_novaedu
-- 
-- Este script atualiza o banco existente para suportar:
-- 1. Novo perfil 'professor_cursos' (Formação Continuada)
-- 2. Tabelas do módulo cursos
-- 3. Sistema de permissões por curso
-- =====================================================

USE u985723830_novaedu;

-- =====================================================
-- PARTE 1: ATUALIZAR TABELA usuarios
-- =====================================================

-- Verificar estrutura atual
SELECT 'Verificando estrutura da tabela usuarios...' AS status;

-- Adicionar 'professor_cursos' ao ENUM (se a tabela existir)
-- Este comando é seguro mesmo se o valor já existir
ALTER TABLE usuarios 
MODIFY COLUMN nivel_acesso ENUM('root', 'admin', 'professor', 'aluno', 'professor_cursos') 
NOT NULL DEFAULT 'professor' 
COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos), professor_cursos (acesso apenas ao subdomínio cursos)';

-- Adicionar flag de Formação Continuada para professor
SET @fc_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'formacao_continuada'
);

SET @sql_fc = IF(
  @fc_column_exists = 0,
  'ALTER TABLE usuarios ADD COLUMN formacao_continuada TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Indica se o professor está habilitado para a Formação Continuada''',
  'SELECT ''Coluna formacao_continuada já existe na tabela usuarios'' AS status'
);

PREPARE stmt_fc FROM @sql_fc;
EXECUTE stmt_fc;
DEALLOCATE PREPARE stmt_fc;

SELECT 'Tabela usuarios atualizada com sucesso!' AS status;

-- =====================================================
-- PARTE 2: CRIAR TABELAS DO MÓDULO CURSOS
-- =====================================================

-- 2.1. TABELA DE CURSOS
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

SELECT 'Tabela cursos criada/verificada!' AS status;

-- 2.2. TABELA DE AULAS
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

-- Se a tabela já existir mas não tiver o campo modulo, adicionar
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
  AND TABLE_NAME = 'aulas' 
  AND COLUMN_NAME = 'modulo'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE aulas ADD COLUMN modulo ENUM(\'I\', \'II\') DEFAULT \'I\' COMMENT \'Módulo I ou II\' AFTER ordem',
  'SELECT \'Campo modulo já existe na tabela aulas\' AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Tabela aulas criada/verificada!' AS status;

-- 2.3. TABELA DE PERMISSÕES CURSO-USUÁRIO
CREATE TABLE IF NOT EXISTS permissoes_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (tabela usuarios)',
  curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação da permissão',
  criado_por VARCHAR(255) DEFAULT NULL COMMENT 'ID do usuário root que criou a permissão',
  UNIQUE KEY unique_permissao (usuario_id, curso_id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_curso_id (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela permissoes_cursos criada/verificada!' AS status;

-- 2.4. TABELA DE INSCRIÇÕES
CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (tabela usuarios)',
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

SELECT 'Tabela inscricoes criada/verificada!' AS status;

-- 2.5. TABELA DE PROGRESSO DAS AULAS
CREATE TABLE IF NOT EXISTS progresso_aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (tabela usuarios)',
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

SELECT 'Tabela progresso_aulas criada/verificada!' AS status;

-- =====================================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- =====================================================

SELECT '========================================' AS '';
SELECT 'VERIFICAÇÃO FINAL' AS '';
SELECT '========================================' AS '';

-- Verificar se o ENUM foi atualizado
SELECT 
  COLUMN_TYPE AS 'Tipo da coluna nivel_acesso',
  COLUMN_DEFAULT AS 'Valor padrão'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'nivel_acesso';

-- Listar todas as tabelas criadas
SELECT 
  TABLE_NAME AS 'Tabela',
  TABLE_ROWS AS 'Registros',
  CREATE_TIME AS 'Criada em'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
AND TABLE_NAME IN ('cursos', 'aulas', 'permissoes_cursos', 'inscricoes', 'progresso_aulas')
ORDER BY TABLE_NAME;

SELECT '========================================' AS '';
SELECT 'ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!' AS '';
SELECT '========================================' AS '';
