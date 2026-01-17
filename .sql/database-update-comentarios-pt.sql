-- =====================================================
-- ATUALIZAÇÃO: ADICIONAR COMENTÁRIOS EM PORTUGUÊS
-- Banco: supernerds3
-- Execute este script para adicionar comentários explicativos
-- =====================================================

USE supernerds3;

-- =====================================================
-- 1. ATUALIZAR TABELA DE USUÁRIOS
-- =====================================================
ALTER TABLE users 
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do usuário',
  MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Nome completo do usuário',
  MODIFY COLUMN email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email (usado para login)',
  MODIFY COLUMN password VARCHAR(255) NOT NULL COMMENT 'Hash da senha (gerado com password_hash do PHP)',
  MODIFY COLUMN role ENUM('root', 'admin', 'professor', 'aluno') NOT NULL DEFAULT 'professor' COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos)',
  MODIFY COLUMN school VARCHAR(255) DEFAULT NULL COMMENT 'Nome da escola ou instituição',
  MODIFY COLUMN subjects JSON DEFAULT NULL COMMENT 'Array de matérias que o usuário leciona (para professores) ou estuda (para alunos)',
  MODIFY COLUMN bio TEXT DEFAULT NULL COMMENT 'Biografia do usuário',
  MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da conta',
  MODIFY COLUMN last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora do último login',
  MODIFY COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Se o usuário está ativo (TRUE) ou inativo (FALSE)',
  MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização';

ALTER TABLE users COMMENT = 'Tabela principal de usuários do sistema';

-- =====================================================
-- 2. ATUALIZAR TABELA DE ANOS ESCOLARES
-- =====================================================
ALTER TABLE school_years
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do ano escolar',
  MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Nome do ano (ex: 1º Ano, 2º Ano, etc.)',
  MODIFY COLUMN level ENUM('educacao-infantil', 'anos-iniciais', 'anos-finais', 'aee') NOT NULL COMMENT 'Nível educacional: educação-infantil, anos-iniciais (1º ao 5º), anos-finais (6º ao 9º), aee (Atendimento Educacional Especializado)',
  MODIFY COLUMN order_number INT NOT NULL COMMENT 'Ordem de exibição (1, 2, 3...)',
  MODIFY COLUMN description TEXT COMMENT 'Descrição do ano escolar';

ALTER TABLE school_years COMMENT = 'Anos escolares da BNCC';

-- =====================================================
-- 3. ATUALIZAR TABELA DE EIXOS BNCC
-- =====================================================
ALTER TABLE bncc_axes
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do eixo',
  MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Nome do eixo (ex: Pensamento Computacional, Cultura Digital)',
  MODIFY COLUMN description TEXT COMMENT 'Descrição do eixo',
  MODIFY COLUMN color VARCHAR(50) DEFAULT '#4F46E5' COMMENT 'Cor para exibição visual (formato hexadecimal)';

ALTER TABLE bncc_axes COMMENT = 'Eixos temáticos da BNCC para Pensamento Computacional';

-- =====================================================
-- 4. ATUALIZAR TABELA DE OBJETOS DE CONHECIMENTO
-- =====================================================
ALTER TABLE knowledge_objects
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do objeto de conhecimento',
  MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Nome do objeto de conhecimento',
  MODIFY COLUMN description TEXT COMMENT 'Descrição detalhada do objeto',
  MODIFY COLUMN axis_id VARCHAR(255) NOT NULL COMMENT 'ID do eixo ao qual pertence (chave estrangeira)',
  MODIFY COLUMN school_years JSON COMMENT 'Array de IDs dos anos escolares onde este objeto é trabalhado';

ALTER TABLE knowledge_objects COMMENT = 'Objetos de conhecimento da BNCC';

-- =====================================================
-- 5. ATUALIZAR TABELA DE HABILIDADES
-- =====================================================
ALTER TABLE skills
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único da habilidade',
  MODIFY COLUMN code VARCHAR(50) NOT NULL COMMENT 'Código da habilidade (ex: EF01CI01, EF02CI02)',
  MODIFY COLUMN description TEXT NOT NULL COMMENT 'Descrição completa da habilidade',
  MODIFY COLUMN knowledge_object_id VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento ao qual pertence (chave estrangeira)',
  MODIFY COLUMN school_years JSON COMMENT 'Array de IDs dos anos escolares onde esta habilidade é desenvolvida';

ALTER TABLE skills COMMENT = 'Habilidades e competências da BNCC';

-- =====================================================
-- 6. ATUALIZAR TABELA DE ATIVIDADES
-- =====================================================
ALTER TABLE activities
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único da atividade',
  MODIFY COLUMN title VARCHAR(255) NOT NULL COMMENT 'Título da atividade',
  MODIFY COLUMN description TEXT COMMENT 'Descrição completa da atividade',
  MODIFY COLUMN type ENUM('plugada', 'desplugada') NOT NULL COMMENT 'Tipo: plugada (usa tecnologia/computador) ou desplugada (sem tecnologia)',
  MODIFY COLUMN school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais a atividade é adequada',
  MODIFY COLUMN axis_id VARCHAR(255) NOT NULL COMMENT 'ID do eixo BNCC (chave estrangeira)',
  MODIFY COLUMN knowledge_object_id VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento (chave estrangeira)',
  MODIFY COLUMN skill_ids JSON COMMENT 'Array de IDs das habilidades trabalhadas na atividade',
  MODIFY COLUMN duration INT DEFAULT NULL COMMENT 'Duração estimada da atividade em minutos',
  MODIFY COLUMN difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'medio' COMMENT 'Nível de dificuldade: fácil, médio ou difícil',
  MODIFY COLUMN materials JSON COMMENT 'Array de materiais necessários para realizar a atividade',
  MODIFY COLUMN objectives JSON COMMENT 'Array de objetivos de aprendizagem da atividade',
  MODIFY COLUMN thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura',
  MODIFY COLUMN video_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo explicativo (se houver)',
  MODIFY COLUMN document_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do documento PDF ou arquivo relacionado (se houver)',
  MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da atividade';

