-- =====================================================
-- TABELA DE PLANOS DE AULA BETA
-- =====================================================
-- Versão beta de planos de aula estruturados, vinculados
-- a uma atividade existente na tabela `atividades`.
--
-- Observações:
-- - Armazena os principais campos em colunas próprias
--   (carga horária, tipo, eixos, etc).
-- - Campos que são listas/estruturas mais complexas
--   (habilidades, objetivos específicos, etc) são salvos
--   como JSON em colunas TEXT/LONGTEXT.
-- - Apenas usuários root podem criar/editar/excluir via API.
--
-- Idempotente: pode ser executado em produção com segurança.

CREATE TABLE IF NOT EXISTS planos_aula_beta (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID interno do plano de aula beta',
  atividade_id VARCHAR(255) NOT NULL COMMENT 'ID da atividade vinculada (atividades.id)',

  carga_horaria_min INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Carga horária total em minutos',
  tipo_atividade VARCHAR(20) NOT NULL DEFAULT 'Plugada' COMMENT 'Plugada ou Desplugada',

  componente_curricular_principal VARCHAR(255) NULL COMMENT 'Componente curricular principal',
  disciplinas_integradas TEXT NULL COMMENT 'Lista de disciplinas integradas (JSON de array de strings)',

  eixos_tematicos TEXT NULL COMMENT 'Eixos temáticos de computação (JSON de array de strings)',
  habilidades_computacao_ids TEXT NULL COMMENT 'IDs das habilidades de computação (JSON de array de números)',
  habilidades_disciplinas_integradas LONGTEXT NULL COMMENT 'Habilidades das disciplinas integradas (JSON de objetos com código/descrição)',

  objetivo_geral TEXT NULL COMMENT 'Objetivo geral da aula',
  objetivos_especificos LONGTEXT NULL COMMENT 'Objetivos específicos (JSON de array de textos)',

  introducao_tempo_min INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Tempo de introdução em minutos',
  introducao_descricao LONGTEXT NULL COMMENT 'Descrição da introdução/sensibilização',

  desenvolvimento_tempo_min INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Tempo de desenvolvimento/prática em minutos',
  desenvolvimento_sequencia_coletiva LONGTEXT NULL COMMENT 'Descrição da etapa Sequência Coletiva',
  desenvolvimento_mao_na_massa LONGTEXT NULL COMMENT 'Descrição da etapa Mão na Massa',
  desenvolvimento_desafio_extra LONGTEXT NULL COMMENT 'Descrição da etapa Desafio Extra',

  fechamento_tempo_min INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Tempo de fechamento/sistematização em minutos',

  recursos_didaticos LONGTEXT NULL COMMENT 'Recursos didáticos utilizados',

  avaliacao_criterios LONGTEXT NULL COMMENT 'Critérios de avaliação',
  avaliacao_instrumento LONGTEXT NULL COMMENT 'Instrumentos de avaliação',

  adaptacoes_inclusao LONGTEXT NULL COMMENT 'Adaptações para inclusão',

  created_by VARCHAR(255) NULL COMMENT 'ID do usuário que criou (usuarios.id)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data/hora da última atualização',

  PRIMARY KEY (id),
  KEY idx_atividade (atividade_id),
  KEY idx_created_by (created_by),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Planos de aula estruturados (versão beta) vinculados a atividades BNCC';

