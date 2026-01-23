-- =====================================================
-- MIGRAÇÃO: ATUALIZAR TABELA ATIVIDADES ANTIGA PARA NOVA ESTRUTURA
-- Adiciona campos novos e migra dados dos campos antigos
-- =====================================================

USE u985723830_novaedu;

-- =====================================================
-- PARTE 1: ADICIONAR CAMPOS NOVOS
-- =====================================================

-- Adicionar nome_atividade (mapear de titulo)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar etapa
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar eixos_bncc (JSON)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar nivel_dificuldade (mapear de dificuldade)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar thumbnail_url (mapear de url_miniatura)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar video_url (mapear de url_video)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar pdf_estrutura_pedagogica_url (mapear de url_documento)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar material_apoio_url
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar link_video
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar criado_em (mapear de data_criacao)
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar atualizado_em
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- Adicionar criado_por
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
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

-- =====================================================
-- PARTE 2: MIGRAR DADOS DOS CAMPOS ANTIGOS PARA OS NOVOS
-- =====================================================

-- Migrar titulo -> nome_atividade (apenas se nome_atividade estiver vazio)
UPDATE atividades 
SET nome_atividade = titulo 
WHERE (nome_atividade IS NULL OR nome_atividade = '') 
  AND titulo IS NOT NULL 
  AND titulo != '';

-- Migrar dificuldade -> nivel_dificuldade (convertendo valores)
UPDATE atividades 
SET nivel_dificuldade = CASE 
  WHEN dificuldade = 'facil' THEN 'Fácil'
  WHEN dificuldade = 'medio' THEN 'Médio'
  WHEN dificuldade = 'dificil' THEN 'Difícil'
  ELSE 'Médio'
END
WHERE nivel_dificuldade IS NULL 
  AND dificuldade IS NOT NULL;

-- Migrar url_miniatura -> thumbnail_url
UPDATE atividades 
SET thumbnail_url = url_miniatura 
WHERE (thumbnail_url IS NULL OR thumbnail_url = '') 
  AND url_miniatura IS NOT NULL 
  AND url_miniatura != '';

-- Migrar url_video -> video_url
UPDATE atividades 
SET video_url = url_video 
WHERE (video_url IS NULL OR video_url = '') 
  AND url_video IS NOT NULL 
  AND url_video != '';

-- Migrar url_documento -> pdf_estrutura_pedagogica_url
UPDATE atividades 
SET pdf_estrutura_pedagogica_url = url_documento 
WHERE (pdf_estrutura_pedagogica_url IS NULL OR pdf_estrutura_pedagogica_url = '') 
  AND url_documento IS NOT NULL 
  AND url_documento != '';

-- Migrar data_criacao -> criado_em
UPDATE atividades 
SET criado_em = data_criacao 
WHERE criado_em IS NULL 
  AND data_criacao IS NOT NULL;

-- Migrar id_eixo -> eixos_bncc (converter para JSON array)
UPDATE atividades 
SET eixos_bncc = JSON_ARRAY(id_eixo)
WHERE (eixos_bncc IS NULL OR eixos_bncc = '[]' OR eixos_bncc = 'null')
  AND id_eixo IS NOT NULL 
  AND id_eixo != '';

-- Converter tipo para maiúscula (Plugada/Desplugada)
UPDATE atividades 
SET tipo = CASE 
  WHEN tipo = 'plugada' THEN 'Plugada'
  WHEN tipo = 'desplugada' THEN 'Desplugada'
  ELSE tipo
END
WHERE tipo IN ('plugada', 'desplugada');

-- Converter duracao de int para string (se necessário)
-- Manter como está, a API aceita ambos os formatos

SELECT 'Migração de dados concluída!' AS status;
