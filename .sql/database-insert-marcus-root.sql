-- =====================================================
-- INSERIR USUÁRIO ROOT - Marcus Lopes
-- Banco: u985723830_novaedu
-- =====================================================

USE u985723830_novaedu;

-- =====================================================
-- INSERIR USUÁRIO ROOT
-- =====================================================
-- Usuário: marcus.lopes
-- Hash: $2a$12$LSJq5QenvGRC3irGi6WXxueWPucOWQNQ8d9hih4BIRMaRDupdXwy6
-- Senha: ?&,6bsMrD08a
-- =====================================================

INSERT INTO usuarios (
  id, 
  nome, 
  usuario, 
  senha, 
  nivel_acesso, 
  escola, 
  ativo, 
  data_criacao
) VALUES (
  'root-marcus-001',
  'Marcus Lopes',
  'marcus.lopes',
  '$2a$12$LSJq5QenvGRC3irGi6WXxueWPucOWQNQ8d9hih4BIRMaRDupdXwy6',
  'root',
  'Sistema Educacional BNCC',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  nome = 'Marcus Lopes',
  senha = '$2a$12$LSJq5QenvGRC3irGi6WXxueWPucOWQNQ8d9hih4BIRMaRDupdXwy6',
  nivel_acesso = 'root',
  ativo = TRUE,
  data_atualizacao = NOW();

-- =====================================================
-- VERIFICAR SE FOI INSERIDO
-- =====================================================
SELECT 
  id, 
  nome, 
  usuario, 
  nivel_acesso, 
  escola, 
  ativo, 
  data_criacao,
  ultimo_login
FROM usuarios 
WHERE usuario = 'marcus.lopes';

-- =====================================================
-- TESTAR HASH DA SENHA (via PHP)
-- =====================================================
-- Para testar se o hash está correto, use este código PHP:
-- 
-- <?php
-- $senha = '?&,6bsMrD08a';
-- $hash = '$2a$12$LSJq5QenvGRC3irGi6WXxueWPucOWQNQ8d9hih4BIRMaRDupdXwy6';
-- 
-- if (password_verify($senha, $hash)) {
--     echo "✅ Hash está CORRETO!\n";
-- } else {
--     echo "❌ Hash está INCORRETO!\n";
-- }
-- ?>

SELECT 'Usuário root (marcus.lopes) inserido/atualizado com sucesso!' AS resultado;
