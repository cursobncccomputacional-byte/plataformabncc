-- =====================================================
-- Ajustar tipo das atividades (Plugada / Desplugada)
-- Use para corrigir atividades que aparecem todas como "Plugada"
-- ou com tipo vazio/nulo.
-- =====================================================

-- Opção 1: Definir como Desplugada onde tipo está vazio ou nulo
UPDATE atividades
SET tipo = 'Desplugada'
WHERE (tipo IS NULL OR TRIM(tipo) = '');

-- Opção 2 (opcional): Se quiser definir TODAS como Desplugada e depois
-- editar manualmente as que forem plugadas no "Gerenciar Atividades":
-- UPDATE atividades SET tipo = 'Desplugada';

SELECT 'Tipos de atividades ajustados. Verifique em Gerenciar Atividades.' AS status;
