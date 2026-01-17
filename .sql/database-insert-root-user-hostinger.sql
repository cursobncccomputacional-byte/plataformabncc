-- =====================================================
-- INSERIR USUÁRIO ROOT - Hostinger
-- Banco: (substituir pelo nome do seu banco)
-- =====================================================

-- IMPORTANTE: Substituir o nome do banco abaixo
-- USE nome_do_seu_banco;

-- =====================================================
-- GERAR HASH DA SENHA PRIMEIRO!
-- =====================================================
-- Execute este código PHP para gerar o hash:
-- <?php echo password_hash('sua_senha_aqui', PASSWORD_DEFAULT); ?>
-- 
-- Ou use o arquivo: gerar-hashes-senhas.php
-- =====================================================

-- Inserir usuário root
-- ATENÇÃO: Substituir 'HASH_DA_SENHA_AQUI' pelo hash gerado!
INSERT INTO users (
  id, 
  name, 
  email, 
  password, 
  role, 
  school, 
  is_active, 
  created_at
) VALUES (
  'root001',
  'Root Administrator',
  'root@plataformabncc.com',
  'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  'root',
  'Sistema Educacional BNCC',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  name = 'Root Administrator',
  password = 'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  is_active = TRUE;

-- Inserir usuário admin
-- ATENÇÃO: Substituir 'HASH_DA_SENHA_AQUI' pelo hash gerado!
INSERT INTO users (
  id, 
  name, 
  email, 
  password, 
  role, 
  school, 
  subjects, 
  is_active, 
  created_at
) VALUES (
  'admin001',
  'Raphael Silva de Vasconcelos',
  'admin@plataformabncc.com',
  'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  'admin',
  'Sistema Educacional BNCC',
  '["Administração", "Gestão Educacional"]',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  name = 'Raphael Silva de Vasconcelos',
  password = 'HASH_DA_SENHA_AQUI', -- SUBSTITUIR pelo hash gerado!
  is_active = TRUE;

-- Verificar se foram inseridos
SELECT id, name, email, role, is_active, created_at 
FROM users 
WHERE role IN ('root', 'admin');

SELECT 'Usuários root e admin criados com sucesso!' AS resultado;
