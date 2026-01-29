-- =====================================================
-- ADICIONAR CAMPO HABILIDADES_IDS NA TABELA ATIVIDADES
-- Associa atividades às habilidades do currículo BNCC (curriculo_habilidades).
-- Os eixos da atividade podem ser derivados dessas habilidades.
-- =====================================================

-- Verificar se a coluna já existe
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'habilidades_ids'
);

-- Adicionar coluna se não existir
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN habilidades_ids JSON DEFAULT NULL COMMENT "IDs das habilidades do currículo BNCC (curriculo_habilidades) associadas à atividade"',
  'SELECT "Campo habilidades_ids já existe" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Campo habilidades_ids adicionado/verificado com sucesso!' AS status;
