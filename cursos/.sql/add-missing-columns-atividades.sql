-- =====================================================
-- ADICIONAR CAMPOS FALTANTES NA TABELA ATIVIDADES
-- Este script adiciona apenas os campos que não existem
-- Não remove ou modifica campos existentes
-- =====================================================

USE u985723830_novaedu;

-- Função auxiliar para verificar se coluna existe
SET @db_name = 'u985723830_novaedu';
SET @table_name = 'atividades';

-- Adicionar nome_atividade se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'nome_atividade'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN nome_atividade VARCHAR(255) NOT NULL DEFAULT "" AFTER id',
  'SELECT "Campo nome_atividade já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar descricao se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'descricao'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN descricao TEXT COMMENT "Descrição completa da atividade"',
  'SELECT "Campo descricao já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar tipo se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'tipo'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN tipo ENUM("Plugada", "Desplugada") COMMENT "Tipo de atividade"',
  'SELECT "Campo tipo já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar etapa se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'etapa'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN etapa ENUM("Educação Infantil", "Anos Iniciais", "Anos Finais") COMMENT "Etapa educacional"',
  'SELECT "Campo etapa já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar anos_escolares se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'anos_escolares'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN anos_escolares JSON COMMENT "Anos escolares permitidos (1º ao 9º Ano)"',
  'SELECT "Campo anos_escolares já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar eixos_bncc se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'eixos_bncc'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN eixos_bncc JSON COMMENT "Eixos de Pensamento Computacional (tags)"',
  'SELECT "Campo eixos_bncc já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar duracao se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'duracao'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN duracao VARCHAR(50) COMMENT "Duração do vídeo (ex: 15 minutos)"',
  'SELECT "Campo duracao já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar nivel_dificuldade se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'nivel_dificuldade'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN nivel_dificuldade ENUM("Fácil", "Médio", "Difícil") COMMENT "Nível de dificuldade"',
  'SELECT "Campo nivel_dificuldade já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar thumbnail_url se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'thumbnail_url'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN thumbnail_url VARCHAR(500) COMMENT "URL da imagem thumbnail"',
  'SELECT "Campo thumbnail_url já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar video_url se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'video_url'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN video_url VARCHAR(500) COMMENT "URL do vídeo para embed/player"',
  'SELECT "Campo video_url já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar pdf_estrutura_pedagogica_url se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'pdf_estrutura_pedagogica_url'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN pdf_estrutura_pedagogica_url VARCHAR(500) COMMENT "Link do PDF da Estrutura Pedagógica"',
  'SELECT "Campo pdf_estrutura_pedagogica_url já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar material_apoio_url se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'material_apoio_url'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN material_apoio_url VARCHAR(500) COMMENT "Link do Material de Apoio"',
  'SELECT "Campo material_apoio_url já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar link_video se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'link_video'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN link_video VARCHAR(500) COMMENT "Link adicional do vídeo"',
  'SELECT "Campo link_video já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar criado_em se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'criado_em'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT "Data de criação"',
  'SELECT "Campo criado_em já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar atualizado_em se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'atualizado_em'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "Data de atualização"',
  'SELECT "Campo atualizado_em já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar criado_por se não existir
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = @table_name
    AND COLUMN_NAME = 'criado_por'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN criado_por VARCHAR(255) COMMENT "ID do usuário que criou"',
  'SELECT "Campo criado_por já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Verificação de campos concluída!' AS status;
