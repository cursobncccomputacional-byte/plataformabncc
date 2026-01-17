-- =====================================================
-- INSERIR USUÁRIO ROOT - Hostinger (Português)
-- Banco: u985723830_novaedu
-- =====================================================

USE u985723830_novaedu;

-- =====================================================
-- GERAR HASH DA SENHA PRIMEIRO!
-- =====================================================
-- Execute este código PHP para gerar o hash:
-- <?php echo password_hash('sua_senha_aqui', PASSWORD_DEFAULT); ?>
-- 
-- Ou use o arquivo: gerar-hash-senha-simples.php
-- =====================================================

-- Inserir usuário root
-- ATENÇÃO: Substituir 'HASH_DA_SENHA_AQUI' pelo hash gerado!
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
  'root001',
  'Root Administrator',
  'root',
  'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  'root',
  'Sistema Educacional BNCC',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  nome = 'Root Administrator',
  senha = 'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  ativo = TRUE;

-- Inserir usuário admin
-- ATENÇÃO: Substituir 'HASH_DA_SENHA_AQUI' pelo hash gerado!
INSERT INTO usuarios (
  id, 
  nome, 
  usuario, 
  senha, 
  nivel_acesso, 
  escola, 
  materias, 
  ativo, 
  data_criacao
) VALUES (
  'admin001',
  'Raphael Silva de Vasconcelos',
  'admin',
  'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  'admin',
  'Sistema Educacional BNCC',
  '["Administração", "Gestão Educacional"]',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  nome = 'Raphael Silva de Vasconcelos',
  senha = 'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  ativo = TRUE;

-- Verificar se foram inseridos
SELECT id, nome, usuario, nivel_acesso, ativo, data_criacao 
FROM usuarios 
WHERE nivel_acesso IN ('root', 'admin');

SELECT 'Usuários root e admin criados com sucesso!' AS resultado;
