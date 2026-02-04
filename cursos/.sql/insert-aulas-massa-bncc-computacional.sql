-- =====================================================
-- INSERIR AULAS EM MASSA - Curso "Descomplicando a BNCC Computacional"
-- =====================================================
-- Módulo I: Aulas 03 a 10 (03:8, 04:6, 05:11, 06:8, 07:5, 08:8, 09:9, 10:9 vídeos)
-- USA APENAS O CURSO BNCC JÁ EXISTENTE (não cria curso novo).
-- =====================================================

-- USE u985723830_novaedu;   -- descomente e ajuste se necessário

-- 0) Usar o curso BNCC existente (ex.: id = curso-001)
SET @curso_id = (
  SELECT id FROM cursos
  WHERE titulo = 'Descomplicando a BNCC Computacional'
  ORDER BY id
  LIMIT 1
);

-- Garantir que o módulo "Módulo I" existe nesse curso (usar existente ou criar)
SET @modulo_id = (
  SELECT id FROM modulos
  WHERE curso_id = @curso_id
    AND (titulo_modulo LIKE '%Módulo I%' OR ordem = 1)
  ORDER BY ordem
  LIMIT 1
);

-- Se não existir Módulo I, criar com id compatível com o curso
INSERT INTO modulos (id, curso_id, titulo_modulo, ordem)
SELECT CONCAT(@curso_id, '-modulo-01'), @curso_id, 'Módulo I', 1
FROM DUAL
WHERE @modulo_id IS NULL;
SET @modulo_id = COALESCE(@modulo_id, CONCAT(@curso_id, '-modulo-01'));

-- ID da aula (único por curso)
SET @aula_id = CONCAT(@curso_id, '-m1-aula-03');

-- -----------------------------------------------
-- 1) Inserir a Aula 03 na tabela aulas (no curso existente)
-- -----------------------------------------------
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (
  @aula_id,
  @curso_id,
  @modulo_id,
  'Aula 03',
  NULL,
  '',
  0,
  NULL,
  3
);

-- -----------------------------------------------
-- 2) Inserir os 8 vídeos (partes) da Aula 03 em aula_videos
-- -----------------------------------------------
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A3.1', NULL, 'https://vimeo.com/1157670654?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A3.2', NULL, 'https://vimeo.com/1157670687?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A3.3', NULL, 'https://vimeo.com/1157670726?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A3.4', NULL, 'https://vimeo.com/1157670774?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A3.5', NULL, 'https://vimeo.com/1157670820?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A3.6', NULL, 'https://vimeo.com/1157670884?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A3.7', NULL, 'https://vimeo.com/1157670919?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A3.8', NULL, 'https://vimeo.com/1157670989?fl=ml&fe=ec', 0, NULL, 8, 1);

-- -----------------------------------------------
-- 3) Aula 04 - Módulo I (6 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-04');

INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (
  @aula_id,
  @curso_id,
  @modulo_id,
  'Aula 04',
  NULL,
  '',
  0,
  NULL,
  4
);

INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A4.1', NULL, 'https://vimeo.com/1157671013?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A4.2', NULL, 'https://vimeo.com/1157671043?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A4.3', NULL, 'https://vimeo.com/1157671066?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A4.4', NULL, 'https://vimeo.com/1157671098?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A4.5', NULL, 'https://vimeo.com/1157671140?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A4.6', NULL, 'https://vimeo.com/1157671177?fl=ml&fe=ec', 0, NULL, 6, 1);

-- -----------------------------------------------
-- 4) Aula 05 - Módulo I (11 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-05');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 05', NULL, '', 0, NULL, 5);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A5.1', NULL, 'https://vimeo.com/1157671245?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A5.2', NULL, 'https://vimeo.com/1157671294?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A5.3', NULL, 'https://vimeo.com/1157671358?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A5.4', NULL, 'https://vimeo.com/1157671390?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A5.5', NULL, 'https://vimeo.com/1157671417?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A5.6', NULL, 'https://vimeo.com/1157671444?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A5.7', NULL, 'https://vimeo.com/1157671462?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A5.8', NULL, 'https://vimeo.com/1157671490?fl=ml&fe=ec', 0, NULL, 8, 1),
  (CONCAT(@aula_id, '-parte-009'), @aula_id, 'M1.A5.9', NULL, 'https://vimeo.com/1157671527?fl=ml&fe=ec', 0, NULL, 9, 1),
  (CONCAT(@aula_id, '-parte-010'), @aula_id, 'M1.A5.10', NULL, 'https://vimeo.com/1157671556?fl=ml&fe=ec', 0, NULL, 10, 1),
  (CONCAT(@aula_id, '-parte-011'), @aula_id, 'M1.A5.11', NULL, 'https://vimeo.com/1157671595?fl=ml&fe=ec', 0, NULL, 11, 1);

