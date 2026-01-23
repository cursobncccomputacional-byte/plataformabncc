-- =====================================================
-- CORREÇÃO: Permitir NULL ou array vazio em anos_escolares
-- =====================================================

USE u985723830_novaedu;

-- Verificar se a coluna anos_escolares existe
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'u985723830_novaedu'
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'anos_escolares'
);

-- Se não existir, adicionar
SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN anos_escolares JSON DEFAULT (JSON_ARRAY()) COMMENT "Anos escolares permitidos (1º ao 9º Ano)"',
  'SELECT "Campo anos_escolares já existe" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Se existir, modificar para permitir NULL e ter DEFAULT
SET @sql_modify = IF(
  @col_exists > 0,
  'ALTER TABLE atividades MODIFY COLUMN anos_escolares JSON DEFAULT (JSON_ARRAY()) COMMENT "Anos escolares permitidos (1º ao 9º Ano)"',
  'SELECT "Campo anos_escolares não existe, foi criado acima" AS status'
);
PREPARE stmt_modify FROM @sql_modify;
EXECUTE stmt_modify;
DEALLOCATE PREPARE stmt_modify;

SELECT 'Campo anos_escolares corrigido!' AS status;
