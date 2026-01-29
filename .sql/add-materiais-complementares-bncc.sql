-- =====================================================
-- Adiciona campo materiais_complementares em bncc_computacional
-- Ex.: "Pattern Shapes, Shape Pattern, Chicken Dance"
-- =====================================================

ALTER TABLE bncc_computacional
  ADD COLUMN materiais_complementares LONGTEXT NULL COMMENT 'Materiais/ferramentas sugeridos (ex.: nomes de apps, jogos, links)' AFTER exemplos;
