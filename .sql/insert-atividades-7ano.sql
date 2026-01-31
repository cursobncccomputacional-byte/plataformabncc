-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 7º ANO (ANOS FINAIS)
-- Todas: Desplugada, Anos Finais, anos_escolares = ["7º Ano"], bloqueada = 1
-- Eixos: metade Pensamento Computacional; restante Mundo Digital e Cultura Digital
-- =====================================================
-- Execute no mesmo banco onde está a tabela 'atividades'.
-- Ajuste o nome do banco (USE ...) se necessário.
-- =====================================================

INSERT INTO atividades (
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
-- Eixo: Pensamento Computacional (8 atividades)
('7ano-01', 'A Dança da Repetição (Loops e Ciclos)', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-02', 'Narrativas Interativas no Scratch', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-03', 'O Jogo das Variáveis: Pontuação e Vidas', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-04', 'Labirinto de Condicionais (Se/Então)', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-05', 'Decifrando Mensagens Secretas (Criptografia Básica)', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-06', 'Hardware de Papel: Montando um Computador', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-07', 'Caça ao Tesouro com Buscas Eficientes', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-08', 'Detetives de Imagens (Direitos Autorais)', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4 atividades)
('7ano-09', 'O Rastro da Pegada Digital', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-10', 'Fluxograma da Rotina Matinal', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-11', 'Pixel Art: Desenhando com Números', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-12', 'Entendendo Inputs e Outputs (Entrada e Saída)', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3 atividades)
('7ano-13', 'Simulação de Rede Social Offline', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-14', 'Algoritmos de Ordenação com Cartas de Baralho', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('7ano-15', 'Júri Simulado: Privacidade na Internet', NULL, 'Desplugada', 'Anos Finais', '["7º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
