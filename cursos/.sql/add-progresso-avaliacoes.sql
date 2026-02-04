-- =====================================================
-- Progresso de avaliações (conclusão ao final da aula)
-- Módulo I, Aulas 01 a 10: avaliação após cada aula
-- =====================================================

CREATE TABLE IF NOT EXISTS progresso_avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  curso_id VARCHAR(255) NOT NULL,
  aula_id VARCHAR(255) NOT NULL COMMENT 'Aula cuja avaliação foi concluída',
  concluida_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_avaliacao (usuario_id, curso_id, aula_id),
  INDEX idx_usuario_curso (usuario_id, curso_id),
  INDEX idx_curso (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tabela progresso_avaliacoes criada/verificada.' AS status;
