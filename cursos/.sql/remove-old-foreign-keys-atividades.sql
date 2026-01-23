-- =====================================================
-- REMOVER FOREIGN KEYS ANTIGAS DA TABELA ATIVIDADES
-- Remove constraints de id_eixo e id_objeto_conhecimento
-- que não são mais usadas na nova estrutura
-- =====================================================

USE u985723830_novaedu;

-- Verificar e remover foreign key de id_eixo (se existir)
SET @fk_eixo = (
  SELECT CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND REFERENCED_TABLE_NAME = 'eixos_bncc'
  LIMIT 1
);

SET @sql_drop_eixo = IF(
  @fk_eixo IS NOT NULL,
  CONCAT('ALTER TABLE atividades DROP FOREIGN KEY ', @fk_eixo),
  'SELECT "Foreign key id_eixo não existe" AS status'
);
PREPARE stmt_eixo FROM @sql_drop_eixo;
EXECUTE stmt_eixo;
DEALLOCATE PREPARE stmt_eixo;

-- Verificar e remover foreign key de id_objeto_conhecimento (se existir)
SET @fk_objeto = (
  SELECT CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND REFERENCED_TABLE_NAME = 'objetos_conhecimento'
  LIMIT 1
);

SET @sql_drop_objeto = IF(
  @fk_objeto IS NOT NULL,
  CONCAT('ALTER TABLE atividades DROP FOREIGN KEY ', @fk_objeto),
  'SELECT "Foreign key id_objeto_conhecimento não existe" AS status'
);
PREPARE stmt_objeto FROM @sql_drop_objeto;
EXECUTE stmt_objeto;
DEALLOCATE PREPARE stmt_objeto;

-- Tornar os campos antigos opcionais (permitir NULL) se ainda existirem
SET @col_eixo_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'id_eixo'
);

SET @sql_modify_eixo = IF(
  @col_eixo_exists > 0,
  'ALTER TABLE atividades MODIFY COLUMN id_eixo VARCHAR(255) NULL',
  'SELECT "Campo id_eixo não existe" AS status'
);
PREPARE stmt_modify_eixo FROM @sql_modify_eixo;
EXECUTE stmt_modify_eixo;
DEALLOCATE PREPARE stmt_modify_eixo;

SET @col_objeto_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'id_objeto_conhecimento'
);

SET @sql_modify_objeto = IF(
  @col_objeto_exists > 0,
  'ALTER TABLE atividades MODIFY COLUMN id_objeto_conhecimento VARCHAR(255) NULL',
  'SELECT "Campo id_objeto_conhecimento não existe" AS status'
);
PREPARE stmt_modify_objeto FROM @sql_modify_objeto;
EXECUTE stmt_modify_objeto;
DEALLOCATE PREPARE stmt_modify_objeto;

SELECT 'Foreign keys antigas removidas e campos tornados opcionais!' AS status;
