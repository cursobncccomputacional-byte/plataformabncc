-- =====================================================
-- TABELA DE ANDAMENTO DO DASHBOARD (RELATÓRIOS)
-- =====================================================
-- Armazena dados inseridos manualmente para acompanhamento:
-- Meta e quantidades (criadas, gravadas, editadas) por etapa e tipo.
--
-- Se a tabela JÁ EXISTIA antes de ter qte_criadas/qte_gravadas/qte_editadas:
-- execute PRIMEIRO: add-dashboard-andamento-criadas-gravadas-editadas.sql
-- (senão o INSERT falha com "Coluna 'qte_criadas' desconhecida").
--
-- Uso: Relatórios > Dashboard > Andamento das Atividades.

CREATE TABLE IF NOT EXISTS dashboard_andamento (
  etapa VARCHAR(20) NOT NULL COMMENT 'EF, 1º Ano, 2º Ano, ... 9º Ano, AEE',
  tipo VARCHAR(20) NOT NULL COMMENT 'plugada ou desplugada',
  meta INT UNSIGNED NOT NULL DEFAULT 20 COMMENT 'Meta de atividades para esta etapa/tipo',
  qte_pendente_gravacao INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade pendente de gravação (legado)',
  qte_pendente_edicao INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade pendente de edição (legado)',
  qte_criadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já criada',
  qte_gravadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já gravada',
  qte_editadas INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade já editada',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (etapa, tipo),
  KEY idx_etapa (etapa),
  KEY idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dados manuais de andamento do dashboard (meta e pendentes por etapa/tipo)';

-- Inserir linhas iniciais para todas as combinações etapa × tipo (se não existirem)
INSERT IGNORE INTO dashboard_andamento (etapa, tipo, meta, qte_pendente_gravacao, qte_pendente_edicao, qte_criadas, qte_gravadas, qte_editadas)
SELECT e.etapa, t.tipo, 20, 0, 0, 0, 0, 0
FROM (
  SELECT 'EF' AS etapa UNION SELECT '1º Ano' UNION SELECT '2º Ano' UNION SELECT '3º Ano' UNION SELECT '4º Ano'
  UNION SELECT '5º Ano' UNION SELECT '6º Ano' UNION SELECT '7º Ano' UNION SELECT '8º Ano' UNION SELECT '9º Ano' UNION SELECT 'AEE'
) e
CROSS JOIN (SELECT 'plugada' AS tipo UNION SELECT 'desplugada') t;
