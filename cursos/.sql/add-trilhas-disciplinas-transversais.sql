-- =====================================================
-- ADICIONAR TRILHAS DE DISCIPLINAS TRANSVERSAIS
-- Cria trilhas para cada disciplina transversal
-- =====================================================

USE u985723830_novaedu;

-- Primeiro, atualizar o ENUM para incluir 'disciplina_transversal'
ALTER TABLE trilhas MODIFY COLUMN tipo ENUM('eixo_bncc', 'etapa', 'disciplina_transversal') NOT NULL COMMENT 'Tipo de trilha: eixo_bncc, etapa ou disciplina_transversal';

-- Inserir trilhas de disciplinas transversais
INSERT INTO trilhas (id, titulo, descricao, tipo, valor, ordem, ativo) VALUES
('portugues', 'Português', 'Trilha de atividades relacionadas à Língua Portuguesa', 'disciplina_transversal', 'Português', 7, 1),
('matematica', 'Matemática', 'Trilha de atividades relacionadas à Matemática', 'disciplina_transversal', 'Matemática', 8, 1),
('historia', 'História', 'Trilha de atividades relacionadas à História', 'disciplina_transversal', 'História', 9, 1),
('geografia', 'Geografia', 'Trilha de atividades relacionadas à Geografia', 'disciplina_transversal', 'Geografia', 10, 1),
('ciencias', 'Ciências', 'Trilha de atividades relacionadas às Ciências', 'disciplina_transversal', 'Ciências', 11, 1),
('educacao-fisica', 'Educação Física', 'Trilha de atividades relacionadas à Educação Física', 'disciplina_transversal', 'Educação Física', 12, 1),
('ensino-religioso', 'Ensino Religioso', 'Trilha de atividades relacionadas ao Ensino Religioso', 'disciplina_transversal', 'Ensino Religioso', 13, 1),
('computacao', 'Computação', 'Trilha de atividades relacionadas à Computação', 'disciplina_transversal', 'Computação', 14, 1),
('ingles', 'Inglês', 'Trilha de atividades relacionadas ao Inglês', 'disciplina_transversal', 'Inglês', 15, 1),
('artes', 'Artes', 'Trilha de atividades relacionadas às Artes', 'disciplina_transversal', 'Artes', 16, 1)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), descricao = VALUES(descricao);

SELECT 'Trilhas de disciplinas transversais criadas com sucesso!' AS status;
