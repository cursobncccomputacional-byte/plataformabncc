-- =====================================================
-- INSERÇÃO DE ATIVIDADES - 2º, 3º e 4º ANO (ANOS INICIAIS)
-- Todas: Desplugada, Anos Iniciais, bloqueada = 1
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
-- ========== 4º ANO (14 atividades) ==========
-- Eixo: Pensamento Computacional (8)
('4ano-01', 'Hardware: Entrada e Saída (O Jogo das Cartas)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-02', 'Debugando o Labirinto (Encontrando o Erro)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-03', 'Criptografia com Cifra de César Simples', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-04', 'O Algoritmo do Sanduíche (Passo a Passo Preciso)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-05', 'Criando uma História Interativa', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-06', 'Mágica dos Números Binários (Cartões com Pontos)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-07', 'Decomposição: Planejando uma Festa', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-08', 'Pixel Art Colorido (Resolução de Imagem)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (3)
('4ano-09', 'Netiqueta: O Que Postar e Não Postar?', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-10', 'Busca na Internet: Palavras-Chave Eficientes', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-11', 'O Jogo das Condicionais (Siga o Mestre Lógico)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3)
('4ano-12', 'Stop Motion: Minha Primeira Animação', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-13', 'Classificando Dados: Árvore de Decisão', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('4ano-14', 'Correio Eletrônico de Papel (Como funciona o E-mail)', NULL, 'Desplugada', 'Anos Iniciais', '["4º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),

-- ========== 3º ANO (14 atividades) ==========
-- Eixo: Pensamento Computacional (8)
('3ano-01', 'O Caminho do Robô (Setas e Direções)', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-02', 'Algoritmo da Escovação de Dentes', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-03', 'Caça aos Padrões na Sala de Aula', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-04', 'Pintura Digital (Paint ou Tux Paint)', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-05', 'Loop da Dança (Repetição de Movimentos)', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-06', 'História em Quadrinhos Ordenada (Lógica de Sequência)', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-07', 'Teclado de Papel: Conhecendo as Teclas', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-08', 'Jogo da Memória de Hardware', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (4)
('3ano-09', 'O Que é Tecnologia em Casa?', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-10', 'Senhas: O Segredo do Baú', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-11', 'Ícones e Símbolos: O Que Eles Fazem?', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-12', 'Verdadeiro ou Falso na Internet', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3)
('3ano-13', 'Construindo um "Robô" com Recicláveis', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('3ano-14', 'Ordenando Objetos (Tamanho e Cor)', NULL, 'Desplugada', 'Anos Iniciais', '["3º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),

-- ========== 2º ANO (14 atividades) ==========
-- Eixo: Pensamento Computacional (8)
('2ano-01', 'Sequência do Dia a Dia (Acordar, Comer, Estudar)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-02', 'Tecnológico vs. Não Tecnológico', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-03', 'Montando Quebra-Cabeças (Lógica Espacial)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-04', 'Padrões com Peças de LEGO ou Blocos', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-05', 'O Robô Diz (Variação de "O Mestre Mandou")', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-06', 'Labirinto de Fita Crepe no Chão', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-07', 'Desenhando com Formas Geométricas no PC', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-08', 'Agrupando Animais (Lógica de Conjuntos)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Pensamento Computacional"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Mundo Digital (3)
('2ano-09', 'Ligado e Desligado (Símbolo Power)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-10', 'O Que Faz o Mouse? (Coordenação Motora)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-11', 'Minha Pegada Digital (Quem vê o que eu faço?)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Mundo Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
-- Eixo: Cultura Digital (3)
('2ano-12', 'Tempo de Tela: Relógio Saudável', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-13', 'Colorindo por Números (Lógica de Código)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL),
('2ano-14', 'O Computador de Papelão (Brincadeira Simbólica)', NULL, 'Desplugada', 'Anos Iniciais', '["2º Ano"]', '["Cultura Digital"]', '[]', '[]', NULL, 'Médio', '', '', NULL, NULL, 1, NULL);

-- =====================================================
-- FIM DO SCRIPT (4º ano: 14 | 3º ano: 14 | 2º ano: 14 = 42 atividades)
-- =====================================================
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace