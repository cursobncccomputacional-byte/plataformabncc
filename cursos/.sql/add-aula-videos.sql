-- =====================================================
-- CRIAR TABELA DE VÍDEOS (PARTES) POR AULA
-- Cada Aula pode ter vários vídeos associados (partes)
-- =====================================================

USE u985723830_novaedu;

-- Tabela de vídeos/partes da aula
CREATE TABLE IF NOT EXISTS aula_videos (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID do vídeo (ex: aula-001-parte-001)',
  aula_id VARCHAR(255) NOT NULL COMMENT 'FK para aulas.id',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título da parte/vídeo',
  descricao TEXT NULL COMMENT 'Descrição da parte/vídeo',
  video_url VARCHAR(1000) NOT NULL COMMENT 'URL do vídeo (Vimeo/YouTube/Drive/MP4)',
  duracao_video INT DEFAULT 0 COMMENT 'Duração em segundos',
  thumbnail_url VARCHAR(1000) NULL COMMENT 'URL da thumbnail',
  ordem INT DEFAULT 0 COMMENT 'Ordem dentro da aula',
  ativo TINYINT(1) DEFAULT 1 COMMENT 'Se o vídeo está ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aula (aula_id),
  INDEX idx_aula_ordem (aula_id, ordem),
  CONSTRAINT fk_aula_videos_aula FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Garantir que campos antigos em aulas sejam opcionais (para aula sem vídeo direto)
-- (Se a coluna não existir em algum ambiente, o comando pode falhar; execute conforme seu schema)
-- ALTER TABLE aulas MODIFY COLUMN video_url VARCHAR(1000) NULL;
-- ALTER TABLE aulas MODIFY COLUMN duracao_video INT NULL DEFAULT 0;
-- ALTER TABLE aulas MODIFY COLUMN thumbnail_url VARCHAR(1000) NULL;

-- Migrar aulas existentes (aulas.video_url) para aula_videos como "Parte 1"
-- Só migra se houver video_url e ainda não existir nenhum vídeo cadastrado para a aula.
INSERT INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo)
SELECT
  CONCAT(a.id, '-parte-001') AS id,
  a.id AS aula_id,
  CONCAT(a.titulo, ' - Parte 1') AS titulo,
  a.descricao AS descricao,
  a.video_url AS video_url,
  COALESCE(a.duracao_video, 0) AS duracao_video,
  a.thumbnail_url AS thumbnail_url,
  1 AS ordem,
  1 AS ativo
FROM aulas a
LEFT JOIN aula_videos av ON av.aula_id = a.id
WHERE a.video_url IS NOT NULL AND a.video_url <> ''
  AND av.aula_id IS NULL;

SELECT 'Tabela aula_videos criada e migração executada (quando aplicável).' AS status;

