-- =====================================================
-- RENOMEAR TABELAS E CAMPOS PARA PORTUGUÊS
-- Banco: supernerds3
-- ATENÇÃO: Isso vai exigir ajustes no código também!
-- =====================================================

USE supernerds3;

-- =====================================================
-- 1. RENOMEAR TABELA: users -> usuarios
-- =====================================================
RENAME TABLE users TO usuarios;

-- Renomear campos da tabela usuarios
ALTER TABLE usuarios 
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do usuário',
  CHANGE COLUMN name nome VARCHAR(255) NOT NULL COMMENT 'Nome completo do usuário',
  CHANGE COLUMN email email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email (usado para login)',
  CHANGE COLUMN password senha VARCHAR(255) NOT NULL COMMENT 'Hash da senha (gerado com password_hash do PHP)',
  CHANGE COLUMN role nivel_acesso ENUM('root', 'admin', 'professor', 'aluno') NOT NULL DEFAULT 'professor' COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos)',
  CHANGE COLUMN school escola VARCHAR(255) DEFAULT NULL COMMENT 'Nome da escola ou instituição',
  CHANGE COLUMN subjects materias JSON DEFAULT NULL COMMENT 'Array de matérias que o usuário leciona (para professores) ou estuda (para alunos)',
  CHANGE COLUMN bio biografia TEXT DEFAULT NULL COMMENT 'Biografia do usuário',
  CHANGE COLUMN created_at data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da conta',
  CHANGE COLUMN last_login ultimo_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora do último login',
  CHANGE COLUMN is_active ativo BOOLEAN DEFAULT TRUE COMMENT 'Se o usuário está ativo (TRUE) ou inativo (FALSE)',
  CHANGE COLUMN updated_at data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização';

ALTER TABLE usuarios COMMENT = 'Tabela principal de usuários do sistema';

-- Atualizar índices
ALTER TABLE usuarios DROP INDEX idx_email;
ALTER TABLE usuarios DROP INDEX idx_role;
ALTER TABLE usuarios DROP INDEX idx_active;
ALTER TABLE usuarios DROP INDEX idx_created;

ALTER TABLE usuarios 
  ADD INDEX idx_email (email),
  ADD INDEX idx_nivel_acesso (nivel_acesso),
  ADD INDEX idx_ativo (ativo),
  ADD INDEX idx_data_criacao (data_criacao);

-- =====================================================
-- 2. RENOMEAR TABELA: school_years -> anos_escolares
-- =====================================================
RENAME TABLE school_years TO anos_escolares;

ALTER TABLE anos_escolares
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do ano escolar',
  CHANGE COLUMN name nome VARCHAR(255) NOT NULL COMMENT 'Nome do ano (ex: 1º Ano, 2º Ano, etc.)',
  CHANGE COLUMN level nivel ENUM('educacao-infantil', 'anos-iniciais', 'anos-finais', 'aee') NOT NULL COMMENT 'Nível educacional: educação-infantil, anos-iniciais (1º ao 5º), anos-finais (6º ao 9º), aee (Atendimento Educacional Especializado)',
  CHANGE COLUMN order_number ordem INT NOT NULL COMMENT 'Ordem de exibição (1, 2, 3...)',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição do ano escolar';

ALTER TABLE anos_escolares COMMENT = 'Anos escolares da BNCC';

-- Atualizar índices
ALTER TABLE anos_escolares DROP INDEX idx_level;
ALTER TABLE anos_escolares DROP INDEX idx_order;

ALTER TABLE anos_escolares
  ADD INDEX idx_nivel (nivel),
  ADD INDEX idx_ordem (ordem);

-- =====================================================
-- 3. RENOMEAR TABELA: bncc_axes -> eixos_bncc
-- =====================================================
RENAME TABLE bncc_axes TO eixos_bncc;

