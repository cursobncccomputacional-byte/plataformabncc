-- =====================================================
-- TESTE PROFESSOR: atividades liberadas (whitelist)
-- Objetivo:
--   Permitir configurar, via sistema, quais atividades o perfil "teste_professor"
--   consegue VER/ACESSAR (o restante não aparece para esse perfil).
--
-- Como usar:
--   1) Execute este script uma vez no seu banco.
--   2) Depois, no "Gerenciar Atividades", marque/desmarque quais ficam liberadas.
-- =====================================================

CREATE TABLE IF NOT EXISTS teste_professor_atividades_liberadas (
  activity_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela teste_professor_atividades_liberadas pronta.' AS status;

