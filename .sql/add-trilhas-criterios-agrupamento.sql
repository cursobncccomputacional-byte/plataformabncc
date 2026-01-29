-- =====================================================
-- ADICIONAR CRITÉRIOS DE AGRUPAMENTO NAS TRILHAS
-- Permite definir múltiplos critérios (disciplina, etapa, ano, eixo)
-- para que a trilha contenha atividades que atendam a todos (AND).
-- =====================================================

-- Verificar se a coluna já existe
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'trilhas'
    AND COLUMN_NAME = 'criterios_agrupamento'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE trilhas ADD COLUMN criterios_agrupamento JSON DEFAULT NULL COMMENT "Critérios de agrupamento: array de {tipo, valor}. Tipos: eixo_bncc, etapa, ano_escolar, disciplina_transversal"',
  'SELECT "Coluna criterios_agrupamento já existe" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Coluna criterios_agrupamento adicionada/verificada com sucesso!' AS status;
