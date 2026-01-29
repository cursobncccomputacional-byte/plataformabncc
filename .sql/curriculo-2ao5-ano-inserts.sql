/* ==========================================================================
   INSERÇÃO DE DADOS: 2º AO 5º ANO (FUNDAMENTAL I COMPLETO)
   Adaptado do script Gemini para as tabelas curriculo_*.
   Execute após: curriculo-computacao-educacao-infantil.sql e curriculo-1ano-inserts.sql
   ========================================================================== */

-- 1. Inserir Etapas (2º, 3º, 4º, 5º Ano)
INSERT INTO curriculo_etapas_ensino (id, nome) VALUES
(3, '2º Ano'),
(4, '3º Ano'),
(5, '4º Ano'),
(6, '5º Ano')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 2. Habilidades (2º Ano)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(19, 3, 'EF02CO01', 'Pensamento Computacional', 'Criar e comparar modelos (representações) de objetos, identificando padrões e atributos essenciais.', 'Um modelo é construído ao se identificar características essenciais de objetos. Modelos são importantes para classificar objetos e a escolha das características define os agrupamentos.'),
(20, 3, 'EF02CO02', 'Pensamento Computacional', 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, construídos como sequências com repetições simples (iterações definidas) com base em instruções preestabelecidas ou criadas, analisando como a precisão da instrução impacta na execução do algoritmo.', 'Usar linguagem oral, textual ou pictográfica para descrever algoritmos, percebendo a importância de descrevê-los com precisão para que possam ser executados por outras pessoas (ou máquinas). Os algoritmos aqui devem ser descritos através de sequências de instruções que podem ser repetidas um determinado número de vezes.'),
(21, 3, 'EF02CO03', 'Mundo Digital', 'Identificar que máquinas diferentes executam conjuntos próprios de instruções e que podem ser usadas para definir algoritmos.', 'Para compreender o funcionamento dos computadores, é importante entender que uma máquina disponibiliza um conjunto de instruções (as operações) que, se realizadas em uma dada sequência (algoritmo), produzem algum resultado.'),
(22, 3, 'EF02CO04', 'Mundo Digital', 'Diferenciar componentes físicos (hardware) e programas que fornecem as instruções (software) para o hardware.', 'O objetivo da habilidade é mostrar aos alunos que em seu cotidiano existem dispositivos físicos (celulares, computadores, calculadoras) que são controlados por algo que segue uma sequência de passos lógicos (um App do celular, uma pessoa com a calculadora).'),
(23, 3, 'EF02CO05', 'Cultura Digital', 'Reconhecer as características e usos das tecnologias computacionais no cotidiano dentro e fora da escola.', 'A proposta nessa habilidade é que o aluno verifique as diferentes características das tecnologias de informação e comunicação, identificando como funcionam, principais aspectos, bem como reconhecendo os diferentes usos no dia a dia das pessoas.'),
(24, 3, 'EF02CO06', 'Cultura Digital', 'Reconhecer os cuidados com a segurança no uso de dispositivos computacionais.', 'Nesta habilidade temos a perspectiva de trazer um panorama sobre os cuidados com a segurança ao usar dispositivos como celular, tablets, computadores dentre outros (roubo de dados em dispositivos físicos, rastro de dados online, etc.).')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 3. Habilidades (3º Ano)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(25, 4, 'EF03CO01', 'Pensamento Computacional', 'Associar os valores "verdadeiro" e "falso" a sentenças lógicas que dizem respeito a situações do dia a dia, fazendo uso de termos que indicam negação.', 'As sentenças lógicas são sentenças declarativas que representam a constatação de um fato pelo emissor, podendo ser afirmativas ou negativas. Quando se faz uma declaração, ela pode ser "verdadeira" ou "falsa". O valor de uma sentença lógica pode ser modificado usando a operação de negação (NÃO).'),
(26, 4, 'EF03CO02', 'Pensamento Computacional', 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples com condição (iterações indefinidas), para resolver problemas de forma independente e em colaboração.', 'Os algoritmos aqui devem ser descritos através de sequências de instruções que podem ser repetidas um número de vezes que não é conhecido de antemão. Nestes casos, esta repetição é controlada por alguma condição (sentença lógica).'),
(27, 4, 'EF03CO03', 'Pensamento Computacional', 'Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.', 'Decomposição é uma das principais técnicas de resolução de problemas, na qual um problema é dividido em subproblemas, os quais são resolvidos independentemente, e cujas soluções são combinadas para construir a solução do problema original.'),
(28, 4, 'EF03CO04', 'Mundo Digital', 'Relacionar o conceito de informação com o de dado.', 'Para que um computador possa armazenar, transmitir ou manipular uma informação é preciso processá-la e representá-la como um conjunto de dados (símbolos). A habilidade trabalha a diferença entre esses dois conceitos.'),
(29, 4, 'EF03CO05', 'Mundo Digital', 'Compreender que dados são estruturados em formatos específicos dependendo da informação armazenada.', 'A Computação emprega diferentes técnicas para organizar dados de forma estruturada para representar informação. Cada tipo de informação possui uma estratégia de representação (ex: textos, imagens, sons).'),
(30, 4, 'EF03CO06', 'Mundo Digital', 'Reconhecer que, para um computador realizar tarefas, ele se comunica com o mundo exterior com o uso de interfaces físicas (dispositivos de entrada e saída).', 'É importante entender que o computador se comunica com o mundo exterior com dispositivos físicos próprios: dispositivos de entrada (teclado, mouse, sensores) e dispositivos de saída (monitor, alto-falante, impressora).'),
(31, 4, 'EF03CO07', 'Cultura Digital', 'Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar informações.', 'Nesta habilidade temos a perspectiva que o aluno possa explorar diferentes navegadores e buscadores, conhecendo aspectos gerais das ferramentas de busca como associação de palavras, abas, filtros, e cuidados na busca.'),
(32, 4, 'EF03CO08', 'Cultura Digital', 'Usar ferramentas computacionais em situações didáticas para se expressar em diferentes formatos digitais.', 'O objetivo desta habilidade é que o aluno possa explorar diversas ferramentas computacionais como jogos educacionais, programas de animação, ferramentas de desenho dentre outros, para expressar ideias.'),
(33, 4, 'EF03CO09', 'Cultura Digital', 'Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.', 'A proposta nesta habilidade é que o aluno possa identificar alguns dos principais impactos de compartilhar informações pessoais (endereço, nomes, escola) em meio digital, que podem ser utilizadas por pessoas mal-intencionadas.')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 4. Habilidades (4º Ano)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(34, 5, 'EF04CO01', 'Pensamento Computacional', 'Reconhecer objetos do mundo real ou digital que podem ser representados através de matrizes que estabelecem uma organização na qual cada componente está em uma posição definida por coordenadas.', 'Informações podem ser organizadas em estruturas de dados. Matrizes são organizadas em linhas e colunas. Um dado específico é acessado em uma matriz através de coordenadas (x,y). A ideia é que alunos identifiquem objetos estruturados (tabuleiro de xadrez, batalha naval) caracterizados como matrizes.'),
(35, 5, 'EF04CO02', 'Pensamento Computacional', 'Reconhecer objetos do mundo real ou digital que podem ser representados através de registros que estabelecem uma organização na qual cada componente é identificado por um nome.', 'Registros são agrupamentos de informações (estrutura de dados) onde uma informação específica é acessada através de um identificador (ou nome). Exemplos: carteira de estudante, boletim, ficha de cadastro.'),
(36, 5, 'EF04CO03', 'Pensamento Computacional', 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples e aninhadas.', 'Os algoritmos aqui devem ser descritos através de sequências de instruções que podem ser repetidas. As repetições, aqui, podem ser aninhadas, isto é, um ciclo de repetição pode conter outro (ex: lavar janelas de vários andares).'),
(37, 5, 'EF04CO04', 'Mundo Digital', 'Entender que para guardar, manipular e transmitir dados deve-se codificá-los de alguma forma que seja compreendida pela máquina (formato digital).', 'Um processador opera apenas em dois níveis de tensão. Por isso, o sistema binário (0 e 1) é usado. Isso implica que para um computador guardar dados, precisamos codificá-los (ex: Tabela ASCII).'),
(38, 5, 'EF04CO05', 'Mundo Digital', 'Codificar diferentes informações para representação em computador (binária, ASCII, atributos de pixel, como RGB etc.).', 'Existem diferentes estratégias de representação em formato digital para diferentes tipos de informação. Conhecê-las é um passo importante para o desenvolvimento de algoritmos.'),
(39, 5, 'EF04CO06', 'Cultura Digital', 'Usar diferentes ferramentas computacionais para criação de conteúdo (textos, apresentações, vídeos etc.).', 'O objetivo é explorar diversas ferramentas (editor de texto, imagem, apresentações, HQ, animação) para produzir conteúdo em projetos e atividades diversas.'),
(40, 5, 'EF04CO07', 'Cultura Digital', 'Demonstrar postura ética nas atividades de coleta, transferência, guarda e uso de dados.', 'Propõe-se que o aluno reflita sobre aspectos éticos relacionados a manipulação de dados, como por exemplo quando assiste e faz download, compartilha uma imagem, verifica autoria e permissões.'),
(41, 5, 'EF04CO08', 'Cultura Digital', 'Reconhecer a importância de verificar a confiabilidade das fontes de informações obtidas na Internet.', 'Espera-se que os alunos possam reconhecer que, ao se obter informações na Internet, é preciso identificar as suas fontes e se elas são seguras e a informação é confiável.')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 5. Habilidades (5º Ano)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(42, 6, 'EF05CO01', 'Pensamento Computacional', 'Reconhecer objetos do mundo real e digital que podem ser representados através de listas que estabelecem uma organização na qual há um número variável de itens dispostos em sequência.', 'Listas são estruturas de dados que agrupam itens organizados logicamente um depois do outro e não têm tamanho pré-definido. Exemplos: filas de pessoas, pilhas de cartas, lista de compras.'),
(43, 6, 'EF05CO02', 'Pensamento Computacional', 'Reconhecer objetos do mundo real e digital que podem ser representados através de grafos que estabelecem uma organização com uma quantidade variável de vértices conectados por arestas.', 'Grafos são usados para representar relações entre objetos (descritos por vértices e arestas). Exemplos: mapas, redes sociais, internet, árvores genealógicas.'),
(44, 6, 'EF05CO03', 'Pensamento Computacional', 'Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores "verdadeiro" e "falso".', 'Os valores de sentenças lógicas podem ser modificados ou combinados usando operações lógicas como negação (NÃO), conjunção (E) e disjunção (OU).'),
(45, 6, 'EF05CO04', 'Pensamento Computacional', 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências, repetições e seleções condicionais.', 'Além de sequências e repetições, muitas vezes é necessário fazer escolhas sobre qual ação executar. Escolhas são feitas a partir de condições (se o semáforo estiver vermelho, pare).'),
(46, 6, 'EF05CO05', 'Mundo Digital', 'Identificar os componentes principais de um computador (dispositivos de entrada/saída, processadores e armazenamento).', 'O objetivo é ensinar os elementos principais da arquitetura de um computador: E/S, processador e dispositivos de armazenamento temporários (RAM) e persistentes (disco).'),
(47, 6, 'EF05CO06', 'Mundo Digital', 'Reconhecer que os dados podem ser armazenados em um dispositivo local ou remoto.', 'Os dados podem ser armazenados em dispositivo acoplado ao computador (local), removíveis ou transmitidos para outros computadores na Internet (nuvem).'),
(48, 6, 'EF05CO07', 'Mundo Digital', 'Reconhecer a necessidade de um sistema operacional para a execução de programas e gerenciamento do hardware.', 'Os dispositivos físicos de um computador são gerenciados por um software denominado Sistema Operacional, responsável por gerenciar recursos (memória, arquivos, dispositivos).'),
(49, 6, 'EF05CO08', 'Cultura Digital', 'Acessar as informações na Internet de forma crítica para distinguir os conteúdos confiáveis de não confiáveis.', 'Refletir e acessar informações em buscas na Internet criticamente, identificando características de conteúdos prejudiciais, informações confiáveis e notícias falsas.'),
(50, 6, 'EF05CO09', 'Cultura Digital', 'Usar informações considerando aplicações e limites dos direitos autorais em diferentes mídias digitais.', 'Utilizar informações e dados na Internet reconhecendo os direitos autorais (música, filme, livro) e os cuidados em seu compartilhamento e uso.'),
(51, 6, 'EF05CO10', 'Cultura Digital', 'Expressar-se crítica e criativamente na compreensão das mudanças tecnológicas no mundo do trabalho e sobre a evolução da sociedade.', 'Expressar-se por meio de dispositivos computacionais ou não, demonstrando compreensão das mudanças que as tecnologias trazem ao cotidiano e mundo do trabalho.'),
(52, 6, 'EF05CO11', 'Cultura Digital', 'Identificar a adequação de diferentes tecnologias computacionais na resolução de problemas.', 'Compreender diferentes necessidades de uso das tecnologias computacionais (ex: por que usar computador para HQ e celular para ligação).')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 6. Exemplos Práticos (Anos 2 a 5)
INSERT INTO curriculo_exemplos_praticos (habilidade_id, tipo, conteudo) VALUES
(19, 'Geral', 'Agrupar imagens de veículos (motos, bicicletas, aviões) por características: voam, possuem rodas, possuem motor.'),
(20, 'Geral', 'Construir algoritmos com instruções pré-definidas (avançar, virar). Ex: "Ande um passo 10 vezes; vire à esquerda; ande um passo 5 vezes".'),
(21, 'Geral', 'Identificar que operações de uma calculadora ou dobradura podem ser usadas em sequências definidas para produzir resultados.'),
(22, 'Geral', 'Utilizar dispositivos do cotidiano para diferenciar o dispositivo físico (hardware) daquilo que o controla (software).'),
(23, 'Geral', 'Apresentar imagens de tecnologias (celular, computador) destacando características e usos (ligações, documentos).'),
(24, 'Geral', 'Criar portfólio com cuidados ao jogar nos dispositivos. Refletir sobre não falar tudo na internet.'),
(25, 'Geral', 'Determinar valores verdade de sentenças: "Cinco é maior que seis" (Falso); "Cinco NÃO é maior que seis" (Verdadeiro).'),
(26, 'Geral', 'Algoritmo para andar em tabuleiro até encontrar obstáculo: "Enquanto a próxima posição estiver vazia, ande um passo".'),
(27, 'Geral', 'Decompor a tarefa "preparar café da manhã" em subproblemas: preparar café e fazer sanduíche. Combinar as soluções.'),
(28, 'Geral', 'Mostrar que dados de endereço (rua, CEP) juntos definem a informação de um local. Cores de pixels juntos definem imagem.'),
(29, 'Geral', 'Mostrar que para representar data combina-se dia, mês, ano. Imagens representadas por composições de cores em pixels.'),
(30, 'Geral', 'Exemplificar dispositivos de entrada (teclado, mouse) e saída (monitor, impressora).'),
(31, 'Geral', 'Pesquisa simples sobre personagem de desenho, verificando filtros e diferentes resultados de busca.'),
(32, 'Geral', 'Utilizar ferramenta de desenho para criar figura que represente férias ou evento importante.'),
(33, 'Geral', 'Apresentar caso de dados roubados e destacar causas. Criar painel com impactos de compartilhar dados em tablets/celulares.'),
(34, 'Geral', 'Construir tabuleiro de batalha naval (matriz) e jogar informando coordenadas. Representar janelas de prédio em matriz.'),
(35, 'Geral', 'Identificar informações em documentos de identidade (nome, filiação). Criar formulário para coletar informações anônimas de colegas.'),
(36, 'Geral', 'Algoritmo para lavar janelas de prédio: Repetir 10 vezes (andares) a tarefa de lavar 20 janelas (repetição aninhada).'),
(37, 'Geral', 'Utilizar tabela ASCII onde "A" é 65 (1000001 em binário). Conversão decimal para binário.'),
(38, 'Geral', 'Usar tabela ASCII ou formatos de imagem simples (matriz de 0 e 1) para codificar informações. Enviar mensagens secretas.'),
(39, 'Geral', 'Projeto de criação de história digital ou vídeo curto usando editores.'),
(40, 'Geral', 'Construção de painel sobre manipulação de dados (imagem, música), destacando permissões e autoria.'),
(41, 'Geral', 'Organizar casos onde se precisa de informação e comparar páginas com informações diferentes (ex: biografia) para checar fontes.'),
(42, 'Geral', 'Fornecer cartas agrupadas por naipes e ordenadas. Inserir novas cartas mantendo ordem. Busca por carta específica.'),
(43, 'Geral', 'Traçar linhas em mapa de bairro ligando prédios (grafo). Comparar caminhos. Representar amizades em rede social como grafo.'),
(44, 'Geral', 'Determinar valor verdade com conectivos: "Cinco é maior que seis E maior que dois" (Falso); "Cinco é maior que seis OU maior que dois" (Verdadeiro).'),
(45, 'Geral', 'Algoritmo para atravessar rua: "Se semáforo vermelho OU amarelo, aguardar; caso contrário, atravessar".'),
(46, 'Geral', 'Explicar componentes básicos (processador, memória) e suas funções.'),
(47, 'Geral', 'Exemplificar dispositivos de armazenamento, diferenciando local (HD) e remoto (nuvem).'),
(48, 'Geral', 'Mostrar a existência de diferentes Sistemas Operacionais (Windows, Linux) e suas funções.'),
(49, 'Geral', 'Estudo comparativo entre sites de jornais oficiais e blogs para analisar confiabilidade.'),
(50, 'Geral', 'Criar portfólio com imagens de personagens citando fontes e considerando direitos autorais.'),
(51, 'Geral', 'Criar animação sobre impacto da tecnologia na sociedade (ex: uso de áudio em vez de ligação).'),
(52, 'Geral', 'Jogo onde alunos escolhem a melhor tecnologia para resolver problemas apresentados, justificando a escolha.');

-- 7. Materiais Complementares (Anos 2 a 5)
INSERT INTO curriculo_materiais_complementares (habilidade_id, descricao, link) VALUES
(19, 'Identificar padrões, Classificar objetos, Ordenar Objetos, Jogos - Padrões, Modelagem 1 e 2', NULL),
(20, 'Introdução algoritmo, Dentes bem limpos, Achocolatado, Começamos programar', NULL),
(21, 'Pequenos jardineiros, Brincando com número, Montando envelope', NULL),
(22, 'Hardware e Software, Jogo partes computad, Software para colorir, Jogos GCompris', NULL),
(23, 'O que é tecnologia, O que são TICs', NULL),
(24, 'Nossos perfis, Jogo da privacidade, Proteja privacidade', NULL),
(25, '3º_Lógica VouF', NULL),
(26, '3º_Algoritmo.rotina, 3º_Algoritmo.ordem, 3º_Algoritmo.artista, 3º_Algoritmos.mapa1', NULL),
(27, '3º_Apresentação, 3º_Decomposição', NULL),
(28, '3º_Memória, 3º_Processador', NULL),
(29, '3º_Processo inform., 3º_Proc.Inf.Ativ.', NULL),
(30, '3º_IF_Computadores, 3º_IF_HeS, 3º_IF_EeS, 3º_IF_Quebra-cabeça', NULL),
(31, '3º_Buscador_prática, 3º_Buscadores', NULL),
(32, '3º_Ferramenta.Google, 3º_Google Docs', NULL),
(33, '3º_Tecnologia, 3º_Riscos virtual, 3º_Proteção dados', NULL),
(34, '4º_Matriz.CM, 4º_Matiz.tabuleiro, 4º_Matriz.mapa', NULL),
(35, '4º_Matrizes.fichas', NULL),
(36, '4º_Algoritmos, 4º_Alg.Padrões, 4º_Algorit_Minecraft, 4º_Algorit.Code', NULL),
(37, 'Conversão de base, Contagem com 0 e 1, 4º_Números Binários', NULL),
(38, 'O que é um pixel?, 4º_Criptografia, 4º_Arte Pixel, Desenhos em Pixel', NULL),
(39, '4º_Google, 4º_Google Slides, 4º_Google Docs', NULL),
(40, '4º_Internet Segura, 4º_Ética', NULL),
(41, '4º_Confiabilidade', NULL),
(42, '5º_Listas.dados, 5º_Listas.algoritmos', NULL),
(43, '5º_Listas.fluxograma', NULL),
(44, '5º_Lógica.VouF', NULL),
(45, '5º_Algoritmo.Scratch, 5º_Condicional1 e 2', NULL),
(46, '5º_Tudo.computadores, 5º_Computador.partes', NULL),
(47, '5º_Armazenamento', NULL),
(48, '5º_Sistema.operacion', NULL),
(49, '5º_Internet.ñ.é.tudo, 5º_Fake News', NULL),
(50, '5º_Direito.autoral', NULL),
(51, '5º_Google.docs, 5º_Impacto.tecn.', NULL),
(52, '5º_Google.slides', NULL);
