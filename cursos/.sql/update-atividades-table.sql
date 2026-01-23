-- =====================================================
-- ATUALIZAR TABELA ATIVIDADES EXISTENTE
-- Adiciona campos faltantes sem perder dados existentes
-- =====================================================

USE u985723830_novaedu;

-- Verificar e adicionar campos faltantes
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'nome_atividade'
);

-- Se a tabela não tiver os campos novos, adicionar
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN nome_atividade VARCHAR(255) NOT NULL DEFAULT "" AFTER id',
  'SELECT "Campo nome_atividade já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar outros campos se não existirem
ALTER TABLE atividades 
  ADD COLUMN IF NOT EXISTS descricao TEXT COMMENT 'Descrição completa da atividade',
  ADD COLUMN IF NOT EXISTS tipo ENUM('Plugada', 'Desplugada') COMMENT 'Tipo de atividade',
  ADD COLUMN IF NOT EXISTS etapa ENUM('Educação Infantil', 'Anos Iniciais', 'Anos Finais') COMMENT 'Etapa educacional',
  ADD COLUMN IF NOT EXISTS anos_escolares JSON COMMENT 'Anos escolares permitidos (1º ao 9º Ano)',
  ADD COLUMN IF NOT EXISTS eixos_bncc JSON COMMENT 'Eixos de Pensamento Computacional (tags)',
  ADD COLUMN IF NOT EXISTS duracao VARCHAR(50) COMMENT 'Duração do vídeo (ex: "15 minutos")',
  ADD COLUMN IF NOT EXISTS nivel_dificuldade ENUM('Fácil', 'Médio', 'Difícil') COMMENT 'Nível de dificuldade',
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) COMMENT 'URL da imagem thumbnail',
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) COMMENT 'URL do vídeo para embed/player',
  ADD COLUMN IF NOT EXISTS pdf_estrutura_pedagogica_url VARCHAR(500) COMMENT 'Link do PDF da Estrutura Pedagógica',
  ADD COLUMN IF NOT EXISTS material_apoio_url VARCHAR(500) COMMENT 'Link do Material de Apoio',
  ADD COLUMN IF NOT EXISTS link_video VARCHAR(500) COMMENT 'Link adicional do vídeo',
  ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
  ADD COLUMN IF NOT EXISTS criado_por VARCHAR(255) COMMENT 'ID do usuário que criou';

-- Adicionar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_tipo ON atividades(tipo);
CREATE INDEX IF NOT EXISTS idx_etapa ON atividades(etapa);
CREATE INDEX IF NOT EXISTS idx_nivel_dificuldade ON atividades(nivel_dificuldade);
CREATE INDEX IF NOT EXISTS idx_criado_em ON atividades(criado_em);

SELECT 'Tabela atividades atualizada com sucesso!' AS status;
