-- =====================================================
-- TABELA DE PLANOS DE AULA
-- =====================================================
-- Cada registro representa um plano de aula (PDF) vinculado
-- a uma atividade existente na tabela `atividades`.
--
-- Regra de negócio atual:
-- - Relação 1:1 entre atividade e plano de aula.
-- - Armazenamos apenas URLs (PDF e thumb), sem upload direto aqui.
--
-- Este script é idempotente e pode ser executado em produção com segurança.

CREATE TABLE IF NOT EXISTS planos_aula (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID interno do plano de aula',
  atividade_id VARCHAR(255) NOT NULL COMMENT 'ID da atividade vinculada (tabela atividades.id)',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título do plano de aula',
  descricao TEXT NULL COMMENT 'Descrição/resumo do plano de aula',
  pdf_url VARCHAR(500) NOT NULL COMMENT 'URL pública do arquivo PDF do plano de aula',
  thumb_url VARCHAR(500) NULL COMMENT 'URL da thumbnail/preview do plano de aula',
  created_by VARCHAR(255) NULL COMMENT 'ID do usuário que criou o plano (usuarios.id)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data/hora da última atualização',
  PRIMARY KEY (id),
  UNIQUE KEY idx_unq_atividade (atividade_id),
  KEY idx_atividade (atividade_id),
  KEY idx_created_by (created_by),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Planos de aula em PDF vinculados a atividades BNCC';

