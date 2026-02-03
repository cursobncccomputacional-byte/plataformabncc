-- =====================================================
-- LGPD: Campos de consentimento e versão da Política de Privacidade
-- Tabela: usuarios
-- =====================================================

-- Data/hora em que o titular aceitou a Política de Privacidade (quando aplicável)
-- Execute uma vez; se a coluna já existir, ignore o erro ou use IF NOT EXISTS (MySQL 8.0).
ALTER TABLE usuarios
  ADD COLUMN data_aceite_politica_privacidade DATETIME NULL
  COMMENT 'Data/hora do aceite da Política de Privacidade (LGPD)';

ALTER TABLE usuarios
  ADD COLUMN versao_politica_privacidade VARCHAR(20) NULL
  COMMENT 'Versão da Política de Privacidade aceita';

ALTER TABLE usuarios
  ADD COLUMN solicitacao_exclusao_em DATETIME NULL
  COMMENT 'Data em que o titular solicitou exclusão dos dados (Art. 18 LGPD)';

ALTER TABLE usuarios
  ADD COLUMN exclusao_efetivada_em DATETIME NULL
  COMMENT 'Data em que a exclusão foi efetivada pelo controlador';