ALTER TABLE eixos_bncc
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do eixo',
  CHANGE COLUMN name nome VARCHAR(255) NOT NULL COMMENT 'Nome do eixo (ex: Pensamento Computacional, Cultura Digital)',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição do eixo',
  CHANGE COLUMN color cor VARCHAR(50) DEFAULT '#4F46E5' COMMENT 'Cor para exibição visual (formato hexadecimal)';

ALTER TABLE eixos_bncc COMMENT = 'Eixos temáticos da BNCC para Pensamento Computacional';

-- =====================================================
-- 4. RENOMEAR TABELA: knowledge_objects -> objetos_conhecimento
-- =====================================================
RENAME TABLE knowledge_objects TO objetos_conhecimento;

ALTER TABLE objetos_conhecimento
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do objeto de conhecimento',
  CHANGE COLUMN name nome VARCHAR(255) NOT NULL COMMENT 'Nome do objeto de conhecimento',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição detalhada do objeto',
  CHANGE COLUMN axis_id id_eixo VARCHAR(255) NOT NULL COMMENT 'ID do eixo ao qual pertence (chave estrangeira)',
  CHANGE COLUMN school_years anos_escolares JSON COMMENT 'Array de IDs dos anos escolares onde este objeto é trabalhado';

-- Atualizar foreign key (descobrir nome real primeiro)
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'supernerds3' 
                AND TABLE_NAME = 'objetos_conhecimento' 
                AND REFERENCED_TABLE_NAME IS NOT NULL 
                LIMIT 1);
