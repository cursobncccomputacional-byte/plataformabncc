-- =====================================================
-- ESTRUTURA DO BANCO DE DADOS - PLATAFORMA BNCC
-- Banco: supernerds3
-- Versão com nomes em PORTUGUÊS (tabelas e campos)
-- =====================================================

-- Selecionar o banco de dados
USE supernerds3;

-- =====================================================
-- 1. TABELA DE USUÁRIOS DO SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do usuário',
  nome VARCHAR(255) NOT NULL COMMENT 'Nome completo do usuário',
  usuario VARCHAR(255) UNIQUE NOT NULL COMMENT 'Usuário (usado para login)',
  senha VARCHAR(255) NOT NULL COMMENT 'Hash da senha (gerado com password_hash do PHP)',
  nivel_acesso ENUM('root', 'admin', 'professor', 'aluno') NOT NULL DEFAULT 'professor' COMMENT 'Nível de acesso: root (gerenciamento total), admin (gerencia professores e alunos), professor (assiste vídeos e baixa documentos), aluno (acessa atividades e jogos)',
  escola VARCHAR(255) DEFAULT NULL COMMENT 'Nome da escola ou instituição',
  materias JSON DEFAULT NULL COMMENT 'Array de matérias que o usuário leciona (para professores) ou estuda (para alunos)',
  biografia TEXT DEFAULT NULL COMMENT 'Biografia do usuário',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da conta',
  ultimo_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora do último login',
  ativo BOOLEAN DEFAULT TRUE COMMENT 'Se o usuário está ativo (TRUE) ou inativo (FALSE)',
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização',
  
  INDEX idx_usuario (usuario) COMMENT 'Índice para busca rápida por usuário',
  INDEX idx_nivel_acesso (nivel_acesso) COMMENT 'Índice para filtro por nível de acesso',
  INDEX idx_ativo (ativo) COMMENT 'Índice para filtrar usuários ativos/inativos',
  INDEX idx_data_criacao (data_criacao) COMMENT 'Índice para ordenação por data de criação'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela principal de usuários do sistema';

