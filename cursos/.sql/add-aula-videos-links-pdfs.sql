-- =====================================================
-- Links úteis e PDFs para download por vídeo-aula
-- Cada vídeo pode ter vários links e vários PDFs
-- =====================================================
-- Formato JSON: [{"label":"Texto do link","url":"https://..."}]
-- =====================================================

-- Execute um de cada vez; se a coluna já existir, ignore o erro e siga para a próxima.
ALTER TABLE aula_videos ADD COLUMN links_uteis JSON DEFAULT NULL COMMENT 'Lista de links úteis: [{"label":"...","url":"..."}]';
ALTER TABLE aula_videos ADD COLUMN pdfs_download JSON DEFAULT NULL COMMENT 'Lista de PDFs: [{"label":"...","url":"..."}]';

SELECT 'Colunas links_uteis e pdfs_download adicionadas à aula_videos.' AS status;