SET @sql = IFNULL(CONCAT('ALTER TABLE objetos_conhecimento DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE objetos_conhecimento 
  ADD CONSTRAINT fk_objetos_eixo FOREIGN KEY (id_eixo) REFERENCES eixos_bncc(id) ON DELETE CASCADE;

ALTER TABLE objetos_conhecimento DROP INDEX idx_axis;
ALTER TABLE objetos_conhecimento
  ADD INDEX idx_id_eixo (id_eixo),
  ADD INDEX idx_nome (nome);

ALTER TABLE objetos_conhecimento COMMENT = 'Objetos de conhecimento da BNCC';

-- =====================================================
-- 5. RENOMEAR TABELA: skills -> habilidades
-- =====================================================
RENAME TABLE skills TO habilidades;

ALTER TABLE habilidades
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único da habilidade',
  CHANGE COLUMN code codigo VARCHAR(50) NOT NULL COMMENT 'Código da habilidade (ex: EF01CI01, EF02CI02)',
  CHANGE COLUMN description descricao TEXT NOT NULL COMMENT 'Descrição completa da habilidade',
  CHANGE COLUMN knowledge_object_id id_objeto_conhecimento VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento ao qual pertence (chave estrangeira)',
  CHANGE COLUMN school_years anos_escolares JSON COMMENT 'Array de IDs dos anos escolares onde esta habilidade é desenvolvida';

-- Atualizar foreign key (descobrir nome real primeiro)
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'supernerds3' 
                AND TABLE_NAME = 'habilidades' 
                AND REFERENCED_TABLE_NAME IS NOT NULL 
                LIMIT 1);
SET @sql = IFNULL(CONCAT('ALTER TABLE habilidades DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE habilidades 
  ADD CONSTRAINT fk_habilidades_objeto FOREIGN KEY (id_objeto_conhecimento) REFERENCES objetos_conhecimento(id) ON DELETE CASCADE;

ALTER TABLE habilidades DROP INDEX idx_code;
ALTER TABLE habilidades DROP INDEX idx_knowledge_object;

ALTER TABLE habilidades
  ADD INDEX idx_codigo (codigo),
  ADD INDEX idx_id_objeto_conhecimento (id_objeto_conhecimento);

ALTER TABLE habilidades COMMENT = 'Habilidades e competências da BNCC';

-- =====================================================
-- 6. RENOMEAR TABELA: activities -> atividades
-- =====================================================
RENAME TABLE activities TO atividades;

ALTER TABLE atividades
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único da atividade',
  CHANGE COLUMN title titulo VARCHAR(255) NOT NULL COMMENT 'Título da atividade',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição completa da atividade',
  CHANGE COLUMN type tipo ENUM('plugada', 'desplugada') NOT NULL COMMENT 'Tipo: plugada (usa tecnologia/computador) ou desplugada (sem tecnologia)',
  CHANGE COLUMN school_years anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais a atividade é adequada',
  CHANGE COLUMN axis_id id_eixo VARCHAR(255) NOT NULL COMMENT 'ID do eixo BNCC (chave estrangeira)',
  CHANGE COLUMN knowledge_object_id id_objeto_conhecimento VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento (chave estrangeira)',
  CHANGE COLUMN skill_ids ids_habilidades JSON COMMENT 'Array de IDs das habilidades trabalhadas na atividade',
  CHANGE COLUMN duration duracao INT DEFAULT NULL COMMENT 'Duração estimada da atividade em minutos',
  CHANGE COLUMN difficulty dificuldade ENUM('facil', 'medio', 'dificil') DEFAULT 'medio' COMMENT 'Nível de dificuldade: fácil, médio ou difícil',
  CHANGE COLUMN materials materiais JSON COMMENT 'Array de materiais necessários para realizar a atividade',
  CHANGE COLUMN objectives objetivos JSON COMMENT 'Array de objetivos de aprendizagem da atividade',
  CHANGE COLUMN thumbnail_url url_miniatura VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura',
  CHANGE COLUMN video_url url_video VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo explicativo (se houver)',
  CHANGE COLUMN document_url url_documento VARCHAR(500) DEFAULT NULL COMMENT 'URL do documento PDF ou arquivo relacionado (se houver)',
  CHANGE COLUMN created_at data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da atividade';

-- Atualizar foreign keys (descobrir nomes reais primeiro)
SET @fk_name1 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                 WHERE TABLE_SCHEMA = 'supernerds3' 
                 AND TABLE_NAME = 'atividades' 
                 AND REFERENCED_TABLE_NAME = 'eixos_bncc' 
                 LIMIT 1);
SET @fk_name2 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                 WHERE TABLE_SCHEMA = 'supernerds3' 
                 AND TABLE_NAME = 'atividades' 
                 AND REFERENCED_TABLE_NAME = 'objetos_conhecimento' 
                 LIMIT 1);

SET @sql = IFNULL(CONCAT('ALTER TABLE atividades DROP FOREIGN KEY ', @fk_name1), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IFNULL(CONCAT('ALTER TABLE atividades DROP FOREIGN KEY ', @fk_name2), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE atividades 
  ADD CONSTRAINT fk_atividades_eixo FOREIGN KEY (id_eixo) REFERENCES eixos_bncc(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_atividades_objeto FOREIGN KEY (id_objeto_conhecimento) REFERENCES objetos_conhecimento(id) ON DELETE CASCADE;

-- Atualizar índices
ALTER TABLE atividades DROP INDEX idx_type;
ALTER TABLE atividades DROP INDEX idx_axis;
ALTER TABLE atividades DROP INDEX idx_difficulty;
ALTER TABLE atividades DROP INDEX idx_created;

ALTER TABLE atividades
  ADD INDEX idx_tipo (tipo),
  ADD INDEX idx_id_eixo (id_eixo),
  ADD INDEX idx_dificuldade (dificuldade),
  ADD INDEX idx_data_criacao (data_criacao);

ALTER TABLE atividades COMMENT = 'Atividades educacionais alinhadas à BNCC';

-- =====================================================
-- 7. RENOMEAR TABELA: video_courses -> cursos_video
-- =====================================================
RENAME TABLE video_courses TO cursos_video;

ALTER TABLE cursos_video
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do curso de vídeo',
  CHANGE COLUMN title titulo VARCHAR(255) NOT NULL COMMENT 'Título do curso',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição completa do curso',
  CHANGE COLUMN thumbnail_url url_miniatura VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura do vídeo',
  CHANGE COLUMN video_url url_video VARCHAR(500) NOT NULL COMMENT 'URL do vídeo (YouTube, Vimeo, etc.)',
  CHANGE COLUMN duration duracao INT NOT NULL COMMENT 'Duração do vídeo em segundos',
  CHANGE COLUMN school_years anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o curso é adequado',
  CHANGE COLUMN activities atividades JSON COMMENT 'Array de IDs das atividades relacionadas ao curso',
  CHANGE COLUMN created_at data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação do curso';

ALTER TABLE cursos_video DROP INDEX idx_created;
ALTER TABLE cursos_video DROP INDEX idx_duration;

ALTER TABLE cursos_video
  ADD INDEX idx_data_criacao (data_criacao),
  ADD INDEX idx_duracao (duracao);

ALTER TABLE cursos_video COMMENT = 'Cursos de vídeo educacionais';

-- =====================================================
-- 8. RENOMEAR TABELA: documents -> documentos
-- =====================================================
RENAME TABLE documents TO documentos;

ALTER TABLE documentos
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do documento',
  CHANGE COLUMN title titulo VARCHAR(255) NOT NULL COMMENT 'Título do documento',
  CHANGE COLUMN description descricao TEXT COMMENT 'Descrição do conteúdo do documento',
  CHANGE COLUMN file_url url_arquivo VARCHAR(500) NOT NULL COMMENT 'URL do arquivo (PDF, DOCX, PPTX)',
  CHANGE COLUMN file_type tipo_arquivo ENUM('pdf', 'docx', 'pptx') NOT NULL COMMENT 'Tipo do arquivo: PDF, DOCX (Word) ou PPTX (PowerPoint)',
  CHANGE COLUMN school_years anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o documento é adequado',
  CHANGE COLUMN activities atividades JSON COMMENT 'Array de IDs das atividades relacionadas ao documento',
  CHANGE COLUMN created_at data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação/upload do documento';

ALTER TABLE documentos DROP INDEX idx_file_type;
ALTER TABLE documentos DROP INDEX idx_created;

ALTER TABLE documentos
  ADD INDEX idx_tipo_arquivo (tipo_arquivo),
  ADD INDEX idx_data_criacao (data_criacao);

ALTER TABLE documentos COMMENT = 'Documentos educacionais (PDFs, planos de aula, apresentações)';

-- =====================================================
-- 9. RENOMEAR TABELA: user_progress -> progresso_usuario
-- =====================================================
RENAME TABLE user_progress TO progresso_usuario;

ALTER TABLE progresso_usuario
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do registro de progresso',
  CHANGE COLUMN user_id id_usuario VARCHAR(255) NOT NULL COMMENT 'ID do usuário (chave estrangeira)',
  CHANGE COLUMN video_id id_video VARCHAR(255) DEFAULT NULL COMMENT 'ID do vídeo assistido (se aplicável)',
  CHANGE COLUMN activity_id id_atividade VARCHAR(255) DEFAULT NULL COMMENT 'ID da atividade realizada (se aplicável)',
  CHANGE COLUMN completed concluido BOOLEAN DEFAULT FALSE COMMENT 'Se o vídeo/atividade foi completado (TRUE) ou não (FALSE)',
  CHANGE COLUMN last_watched_at ultima_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da última visualização',
  CHANGE COLUMN progress_percentage percentual_progresso INT DEFAULT 0 COMMENT 'Percentual de conclusão (0 a 100)';

-- Atualizar foreign key (descobrir nome real primeiro)
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'supernerds3' 
                AND TABLE_NAME = 'progresso_usuario' 
                AND REFERENCED_TABLE_NAME IS NOT NULL 
                LIMIT 1);
SET @sql = IFNULL(CONCAT('ALTER TABLE progresso_usuario DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE progresso_usuario 
  ADD CONSTRAINT fk_progresso_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
ALTER TABLE progresso_usuario DROP INDEX idx_user;
ALTER TABLE progresso_usuario DROP INDEX idx_video;
ALTER TABLE progresso_usuario DROP INDEX idx_activity;
ALTER TABLE progresso_usuario DROP INDEX idx_completed;

ALTER TABLE progresso_usuario
  ADD INDEX idx_id_usuario (id_usuario),
  ADD INDEX idx_id_video (id_video),
  ADD INDEX idx_id_atividade (id_atividade),
  ADD INDEX idx_concluido (concluido);

ALTER TABLE progresso_usuario COMMENT = 'Progresso dos usuários em vídeos e atividades';

-- =====================================================
-- 10. RENOMEAR TABELA: activity_logs -> logs_atividade
-- =====================================================
RENAME TABLE activity_logs TO logs_atividade;

ALTER TABLE logs_atividade
  CHANGE COLUMN id id VARCHAR(255) COMMENT 'ID único do log',
  CHANGE COLUMN user_id id_usuario VARCHAR(255) NOT NULL COMMENT 'ID do usuário que realizou a ação (chave estrangeira)',
  CHANGE COLUMN user_name nome_usuario VARCHAR(255) COMMENT 'Nome do usuário (armazenado para histórico)',
  CHANGE COLUMN user_email email_usuario VARCHAR(255) COMMENT 'Email do usuário (armazenado para histórico)',
  CHANGE COLUMN activity atividade ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL COMMENT 'Tipo de atividade: login, logout, visualizar atividade/documento/vídeo, download, pesquisa, filtro',
  CHANGE COLUMN resource_type tipo_recurso ENUM('activity', 'document', 'video', 'page') DEFAULT NULL COMMENT 'Tipo de recurso acessado: atividade, documento, vídeo ou página',
  CHANGE COLUMN resource_id id_recurso VARCHAR(255) DEFAULT NULL COMMENT 'ID do recurso acessado',
  CHANGE COLUMN resource_title titulo_recurso VARCHAR(255) DEFAULT NULL COMMENT 'Título do recurso (armazenado para histórico)',
  CHANGE COLUMN details detalhes TEXT DEFAULT NULL COMMENT 'Detalhes adicionais da ação',
  CHANGE COLUMN timestamp data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da ação',
  CHANGE COLUMN session_id id_sessao VARCHAR(255) DEFAULT NULL COMMENT 'ID da sessão do usuário',
  CHANGE COLUMN ip_address endereco_ip VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP do usuário',
  CHANGE COLUMN user_agent agente_usuario TEXT DEFAULT NULL COMMENT 'Informações do navegador/dispositivo do usuário';

-- Atualizar foreign key (descobrir nome real primeiro)
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'supernerds3' 
                AND TABLE_NAME = 'logs_atividade' 
                AND REFERENCED_TABLE_NAME IS NOT NULL 
                LIMIT 1);
SET @sql = IFNULL(CONCAT('ALTER TABLE logs_atividade DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE logs_atividade 
  ADD CONSTRAINT fk_logs_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Atualizar índices
ALTER TABLE logs_atividade DROP INDEX idx_user;
ALTER TABLE logs_atividade DROP INDEX idx_activity;
ALTER TABLE logs_atividade DROP INDEX idx_timestamp;
ALTER TABLE logs_atividade DROP INDEX idx_session;

ALTER TABLE logs_atividade
  ADD INDEX idx_id_usuario (id_usuario),
  ADD INDEX idx_atividade (atividade),
  ADD INDEX idx_data_hora (data_hora),
  ADD INDEX idx_id_sessao (id_sessao);

ALTER TABLE logs_atividade COMMENT = 'Logs de todas as atividades dos usuários no sistema';

-- =====================================================
-- FIM DA RENOMEAÇÃO
-- =====================================================

SELECT 'Renomeação concluída! Todas as tabelas e campos agora estão em português.' AS resultado;
SELECT 'IMPORTANTE: Agora você precisa ajustar o código TypeScript/JavaScript para usar os novos nomes!' AS aviso;
