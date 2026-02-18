-- =====================================================
-- Adiciona colunas criadas, gravadas, editadas em dashboard_andamento
-- Permite: meta 20, criei x, gravei y, editei w -> faltam criar/gravar/editar
-- Execute após add-dashboard-andamento-table.sql
-- =====================================================

-- Execute coluna por coluna se alguma já existir (evita erro de coluna duplicada)
ALTER TABLE dashboard_andamento ADD COLUMN qte_criadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já criada';
ALTER TABLE dashboard_andamento ADD COLUMN qte_gravadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já gravada';
ALTER TABLE dashboard_andamento ADD COLUMN qte_editadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já editada';
