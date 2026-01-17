-- =====================================================
-- EXCLUIR TODAS AS TABELAS DO BANCO
-- Banco: supernerds3
-- ATENÇÃO: Este script remove TODAS as tabelas e seus dados!
-- Use apenas se quiser recriar tudo do zero
-- =====================================================

USE supernerds3;

-- Desabilitar verificação de foreign keys temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- EXCLUIR TODAS AS TABELAS
-- =====================================================

-- Excluir tabelas que dependem de outras (com foreign keys) primeiro
DROP TABLE IF EXISTS logs_atividade;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS progresso_usuario;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS atividades;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS habilidades;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS objetos_conhecimento;
DROP TABLE IF EXISTS knowledge_objects;
DROP TABLE IF EXISTS documentos;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS cursos_video;
DROP TABLE IF EXISTS video_courses;
DROP TABLE IF EXISTS anos_escolares;
DROP TABLE IF EXISTS school_years;
DROP TABLE IF EXISTS eixos_bncc;
DROP TABLE IF EXISTS bncc_axes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS users;

-- Excluir qualquer outra tabela que possa existir
-- (caso tenha alguma tabela com nome diferente)
DROP TABLE IF EXISTS Nova;

-- Reabilitar verificação de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICAR SE AS TABELAS FORAM EXCLUÍDAS
-- =====================================================

-- Listar todas as tabelas restantes (deve estar vazio)
SHOW TABLES;

SELECT 'Todas as tabelas foram excluídas com sucesso!' AS resultado;
SELECT 'Agora você pode executar o script database-structure.sql ou database-structure-pt.sql para recriar tudo.' AS proximo_passo;
