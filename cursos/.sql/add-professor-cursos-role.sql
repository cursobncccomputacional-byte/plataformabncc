-- =====================================================
-- ADICIONAR PERFIL 'professor_cursos' NA TABELA usuarios
-- Banco: u985723830_novaedu
-- =====================================================

USE u985723830_novaedu;

-- Verificar estrutura atual da coluna nivel_acesso
-- SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
-- AND TABLE_NAME = 'usuarios' 
-- AND COLUMN_NAME = 'nivel_acesso';

-- Adicionar novo perfil ao ENUM
-- IMPORTANTE: Execute este comando apenas se a tabela usuarios já existir
-- Se a tabela não existir, o perfil será criado automaticamente na estrutura

ALTER TABLE usuarios 
MODIFY COLUMN nivel_acesso ENUM('root', 'admin', 'professor', 'aluno', 'professor_cursos') 
NOT NULL DEFAULT 'professor';

-- Verificar se foi aplicado
-- SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
-- AND TABLE_NAME = 'usuarios' 
-- AND COLUMN_NAME = 'nivel_acesso';
