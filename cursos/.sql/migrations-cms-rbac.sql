-- =====================================================
-- MIGRATIONS: SISTEMA CMS E RBAC
-- Banco: u985723830_novaedu
-- 
-- Este script cria:
-- 1. Colunas de permissões na tabela usuarios
-- 2. Tabela de atividades (Plataforma BNCC)
-- 3. Tabela de módulos (hierarquia de cursos)
-- 4. Ajustes na tabela aulas para suportar hierarquia Curso → Módulo → Aula
-- =====================================================

USE u985723830_novaedu;

-- =====================================================
-- PARTE 1: PERMISSÕES DE ACESSO (RBAC)
-- =====================================================

-- Adicionar colunas de permissões na tabela usuarios
SET @perm_activities_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'can_manage_activities'
);

SET @sql_perm_activities = IF(
  @perm_activities_exists = 0,
  'ALTER TABLE usuarios ADD COLUMN can_manage_activities TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Permite acesso ao CRUD de vídeos de atividades (Plataforma BNCC)''',
  'SELECT ''Coluna can_manage_activities já existe na tabela usuarios'' AS status'
);

PREPARE stmt_perm_activities FROM @sql_perm_activities;
EXECUTE stmt_perm_activities;
DEALLOCATE PREPARE stmt_perm_activities;

SET @perm_courses_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'can_manage_courses'
);

SET @sql_perm_courses = IF(
  @perm_courses_exists = 0,
  'ALTER TABLE usuarios ADD COLUMN can_manage_courses TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''Permite acesso ao CRUD de cursos de Formação Continuada''',
  'SELECT ''Coluna can_manage_courses já existe na tabela usuarios'' AS status'
);

PREPARE stmt_perm_courses FROM @sql_perm_courses;
EXECUTE stmt_perm_courses;
DEALLOCATE PREPARE stmt_perm_courses;

SELECT 'Permissões RBAC adicionadas/verificadas!' AS status;

-- =====================================================
-- PARTE 2: TABELA DE ATIVIDADES (PLATAFORMA BNCC)
-- =====================================================

CREATE TABLE IF NOT EXISTS atividades (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da atividade',
  nome_atividade VARCHAR(255) NOT NULL COMMENT 'Nome da atividade',
  descricao TEXT COMMENT 'Descrição completa da atividade',
  tipo ENUM('Plugada', 'Desplugada') NOT NULL COMMENT 'Tipo de atividade',
  etapa ENUM('Educação Infantil', 'Anos Iniciais', 'Anos Finais') NOT NULL COMMENT 'Etapa educacional',
  anos_escolares JSON COMMENT 'Anos escolares permitidos (1º ao 9º Ano)',
  eixos_bncc JSON COMMENT 'Eixos de Pensamento Computacional (tags)',
  duracao VARCHAR(50) COMMENT 'Duração do vídeo (ex: "15 minutos")',
  nivel_dificuldade ENUM('Fácil', 'Médio', 'Difícil') NOT NULL COMMENT 'Nível de dificuldade',
  thumbnail_url VARCHAR(500) COMMENT 'URL da imagem thumbnail',
  video_url VARCHAR(500) NOT NULL COMMENT 'URL do vídeo para embed/player',
  pdf_estrutura_pedagogica_url VARCHAR(500) COMMENT 'Link do PDF da Estrutura Pedagógica',
  material_apoio_url VARCHAR(500) COMMENT 'Link do Material de Apoio',
  link_video VARCHAR(500) COMMENT 'Link adicional do vídeo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
  criado_por VARCHAR(255) COMMENT 'ID do usuário que criou',
  INDEX idx_tipo (tipo),
  INDEX idx_etapa (etapa),
  INDEX idx_nivel_dificuldade (nivel_dificuldade),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela atividades criada/verificada!' AS status;

-- =====================================================
-- PARTE 3: TABELA DE MÓDULOS (HIERARQUIA DE CURSOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS modulos (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do módulo',
  curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso (FK para cursos.id)',
  titulo_modulo VARCHAR(255) NOT NULL COMMENT 'Título do módulo',
  descricao TEXT COMMENT 'Descrição do módulo',
  ordem INT DEFAULT 0 COMMENT 'Ordem de exibição dentro do curso',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_id (curso_id),
  INDEX idx_ordem (curso_id, ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela modulos criada/verificada!' AS status;

-- =====================================================
-- PARTE 4: AJUSTES NA TABELA AULAS (SUPORTE A HIERARQUIA)
-- =====================================================

-- Verificar se a coluna modulo_id já existe
SET @modulo_id_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'aulas'
    AND COLUMN_NAME = 'modulo_id'
);

-- Adicionar coluna modulo_id se não existir
SET @sql_modulo_id = IF(
  @modulo_id_exists = 0,
  'ALTER TABLE aulas ADD COLUMN modulo_id VARCHAR(255) NULL COMMENT ''ID do módulo (FK para modulos.id)'' AFTER curso_id, ADD FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE, ADD INDEX idx_modulo_id (modulo_id)',
  'SELECT ''Coluna modulo_id já existe na tabela aulas'' AS status'
);

PREPARE stmt_modulo_id FROM @sql_modulo_id;
EXECUTE stmt_modulo_id;
DEALLOCATE PREPARE stmt_modulo_id;

-- Atualizar comentário da coluna curso_id para refletir a nova hierarquia
ALTER TABLE aulas 
MODIFY COLUMN curso_id VARCHAR(255) NOT NULL COMMENT 'ID do curso (FK para cursos.id) - Hierarquia: Curso → Módulo → Aula';

SELECT 'Tabela aulas atualizada para suportar hierarquia!' AS status;

-- =====================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- =====================================================

SELECT '========================================' AS '';
SELECT 'VERIFICAÇÃO FINAL' AS '';
SELECT '========================================' AS '';

-- Verificar colunas de permissões
SELECT 
  COLUMN_NAME AS 'Coluna de Permissão',
  COLUMN_TYPE AS 'Tipo',
  COLUMN_DEFAULT AS 'Valor Padrão'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
  AND TABLE_NAME = 'usuarios' 
  AND COLUMN_NAME IN ('can_manage_activities', 'can_manage_courses')
ORDER BY COLUMN_NAME;

-- Verificar tabelas criadas
SELECT 
  TABLE_NAME AS 'Tabela',
  TABLE_ROWS AS 'Registros',
  CREATE_TIME AS 'Criada em'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
  AND TABLE_NAME IN ('atividades', 'modulos')
ORDER BY TABLE_NAME;

-- Verificar estrutura da tabela aulas
SELECT 
  COLUMN_NAME AS 'Coluna',
  COLUMN_TYPE AS 'Tipo',
  IS_NULLABLE AS 'Permite NULL',
  COLUMN_COMMENT AS 'Comentário'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
  AND TABLE_NAME = 'aulas' 
  AND COLUMN_NAME IN ('curso_id', 'modulo_id', 'titulo', 'video_url', 'ordem')
ORDER BY ORDINAL_POSITION;

SELECT '========================================' AS '';
SELECT 'MIGRATIONS CMS E RBAC CONCLUÍDAS!' AS '';
SELECT '========================================' AS '';
