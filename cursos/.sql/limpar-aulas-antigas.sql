-- =====================================================
-- SCRIPT DE LIMPEZA: REMOVER AULAS ANTIGAS (IMPORTADAS DE PLANILHA)
-- Banco: u985723830_novaedu
-- 
-- ATENÇÃO: Este script remove TODAS as aulas existentes da tabela 'aulas'
-- Execute apenas se tiver certeza de que deseja limpar os dados antigos
-- =====================================================

USE u985723830_novaedu;

-- Verificar quantas aulas existem antes de excluir
SELECT 
    COUNT(*) AS total_aulas_antes,
    'Aulas que serão excluídas' AS observacao
FROM aulas;

-- Verificar aulas por curso (para referência)
SELECT 
    c.id AS curso_id,
    c.titulo AS curso_titulo,
    COUNT(a.id) AS total_aulas
FROM cursos c
LEFT JOIN aulas a ON a.curso_id = c.id
GROUP BY c.id, c.titulo
ORDER BY total_aulas DESC;

-- =====================================================
-- EXCLUSÃO DAS AULAS ANTIGAS
-- =====================================================

-- Desabilitar verificação de foreign keys temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Excluir todas as aulas (as foreign keys em progresso_aulas serão tratadas pelo CASCADE se configurado)
DELETE FROM aulas;

-- Reabilitar verificação de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar se a exclusão foi bem-sucedida
SELECT 
    COUNT(*) AS total_aulas_depois,
    'Aulas restantes após limpeza' AS observacao
FROM aulas;

-- Se houver registros em progresso_aulas que referenciam aulas deletadas,
-- você pode querer limpar também (descomente se necessário):
-- DELETE FROM progresso_aulas WHERE aula_id NOT IN (SELECT id FROM aulas);

SELECT '========================================' AS '';
SELECT 'LIMPEZA DE AULAS CONCLUÍDA!' AS '';
SELECT '========================================' AS '';
SELECT 'Todas as aulas antigas foram removidas.' AS '';
SELECT 'Agora você pode cadastrar novas atividades via plataforma.' AS '';
SELECT '========================================' AS '';
