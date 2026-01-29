/* ==========================================================================
   INSERÇÃO DE DADOS: 1º ANO (Currículo de Computação)
   Adaptado do script Gemini para as tabelas curriculo_*.
   Execute após: curriculo-computacao-educacao-infantil.sql
   ========================================================================== */

-- 1. Inserir a Etapa (1º Ano)
INSERT INTO curriculo_etapas_ensino (id, nome) VALUES (2, '1º Ano')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 2. Inserir Habilidades (IDs 12 a 18)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(12, 2, 'EF01CO01', 'Pensamento Computacional', 'Organizar objetos físicos ou digitais considerando diferentes características para esta organização, explicitando semelhanças (padrões) e diferenças.', 'Objetos de um mesmo conjunto podem ser organizados e agrupados de diferentes maneiras, enfatizando as características desejadas. A organização adequada pode facilitar a busca por um objeto específico dentro deste conjunto.'),
(13, 2, 'EF01CO02', 'Pensamento Computacional', 'Identificar e seguir sequências de passos aplicados no dia a dia para resolver problemas.', 'O objetivo é que os alunos possam identificar passos que fazem parte da execução de uma tarefa, bem como seguir uma sequência de passos para realizar uma tarefa (resolver um problema).'),
(14, 2, 'EF01CO03', 'Pensamento Computacional', 'Reorganizar e criar sequências de passos em meios físicos ou digitais, relacionando essas sequências à palavra "Algoritmos".', 'Ao explicar para alguém como realizar uma tarefa (resolver um problema), se está criando um algoritmo. Esses algoritmos podem ser construídos a partir de um conjunto de passos desordenados, onde o aluno deve identificar a sequência em que esses passos devem ser executados, ou podem ser construídos partindo do zero, na qual esses passos também devem ser determinados, além da sequência desses. Pode-se usar linguagem textual, oral ou pictográfica para descrever os passos de um algoritmo.'),
(15, 2, 'EF01CO04', 'Mundo Digital', 'Reconhecer o que é a informação, que ela pode ser armazenada, transmitida como mensagem por diversos meios e descrita em várias linguagens.', 'O objetivo é fazer com que o aluno compreenda o conceito de informação, que uma mesma informação pode ser descrita de diversas formas (usando linguagem oral, imagens, sons etc.) e que tal descrição pode ser armazenada e transmitida. Por exemplo, a informação sobre a existência de um cachorro pode ser representada como uma imagem ou como o som de seu latido, que pode ser transmitida repassando a folha com a imagem para outra pessoa ou reproduzindo o som para outra pessoa (como na brincadeira telefone sem fio) e depois pode ser armazenada em uma pasta ou gravação.'),
(16, 2, 'EF01CO05', 'Mundo Digital', 'Representar informação usando diferentes codificações.', 'Compreender o conceito de representação é um passo importante para a compreensão de como computadores representam as informações e simulam comportamentos, além de ser habilidade importante para o desenvolvimento e uso de abstrações. Um algoritmo executado por um computador opera dados representados de maneira simbólica. Por exemplo, uma imagem pode ser representada por uma grade formada por pequenos quadrados (pixels), cada qual com um número que representa sua cor (por exemplo, 0 branco e 1 preto). Sons podem ser representados por notas musicais etc.'),
(17, 2, 'EF01CO06', 'Mundo Digital', 'Reconhecer e explorar artefatos computacionais voltados a atender necessidades pessoais ou coletivas.', 'Esta habilidade tem como proposta a identificação e exploração de tecnologias físicas ou digitais, como por exemplo computador, tablets, brinquedos eletrônicos, ferramentas do cotidiano (martelo, alavancas, rampa).'),
(18, 2, 'EF01CO07', 'Cultura Digital', 'Conhecer as possibilidades de uso seguro das tecnologias computacionais para proteção dos dados pessoais e para garantir a própria segurança.', 'Esta habilidade propõe que o aluno possa refletir sobre a importância de resguardar dados pessoais como nome, endereço, idade, onde estuda, quando da utilização de tecnologias como celular, tablets, em que não se pode compartilhar essas informações com qualquer pessoa.')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 3. Exemplos Práticos (tipo 'Geral' – documento mistura os tipos nesta etapa)
INSERT INTO curriculo_exemplos_praticos (habilidade_id, tipo, conteudo) VALUES
(12, 'Geral', 'O professor pode pedir que os alunos organizem um conjunto de personagens por gênero, cor dos olhos, idade, tamanho, nacionalidade etc. Também pode sugerir que os alunos organizem um conjunto de figuras geométricas por cor, por tipo de figura, por tamanho das figuras etc. Introduzir os estudantes no tema, por meio de imagens que representem o termo digital'),
(12, 'Geral', 'A partir das semelhanças e diferenças dos tipos de curvas, treinar a motricidade fina para, posteriormente, o aluno não ter dificuldades ao trabalhar com o touchpad.'),
(12, 'Geral', 'Classificar os objetos de acordo com suas características.'),
(12, 'Geral', 'Aproximar o estudante do conceito de padrões, por meio de atividades que representem sequências de padrões.'),
(13, 'Geral', 'O professor pode fornecer sequências de passos para resolver problemas como construir origamis simples, seguir caminhos, executar uma receita, construir figuras com Tangram, entre outros, e solicitar que os alunos as executem. Introduzir o conceito de algoritmo.'),
(13, 'Geral', 'A partir do conhecimento adquirido sobre algoritmos, criar um novo algoritmo e, depois, recolocar o algoritmo em sua ordem original.'),
(14, 'Geral', 'O professor pode fornecer imagens que descrevem os passos para construir um objeto usando peças do tipo ''Lego'' e solicitar que os alunos as organizem em uma sequência que permita construir o objeto. Ou ainda, o professor pode solicitar que os alunos expliquem, oralmente ou através de sequências de desenhos, como se joga esconde-esconde ou qualquer outro tipo de jogo. A partir do conhecimento adquirido sobre algoritmos, criar um novo algoritmo e, depois, recolocar o algoritmo em sua ordem original.'),
(15, 'Geral', 'Transmitir uma palavra por ''telefone sem fio'', enviar um desenho para um colega, gravar uma mensagem de áudio e reproduzi-la para um colega, entre outros. Introduzir o estudante ao reconhecimento de informações transmitidas por meio de códigos.'),
(15, 'Geral', 'Compreender que podemos nos comunicar utilizando diferentes linguagens.'),
(16, 'Geral', 'Mostrar que ao pintar as áreas de uma imagem com cores pré-definidas (codificação) uma imagem é recuperada (informação) ou mostrar a relação de uma música com suas notas musicais. Compreender que uma mesma informação pode ser mostrada de diferentes maneiras.'),
(17, 'Geral', 'O professor poderá utilizar um jogo educacional em ferramentas como computador, tablet, mesas interativas, celular, em que os alunos possam experimentar seus recursos. Digitar letras utilizando um teclado'),
(17, 'Geral', 'Identificar e explorar as tecnologias digitais, como o computador, conhecendo seus componentes.'),
(17, 'Geral', 'Identificar e explorar tecnologias digitais, por meio de jogos digitais.'),
(18, 'Geral', 'Professor poderá fazer um jogo de imagens de dispositivos como celular, tablet, computador dentre outros em que os alunos precisam apresentar o que as pessoas fazem com essas tecnologias. Assim, o professor poderá destacar os cuidados quando usamos esses dispositivos. Refletir sobre a importância de não compartilhar informações pessoais com pessoas desconhecidas.');

