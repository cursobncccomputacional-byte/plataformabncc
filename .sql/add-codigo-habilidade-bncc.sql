-- =====================================================
-- Adiciona campo codigo_habilidade na tabela bncc_computacional
-- Ex.: EI03CO01, EF01CO01 — separado da descrição (habilidade)
-- =====================================================

ALTER TABLE bncc_computacional
  ADD COLUMN codigo_habilidade VARCHAR(30) NULL COMMENT 'Código da habilidade (ex: EI03CO01, EF01CO01)' AFTER ano_etapa;

-- Índice para busca e ordenação por código
CREATE INDEX idx_codigo_habilidade ON bncc_computacional (codigo_habilidade);

-- Incluir no FULLTEXT para buscas (opcional; recriar índice se necessário)
-- ALTER TABLE bncc_computacional DROP INDEX idx_busca;
-- ALTER TABLE bncc_computacional ADD FULLTEXT idx_busca (codigo_habilidade, habilidade, eixo, objetivo_aprendizagem, objeto_conhecimento, explicacao_habilidade, exemplos);
