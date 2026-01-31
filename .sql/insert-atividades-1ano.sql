-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 1º ANO (ANOS INICIAIS)
-- Todas: Desplugada, Anos Iniciais, anos_escolares = ["1º Ano"], bloqueada = 1
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
-- Eixo: Pensamento Computacional (8 atividades)
('1ano-01', 'O Comando do Mestre Robô (Instruções orais de movimento)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-02', 'Tecnologia na Mochila (Classificar o que é e o que não é tecnologia)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-03', 'Algoritmo da Manhã (Sequência lógica: acordar, escovar dentes, vestir)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-04', 'Labirinto de Fita no Chão (Noções de frente, direita e esquerda)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-05', 'Colorindo Pixels Gigantes (Entendendo que imagens são feitas de quadradinhos)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-06', 'O Jogo do "Se... Então..." (Brincadeira corporal de condicionais)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-07', 'Padrões de Cores com LEGO ou Blocos (Repetição e Lógica)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-08', 'Histórias em Ordem (Organizar o começo, meio e fim)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4 atividades)
('1ano-09', 'Caça aos Símbolos Mágicos (Reconhecer Play, Pause, Power)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-10', 'Montando meu Primeiro Teclado de Papel', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-11', 'Minha Senha é um Desenho (Introdução à privacidade)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-12', 'O Computador tem Partes? (Identificar Tela, Mouse e Teclado)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (4 atividades)
('1ano-13', 'Detetive de Letras no Teclado', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-14', 'Correio de Papel vs. E-mail (Como a mensagem viaja)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-15', 'Tempo de Tela e Tempo de Brincar (Equilíbrio saudável)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('1ano-16', 'A Dança dos Movimentos Repetidos (Introdução a Loops)', NULL, 'Desplugada', 'Anos Iniciais', '["1º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT (1º ano: 16 atividades)
-- =====================================================
