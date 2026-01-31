-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 6º ANO (ANOS FINAIS)
-- Todas: Desplugada, Anos Finais, anos_escolares = ["6º Ano"], bloqueada = 1
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
('6ano-01', 'Algoritmos da Vida Real: Receitas e Manuais', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-02', 'Programação em Blocos: Minha Primeira Animação', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-03', 'Hardware vs. Software: O Jogo das Diferenças', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-04', 'O Código Secreto dos Computadores (Binário)', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-05', 'Fluxogramas da Rotina Escolar', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-06', 'Decomposição: Quebrando Grandes Problemas em Partes', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-07', 'O Computador Humano (Entrada, Processamento e Saída)', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-08', 'Caçadores de Padrões na Geometria', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4 atividades)
('6ano-09', 'Netiqueta: Boas Maneiras e Respeito Online', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-10', 'Debugando o Caminho do Robô', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-11', 'O Que é a Nuvem? (Conceito Básico)', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-12', 'Criando Avatares Seguros e Identidade Digital', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3 atividades)
('6ano-13', 'O Jogo das Condicionais (Se... Então...)', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-14', 'História da Computação: Linha do Tempo Ilustrada', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('6ano-15', 'Pesquisa Inteligente: O Poder das Palavras-Chave', NULL, 'Desplugada', 'Anos Finais', '["6º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
