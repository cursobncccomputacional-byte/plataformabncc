-- =====================================================
-- CRIAR TABELA DE SESSÕES E ATIVIDADES
-- Sistema de rastreamento de sessões e atividades dos usuários
-- =====================================================

-- Tabela de sessões (login/logout)
CREATE TABLE IF NOT EXISTS sessoes (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da sessão',
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário',
  session_id VARCHAR(255) NOT NULL COMMENT 'ID da sessão PHP',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP do usuário',
  user_agent TEXT DEFAULT NULL COMMENT 'User agent do navegador',
  data_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora do login',
  data_logout TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora do logout',
  tempo_sessao INT DEFAULT NULL COMMENT 'Tempo da sessão em segundos',
  tipo_logout ENUM('manual', 'inativo', 'timeout', 'forcado') DEFAULT NULL COMMENT 'Tipo de logout',
  criado_por VARCHAR(255) DEFAULT NULL COMMENT 'ID do admin que criou este usuário (para filtros)',
  
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_login (data_login),
  INDEX idx_data_logout (data_logout),
  INDEX idx_criado_por (criado_por),
  INDEX idx_session_id (session_id),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de sessões de login/logout dos usuários';

-- Tabela de atividades durante sessões
CREATE TABLE IF NOT EXISTS atividades_sessao (
  id VARCHAR(255) PRIMARY KEY COMMENT 'ID único da atividade',
  sessao_id VARCHAR(255) NOT NULL COMMENT 'ID da sessão',
  usuario_id VARCHAR(255) NOT NULL COMMENT 'ID do usuário',
  tipo_atividade VARCHAR(50) NOT NULL COMMENT 'Tipo: view_page, view_activity, view_video, view_document, download, search, etc',
  recurso_id VARCHAR(255) DEFAULT NULL COMMENT 'ID do recurso acessado (atividade, vídeo, documento, etc)',
  recurso_titulo VARCHAR(500) DEFAULT NULL COMMENT 'Título do recurso acessado',
  detalhes TEXT DEFAULT NULL COMMENT 'Detalhes adicionais (JSON ou texto)',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Endereço IP',
  data_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da atividade',
  criado_por VARCHAR(255) DEFAULT NULL COMMENT 'ID do admin que criou este usuário (para filtros)',
  
  INDEX idx_sessao_id (sessao_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_tipo_atividade (tipo_atividade),
  INDEX idx_data_atividade (data_atividade),
  INDEX idx_criado_por (criado_por),
  
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de atividades dos usuários durante as sessões';

-- Atualizar campo criado_por na tabela usuarios se ainda não existir
SET @dbname = DATABASE();
SET @tablename = "usuarios";
SET @columnname = "criado_por";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(255) DEFAULT NULL COMMENT 'ID do admin/root que criou este usuário'")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Criar índice para criado_por se não existir
SET @indexname = "idx_criado_por";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  "SELECT 1",
  CONCAT("CREATE INDEX ", @indexname, " ON ", @tablename, "(criado_por)")
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
