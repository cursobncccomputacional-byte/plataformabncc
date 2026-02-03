-- =====================================================
-- TABELA DE DEMANDAS (Gestão Interna)
-- Permite cadastro de demandas com responsável (root),
-- data prevista e conclusão.
-- =====================================================

CREATE TABLE IF NOT EXISTS demandas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT DEFAULT NULL,
  responsavel_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do usuário root responsável (usuarios.id)',
  data_prevista DATE DEFAULT NULL,
  data_conclusao DATETIME NULL DEFAULT NULL COMMENT 'Preenchido ao clicar em Concluir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_responsavel (responsavel_id),
  INDEX idx_data_prevista (data_prevista),
  INDEX idx_data_conclusao (data_conclusao),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