ALTER TABLE activities COMMENT = 'Atividades educacionais alinhadas à BNCC';

-- =====================================================
-- 7. ATUALIZAR TABELA DE CURSOS DE VÍDEO
-- =====================================================
ALTER TABLE video_courses
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do curso de vídeo',
  MODIFY COLUMN title VARCHAR(255) NOT NULL COMMENT 'Título do curso',
  MODIFY COLUMN description TEXT COMMENT 'Descrição completa do curso',
  MODIFY COLUMN thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura do vídeo',
  MODIFY COLUMN video_url VARCHAR(500) NOT NULL COMMENT 'URL do vídeo (YouTube, Vimeo, etc.)',
  MODIFY COLUMN duration INT NOT NULL COMMENT 'Duração do vídeo em segundos',
  MODIFY COLUMN school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o curso é adequado',
  MODIFY COLUMN activities JSON COMMENT 'Array de IDs das atividades relacionadas ao curso',
  MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação do curso';

ALTER TABLE video_courses COMMENT = 'Cursos de vídeo educacionais';

-- =====================================================
-- 8. ATUALIZAR TABELA DE DOCUMENTOS
-- =====================================================
ALTER TABLE documents
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do documento',
  MODIFY COLUMN title VARCHAR(255) NOT NULL COMMENT 'Título do documento',
  MODIFY COLUMN description TEXT COMMENT 'Descrição do conteúdo do documento',
  MODIFY COLUMN file_url VARCHAR(500) NOT NULL COMMENT 'URL do arquivo (PDF, DOCX, PPTX)',
  MODIFY COLUMN file_type ENUM('pdf', 'docx', 'pptx') NOT NULL COMMENT 'Tipo do arquivo: PDF, DOCX (Word) ou PPTX (PowerPoint)',
  MODIFY COLUMN school_years JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o documento é adequado',
  MODIFY COLUMN activities JSON COMMENT 'Array de IDs das atividades relacionadas ao documento',
  MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação/upload do documento';

ALTER TABLE documents COMMENT = 'Documentos educacionais (PDFs, planos de aula, apresentações)';

-- =====================================================
-- 9. ATUALIZAR TABELA DE PROGRESSO DO USUÁRIO
-- =====================================================
ALTER TABLE user_progress
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do registro de progresso',
  MODIFY COLUMN user_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário (chave estrangeira)',
  MODIFY COLUMN video_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do vídeo assistido (se aplicável)',
  MODIFY COLUMN activity_id VARCHAR(255) DEFAULT NULL COMMENT 'ID da atividade realizada (se aplicável)',
  MODIFY COLUMN completed BOOLEAN DEFAULT FALSE COMMENT 'Se o vídeo/atividade foi completado (TRUE) ou não (FALSE)',
  MODIFY COLUMN last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da última visualização',
  MODIFY COLUMN progress_percentage INT DEFAULT 0 COMMENT 'Percentual de conclusão (0 a 100)';

ALTER TABLE user_progress COMMENT = 'Progresso dos usuários em vídeos e atividades';

-- =====================================================
-- 10. ATUALIZAR TABELA DE LOGS DE ATIVIDADE
-- =====================================================
ALTER TABLE activity_logs
  MODIFY COLUMN id VARCHAR(255) COMMENT 'ID único do log',
  MODIFY COLUMN user_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário que realizou a ação (chave estrangeira)',
  MODIFY COLUMN user_name VARCHAR(255) COMMENT 'Nome do usuário (armazenado para histórico)',
  MODIFY COLUMN user_email VARCHAR(255) COMMENT 'Email do usuário (armazenado para histórico)',
  MODIFY COLUMN activity ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL COMMENT 'Tipo de atividade: login, logout, visualizar atividade/documento/vídeo, download, pesquisa, filtro',
  MODIFY COLUMN resource_type ENUM('activity', 'document', 'video', 'page') DEFAULT NULL COMMENT 'Tipo de recurso acessado: atividade, documento, vídeo ou página',
  MODIFY COLUMN resource_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do recurso acessado',
  MODIFY COLUMN resource_title VARCHAR(255) DEFAULT NULL COMMENT 'Título do recurso (armazenado para histórico)',
  MODIFY COLUMN details TEXT DEFAULT NULL COMMENT 'Detalhes adicionais da ação',
  MODIFY COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da ação',
  MODIFY COLUMN session_id VARCHAR(255) DEFAULT NULL COMMENT 'ID da sessão do usuário',
  MODIFY COLUMN ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP do usuário',
  MODIFY COLUMN user_agent TEXT DEFAULT NULL COMMENT 'Informações do navegador/dispositivo do usuário';

ALTER TABLE activity_logs COMMENT = 'Logs de todas as atividades dos usuários no sistema';

-- =====================================================
-- FIM DA ATUALIZAÇÃO
-- =====================================================

-- Verificar se os comentários foram adicionados
-- Execute este comando para ver os comentários de uma tabela:
-- SHOW FULL COLUMNS FROM users;

SELECT 'Atualização concluída! Os comentários em português foram adicionados a todas as tabelas.' AS resultado;
