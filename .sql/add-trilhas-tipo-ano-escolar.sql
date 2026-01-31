-- =====================================================
-- TRILHAS: TIPO ano_escolar E MIGRAÇÃO POR SÉRIES
-- Inclui ano_escolar no ENUM e move trilhas 1º-9º e AEE
-- para a seção "Por Séries" (antes em "Por Etapas").
-- =====================================================

-- Incluir 'ano_escolar' no ENUM da coluna tipo
ALTER TABLE trilhas
  MODIFY COLUMN tipo ENUM('eixo_bncc', 'etapa', 'ano_escolar', 'disciplina_transversal') NOT NULL
  COMMENT 'Tipo: eixo_bncc, etapa (EI/Anos Iniciais/Finais), ano_escolar (1º-9º/AEE), disciplina_transversal';

-- Migrar trilhas de série/ano para tipo ano_escolar (aparecem em "Por Séries")
UPDATE trilhas
SET tipo = 'ano_escolar'
WHERE tipo = 'etapa'
  AND valor IN (
    '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
    '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE'
  );

SELECT 'Tipo ano_escolar adicionado e trilhas 1º-9º e AEE migradas para Por Séries.' AS status;
