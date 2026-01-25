-- =====================================================
-- ADICIONAR CAMPO criado_por NA TABELA usuarios
-- Campo para rastrear qual admin/root criou cada usuário
-- =====================================================

-- Adicionar campo criado_por na tabela usuarios
-- Verificar e adicionar o campo se não existir

SET @dbname = DATABASE();
SET @tablename = "usuarios";
SET @columnname = "criado_por";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(255) DEFAULT NULL COMMENT 'ID do admin/root que criou este usuário'")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Criar índice para melhor performance (verificar se já existe)
SET @indexname = "idx_criado_por";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  "SELECT 1",
  CONCAT("CREATE INDEX ", @indexname, " ON ", @tablename, "(criado_por)")
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Atualizar registros existentes: se não houver criado_por, pode ser NULL
-- (usuários criados antes desta implementação não terão criado_por definido)
