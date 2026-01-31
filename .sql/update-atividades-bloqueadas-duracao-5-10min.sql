-- =====================================================
-- ATUALIZAR DURAÇÃO DAS ATIVIDADES BLOQUEADAS (5 a 10 min)
-- Atividades bloqueadas sem vídeo ficam com "0 min" no card.
-- Este script define duração aleatória entre 5 e 10 minutos para todas
-- as atividades com bloqueada = 1 e duração nula, vazia ou zero.
-- =====================================================

UPDATE atividades
SET duracao = CAST(FLOOR(5 + (RAND() * 6)) AS CHAR)
WHERE bloqueada = 1
  AND (duracao IS NULL OR TRIM(COALESCE(duracao, '')) = '' OR duracao = '0');

-- Verificar: listar quantas foram atualizadas (execute antes e depois para comparar)
-- SELECT id, nome_atividade, duracao, bloqueada FROM atividades WHERE bloqueada = 1 LIMIT 20;
