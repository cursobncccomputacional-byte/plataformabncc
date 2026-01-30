-- =====================================================
-- ADICIONAR CAMPO BLOQUEADA NA TABELA ATIVIDADES
-- Atividades bloqueadas aparecem na lista para professores/admins
-- mas não podem ser acessadas (vídeo/PDF). Quando bloqueada, o
-- link do vídeo não é obrigatório no cadastro.
-- =====================================================

SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'atividades'
    AND COLUMN_NAME = 'bloqueada'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE atividades ADD COLUMN bloqueada TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1 = atividade bloqueada (não acessível para professores/admins)"',
  'SELECT "Campo bloqueada já existe" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Campo bloqueada adicionado/verificado com sucesso!' AS status;
