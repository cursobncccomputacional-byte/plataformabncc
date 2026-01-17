-- =====================================================
-- ALTERAR CAMPO email PARA usuario
-- Banco: supernerds3
-- Execute este script se o banco já foi criado com o campo "email"
-- =====================================================

USE supernerds3;

-- Renomear coluna email para usuario
ALTER TABLE usuarios 
  CHANGE COLUMN email usuario VARCHAR(255) UNIQUE NOT NULL COMMENT 'Usuário (usado para login)';

-- Renomear índice
ALTER TABLE usuarios DROP INDEX IF EXISTS idx_email;
ALTER TABLE usuarios ADD INDEX idx_usuario (usuario) COMMENT 'Índice para busca rápida por usuário';

-- Verificar alteração
DESCRIBE usuarios;

SELECT 'Campo email alterado para usuario com sucesso!' AS resultado;
