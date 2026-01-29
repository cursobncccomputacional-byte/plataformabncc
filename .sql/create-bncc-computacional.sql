-- =====================================================
-- BNCC COMPUTACIONAL DIGITAL
-- Tabela para habilidades, eixos, objetivos e exemplos
-- Educação Infantil: Habilidade, Eixo, Objetivo de Aprendizagem, Exemplos
-- Anos Iniciais/Finais (1º-9º): Habilidade, Eixo, Objeto do Conhecimento, Explicação da Habilidade, Exemplos
-- =====================================================

CREATE TABLE IF NOT EXISTS bncc_computacional (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID ou ID único',
  tipo_nivel ENUM('educacao_infantil', 'fundamental') NOT NULL COMMENT 'educacao_infantil = EI; fundamental = 1º ao 9º',
  ano_etapa VARCHAR(50) NOT NULL COMMENT 'Educação Infantil | 1º Ano | 2º Ano | ... | 9º Ano',
  habilidade VARCHAR(500) NOT NULL COMMENT 'Nome/código da habilidade',
  eixo VARCHAR(255) NOT NULL COMMENT 'Eixo (ex: Pensamento Computacional, Mundo Digital)',
  -- Campos para Educação Infantil
  objetivo_aprendizagem TEXT NULL COMMENT 'Apenas para Educação Infantil',
  -- Campos para Fundamental (1º-9º)
  objeto_conhecimento VARCHAR(500) NULL COMMENT 'Apenas para Anos Iniciais/Finais',
  explicacao_habilidade TEXT NULL COMMENT 'Apenas para Anos Iniciais/Finais',
  -- Campo comum (grande)
  exemplos LONGTEXT NULL COMMENT 'Exemplos (muitos caracteres)',
  ordem INT DEFAULT 0 COMMENT 'Ordem de exibição',
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo_nivel (tipo_nivel),
  INDEX idx_ano_etapa (ano_etapa),
  INDEX idx_eixo (eixo),
  INDEX idx_ordem (ordem),
  FULLTEXT idx_busca (habilidade, eixo, objetivo_aprendizagem, objeto_conhecimento, explicacao_habilidade, exemplos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Habilidades BNCC Computacional Digital';