-- -----------------------------------------------
-- 5) Aula 06 - Módulo I (8 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-06');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 06', NULL, '', 0, NULL, 6);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A6.1', NULL, 'https://vimeo.com/1157671632?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A6.2', NULL, 'https://vimeo.com/1157671682?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A6.3', NULL, 'https://vimeo.com/1157671698?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A6.4', NULL, 'https://vimeo.com/1157671744?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A6.5', NULL, 'https://vimeo.com/1157671786?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A6.6', NULL, 'https://vimeo.com/1157671830?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A6.7', NULL, 'https://vimeo.com/1157671885?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A6.8', NULL, 'https://vimeo.com/1157671923?fl=ml&fe=ec', 0, NULL, 8, 1);

-- -----------------------------------------------
-- 6) Aula 07 - Módulo I (5 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-07');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 07', NULL, '', 0, NULL, 7);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A7.1', NULL, 'https://vimeo.com/1157671988?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A7.2', NULL, 'https://vimeo.com/1157672023?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A7.3', NULL, 'https://vimeo.com/1157672060?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A7.4', NULL, 'https://vimeo.com/1157672118?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A7.5', NULL, 'https://vimeo.com/1157672173?fl=ml&fe=ec', 0, NULL, 5, 1);

-- -----------------------------------------------
-- 7) Aula 08 - Módulo I (8 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-08');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 08', NULL, '', 0, NULL, 8);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A8.1', NULL, 'https://vimeo.com/1157672223?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A8.2', NULL, 'https://vimeo.com/1157672269?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A8.3', NULL, 'https://vimeo.com/1157672311?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A8.4', NULL, 'https://vimeo.com/1157672360?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A8.5', NULL, 'https://vimeo.com/1157672402?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A8.6', NULL, 'https://vimeo.com/1157672450?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A8.7', NULL, 'https://vimeo.com/1157672490?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A8.8', NULL, 'https://vimeo.com/1157672543?fl=ml&fe=ec', 0, NULL, 8, 1);

-- -----------------------------------------------
-- 8) Aula 09 - Módulo I (9 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-09');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 09', NULL, '', 0, NULL, 9);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A9.1', NULL, 'https://vimeo.com/1157672588?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A9.2', NULL, 'https://vimeo.com/1157672634?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A9.3', NULL, 'https://vimeo.com/1157672698?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A9.4', NULL, 'https://vimeo.com/1157672745?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A9.5', NULL, 'https://vimeo.com/1157672784?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A9.6', NULL, 'https://vimeo.com/1157672869?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A9.7', NULL, 'https://vimeo.com/1157672895?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A9.8', NULL, 'https://vimeo.com/1157672964?fl=ml&fe=ec', 0, NULL, 8, 1),
  (CONCAT(@aula_id, '-parte-009'), @aula_id, 'M1.A9.9', NULL, 'https://vimeo.com/1157673007?fl=ml&fe=ec', 0, NULL, 9, 1);

-- -----------------------------------------------
-- 9) Aula 10 - Módulo I (9 vídeos)
-- -----------------------------------------------
SET @aula_id = CONCAT(@curso_id, '-m1-aula-10');
INSERT IGNORE INTO aulas (id, curso_id, modulo_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem)
VALUES (@aula_id, @curso_id, @modulo_id, 'Aula 10', NULL, '', 0, NULL, 10);
INSERT IGNORE INTO aula_videos (id, aula_id, titulo, descricao, video_url, duracao_video, thumbnail_url, ordem, ativo) VALUES
  (CONCAT(@aula_id, '-parte-001'), @aula_id, 'M1.A10.1', NULL, 'https://vimeo.com/1157673050?fl=ml&fe=ec', 0, NULL, 1, 1),
  (CONCAT(@aula_id, '-parte-002'), @aula_id, 'M1.A10.2', NULL, 'https://vimeo.com/1157673072?fl=ml&fe=ec', 0, NULL, 2, 1),
  (CONCAT(@aula_id, '-parte-003'), @aula_id, 'M1.A10.3', NULL, 'https://vimeo.com/1157673114?fl=ml&fe=ec', 0, NULL, 3, 1),
  (CONCAT(@aula_id, '-parte-004'), @aula_id, 'M1.A10.4', NULL, 'https://vimeo.com/1157673157?fl=ml&fe=ec', 0, NULL, 4, 1),
  (CONCAT(@aula_id, '-parte-005'), @aula_id, 'M1.A10.5', NULL, 'https://vimeo.com/1157673182?fl=ml&fe=ec', 0, NULL, 5, 1),
  (CONCAT(@aula_id, '-parte-006'), @aula_id, 'M1.A10.6', NULL, 'https://vimeo.com/1157673198?fl=ml&fe=ec', 0, NULL, 6, 1),
  (CONCAT(@aula_id, '-parte-007'), @aula_id, 'M1.A10.7', NULL, 'https://vimeo.com/1157673242?fl=ml&fe=ec', 0, NULL, 7, 1),
  (CONCAT(@aula_id, '-parte-008'), @aula_id, 'M1.A10.8', NULL, 'https://vimeo.com/1157673271?fl=ml&fe=ec', 0, NULL, 8, 1),
  (CONCAT(@aula_id, '-parte-009'), @aula_id, 'M1.A10.9', NULL, 'https://vimeo.com/1157673293?fl=ml&fe=ec', 0, NULL, 9, 1);

SELECT 'Módulo I - Aulas 03 a 10 inseridas (INSERT IGNORE).' AS status;
