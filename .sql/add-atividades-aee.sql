-- Adiciona coluna AEE (Atendimento Educacional Especializado) na tabela atividades.
-- Atividades marcadas como AEE constam na trilha de AEE.
-- Execute uma vez no banco da plataforma.

-- Adiciona coluna AEE (Atendimento Educacional Especializado).
-- Atividades com aee=1 constam na trilha de AEE.
-- Se a coluna já existir, ignore o erro ou comente esta linha.

ALTER TABLE atividades
ADD COLUMN aee TINYINT(1) NOT NULL DEFAULT 0
COMMENT '1 = atividade AEE (Atendimento Educacional Especializado), aparece na trilha AEE';
