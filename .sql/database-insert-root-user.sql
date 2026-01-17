-- =====================================================
-- INSERIR USUÁRIO ROOT - marcus.lopes
-- Banco: supernerds3
-- =====================================================

USE supernerds3;

-- Inserir usuário root
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
  '$2a$12$1EcEt6N61U.Gw00nBtdAOOzXFluwSrZNQjLSfOuTC75TTSSoT1nPG',
  'root',
  'Sistema Educacional BNCC',
  TRUE,
  NOW()
)
ON DUPLICATE KEY UPDATE 
  nome = 'Marcus Lopes',
  senha = '$2a$12$1EcEt6N61U.Gw00nBtdAOOzXFluwSrZNQjLSfOuTC75TTSSoT1nPG',
  ativo = TRUE;

-- Verificar se foi inserido
SELECT id, nome, usuario, nivel_acesso, ativo FROM usuarios WHERE usuario = 'marcus.lopes';

SELECT 'Usuário root marcus.lopes criado com sucesso!' AS resultado;