-- =====================================================
-- 2. TABELA DE ANOS ESCOLARES (BNCC)
-- =====================================================
CREATE TABLE IF NOT EXISTS anos_escolares (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do ano escolar',
  nome VARCHAR(255) NOT NULL COMMENT 'Nome do ano (ex: 1º Ano, 2º Ano, etc.)',
  nivel ENUM('educacao-infantil', 'anos-iniciais', 'anos-finais', 'aee') NOT NULL COMMENT 'Nível educacional: educação-infantil, anos-iniciais (1º ao 5º), anos-finais (6º ao 9º), aee (Atendimento Educacional Especializado)',
  ordem INT NOT NULL COMMENT 'Ordem de exibição (1, 2, 3...)',
  descricao TEXT COMMENT 'Descrição do ano escolar',
  
  INDEX idx_nivel (nivel) COMMENT 'Índice para filtro por nível educacional',
  INDEX idx_ordem (ordem) COMMENT 'Índice para ordenação'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Anos escolares da BNCC';

-- =====================================================
-- 3. TABELA DE EIXOS DA BNCC
-- =====================================================
CREATE TABLE IF NOT EXISTS eixos_bncc (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do eixo',
  nome VARCHAR(255) NOT NULL COMMENT 'Nome do eixo (ex: Pensamento Computacional, Cultura Digital)',
  descricao TEXT COMMENT 'Descrição do eixo',
  cor VARCHAR(50) DEFAULT '#4F46E5' COMMENT 'Cor para exibição visual (formato hexadecimal)',
  
  INDEX idx_nome (nome) COMMENT 'Índice para busca por nome'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eixos temáticos da BNCC para Pensamento Computacional';

-- =====================================================
-- 4. TABELA DE OBJETOS DE CONHECIMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS objetos_conhecimento (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do objeto de conhecimento',
  nome VARCHAR(255) NOT NULL COMMENT 'Nome do objeto de conhecimento',
  descricao TEXT COMMENT 'Descrição detalhada do objeto',
  id_eixo VARCHAR(255) NOT NULL COMMENT 'ID do eixo ao qual pertence (chave estrangeira)',
  anos_escolares JSON COMMENT 'Array de IDs dos anos escolares onde este objeto é trabalhado',
  
  FOREIGN KEY (id_eixo) REFERENCES eixos_bncc(id) ON DELETE CASCADE,
  INDEX idx_id_eixo (id_eixo) COMMENT 'Índice para busca por eixo',
  INDEX idx_nome (nome) COMMENT 'Índice para busca por nome'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Objetos de conhecimento da BNCC';

-- =====================================================
-- 5. TABELA DE HABILIDADES (COMPETÊNCIAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS habilidades (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da habilidade',
  codigo VARCHAR(50) NOT NULL COMMENT 'Código da habilidade (ex: EF01CI01, EF02CI02)',
  descricao TEXT NOT NULL COMMENT 'Descrição completa da habilidade',
  id_objeto_conhecimento VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento ao qual pertence (chave estrangeira)',
  anos_escolares JSON COMMENT 'Array de IDs dos anos escolares onde esta habilidade é desenvolvida',
  
  FOREIGN KEY (id_objeto_conhecimento) REFERENCES objetos_conhecimento(id) ON DELETE CASCADE,
  INDEX idx_codigo (codigo) COMMENT 'Índice para busca rápida por código',
  INDEX idx_id_objeto_conhecimento (id_objeto_conhecimento) COMMENT 'Índice para busca por objeto de conhecimento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Habilidades e competências da BNCC';

-- =====================================================
-- 6. TABELA DE ATIVIDADES EDUCACIONAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS atividades (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da atividade',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título da atividade',
  descricao TEXT COMMENT 'Descrição completa da atividade',
  tipo ENUM('plugada', 'desplugada') NOT NULL COMMENT 'Tipo: plugada (usa tecnologia/computador) ou desplugada (sem tecnologia)',
  anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais a atividade é adequada',
  id_eixo VARCHAR(255) NOT NULL COMMENT 'ID do eixo BNCC (chave estrangeira)',
  id_objeto_conhecimento VARCHAR(255) NOT NULL COMMENT 'ID do objeto de conhecimento (chave estrangeira)',
  ids_habilidades JSON COMMENT 'Array de IDs das habilidades trabalhadas na atividade',
  duracao INT DEFAULT NULL COMMENT 'Duração estimada da atividade em minutos',
  dificuldade ENUM('facil', 'medio', 'dificil') DEFAULT 'medio' COMMENT 'Nível de dificuldade: fácil, médio ou difícil',
  materiais JSON COMMENT 'Array de materiais necessários para realizar a atividade',
  objetivos JSON COMMENT 'Array de objetivos de aprendizagem da atividade',
  url_miniatura VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura',
  url_video VARCHAR(500) DEFAULT NULL COMMENT 'URL do vídeo explicativo (se houver)',
  url_documento VARCHAR(500) DEFAULT NULL COMMENT 'URL do documento PDF ou arquivo relacionado (se houver)',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação da atividade',
  
  FOREIGN KEY (id_eixo) REFERENCES eixos_bncc(id) ON DELETE CASCADE,
  FOREIGN KEY (id_objeto_conhecimento) REFERENCES objetos_conhecimento(id) ON DELETE CASCADE,
  INDEX idx_tipo (tipo) COMMENT 'Índice para filtro por tipo (plugada/desplugada)',
  INDEX idx_id_eixo (id_eixo) COMMENT 'Índice para busca por eixo',
  INDEX idx_dificuldade (dificuldade) COMMENT 'Índice para filtro por dificuldade',
  INDEX idx_data_criacao (data_criacao) COMMENT 'Índice para ordenação por data'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Atividades educacionais alinhadas à BNCC';

-- =====================================================
-- 7. TABELA DE CURSOS DE VÍDEO
-- =====================================================
CREATE TABLE IF NOT EXISTS cursos_video (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do curso de vídeo',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título do curso',
  descricao TEXT COMMENT 'Descrição completa do curso',
  url_miniatura VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa/miniatura do vídeo',
  url_video VARCHAR(500) NOT NULL COMMENT 'URL do vídeo (YouTube, Vimeo, etc.)',
  duracao INT NOT NULL COMMENT 'Duração do vídeo em segundos',
  anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o curso é adequado',
  atividades JSON COMMENT 'Array de IDs das atividades relacionadas ao curso',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação do curso',
  
  INDEX idx_data_criacao (data_criacao) COMMENT 'Índice para ordenação por data',
  INDEX idx_duracao (duracao) COMMENT 'Índice para filtro por duração'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cursos de vídeo educacionais';

-- =====================================================
-- 8. TABELA DE DOCUMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do documento',
  titulo VARCHAR(255) NOT NULL COMMENT 'Título do documento',
  descricao TEXT COMMENT 'Descrição do conteúdo do documento',
  url_arquivo VARCHAR(500) NOT NULL COMMENT 'URL do arquivo (PDF, DOCX, PPTX)',
  tipo_arquivo ENUM('pdf', 'docx', 'pptx') NOT NULL COMMENT 'Tipo do arquivo: PDF, DOCX (Word) ou PPTX (PowerPoint)',
  anos_escolares JSON NOT NULL COMMENT 'Array de IDs dos anos escolares para os quais o documento é adequado',
  atividades JSON COMMENT 'Array de IDs das atividades relacionadas ao documento',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação/upload do documento',
  
  INDEX idx_tipo_arquivo (tipo_arquivo) COMMENT 'Índice para filtro por tipo de arquivo',
  INDEX idx_data_criacao (data_criacao) COMMENT 'Índice para ordenação por data'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Documentos educacionais (PDFs, planos de aula, apresentações)';

-- =====================================================
-- 9. TABELA DE PROGRESSO DO USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS progresso_usuario (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do registro de progresso',
  id_usuario VARCHAR(255) NOT NULL COMMENT 'ID do usuário (chave estrangeira)',
  id_video VARCHAR(255) DEFAULT NULL COMMENT 'ID do vídeo assistido (se aplicável)',
  id_atividade VARCHAR(255) DEFAULT NULL COMMENT 'ID da atividade realizada (se aplicável)',
  concluido BOOLEAN DEFAULT FALSE COMMENT 'Se o vídeo/atividade foi completado (TRUE) ou não (FALSE)',
  ultima_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da última visualização',
  percentual_progresso INT DEFAULT 0 COMMENT 'Percentual de conclusão (0 a 100)',
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_id_usuario (id_usuario) COMMENT 'Índice para busca por usuário',
  INDEX idx_id_video (id_video) COMMENT 'Índice para busca por vídeo',
  INDEX idx_id_atividade (id_atividade) COMMENT 'Índice para busca por atividade',
  INDEX idx_concluido (concluido) COMMENT 'Índice para filtrar atividades completadas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Progresso dos usuários em vídeos e atividades';

-- =====================================================
-- 10. TABELA DE LOGS DE ATIVIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_atividade (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único do log',
  id_usuario VARCHAR(255) NOT NULL COMMENT 'ID do usuário que realizou a ação (chave estrangeira)',
  nome_usuario VARCHAR(255) COMMENT 'Nome do usuário (armazenado para histórico)',
  email_usuario VARCHAR(255) COMMENT 'Email do usuário (armazenado para histórico)',
  atividade ENUM('login', 'logout', 'view_activity', 'view_document', 'view_video', 'download', 'search', 'filter') NOT NULL COMMENT 'Tipo de atividade: login, logout, visualizar atividade/documento/vídeo, download, pesquisa, filtro',
  tipo_recurso ENUM('activity', 'document', 'video', 'page') DEFAULT NULL COMMENT 'Tipo de recurso acessado: atividade, documento, vídeo ou página',
  id_recurso VARCHAR(255) DEFAULT NULL COMMENT 'ID do recurso acessado',
  titulo_recurso VARCHAR(255) DEFAULT NULL COMMENT 'Título do recurso (armazenado para histórico)',
  detalhes TEXT DEFAULT NULL COMMENT 'Detalhes adicionais da ação',
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da ação',
  id_sessao VARCHAR(255) DEFAULT NULL COMMENT 'ID da sessão do usuário',
  endereco_ip VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP do usuário',
  agente_usuario TEXT DEFAULT NULL COMMENT 'Informações do navegador/dispositivo do usuário',
  
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_id_usuario (id_usuario) COMMENT 'Índice para busca por usuário',
  INDEX idx_atividade (atividade) COMMENT 'Índice para filtro por tipo de atividade',
  INDEX idx_data_hora (data_hora) COMMENT 'Índice para ordenação e filtro por data',
  INDEX idx_id_sessao (id_sessao) COMMENT 'Índice para busca por sessão'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de todas as atividades dos usuários no sistema';

-- =====================================================
-- 11. INSERIR DADOS INICIAIS
-- =====================================================

-- Usuário Root Inicial (Acesso total ao sistema)
-- IMPORTANTE: A senha precisa ser hasheada com password_hash() do PHP
-- Exemplo: password_hash('root123', PASSWORD_DEFAULT)
-- Por enquanto, vamos usar um placeholder que será substituído
INSERT INTO usuarios (id, nome, email, senha, nivel_acesso, escola, ativo, data_criacao) VALUES
('root001', 'Root Administrator', 'root@plataformabncc.com', 'PLACEHOLDER_PASSWORD_HASH', 'root', 'Sistema Educacional BNCC', TRUE, NOW())
ON DUPLICATE KEY UPDATE nome=nome;

-- Usuário Admin Inicial (Gerencia professores e alunos)
INSERT INTO usuarios (id, nome, email, senha, nivel_acesso, escola, materias, ativo, data_criacao) VALUES
('admin001', 'Raphael Silva de Vasconcelos', 'admin@plataformabncc.com', 'PLACEHOLDER_PASSWORD_HASH', 'admin', 'Sistema Educacional BNCC', '["Administração", "Gestão Educacional"]', TRUE, NOW())
ON DUPLICATE KEY UPDATE nome=nome;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar estrutura da tabela usuarios
DESCRIBE usuarios;

SELECT 'Estrutura criada com sucesso! Todas as tabelas e campos estão em português.' AS resultado;
SELECT 'IMPORTANTE: Atualize as senhas dos usuários iniciais usando o script atualizar-senhas.php' AS aviso;
