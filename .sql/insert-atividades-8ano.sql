-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 8º ANO (ANOS FINAIS)
-- Todas: Desplugada, Anos Finais, anos_escolares = ["8º Ano"], bloqueada = 1
-- Eixos: metade Pensamento Computacional; restante Mundo Digital e Cultura Digital
-- =====================================================
-- Execute no mesmo banco onde está a tabela 'atividades'.
-- Ajuste o nome do banco (USE ...) se necessário.
-- =====================================================

-- Inserções: apenas nome, tipo, etapa, ano, eixo e bloqueada.
-- Campos opcionais: descricao NULL, disciplinas_transversais [], habilidades_ids [], duracao NULL,
-- thumbnail_url, video_url, pdf e material vazios/NULL; criado_por NULL.
-- Se a tabela não tiver 'habilidades_ids' ou 'bloqueada', remova essas colunas do INSERT abaixo.

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
('8ano-01', 'Caça aos Bugs no Código', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-02', 'Desafio da Lógica Booleana (Verdadeiro ou Falso)', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-03', 'Pixel Art com Código Binário', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-04', 'Circuito de Papel com LEDs', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-05', 'RPG de Decisões: Se/Então/Senão', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-06', 'Mapeando a Rede da Escola', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-07', 'A Jornada do Pacote de Dados', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-08', 'Simulador de Hardware: Montando um PC', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4 atividades)
('8ano-09', 'Detetives da Pegada Digital', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-10', 'Tribunal da Internet: Julgamento de Cyberbullying', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-11', 'Laboratório de Senhas Fortes', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-12', 'Algoritmos de Busca: Como o Google Acha?', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3 atividades)
('8ano-13', 'O Robô Desenhista (Geometria e Repetição)', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-14', 'Podcast sobre Tecnologia e Sociedade', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('8ano-15', 'Automação Inteligente com Sensores Virtuais', NULL, 'Desplugada', 'Anos Finais', '["8º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
