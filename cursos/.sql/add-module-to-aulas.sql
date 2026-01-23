-- =====================================================
-- ADICIONAR CAMPO MÓDULO NA TABELA DE AULAS
-- =====================================================

USE u985723830_ead;

-- Adicionar coluna modulo na tabela aulas
ALTER TABLE aulas 
ADD COLUMN modulo ENUM('I', 'II') DEFAULT 'I' COMMENT 'Módulo I ou II' 
AFTER ordem;

-- Criar índice para melhorar performance
CREATE INDEX idx_modulo ON aulas(curso_id, modulo, ordem);
