-- =====================================================
-- INSERÇÃO DE ATIVIDADES - EDUCAÇÃO INFANTIL
-- Todas: Desplugada, etapa Educação Infantil, anos_escolares = [] (vazio para EI), bloqueada = 1
-- Eixos: metade Pensamento Computacional; restante Mundo Digital e Cultura Digital
-- =====================================================

INSERT IGNORE INTO atividades (
  id,
  nome_atividade,
  descricao,
  tipo,
  etapa,
  anos_escolares,
  eixos_bncc,
  disciplinas_transversais,
  habilidades_ids,
  duracao,
  nivel_dificuldade,
  thumbnail_url,
  video_url,
  pdf_estrutura_pedagogica_url,
  material_apoio_url,
  bloqueada,
  criado_por
) VALUES
-- Eixo: Pensamento Computacional (4 atividades)
('ei-01', 'O Robô Teleguiado', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('ei-02', 'Separando os Brinquedos (Classificação)', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('ei-03', 'A Sequência das Cores (Colar de Contas)', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('ei-04', 'A Rotina Ilustrada', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (2 atividades)
('ei-05', 'O Que Está Fora do Lugar?', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('ei-06', 'O Caminho da Formiguinha', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (2 atividades)
('ei-07', 'Natureza ou Máquina?', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('ei-08', 'Siga o Mestre dos Gestos', NULL, 'Desplugada', 'Educação Infantil', '[]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT (Educação Infantil: 8 atividades)
-- =====================================================
