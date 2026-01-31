-- =====================================================
-- USUÁRIOS: adicionar role teste_professor
-- Permite criar usuários com nível de acesso "teste_professor"
-- =====================================================

-- Ajuste o ENUM para incluir teste_professor (e manter compatibilidade com professor_cursos, se existir)
ALTER TABLE usuarios
  MODIFY COLUMN nivel_acesso ENUM('root', 'admin', 'professor', 'teste_professor', 'aluno', 'professor_cursos')
  NOT NULL DEFAULT 'professor';

SELECT 'Role teste_professor habilitado na coluna nivel_acesso.' AS status;