-- 4. Materiais Complementares (descricao; link fica NULL)
INSERT INTO curriculo_materiais_complementares (habilidade_id, descricao, link) VALUES
(12, '1º ano_Apresentação', NULL),
(12, '1º_Curvas e linhas, 1º_Curvas jogo', NULL),
(12, '1º_organização, 1º_Contagem e quant., 1º_Classificação', NULL),
(12, '1º_Padrões, 1º_Padrão robô1, 1º_Padrão robô2, 1º_Confecção robô', NULL),
(13, '1º_Algoritmo1', NULL),
(13, '1º_Algoritmo COJP', NULL),
(14, '1º_Algoritmo COJP', NULL),
(15, '1º_Códigos, 1º_Cód_Telefone, 1º_Cod_Emojis, 1º_Cód_Mensagem', NULL),
(15, '1º_Códigos - Podcast, 1º_Código-Vídeo', NULL),
(16, '1º_Códigos, 1º_Cod_Emojis, 1º_Cód_Mensagem, 1º_Cód_colorir, 1º_Cód_representar', NULL),
(17, 'Jogo de Digitação', NULL),
(17, '1º_Computador, 1º_Comp.Acessórios, 1º_Comp. Mouse, 1º_Comp.Teclado, 1º_Comp.Montar', NULL),
(17, '1º_Comp. Jogos Dig', NULL),
(18, '1º_Segurança_Conc., 1º_Segurança.jogo', NULL);
