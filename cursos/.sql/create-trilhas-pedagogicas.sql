-- =====================================================
-- CRIAR TABELA DE TRILHAS PEDAGÓGICAS
-- Sistema de trilhas que agrupam atividades automaticamente
-- =====================================================

USE u985723830_novaedu;

-- Criar tabela de trilhas
CREATE TABLE IF NOT EXISTS trilhas (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da trilha (ex: pensamento-computacional)',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título da trilha (ex: Pensamento Computacional)',
  descricao TEXT COMMENT 'Descrição da trilha',
  tipo ENUM('eixo_bncc', 'etapa') NOT NULL COMMENT 'Tipo de trilha: eixo_bncc ou etapa',
  valor VARCHAR(255) NOT NULL COMMENT 'Valor correspondente (ex: Pensamento Computacional, Educação Infantil)',
  thumbnail_url VARCHAR(500) COMMENT 'URL da imagem/thumbnail da trilha',
  ordem INT DEFAULT 0 COMMENT 'Ordem de exibição',
  ativo TINYINT(1) DEFAULT 1 COMMENT 'Se a trilha está ativa',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
  INDEX idx_tipo (tipo),
  INDEX idx_valor (valor),
  INDEX idx_ativo (ativo),
  INDEX idx_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir trilhas padrão por Eixo BNCC
INSERT INTO trilhas (id, titulo, descricao, tipo, valor, ordem, ativo) VALUES
('pensamento-computacional', 'Pensamento Computacional', 'Trilha de atividades focadas em pensamento computacional', 'eixo_bncc', 'Pensamento Computacional', 1, 1),
('mundo-digital', 'Mundo Digital', 'Trilha de atividades sobre mundo digital', 'eixo_bncc', 'Mundo Digital', 2, 1),
('cultura-digital', 'Cultura Digital', 'Trilha de atividades sobre cultura digital', 'eixo_bncc', 'Cultura Digital', 3, 1)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- Inserir trilhas padrão por Etapa
INSERT INTO trilhas (id, titulo, descricao, tipo, valor, ordem, ativo) VALUES
('educacao-infantil', 'Educação Infantil', 'Trilha de atividades para Educação Infantil', 'etapa', 'Educação Infantil', 4, 1),
('anos-iniciais', 'Anos Iniciais', 'Trilha de atividades para Anos Iniciais', 'etapa', 'Anos Iniciais', 5, 1),
('anos-finais', 'Anos Finais', 'Trilha de atividades para Anos Finais', 'etapa', 'Anos Finais', 6, 1)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

SELECT 'Tabela trilhas criada e trilhas padrão inseridas com sucesso!' AS status;
