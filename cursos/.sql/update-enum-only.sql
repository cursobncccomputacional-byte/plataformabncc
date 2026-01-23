-- =====================================================
-- SCRIPT SIMPLIFICADO: APENAS ATUALIZAR ENUM
-- Banco: u985723830_novaedu
-- 
-- Use este script se você já tem as tabelas do módulo cursos
-- e precisa apenas adicionar o perfil 'professor_cursos'
-- =====================================================

USE u985723830_novaedu;

-- Adicionar 'professor_cursos' ao ENUM de nivel_acesso
ALTER TABLE usuarios 
MODIFY COLUMN nivel_acesso ENUM('root', 'admin', 'professor', 'aluno', 'professor_cursos') 
NOT NULL DEFAULT 'professor' 
COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos), professor_cursos (acesso apenas ao subdomínio cursos)';

-- Verificar se foi aplicado
SELECT 
  COLUMN_TYPE AS 'Tipo da coluna nivel_acesso',
  COLUMN_DEFAULT AS 'Valor padrão'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u985723830_novaedu' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'nivel_acesso';

SELECT 'ENUM atualizado com sucesso!' AS status;
