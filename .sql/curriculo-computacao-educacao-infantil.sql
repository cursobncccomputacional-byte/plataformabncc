/* ==========================================================================
   BANCO DE DADOS: CURRÍCULO DE COMPUTAÇÃO - EDUCAÇÃO INFANTIL
   Estrutura do Gemini, com prefixo curriculo_ para não conflitar com
   tabelas existentes (ex.: habilidades da estrutura principal).
   Eixos: Pensamento Computacional | Mundo Digital | Cultura Digital
   ========================================================================== */

-- 1. Criação das Tabelas
CREATE TABLE IF NOT EXISTS curriculo_etapas_ensino (
    id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS curriculo_habilidades (
    id INT PRIMARY KEY,
    etapa_id INT NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    eixo VARCHAR(100) NOT NULL COMMENT 'Pensamento Computacional | Mundo Digital | Cultura Digital',
    descricao TEXT NOT NULL,
    explicacao TEXT,
    UNIQUE KEY uk_codigo (codigo),
    KEY idx_etapa (etapa_id),
    KEY idx_eixo (eixo),
    FOREIGN KEY (etapa_id) REFERENCES curriculo_etapas_ensino(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS curriculo_exemplos_praticos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    habilidade_id INT NOT NULL,
    tipo VARCHAR(80) NOT NULL COMMENT 'Ex: Computação plugada, Computação desplugada, Computação (Des)plugada',
    conteudo TEXT NOT NULL,
    KEY idx_habilidade (habilidade_id),
    FOREIGN KEY (habilidade_id) REFERENCES curriculo_habilidades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS curriculo_materiais_complementares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    habilidade_id INT NOT NULL,
    descricao TEXT,
    link VARCHAR(500),
    KEY idx_habilidade (habilidade_id),
    FOREIGN KEY (habilidade_id) REFERENCES curriculo_habilidades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ==========================================================================
   INSERÇÃO DE DADOS
   ========================================================================== */

-- 1. Etapa de Ensino
INSERT INTO curriculo_etapas_ensino (id, nome) VALUES (1, 'Educação Infantil')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 2. Habilidades (com eixos corretos: PC, Mundo Digital, Cultura Digital)
INSERT INTO curriculo_habilidades (id, etapa_id, codigo, eixo, descricao, explicacao) VALUES
(1, 1, 'EI03CO01', 'Pensamento Computacional', 'Reconhecer padrão de repetição em sequência de sons, movimentos, desenhos.', 'O reconhecimento de padrões é uma habilidade essencial para a programação de computadores, sendo aplicado em diversas áreas, como reconhecimento de imagens, processamento de sinais e análise de dados.'),
(2, 1, 'EI03CO02', 'Pensamento Computacional', 'Expressar as etapas para a realização de uma tarefa de forma clara e ordenada.', 'Expressar as etapas para a realização de uma tarefa de forma clara e ordenada é importante para que a tarefa seja executada corretamente e que possa ser entendida e executada por outras pessoas ou máquinas. Também ajuda a identificar possíveis erros e a simplificar o processo, tornando-o mais eficiente. Na área da computação, isso é especialmente importante para programação e desenvolvimento de software, onde a organização e a clareza são fundamentais para o sucesso do projeto.'),
(3, 1, 'EI03CO03', 'Pensamento Computacional', 'Experienciar a execução de algoritmos brincando com objetos (des)plugados.', 'A experiência de executar algoritmos brincando com objetos (des)plugados é importante porque permite que os estudantes sejam expostos a conceitos fundamentais de programação de uma forma mais concreta e fácil de compreender. Além disso, essa abordagem também pode ajudar a desenvolver habilidades importantes, como a resolução de problemas, a criatividade e a colaboração.'),
(4, 1, 'EI03CO04', 'Pensamento Computacional', 'Criar e representar algoritmos para resolver problemas.', 'A experiência de executar algoritmos brincando com objetos (des)plugados é importante porque permite que os estudantes sejam expostos a conceitos fundamentais de programação de uma forma mais concreta e fácil de compreender. Além disso, essa abordagem também pode ajudar a desenvolver habilidades importantes, como a resolução de problemas, a criatividade e a colaboração.'),
(5, 1, 'EI03CO05', 'Pensamento Computacional', 'Comparar soluções algorítmicas para resolver um mesmo problema.', 'Comparar soluções algorítmicas para resolver um mesmo problema é importante porque permite identificar a solução mais eficiente em termos de tempo de execução e utilização de recursos computacionais. O conhecimento das vantagens e desvantagens de cada algoritmo pode levar a melhorias significativas no desempenho e na eficiência de sistemas computacionais.'),
(6, 1, 'EI03CO06', 'Pensamento Computacional', 'Compreender decisões em dois estados (verdadeiro ou falso).', 'Compreender decisões em dois estados (verdadeiro ou falso) é importante porque é um dos princípios fundamentais da lógica booleana, que é a base para o funcionamento de muitos sistemas computacionais. A lógica booleana permite que os computadores tomem decisões com base em valores binários, o que é essencial para muitas aplicações, como a programação de sistemas de controle, a criptografia e a construção de algoritmos de busca e classificação.'),
(7, 1, 'EI03CO07', 'Mundo Digital', 'Reconhecer dispositivos eletrônicos (e não-eletrônicos), identificando quando estão ligados ou desligados (abertos ou fechados).', 'Além de saber diferenciar o que são dispositivos eletrônicos e não eletrônicos, a habilidade trata da lógica booleana na identificação dos estados dos dispositivos, já que ela trabalha com valores "verdadeiro" ou "falso", que podem ser associados ao estado ligado ou desligado dos dispositivos. Além disso, a lógica booleana é uma base fundamental para a programação de computadores, uma vez que ela permite a criação de algoritmos que envolvem a tomada de decisões com base em valores booleanos.'),
(8, 1, 'EI03CO08', 'Mundo Digital', 'Compreender o conceito de interfaces para comunicação com objetos (des)plugados.', 'A interface é o que permite que as pessoas interajam com os softwares de forma mais fácil e eficiente, possibilitando que realizem suas tarefas de maneira mais rápida e com menos erros. Além disso, as interfaces também tem um papel importante para a acessibilidade, permitindo que pessoas com deficiências visuais ou motoras possam utilizar as máquinas de maneira mais autônoma e inclusiva.'),
(9, 1, 'EI03CO09', 'Mundo Digital', 'Identificar dispositivos computacionais e as diferentes formas de interação.', 'Identificar as diferentes formas de interação com os dispositivos permite que os alunos entendam como as pessoas interagem com as máquinas e, a partir disso, desenvolvam interfaces mais eficientes e acessíveis. Além disso, ao compreender as diferentes formas de interação, é possível criar softwares e hardwares mais intuitivos e fáceis de usar, melhorando a experiência do usuário e aumentando a sua satisfação com o produto final.'),
(10, 1, 'EI03CO10', 'Cultura Digital', 'Utilizar tecnologia digital de maneira segura, consciente e respeitosa.', 'Saber utilizar tecnologia digital de maneira segura, consciente e respeitosa é importante na educação infantil porque garante a integridade física e psicológica dos estudantes. Além disso, ajuda a formar cidadãos críticos e éticos, conscientes da importância de utilizar a internet de forma responsável, evitando a propagação de notícias falsas, o cyberbullying e outras formas de violência digital. Também é importante incentivar o respeito à diversidade cultural e a convivência com a diferença, combatendo o preconceito e a discriminação. A tecnologia pode ser uma ferramenta poderosa para promover a inclusão social e a igualdade de oportunidades, desde que seja utilizada de forma consciente e respeitosa.'),
(11, 1, 'EI03CO11', 'Cultura Digital', 'Adotar hábitos saudáveis de uso de artefatos computacionais, seguindo recomendações de órgãos de saúde competentes.', 'Adotar hábitos saudáveis de uso de artefatos computacionais, seguindo recomendações de órgãos de saúde competentes, é importante para a educação infantil porque ajuda a prevenir problemas de saúde, como a Síndrome do Olho Seco e a L.E.R. (Lesão por Esforço Repetitivo), bem como a evitar a exposição excessiva a telas, que pode prejudicar o desenvolvimento cognitivo e emocional dos estudantes.')
ON DUPLICATE KEY UPDATE eixo = VALUES(eixo), descricao = VALUES(descricao), explicacao = VALUES(explicacao);

-- 3. Exemplos Práticos (Plugada / Desplugada / (Des)plugada)
INSERT INTO curriculo_exemplos_praticos (habilidade_id, tipo, conteudo) VALUES
(1, 'Computação plugada', '1) Criar padrões de repetição em sequência com formas e cores diferentes: (i) por meio de editor de desenho; (ii) por meio de ferramenta online (Pattern Shapes). 2) Completar a sequência de figuras de acordo com o padrão estabelecido por meio de jogo online: (i) Shape Pattern; (ii) Chicken Dance.'),
(1, 'Computação desplugada', '1) Perceber, por meio de tarefas de sua rotina, a repetição de movimentos: (i) comer um sanduíche (morder, mastigar, engolir); (ii) respirar (inspirar, expirar). 2) Reconhecer padrão por meio de sons do próprio corpo: (i) Perguntar às crianças se sabem o que é um padrão; (ii) Escolher uma música produzida com sons do corpo; (iii) E, após ouvir, fazer questionamentos como: Alguma coisa nessa música repete? O quê? Qual padrão você conseguiu observar? Você consegue reproduzir? 3) Criar uma sequência a partir de um padrão de cores ou formas semelhantes, indicando a quantidade de repetições por meio de blocos de montar ou outros materiais.'),
(2, 'Computação plugada', '1) Experienciar as etapas de execução de tarefas, discutindo como as tarefas são divididas em etapas a partir de jogos digitais como: (i) Cookie Monsters Foodie Truck; (ii) Ready Set Grow.'),
(2, 'Computação desplugada', '1) Expressar as etapas de realização de tarefas diárias por meio de desenhos ou de forma oral; 2) Ordenar uma sequência de imagens que representam as etapas de uma tarefa diária. Exemplo de uma tarefa diária - Hora de dormir: (i) tomar banho, (ii) colocar pijama, (iii) escovar os dentes, (iv) ouvir uma história, (v) dormir.'),
(3, 'Computação plugada', '1) Experienciar a execução de algoritmos por meio de (i) jogos digitais (e.g. Follow the Code); (ii) brinquedos robóticos (e.g. Rope).'),
(3, 'Computação desplugada', '1) Experienciar a execução de algoritmos por meio de percursos realizados a partir de desenhos no chão (ou maquetes) como, por exemplo: (i) jogos de labirinto; (ii) amarelinha; (iii) sequências de números; (iv) sequências de cores; 2) Experienciar a execução de algoritmos por meio de atividades manuais (e.g. dobraduras, bordado, costura). Exemplo: Executar o seguinte algoritmo: Passo (1) - Pegar uma folha de papel sulfite; Passo (2) - Dobrar esta folha ao meio; Passo (3) - Dobrar novamente ao meio; Passo (4) - Dobrar novamente ao meio; Avaliar o resultado refletindo sobre: (a) Quantas vezes pode-se repetir este passo? e (b) Existem formas diferentes de dobrar o papel ao meio?'),
(4, 'Computação Plugada', '1) Explorar jogos digitais, puzzles e jogos de programar que permitem representar uma sequência lógica para resolver problemas. Como exemplos de recursos, temos: (i) Jogos de sequência lógica; (ii) LightBot; (iii) Scratch Jr.'),
(4, 'Computação Desplugada', '1) Preparar uma receita (e.g. bolo, sorvete) com as crianças, evidenciando os passos para o preparo (algoritmo). Dialogar com elas sobre a ordem das etapas. Como sugestão de material de apoio pedagógico, temos a "Minha Fábrica de Comida". 2) Criar percursos, de uma origem até um destino, em um tabuleiro (e.g. papel, chão), representando os passos do trajeto. Como sugestão de material de apoio pedagógico, temos o "AlgoCards" e "Segue o Trilho". Utilizando os AlgoCards para a construção de algoritmos por meio de cores e símbolos.'),
(5, 'Computação Plugada', '1) Comparar diferentes rotas executadas pelas crianças a partir de um jogo digital de labirinto.'),
(5, 'Computação Desplugada', '1) Comparar diferentes rotas executadas pelas crianças a partir de um labirinto marcado no chão; 2) Comparar diferentes formas de se realizar tarefas diárias como: (i) escovar os dentes, (ii) tomar banho, (iii) colocar roupa.'),
(6, 'Computação plugada', '1) Criar um jogo digital a partir de um conjunto de perguntas com base em uma história, personagens ou tema de interesse da turma e avaliar as perguntas respondendo verdadeiro ou falso. Como sugestão de ferramentas para criação da atividade, temos: (i) Wordwall, e (ii) Jamboard.'),
(6, 'Computação desplugada', '1) Criar um conjunto de perguntas com base em uma história, personagens ou tema de interesse da turma. Cada criança recebe duas cartas, uma verde (verdadeiro) e uma vermelha (falso). Para cada pergunta, a criança apresenta o resultado da sua avaliação e, em conjunto, discutem os erros e acertos. 2) Realizar a brincadeira popular de "morto e vivo" (e suas variações) em que, ao invés de morto e vivo, sejam utilizadas frases passíveis de ser julgadas como verdadeiras (vivo) ou falsas (morto). 3) "Verdadeiro ou Falso" / "Isso no meu mundo".'),
(7, 'Computação (Des)plugada', '1) Propor atividades de visualização ou exploração de dispositivos eletrônicos (e.g. lanterna, calculadora, televisão, celular, rádio, tablets) de forma a: (i) possibilitar que as crianças possam ligar e desligar os aparelhos, (ii) reconhecer quando estão ligados ou desligados, e (iii) diferenciar dos dispositivos não-eletrônicos. 2) Participar de brincadeiras que demonstrem dois estados (ligado e desligado). Como brincadeiras de exemplo: (i) Seu Mestre Mandou; (ii) Pega-gelo / Pega-congelou; (iii) Estátua.'),
(8, 'Computação Plugada', '1) Reconhecer as diferentes interfaces de aparelhos (e.g. micro-ondas, computador, projetor, controle remoto etc.) e suas partes, diferenciando as formas de comunicar ações. 2) Representar, por meio de editores gráficos (e.g. Paint), as diferentes interfaces de aparelhos e suas partes.'),
(8, 'Computação Desplugada', '1) Brincar de "telefone sem fio" (brincadeira popular), dialogando sobre o conceito de interface; 2) Criar desenhos representando diferentes formas de interface dos aparelhos e suas partes (e.g. criar as teclas de um telefone).'),
(9, 'Computação Plugada', '1) Brincar com dispositivos (e.g. tablets, mesas e telas interativas, computador, dispositivos robóticos, tecnologias assistivas) por meio de jogos educacionais ou situações de aprendizagem, a fim de que as crianças possam verificar as diferentes formas de utilização de cada uma delas, como: (i) toque de tela em tablets, (ii) uso do mouse no computador, (iii) manipulação de um robô, (iv) comando por voz, (v) reconhecimento facial, (vi) reconhecimento de gestos.'),
(9, 'Computação Desplugada', '1) Simular um jogo de perguntas e respostas ou adivinhação usando imagens que representam as diferentes formas de interação entre os dispositivos; 2) Representar as diferentes formas de interação (e.g. narrativas, storyboards) com dispositivos por meio de atividades manuais (e.g. desenhos, maquetes, colagem, modelagem).'),
(10, 'Computação plugada', '1) Propor um caça ao tesouro (e.g. escape room) com desafios que retratam situações reais de uso de tecnologia, segurança e ética. É possível criar ambientes como esse gratuitamente pelo Google Forms, Escape Factory ou Genial.ly; 2) Adaptar o caça ao tesouro para ser jogado de forma cooperativa ou competitiva, individual ou em grupo, podendo ser online, híbrido ou presencial. 3) Produzir um portfólio com dicas para manter-se seguro ao assistir vídeos, jogar online, registrar vídeos e fotos e compartilhar informações na internet. O portfólio deve ser produzido pelas crianças e pode incluir vídeos, imagens, desenhos e escrita espontânea. Como opções para produzir um portfólio online, tem-se: Book Creator, Flipgrid, Canva, entre outros.'),
(10, 'Computação desplugada', '1) Propor um caça ao tesouro onde as pistas são situações reais de uso de tecnologia, segurança e ética. Para avançar para a próxima pista, as crianças devem demonstrar ou oralizar o que fariam em cada situação. 2) Produzir um portfólio físico a partir da mesma realidade apresentada no exemplo plugado. Situações de exemplo (caça ao tesouro): (i) você está jogando e aparece uma propaganda que deixa você com medo. O que você deve fazer? (ii) Você está participando de uma interação na internet. Alguém que você não conhece pergunta onde você mora. Você conta? (iii) Todo jogo pode ser jogado por crianças da sua idade? Como você descobre se ele será legal ou não?'),
(11, 'Computação plugada', '1) Compreender a importância do tempo de exposição à tela por meio de um óculos sem grau: (i) Utilizar um óculos usado e sem grau; (ii) Pedir que as crianças visualizem alguns objetos na tela do computador; (iii) Depois que todos visualizaram, utilizar tampões de tamanhos diferentes, aumentando o grau de dificuldade da visualização; (iv) Quando todos visualizaram com o último tampão (o mais fechado), explicar que o grau de dificuldade simboliza o tempo de permanência na frente da tela, de forma que quanto maior o tempo, maior a dificuldade de visualizar nitidamente. 2) Compreender os potenciais efeitos do uso prolongado de jogos digitais. Como por exemplo: i) Fazer um levantamento sobre os jogos que as crianças jogam; ii) Acessar um jogo em um dispositivo ilustrando-o para as crianças; iii) Dialogar sobre características que tornam os jogos estimulantes (visual, sons gráficos etc.); iv) Dialogar sobre estratégias usadas para manter o usuário envolvido com o jogo o maior tempo possível (recompensas, fases, bônus etc.); v) Dialogar sobre a sensação que esses jogos geram nas crianças.'),
(11, 'Computação desplugada', '1) Utilizar a mesma estratégia plugada (1), substituindo a tela do computador por um painel de fantoches.');

-- 4. Materiais Complementares (com links)
INSERT INTO curriculo_materiais_complementares (habilidade_id, descricao, link) VALUES
(1, 'Pattern Shapes', 'https://apps.mathlearningcenter.org/pattern-shapes/'),
(1, 'Shape Pattern', 'https://www.topmarks.co.uk/ordering-and-sequencing/shape-patterns'),
(1, 'Chicken Dance', 'https://pbskids.org/peg/games/chicken-dance'),
(2, 'Cookie Monsters Foodie Truck', 'https://pbskids.org/sesame/games/cookie-monsters-foodie-truck/'),
(2, 'Ready Set Grow', 'https://pbskids.org/sesame/games/ready-set-grow/'),
(3, 'Follow the Code', 'https://www.mathplayground.com/follow_the_code.html'),
(3, 'Rope (SmartFun)', 'http://smartfunbrasil.com/'),
(4, 'Jogos de sequência lógica', 'https://www.smartkids.com.br/jogos-educativos/c/jogos-sequencia-logica'),
(4, 'LightBot', 'https://lightbot.com/'),
(4, 'Scratch Jr.', 'https://www.scratchjr.org/'),
(4, 'Minha Fábrica de Comida', 'https://lifes.dc.ufscar.br/computar/minha-fabrica-de-comida/'),
(4, 'AlgoCards', 'http://www.computacional.com.br/'),
(4, 'Segue o Trilho', 'https://lifes.dc.ufscar.br/computar/segue-o-trilho/'),
(6, 'Wordwall', 'https://wordwall.net/pt'),
(6, 'Jamboard', 'https://jamboard.google.com/'),
(6, 'Verdadeiro ou Falso / Isso no meu mundo', 'https://lifes.dc.ufscar.br/computar/verdadeiro-ou-falso/');
