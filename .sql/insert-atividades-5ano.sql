-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 5º ANO (ANOS INICIAIS)
-- Introdução Lógica e Cultura Digital
-- Todas: Desplugada, Anos Iniciais, anos_escolares = ["5º Ano"], bloqueada = 1
-- Eixos: metade Pensamento Computacional; restante Mundo Digital e Cultura Digital
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
('5ano-01', 'O Robô Vivo (Programação Desplugada com Colegas)', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-02', 'Pixel Art com Papel Quadriculado', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-03', 'A Sequência Lógica do Sanduíche', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-04', 'O Labirinto de Instruções (Esquerda, Direita, Frente)', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-05', 'Coreografia em Loop (Entendendo Repetições)', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-06', 'Montando um Computador de Sucata', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-07', 'Ordenando a Fila (Algoritmos de Ordenação Simples)', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-08', 'Lógica Booleana: O Jogo do Verdadeiro ou Falso', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4 atividades)
('5ano-09', 'Crie sua Senha Super Secreta', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-10', 'Tecnológico ou Não? Classificação de Objetos', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-11', 'Detetives da Informação: Fato ou Boato?', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-12', 'Como a Internet Chega Aqui? (Cabos e Wi-Fi)', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3 atividades)
('5ano-13', 'Emoji Code: Comunicação por Símbolos', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-14', 'Criando um Stop Motion com Brinquedos', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('5ano-15', 'Mundo Real vs. Mundo Virtual', NULL, 'Desplugada', 'Anos Iniciais', '["5º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
