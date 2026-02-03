-- Atividades AEE podem ter múltiplas etapas (ex.: EI + Anos Iniciais + Anos Finais).
-- Coluna etapas: JSON array, ex. ["Educação Infantil", "Anos Iniciais", "Anos Finais"].
-- Quando preenchida, a atividade aparece nas trilhas dessas etapas além da trilha AEE.
-- Execute uma vez no banco.

ALTER TABLE atividades
ADD COLUMN etapas JSON NULL
COMMENT 'Para AEE: etapas em que a atividade se aplica (array, ex. ["Educação Infantil","Anos Iniciais","Anos Finais"])';
