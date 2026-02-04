-- =====================================================
-- Perguntas de avaliação ao final da aula (Módulo I)
-- Cada aula pode ter N perguntas de múltipla escolha (A,B,C,D)
-- =====================================================

CREATE TABLE IF NOT EXISTS aula_avaliacao_perguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aula_id VARCHAR(255) NOT NULL COMMENT 'FK para aulas.id (ex: curso-001-m1-aula-01)',
  ordem INT NOT NULL DEFAULT 1,
  enunciado TEXT NOT NULL,
  opcao_a VARCHAR(500) NOT NULL,
  opcao_b VARCHAR(500) NOT NULL,
  opcao_c VARCHAR(500) NOT NULL,
  opcao_d VARCHAR(500) NOT NULL,
  resposta_correta ENUM('A','B','C','D') NOT NULL,
  INDEX idx_aula (aula_id),
  INDEX idx_aula_ordem (aula_id, ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir perguntas da Avaliação – Aula 01: Introdução e Contextualização da BNCC Computacional
-- Obter aula_id da Aula 01 do Módulo I do curso "Descomplicando a BNCC Computacional"
SET @curso_id = (SELECT id FROM cursos WHERE titulo = 'Descomplicando a BNCC Computacional' ORDER BY id LIMIT 1);
SET @modulo_id = (SELECT id FROM modulos WHERE curso_id = @curso_id AND (titulo_modulo LIKE '%Módulo I%' OR ordem = 1) ORDER BY ordem LIMIT 1);
SET @aula_id = (SELECT id FROM aulas WHERE modulo_id = @modulo_id AND (titulo = 'Aula 01' OR ordem = 1) ORDER BY ordem LIMIT 1);

-- Se não existir "Aula 01", usar padrão curso-001-m1-aula-01 (ajuste se seu curso tiver outro id)
SET @aula_id = COALESCE(@aula_id, CONCAT(@curso_id, '-m1-aula-01'));

INSERT INTO aula_avaliacao_perguntas (aula_id, ordem, enunciado, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta) VALUES
(@aula_id, 1, 'A BNCC Computacional é:', 'Um documento que substitui a BNCC tradicional', 'Um complemento à BNCC com diretrizes sobre computação', 'Uma lei federal que regula o uso de celulares nas escolas', 'Um programa voltado apenas para escolas privadas', 'B'),
(@aula_id, 2, 'O principal objetivo da BNCC Computacional é?', 'Fazer com que os alunos usem melhor o celular', 'Tornar os alunos consumidores críticos e criadores de tecnologia', 'Ensinar apenas programação e robótica', 'Substituir o ensino de matemática e ciências', 'B'),
(@aula_id, 3, 'Segundo a Resolução CNE/CEB nº 2/2025, um dos pontos centrais é:', 'Promover o uso pedagógico e responsável da tecnologia', 'Restringir totalmente o uso de dispositivos digitais', 'Proibir o acesso à internet nas escolas', 'Tornar o ensino 100% remoto', 'A'),
(@aula_id, 4, 'A obrigatoriedade da BNCC Computacional se aplica:', 'Apenas às escolas públicas', 'Apenas ao Ensino Médio', 'A todas as instituições públicas e privadas da Educação Básica', 'Somente às escolas com laboratório de informática', 'C'),
(@aula_id, 5, 'Qual é o foco principal do eixo Pensamento Computacional?', 'Uso de aplicativos educacionais', 'Ensino de linguagens de programação avançadas', 'Criação de conteúdos digitais', 'Raciocínio lógico e resolução estruturada de problemas', 'D'),
(@aula_id, 6, 'O eixo Mundo Digital busca:', 'Ensinar o funcionamento técnico de dispositivos e redes', 'Estimular o uso de redes sociais pelos alunos', 'Incentivar o consumo de tecnologia', 'Substituir aulas tradicionais por atividades on-line', 'A'),
(@aula_id, 7, 'O eixo Cultura Digital propõe:', 'A restrição total ao uso de mídias digitais', 'A substituição das práticas pedagógicas tradicionais', 'O uso irrestrito da tecnologia', 'A promoção de um uso crítico, ético e consciente da tecnologia', 'D'),
(@aula_id, 8, 'Entre os pilares do Pensamento Computacional, estão:', 'Lógica, imaginação, criatividade e curiosidade', 'Programação, robótica, hardware e software', 'Decomposição, reconhecimento de padrões, abstração e algoritmos', 'Pesquisa, leitura, escrita e cálculo', 'C'),
(@aula_id, 9, 'A Política Nacional de Educação Digital (PNED) tem como um de seus objetivos:', 'Reduzir o acesso à internet nas escolas', 'Garantir o letramento digital e ampliar o acesso à conectividade e formação docente', 'Substituir disciplinas tradicionais por aulas on-line', 'Focar apenas em ensino de programação', 'B'),
(@aula_id, 10, 'Na prática, implementar a BNCC Computacional nas escolas significa:', 'Integrar o uso pedagógico da tecnologia e promover uma cultura digital responsável', 'Criar apenas aulas de robótica e programação', 'Substituir o professor por recursos digitais', 'Usar a mesma senha em todas as contas', 'A');

SELECT CONCAT('Perguntas da Aula 01 inseridas para aula_id: ', @aula_id) AS status;
