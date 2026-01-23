-- =====================================================
-- ADICIONAR CAMPO DISCIPLINAS TRANSVERSAIS NA TABELA ATIVIDADES
-- Permite associar múltiplas disciplinas a cada atividade
-- =====================================================

USE u985723830_novaedu;

-- Verificar se a coluna já existe
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'disciplinas_transversais'
);

-- Adicionar coluna se não existir
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN disciplinas_transversais JSON DEFAULT (JSON_ARRAY()) COMMENT "Disciplinas transversais associadas (Português, Matemática, História, Geografia, Ciências, Educação Física, Ensino Religioso, Computação, Inglês)"',
  'SELECT "Campo disciplinas_transversais já existe" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Se a coluna foi criada, garantir que permite NULL e tem default
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades MODIFY COLUMN disciplinas_transversais JSON DEFAULT (JSON_ARRAY()) COMMENT "Disciplinas transversais associadas"',
  'SELECT "Campo já configurado" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Campo disciplinas_transversais adicionado/verificado com sucesso!' AS status;
